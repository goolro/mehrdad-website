import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retrieveContext, buildContextBlock } from '@/lib/rag';
import { chatCompletion, chatCompletionStream, getProviderChain, zaiComplete, type ChatTurn } from '@/lib/ai-provider';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { resolveOwnedSession, isSessionOwner } from '@/lib/chat-owner';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// privacy retention: chat sessions (and their messages, via cascade) older
// than this are purged — lazily, on a small fraction of requests, so no cron
// is needed. Sessions where the visitor left contact info or explicitly
// asked for a personal reply ("leads") are business records and are NEVER
// auto-purged — only anonymous conversations age out.
const CHAT_RETENTION_DAYS = 30;

function purgeOldChats(): void {
  if (Math.random() > 0.02) return; // ~2% of requests carry the cleanup
  const cutoff = new Date(Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  db.chatSession
    .deleteMany({
      where: {
        createdAt: { lt: cutoff },
        lead: false,
        contactName: null,
        contactEmail: null,
        contactPhone: null,
      },
    })
    .then((r) => { if (r.count > 0) console.log(`chat retention: purged ${r.count} old sessions`); })
    .catch((e) => console.error('chat retention purge failed:', e));
}

const UNCONFIGURED_FA =
  'فعلاً سرویس هوش مصنوعی پاسخگو تنظیم نشده است. سؤالتان ثبت شد و به دست مدیر سایت رسید — اگر پاسخ انسانی می‌خواهید، دکمهٔ «درخواست پاسخ از مهرداد» را بزنید یا از فرم تماس در mehrdad.ir/contact استفاده کنید.';
const UNCONFIGURED_EN =
  'The AI assistant service is not configured yet. Your question has been logged for the site owner — if you would like a personal reply, tap "Ask Mehrdad to reply" below, or use the contact form at mehrdad.ir/contact.';

// Reply language follows the visitor's MESSAGE, not the site UI toggle —
// a visitor can browse in EN and type فارسی; answering English to a
// Persian greeting is the #1 chatbot rudeness (owner-reported).
const PERSIAN_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Pure greetings ("سلام", "hi!", "درود") get an instant canned reply — no
// AI round-trip, so the very first impression never waits on a free-tier
// queue. Owner asked for a bare one-liner: a greeting deserves a greeting,
// not a paragraph. Anything beyond a bare greeting goes to the model as usual.
const GREETING_RE =
  /^(سلام|درود|هی|هیلو|هلو|salam|salaam|slam|hi|hey|hello|yo|hiya|greetings|good\s?(morning|afternoon|evening)|صبح\s?بخیر|عصر\s?بخیر|شب\s?بخیر|وقت\s?بخیر)[\s!.,\u061F?ـ]*$/i;
const GREETING_FA = 'سلام! به وب‌سایت مهرداد خوش آمدید.';
const GREETING_EN = "Hello! Welcome to Mehrdad's website.";

// Same idea for bare thanks ("مرسی", "ممنون", "thanks") — politeness gets a
// one-liner instantly instead of burning an AI call on a thank-you note.
const THANKS_RE =
  /^(مرسی|ممنون|ممنونم|تشکر|تشکرها|دست شما درد نکند|لطفا|thanks|thank\s?you|thx|ty|cheers|much\s?appreciated)[\s!.,\u061F?ـ]*$/i;
const THANKS_FA = 'خواهش می‌کنم! سؤال دیگری بود، در خدمتم.';
const THANKS_EN = "You're welcome! Ask me anything else.";

// ── lead-capture intents (owner-requested, 2026-09-26) ──────────────────
// The chat offers exactly two real next-step chips: «سفارش انجام پروژه» and
// «درخواست همکاری و سرمایه‌گذاری». Either intent flags the session as an
// UNREAD LEAD — the admin bell + dashboard card notify the owner. The phone
// number is NOT a chip (owner feedback, same day): the flow itself asks for
// it — after the order brief, or after the visitor explains the partnership.
const ORDER_RE =
  /(سفارش\s*(انجام\s*)?(پروژه|سایت|اپلیکیشن|اپ\b|بازی))|((پروژه|سایت|اپلیکیشن|بازی)[^.\n]{0,20}سفارش)|((order|hire|get)[^.\n]{0,24}(project|website|app|game\b))|((project|website|app|game)[^.\n]{0,24}order)/i;
// partnership / investment request — chip label or explicit free wording
// («همکاری» alone is deliberately NOT matched: informational questions must
// reach the AI, only explicit partnership/investment intents script the flow)
const PARTNER_RE =
  /(درخواست\s*همکاری)|(همکاری\s*و\s*سرمایه)|(سرمایه\s*گذاری)|(partnership)|(invest)|(collaborat)/i;
// phone WITH country code (+989123456789 / 00989…, separators tolerated)
const PHONE_INTL_RE = /(?:\+|00)(\d{1,3})[\s\-()]*(?:\d[\s\-()]*){7,13}\d/;
// fallback: local Iranian mobile 09xxxxxxxxx
const PHONE_LOCAL_RE = /\b09\d{9}\b/;
// visitor announcing a phone send (free wording — the chip no longer exists)
const PHONE_INTENT_RE = /(ارسال\s*شماره|شماره\s*تماس(\s*با\s*کد)?|phone\s*number)/i;

// ── ready-made scripts («متن آماده», owner request) ─────────────────────
// Action-chip turns are answered with these FIXED texts — zero AI cost,
// zero wait, and the wording is always exactly what the owner approved.
// Persian copy carries no ویرگول (owner style rule).
// Owner feedback (latest round): the FIRST message of the order flow is ONE
// short line asking for the idea — sent instantly by the widget itself.
// The phone request is the SECOND message (after the visitor explained) and
// calls are always «با هماهنگی» (arranged at a mutually agreed time) — never
// "Mehrdad himself will call you" which reads like his time is free.
const ORDER_INTRO_FA = 'عالیه! در یک یا دو خط بگو چه می‌خواهی بسازیم.';
const ORDER_INTRO_EN = 'Great! Tell me in one or two lines what you want to build.';
const ORDER_ASK_PHONE_FA =
  'ایده‌ات ثبت شد! حالا شماره تماست را با کد کشور بفرست (مثل +989123456789) تا با هماهنگی با تو تماس بگیریم. هزینه و زمان انجام هم بعد از بررسی ایده اعلام می‌شود.';
const ORDER_ASK_PHONE_EN =
  'Idea noted! Now send your phone number with country code (like +989123456789) and we will arrange a call at a time that suits you. Cost and timeline are shared after we review the idea.';
const ORDER_REMIND_FA =
  'هنوز شماره تماست را با کد کشور دریافت نکردم (مثل +989123456789) — همین‌جا بفرست تا با هماهنگی با تو تماس بگیریم.';
const ORDER_REMIND_EN =
  "I still don't have your phone number with country code (like +989123456789) — send it here and we will arrange a call.";
const PARTNER_ASK_FA =
  'چه نوع همکاری یا سرمایه‌گذاری مد نظرت است؟ کمی توضیح بده تا بهترین مسیر را با هم پیدا کنیم.';
const PARTNER_ASK_EN =
  'What kind of partnership or investment do you have in mind? Tell me a bit more so we can find the best path together.';
const PARTNER_ASK_PHONE_FA =
  'ممنون از توضیحت! شماره تماست را با کد کشور بفرست (مثل +989123456789) تا با هماهنگی با تو تماس بگیریم و جزئیات همکاری را بررسی کنیم.';
const PARTNER_ASK_PHONE_EN =
  'Thanks for explaining! Send your phone number with country code (like +989123456789) and we will arrange a call to discuss the details together.';
const PARTNER_REMIND_FA =
  'شماره تماست را با کد کشور بفرست (مثل +989123456789) تا با هماهنگی با تو تماس بگیریم.';
const PARTNER_REMIND_EN =
  'Send your phone number with country code (like +989123456789) and we will arrange a call.';
const PHONE_CONFIRM_FA = 'شماره تماس ثبت شد! به‌زودی برای هماهنگی با تو تماس می‌گیریم.';
const PHONE_CONFIRM_EN = 'Your phone number is saved! We will contact you shortly to arrange the call.';
// the scripted phone-ask markers — lets the server detect (from the last
// assistant reply) that the ask-phone step already ran, so a visitor who
// keeps explaining gets the SHORT reminder instead of a robotic repeat
const PHONE_ASK_MARK_RE = /شماره تماس|phone number with country code/i;

export async function POST(req: NextRequest) {
  purgeOldChats();

  // AI-cost guard: 10 messages per IP per minute
  const rl = rateLimit(`chat:${clientIp(req)}`, 10, 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  // Global ceilings (round-3 finding M4): this endpoint spends money on a
  // paid AI provider, so it also gets a site-wide per-minute and per-day
  // budget that no amount of IP rotation can lift.
  const rlGlobal = rateLimit('chat:__global__', 120, 60 * 1000);
  if (!rlGlobal.ok) return tooManyRequests(rlGlobal.retryAfter);
  const rlDaily = rateLimit('chat:__daily__', 2000, 24 * 60 * 60 * 1000);
  if (!rlDaily.ok) return tooManyRequests(rlDaily.retryAfter);

  // memory guard on the shared host: real messages are ≤ 2000 chars.
  // readJsonBody counts bytes while streaming, so a chunked body (no
  // Content-Length) cannot slip past the cap — round-3 finding M3.
  const parsed = await readJsonBody(req);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const body = parsed.data || {};
    const message = String(body.message ?? '').trim().slice(0, 2000);
    const lang: 'en' | 'fa' = PERSIAN_RE.test(message) ? 'fa' : body.lang === 'fa' ? 'fa' : 'en';
    let sessionId = String(body.sessionId ?? '').trim().slice(0, 64);
    // conversational flow (owner rule): the widget sends which scripted flow
    // the visitor is in ('order' | 'partner') — the chip tap itself never
    // reaches the API (the intro line is instant client-side) so this body
    // flag is how the server knows the NEXT message is the idea/brief
    const flowIn = body.flow === 'order' || body.flow === 'partner' ? body.flow : null;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // session — ownership-bound (round-3 finding L4): continuing a
    // conversation requires the (sessionId, sessionToken) pair the server
    // issued together; a wrong/missing token silently starts a FRESH
    // session instead of continuing someone else's
    const owned = await resolveOwnedSession(
      sessionId,
      String(body.sessionToken ?? '').trim().slice(0, 128)
    );
    sessionId = owned.sessionId;
    const sessionToken = owned.sessionToken;

    // greeting/thanks fast-path: create the session, log both turns, answer
    // now — zero AI cost, zero wait for the shortest (and most common) pings
    const quick =
      message.length <= 40 && GREETING_RE.test(message)
        ? lang === 'fa'
          ? GREETING_FA
          : GREETING_EN
        : message.length <= 40 && THANKS_RE.test(message)
          ? lang === 'fa'
            ? THANKS_FA
            : THANKS_EN
          : null;
    if (quick) {
      await db.chatMessage.create({ data: { sessionId, role: 'user', content: message, lang } });
      await db.chatMessage.create({ data: { sessionId, role: 'assistant', content: quick, lang } });
      return NextResponse.json({ reply: quick, sessionId, sessionToken, sources: [], aiUnavailable: false });
    }

    // history — the LAST 6 messages (asc+take was silently sending the
    // OLDEST 6 of long conversations to the model)
    const history = (
      await db.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 6,
      })
    ).reverse();

    await db.chatMessage.create({
      data: { sessionId, role: 'user', content: message, lang },
    });

    // ── lead capture + ready-made scripts (owner-requested) ────────────
    // Runs BEFORE the AI call so the lead is registered even if every
    // provider then fails. Phone numbers are normalized (separators
    // stripped) and stored on the session; the flags surface as an
    // unread conversation in the admin panel.
    const msgNorm = message.replace(/\u200c/g, ' '); // ZWNJ-tolerant matching
    const orderIntent = ORDER_RE.test(msgNorm);
    const partnerIntent = PARTNER_RE.test(msgNorm);
    const phoneRaw = message.match(PHONE_INTL_RE)?.[0] ?? message.match(PHONE_LOCAL_RE)?.[0] ?? null;
    let phoneCaptured = false;
    // one session read gates everything: phone presence (never re-ask) and
    // note presence (never overwrite a note the lead form set)
    const sess = await db.chatSession
      .findUnique({ where: { id: sessionId }, select: { contactPhone: true, contactNote: true } })
      .catch(() => null);
    // flow memory for the FREE-TYPED path: if the visitor typed an order or
    // partnership intent earlier (without using the chips) the intent note on
    // the session keeps the scripted flow alive — otherwise their idea reply
    // would fall through to the AI and the flow would stall
    const sessFlow =
      sess?.contactNote === 'سفارش پروژه از چت'
        ? 'order'
        : sess?.contactNote === 'درخواست همکاری از چت'
          ? 'partner'
          : null;
    const activeFlow = flowIn ?? sessFlow;
    // a captured phone ends the scripted flow — afterwards the visitor talks
    // to the AI again (or leaves); never re-ask for the number
    const flowActive = !phoneCaptured && !sess?.contactPhone ? activeFlow : null;
    try {
      if (phoneRaw) {
        const normalized = phoneRaw.replace(/(?!^\+)[\s\-()]/g, '').slice(0, 40);
        if (normalized.replace(/\D/g, '').length >= 9) {
          await db.chatSession.update({
            where: { id: sessionId },
            data: { contactPhone: normalized, lead: true, read: false },
          });
          phoneCaptured = true;
        }
      }
      const intentNote =
        activeFlow === 'order' || (!activeFlow && orderIntent)
          ? 'سفارش پروژه از چت'
          : activeFlow === 'partner' || (!activeFlow && partnerIntent)
            ? 'درخواست همکاری از چت'
            : null;
      if (intentNote) {
        await db.chatSession.update({
          where: { id: sessionId },
          data: {
            lead: true,
            read: false,
            ...(sess?.contactNote ? {} : { contactNote: intentNote }),
          },
        });
      }
    } catch (e) {
      console.error('chat lead capture failed:', e);
    }

    // ── ready-made reply («متن آماده»): the two action flows and the phone
    // confirmation are answered with the owner's fixed texts — the AI is
    // never called, so no long improvised answers and no provider wait
    // (the chip tap intro is even faster — the widget answers that one itself)
    const lastUserMsg =
      [...history].reverse().find((h) => h.role === 'user')?.content.replace(/\u200c/g, ' ') ?? '';
    const prevAssistant =
      [...history].reverse().find((h) => h.role === 'assistant')?.content ?? '';
    // the explanation AFTER the partnership question outranks a fresh partner
    // intent — the explanation itself usually contains همکاری/سرمایه and must
    // move to the phone step, never loop the same question (owner flow)
    const partnerFollowUp =
      !phoneCaptured && !sess?.contactPhone && !orderIntent && PARTNER_RE.test(lastUserMsg);
    // the phone-ask step already ran once? → SHORT reminder, not a repeat of
    // the full script (a visitor who keeps typing must not get the same wall)
    const alreadyAskedPhone = PHONE_ASK_MARK_RE.test(prevAssistant);
    const canned = phoneCaptured
      ? lang === 'fa'
        ? PHONE_CONFIRM_FA
        : PHONE_CONFIRM_EN
      : flowActive === 'order'
        ? lang === 'fa'
          ? alreadyAskedPhone
            ? ORDER_REMIND_FA
            : ORDER_ASK_PHONE_FA
          : alreadyAskedPhone
            ? ORDER_REMIND_EN
            : ORDER_ASK_PHONE_EN
        : flowActive === 'partner'
          ? lang === 'fa'
            ? alreadyAskedPhone
              ? PARTNER_REMIND_FA
              : PARTNER_ASK_PHONE_FA
            : alreadyAskedPhone
              ? PARTNER_REMIND_EN
              : PARTNER_ASK_PHONE_EN
          : partnerFollowUp
            ? lang === 'fa'
              ? PARTNER_ASK_PHONE_FA
              : PARTNER_ASK_PHONE_EN
            : partnerIntent
              ? lang === 'fa'
                ? PARTNER_ASK_FA
                : PARTNER_ASK_EN
              : orderIntent
                ? lang === 'fa'
                  ? ORDER_INTRO_FA
                  : ORDER_INTRO_EN
                : null;
    if (canned) {
      await db.chatMessage.create({ data: { sessionId, role: 'assistant', content: canned, lang } });
      return NextResponse.json({
        reply: canned,
        sessionId,
        sessionToken,
        sources: [],
        aiUnavailable: false,
        phoneCaptured,
      });
    }

    // owner rule (2026-09-26 feedback): the phone number is requested by the
    // FLOW itself — once a visitor has actually conversed, invite them once
    // to leave a number so Mehrdad can follow up personally (no chip, no nag)
    const priorUserCount = history.filter((h) => h.role === 'user').length;
    const invitePhone = !phoneCaptured && !sess?.contactPhone && priorUserCount === 2;

    // targeted instruction for the free-form path only — the chip flows and
    // the phone confirmation above are fully scripted now
    let intentBlock = '';
    if (PHONE_INTENT_RE.test(message)) {
      intentBlock =
        lang === 'fa'
          ? '\n\nوضعیت مهم: بازدیدکننده می‌خواهد شماره تماسش را بفرستد. از او بخواه شماره‌اش را با کد کشور بنویسد (مثال: +989123456789). یک جملهٔ کوتاه.'
          : '\n\nIMPORTANT STATE: The visitor wants to send their phone number. Ask them to type it WITH the country code (example: +989123456789). One short sentence.';
    } else if (invitePhone) {
      intentBlock =
        lang === 'fa'
          ? '\n\nوضعیت مهم: بازدیدکننده چند پیام با ما حرف زده است و هنوز شماره تماسش را نداریم. اگر طبیعی بود در پایان پاسخت از او بخواه شماره تماسش را با کد کشور بفرستد (مثل +989123456789) تا برای هماهنگی تماس پیگیری شود. فقط همین یک بار و خیلی کوتاه.'
          : "\n\nIMPORTANT STATE: The visitor has exchanged a few messages and we still don't have their phone number. If it feels natural, end your reply by inviting them to send their phone number WITH country code (like +989123456789) so a call can be arranged. Only this once — keep it very short.";
    }

    // RAG retrieval (3 chunks: fewer prompt tokens → faster first token)
    const chunks = await retrieveContext(message, 3);
    const context = buildContextBlock(chunks);

    // page context (§13): the visitor's current page steers the assistant
    const pageCtxEn =
      body.context === 'fde'
        ? `

PAGE CONTEXT (important): The user is RIGHT NOW on the "Forward Deployed Engineering" service page (مهندسی در خط مقدم حل مسئله) — Mehrdad's core service. Summary: solving real business/product problems end-to-end — process: Discover → Define → Design → Build → Test → Deploy → Learn → Iterate — combining product thinking, engineering and AI. Three roles in one person: Product Builder, Forward Deployed Engineer, AI-Native Engineering. Who it is for: idea without a starting point; existing product with many problems; businesses that want AI; fast MVP needs; complex systems; technical teams facing a hard problem. Outputs: Problem→Strategy, Strategy→Prototype, Prototype→MVP, Existing Product→Audit & Fix, Business→AI Solution, Complex Problem→Custom Solution (not just a report — can include analysis, design, code, prototype, MVP, integration, AI solution, testing, deployment). AI is the force multiplier, human engineering thinking decides. When the user says "this service", they mean Forward Deployed Engineering — answer about THIS page and invite them to describe their problem via chat or the contact form.`
        : '';
    const pageCtxFa =
      body.context === 'fde'
        ? `

بافت صفحه (مهم): کاربر همین حالا در صفحه خدمت «مهندسی در خط مقدم حل مسئله» (Forward Deployed Engineering) است — خدمت اصلی مهرداد. خلاصه: حل مسئله‌های واقعی کسب‌وکار و محصول از ابتدا تا انتها — روند: Discover → Define → Design → Build → Test → Deploy → Learn → Iterate — با ترکیب تفکر محصول، مهندسی و هوش مصنوعی. سه نقش در یک نفر: Product Builder، Forward Deployed Engineer، AI-Native Engineering. مناسب برای: ایده بدون نقطه شروع؛ محصول موجود پرمشکل؛ کسب‌وکارهایی که AI می‌خواهند؛ MVP سریع؛ سیستم‌های پیچیده؛ تیم‌های فنی با مسئله سخت. خروجی‌ها: Problem→Strategy، Strategy→Prototype، Prototype→MVP، Existing Product→Audit & Fix، Business→AI Solution، Complex Problem→Custom Solution (فقط گزارش نیست — می‌تواند تحلیل، طراحی، کد، Prototype، MVP، Integration، راهکار AI، تست و Deployment باشد). AI نیروی تقویت‌کننده است و تصمیم با تفکر مهندسی انسانی است. وقتی کاربر می‌گوید «این سرویس»، منظورش همین صفحه است — درباره همین خدمت پاسخ بده و او را دعوت کن مسئله‌اش را همین‌جا یا از طریق فرم تماس توضیح دهد.`
        : '';

    // owner-requested (2026-09-26): a always-on base knowledge block — the
    // RAG chunks alone left the bot feeling like it "knew nothing" when the
    // retrieval missed. These facts are permanent and verified by the owner.
    const baseEn = `BASE FACTS (always true — even when the knowledge below is empty):
- Services: Forward Deployed Engineering (FDE) — solving real business/product problems end to end with product thinking + engineering + AI; fast MVP building; AI adoption for businesses.
- Games: Traffic Tempo — a traffic-puzzle Android game on Cafe Bazaar: 50 handcrafted levels, endless solver-verified stage machine, fully offline, lightweight (~20MB), no forced mid-game ads. Plus a quiz game project.
- Startups and experiments: BIZPAL, KLIKA, smart city and rail corridor research, smart waste startup; 83+ articles of real research and lessons on the site.
- KLIKA one-pager: the KLIKA investor pitch page (super-app — one platform for dozens of online services: transport, shopping, travel, daily services) is live at https://mehrdad.ir/s/kilika.html; pitch for investors and partners: 1M+ target users in year one, 20+ service categories, $4M requested funding; contact admin@mehrdad.ir.
- Ordering rule: to order a project the visitor first describes the idea in 1–2 lines; THEN the flow asks for a phone number WITH country code; calls are always ARRANGED at a mutually agreed time — never promise an immediate call. Cost and timeline are announced only AFTER the idea is reviewed — NEVER invent prices or deadlines. If asked about cost, say exactly that.
- Partnership/investment rule: ask what kind of cooperation or investment they have in mind; after they explain, collect their phone number with country code.`;
    const baseFa = `حقایق پایه (همیشه درست است حتی وقتی دانش زیر خالی است):
- خدمات: مهندسی در خط مقدم حل مسئله (FDE) — حل مسئله‌های واقعی کسب‌وکار و محصول از ابتدا تا انتها با تفکر محصول و مهندسی و AI؛ ساخت MVP سریع؛ به‌کارگیری AI در کسب‌وکار.
- بازی‌ها: ترافیک تمپو — بازی پازل ترافیک اندروید در کافه‌بازار: ۵۰ مرحله دست‌ساز و موتور مراحل بی‌نهایت تأییدشده با حل‌کننده و کاملاً آفلاین و کم‌حجم (~۲۰ مگابایت) و بدون تبلیغ اجباری وسط بازی. به‌علاوه یک پروژه بازی کوییز.
- استارتاپ‌ها و آزمایش‌ها: BIZPAL و کلیکا و پژوهش شهر هوشمند و کریدور ریلی و استارتاپ مدیریت زباله هوشمند؛ بیش از ۸۳ مقاله از پژوهش‌ها و درس‌های واقعی در سایت.
- صفحه تک‌تصویری کلیکا: صفحه ارائه سرمایه‌گذاری کلیکا (سوپر اپلیکیشن — یک پلتفرم برای ده‌ها سرویس آنلاین: حمل‌ونقل و خرید و سفر و خدمات روزمره) در https://mehrdad.ir/s/kilika.html فعال است؛ ارائه برای سرمایه‌گذاران و شرکا: هدف بیش از ۱ میلیون کاربر در سال اول و ۲۰+ دسته‌بندی خدمات و سرمایه درخواستی ۴ میلیون دلار؛ تماس: admin@mehrdad.ir
- قاعدهٔ سفارش: برای سفارش پروژه بازدیدکننده اول ایده را در ۱–۲ خط توضیح می‌دهد؛ بعد از آن شماره تماس با کد کشور خواسته می‌شود؛ تماس همیشه «با هماهنگی» و در زمانی که هر دو راحت باشیم انجام می‌شود — هرگز تماس فوری وعده نده. هزینه و زمان فقط بعد از بررسی ایده اعلام می‌شود — هرگز قیمت یا زمان حدسی نگو. اگر پرسیدند دقیقاً همین را بگو.
- قاعدهٔ همکاری و سرمایه‌گذاری: بپرس چه نوع همکاری یا سرمایه‌گذاری در نظر دارد؛ بعد از توضیح او شماره تماس با کد کشور را بخواه.`;

    const sysEn = `You are "Mehrdad AI", the official AI assistant on Mehrdad's personal website (mehrdad.ir). Mehrdad is an independent product builder: he designs businesses and products with care, and builds them fast with AI. His work: BUILD (AI-powered products, software, tools, experiments), HELP (businesses using AI for measurable value: sales, marketing, product design, invention commercialization), SHARE (83+ articles of real research, decisions and lessons).

${baseEn}

Use the site knowledge below together with the base facts to answer. If the answer is nowhere, say you don't have that info and suggest the contact form at mehrdad.ir/contact.

Be helpful and EXTREMELY concise: 1–2 short sentences, at most ~25 words. Short answers also load faster for the visitor. Plain text only — NEVER use bullet lists, headings or markdown. If more detail is truly needed, invite them to ask a follow-up. Answer in English.

SITE KNOWLEDGE:
${context || '(no specific knowledge found — rely only on the base facts above)'}${pageCtxEn}`;

    const sysFa = `تو «هوش مصنوعی مهرداد» هستی، دستیار رسمی وب‌سایت شخصی مهرداد (mehrdad.ir). مهرداد سازنده مستقل محصول است: کسب‌وکارها و محصولات را با دقت طراحی می‌کند و با هوش مصنوعی سریع می‌سازد. کار او: ساخت (محصولات و ابزارهای AI)، همراهی (به‌کارگیری AI با نتیجه قابل اندازه‌گیری: فروش، بازاریابی، طراحی محصول، تجاری‌سازی اختراع)، و به‌اشتراک‌گذاری (بیش از ۸۳ مقاله از پژوهش‌ها و درس‌های واقعی).

${baseFa}

از دانش سایت زیر همراه با حقایق پایه برای پاسخ استفاده کن. اگر پاسخ هیچ‌جا نبود بگو اطلاعاتی نداری و فرم تماس در mehrdad.ir/contact را پیشنهاد بده.

خیلی کوتاه و مفید پاسخ بده: فقط ۱–۲ جملهٔ کوتاه (حداکثر ~۲۵ کلمه). پاسخ کوتاه‌تر برای مخاطب سریع‌تر هم بارگذاری می‌شود. متن ساده — هرگز از لیست گلوله‌ای، تیتر یا مارک‌داون استفاده نکن. اگر جزئیات بیشتر واقعاً لازم بود دعوت کن سؤال بعدی بپرسد. به فارسی روان و بدون ویرگول پاسخ بده.

دانش سایت:
${context || '(دانش خاصی یافت نشد — فقط از حقایق پایه بالا استفاده کن)'}${pageCtxFa}`;

    const turns: ChatTurn[] = [
      { role: 'system', content: (lang === 'fa' ? sysFa : sysEn) + intentBlock },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ];

    let reply = '';
    let aiUnavailable = false;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // ── streaming mode ────────────────────────────────────────────────
    // The widget sends stream:true and renders word-by-word (SSE). This is
    // the perceived-latency fix for free-tier models that can take 10s+.
    if (body.stream === true) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(ctrl) {
          const send = (obj: unknown) => ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          let full = '';
          let started = false; // any delta already sent → no retries (would duplicate)
          let servedBy = ''; // which provider answered (debug/observability)
          try {
            send({ sessionId, sessionToken }); // bind the session (and its owner token) before first token
            const chain = await getProviderChain();
            // attempt 1: generous budget; attempt 2 (transient 429/5xx):
            // short — the visitor is already waiting. When several providers
            // are configured the per-provider budget shrinks so the failover
            // walk can never exceed the 60s serverless ceiling.
            const attempts: [number, number][] =
              chain.length > 1
                ? [
                    [0, 25_000],
                    [1_500, 8_000],
                  ]
                : [
                    [0, 40_000],
                    [1_500, 10_000],
                  ];
            outer: for (const provider of chain) {
              for (const [waitMs, tmo] of attempts) {
                if (waitMs) await sleep(waitMs);
                try {
                  for await (
                    const piece of chatCompletionStream(provider, turns, { timeoutMs: tmo, maxTokens: 300 })
                  ) {
                    full += piece;
                    if (!started) {
                      started = true;
                    }
                    send({ delta: piece });
                  }
                  if (full) {
                    servedBy = provider.name;
                    break outer;
                  }
                  // stream ended but produced nothing (thinking-model burned
                  // the budget on reasoning): one non-stream retry — its
                  // extractText() can surface the reasoning tail
                  if (!started) {
                    full = await chatCompletion(provider, turns, { timeoutMs: 8_000, maxTokens: 300 });
                    if (full) {
                      started = true;
                      servedBy = provider.name;
                      send({ delta: full });
                      break outer;
                    }
                  }
                } catch (err) {
                  if (started) break outer; // mid-stream: end gracefully with what we have
                  const msg = String((err as Error)?.message || err);
                  console.error(
                    `chat stream provider ${provider.name} failed:`,
                    msg.slice(0, 200),
                  );
                  // transient (429/5xx): retry same provider once; anything
                  // else (bad key, credit gate, …): fail over to the next one
                  if (!/429|5\d\d/.test(msg)) break;
                }
              }
              if (chain.length > 1 && provider !== chain[chain.length - 1]) {
                console.warn(`chat failover: ${provider.name} exhausted, trying next provider`);
              }
            }
            if (!full) {
              // sandbox/dev fallback (no-op '' on Vercel), then honest message
              full = await zaiComplete(turns, { timeoutMs: 8_000 });
              if (full) servedBy = 'zai-fallback';
            }
            if (!full) {
              full = lang === 'fa' ? UNCONFIGURED_FA : UNCONFIGURED_EN;
              send({ delta: full });
              send({ aiUnavailable: true });
            } else if (!started) {
              // answered outside the stream loop (fallback path): push at once
              send({ delta: full });
            }
            await db.chatMessage.create({ data: { sessionId, role: 'assistant', content: full, lang } });
            const sources = [...new Set(chunks.map((c) => c.refSlug).filter(Boolean))].slice(0, 4);
            send({
              done: true,
              sources,
              servedBy,
              aiUnavailable: full === (lang === 'fa' ? UNCONFIGURED_FA : UNCONFIGURED_EN),
            });
            ctrl.close();
          } catch (e) {
            console.error('chat stream error:', e);
            try {
              send({ error: 'Chat failed' });
              ctrl.close();
            } catch {
              // client already gone
            }
          }
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // ── legacy JSON mode (non-streaming callers) ──────────────────────
    // walk the provider chain: active first, then every other configured
    // provider — a dead provider (empty credit, revoked key, outage) costs
    // one fast failed request, not the whole conversation
    const chain = await getProviderChain();
    for (const provider of chain) {
      let lastErr: unknown = null;
      const legacyTmo = chain.length > 1 ? 25_000 : 45_000;
      for (const waitMs of [0, 1_500]) {
        if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
        try {
          reply = await chatCompletion(provider, turns, { timeoutMs: legacyTmo, maxTokens: 300 });
          if (reply) break;
        } catch (err) {
          lastErr = err;
          const msg = String((err as Error)?.message || err);
          // transient (429/5xx): retry same provider; else fail over now
          if (!/429|5\d\d/.test(msg)) break;
        }
      }
      if (reply) break;
      if (lastErr) console.error(`chat provider ${provider.name} failed:`, lastErr);
    }

    // 2) sandbox/dev fallback (z-ai-web-dev-sdk) — a no-op '' on hosting
    //    environments without the SDK, so the route degrades gracefully
    if (!reply) {
      for (const waitMs of [0, 1_500]) {
        if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
        reply = await zaiComplete(turns, { timeoutMs: 8_000 });
        if (reply) break;
      }
    }

    // 3) nothing configured / everything failed → honest message; the user's
    //    message is already saved so the owner sees the question in the panel
    if (!reply) {
      aiUnavailable = true;
      reply = lang === 'fa' ? UNCONFIGURED_FA : UNCONFIGURED_EN;
    }

    await db.chatMessage.create({
      data: { sessionId, role: 'assistant', content: reply, lang },
    });

    const sources = [...new Set(chunks.map((c) => c.refSlug).filter(Boolean))].slice(0, 4);

    return NextResponse.json({ reply, sessionId, sessionToken, sources, aiUnavailable });
  } catch (e) {
    console.error('chat api error:', e);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}

// user-requested deletion of one conversation (privacy: "delete my data")
export async function DELETE(req: NextRequest) {
  // abuse guard: the delete handler is public, so cap how often an IP may
  // hammer it (random-ID deletes are harmless but should not cost DB work)
  const rl = rateLimit(`chatdel:${clientIp(req)}`, 10, 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  try {
    const parsed = await readJsonBody(req, 4);
    if (!parsed.ok) return jsonBodyError(parsed.error);
    const body = parsed.data;
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim().slice(0, 64) : '';
    // ownership-bound deletion (round-3 finding L4): only the visitor who
    // holds the token issued WITH this session may remove it — a known or
    // guessed id alone deletes nothing (the answer stays ok:true either
    // way, so existence is never revealed)
    const clientToken = typeof body?.sessionToken === 'string' ? body.sessionToken.trim().slice(0, 128) : '';
    if (sessionId && (await isSessionOwner(sessionId, clientToken))) {
      // messages cascade-delete with the session
      await db.chatSession.delete({ where: { id: sessionId } }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
