import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retrieveContext, buildContextBlock } from '@/lib/rag';
import { chatCompletion, getActiveProvider, zaiComplete, type ChatTurn } from '@/lib/ai-provider';
import { clientIp, readJsonBody, jsonBodyError, rateLimit, tooManyRequests } from '@/lib/rate-limit';

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
    const lang: 'en' | 'fa' = body.lang === 'fa' ? 'fa' : 'en';
    let sessionId = String(body.sessionId ?? '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // session
    if (sessionId) {
      const exists = await db.chatSession.findUnique({ where: { id: sessionId } });
      if (!exists) sessionId = '';
    }
    if (!sessionId) {
      const s = await db.chatSession.create({ data: {} });
      sessionId = s.id;
    }

    // history (last 8 messages)
    const history = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 8,
    });

    await db.chatMessage.create({
      data: { sessionId, role: 'user', content: message, lang },
    });

    // RAG retrieval
    const chunks = await retrieveContext(message, 6);
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

    const sysEn = `You are "Mehrdad AI", the official AI assistant on Mehrdad's personal website (mehrdad.ir). Mehrdad is an independent product builder: he designs businesses and products with care, and builds them fast with AI. His work: BUILD (AI-powered products, software, tools, experiments — e.g. BIZPAL, KLIKA, smart city & rail corridor research, smart waste startup), HELP (businesses using AI for measurable value: sales, marketing, product design, invention commercialization), SHARE (83+ articles of real research, decisions and lessons).

Use ONLY the following site knowledge to answer. If the answer is not in the knowledge, say you don't have that info and suggest using the contact form at mehrdad.ir/contact.

Be helpful, professional and concise (max ~180 words). Use markdown sparingly. Answer in English.

SITE KNOWLEDGE:
${context || '(no specific knowledge found — rely only on the general info above)'}${pageCtxEn}`;

    const sysFa = `تو «هوش مصنوعی مهرداد» هستی، دستیار رسمی وب‌سایت شخصی مهرداد (mehrdad.ir). مهرداد سازنده مستقل محصول است: کسب‌وکارها و محصولات را با دقت طراحی می‌کند و با هوش مصنوعی سریع می‌سازد. کار او: ساخت (محصولات و ابزارهای AI مثل BIZPAL، کلیکا، پژوهش شهر هوشمند و کریدور ریلی، استارتاپ مدیریت زباله هوشمند)، همراهی (به‌کارگیری AI با نتیجه قابل اندازه‌گیری: فروش، بازاریابی، طراحی محصول، تجاری‌سازی اختراع)، و به‌اشتراک‌گذاری (بیش از ۸۳ مقاله از پژوهش‌ها و درس‌های واقعی).

فقط از دانش سایت زیر برای پاسخ استفاده کن. اگر پاسخ در دانش موجود نبود، بگو اطلاعاتی نداری و فرم تماس در mehrdad.ir/contact را پیشنهاد بده.

مفید، حرفه‌ای و مختصر پاسخ بده (حداکثر ~۱۸۰ کلمه). به فارسی روان پاسخ بده.

دانش سایت:
${context || '(دانش خاصی یافت نشد — فقط از اطلاعات کلی بالا استفاده کن)'}${pageCtxFa}`;

    const turns: ChatTurn[] = [
      { role: 'system', content: lang === 'fa' ? sysFa : sysEn },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user', content: message },
    ];

    let reply = '';
    let aiUnavailable = false;

    // 1) admin-configured OpenAI-compatible provider (works everywhere,
    //    including Vercel production)
    const provider = await getActiveProvider();
    if (provider) {
      // resilience: short retries for transient 429/5xx storms, then graceful
      let lastErr: unknown = null;
      for (const waitMs of [0, 4000, 9000]) {
        if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
        try {
          reply = await chatCompletion(provider, turns, { timeoutMs: 50_000 });
          if (reply) break;
        } catch (err) {
          lastErr = err;
          const msg = String((err as Error)?.message || err);
          if (!/429|5\d\d/.test(msg)) break; // non-transient: no point retrying
        }
      }
      if (!reply && lastErr) console.error('chat provider error:', lastErr);
    }

    // 2) sandbox/dev fallback (z-ai-web-dev-sdk) — a no-op '' on hosting
    //    environments without the SDK, so the route degrades gracefully
    if (!reply) {
      for (const waitMs of [0, 4000, 9000]) {
        if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
        reply = await zaiComplete(turns, { timeoutMs: 50_000 });
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

    return NextResponse.json({ reply, sessionId, sources, aiUnavailable });
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
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
    if (sessionId) {
      // messages cascade-delete with the session
      await db.chatSession.delete({ where: { id: sessionId } }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
