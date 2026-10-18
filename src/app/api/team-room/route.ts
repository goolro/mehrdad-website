import { NextRequest } from 'next/server';
import {
  chatCompletion,
  getProviderChain,
  zaiComplete,
  type ChatTurn,
} from '@/lib/ai-provider';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * اتاق تیم — orchestration چندایجنتی به سبک Grok (docs.x.ai → grok-4.20-multi-agent):
 *  ۱) کاربر فقط «یک» مأموریت کلی می‌دهد.
 *  ۲) «کاپیتان» (leader) مأموریت را تجزیه می‌کند و به هر متخصص سهم اختصاصی می‌دهد.
 *  ۳) متخصص‌ها با دیدن حرف‌های هم، سهم خودشان را می‌سازند.
 *  ۴) ناقد خروجی همه را cross-check می‌کند.
 *  ۵) کاپیتان بحث را جمع‌بندی و تحویل نهایی می‌دهد.
 * LLM backend = همان provider chain ای که پنل ادمین تنظیم کرده (Gemini/OpenRouter/...)
 * با failover + fallback به ZAI در محیط development.
 */

type Specialist = { key: string; name: string; color: string; persona: string };

const CAPTAIN = { name: 'کاپیتان', color: 'emerald' };

const SPECIALISTS: Specialist[] = [
  {
    key: 'researcher',
    name: 'پژوهشگر',
    color: 'amber',
    persona:
      'تو «پژوهشگر» تیم هستی. سهمی که کاپیتان به تو داده را اجرا کن: زمینه، مخاطب و واقعیتِ ماجرا را روشن کن — دقیق، ملموس، بدون حاشیه.',
  },
  {
    key: 'strategist',
    name: 'استراتژیست',
    color: 'violet',
    persona:
      'تو «استراتژیست» تیم هستی. سهمی که کاپیتان به تو داده را اجرا کن: رویکرد و ساختار کار را طراحی کن و روی حرف‌های قبلی تیم بساز — تکرار نکن.',
  },
  {
    key: 'builder',
    name: 'سازنده',
    color: 'orange',
    persona:
      'تو «سازنده» تیم هستی. سهمی که کاپیتان به تو داده را اجرا کن: خودِ خروجی را بنویس (متن/طرح/برنامه)، نه توصیفش را. قوانین صادقگی: هیچ عدد، آمار یا تعریف مشتریِ جعلی ننویس.',
  },
  {
    key: 'critic',
    name: 'ناقد',
    color: 'rose',
    persona:
      'تو «ناقد» تیم هستی. مثل تیم‌های چندایجنتی، کارِ همه را cross-check کن: دقیقاً ۳ ایراد مشخص (تناقض، جای خالی، ادعای بی‌مبنا) — هر کدام با یک راه اصلاح. بی‌تعارف ولی محترم.',
  },
  {
    key: 'finisher',
    name: 'پرداخت‌گر',
    color: 'teal',
    persona:
      'تو «پرداخت‌گر» تیم هستی. سهمی که کاپیتان به تو داده را اجرا کن: ایرادهای مطرح‌شده را اعمال کن و نسخه‌ی منسجم و آماده‌ی بخش خودت را تحویل بده.',
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** یک completion با failover روی کل زنجیره‌ی providerها + fallback به ZAI. */
async function complete(messages: ChatTurn[]): Promise<string> {
  const chain = await getProviderChain();
  let lastErr: unknown = null;

  for (const provider of chain) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const out = await chatCompletion(provider, messages, { timeoutMs: 25_000, maxTokens: 900 });
        if (out.trim()) return out.trim();
        throw new Error(`provider ${provider.name} returned empty completion`);
      } catch (e) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        if (attempt < 2 && (msg.includes('429') || msg.includes('rate'))) {
          await sleep(6_000);
          continue;
        }
        break; // next provider
      }
    }
  }

  // dev fallback (روی Vercel معمولاً در دسترس نیست و خطا می‌دهد)
  try {
    const out = await zaiComplete(messages, { timeoutMs: 25_000, maxTokens: 900 });
    if (out?.trim()) return out.trim();
  } catch (e) {
    lastErr = e;
  }

  if (lastErr) throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  throw new Error('NO_PROVIDER');
}

type Plan = { title: string; tasks: string[] };

function fallbackPlan(mission: string): Plan {
  return {
    title: mission.slice(0, 80),
    tasks: [
      `زمینه و مخاطبِ «${mission}» را روشن کن: مسئله، مخاطب اصلی و یک نکته‌ی کلیدی.`,
      `رویکرد و ساختار خروجی برای «${mission}» را در چند بند طراحی کن.`,
      `نسخه‌ی اولِ کاملِ خروجیِ «${mission}» را بنویس.`,
      `خروجی همه را بررسی کن: ۳ ایراد مشخص با راه اصلاح.`,
      `با اعمال نقدِ ناقد، نسخه‌ی نهایی منسجم بخش خودت را تحویل بده.`,
    ],
  };
}

function parsePlan(raw: string): Plan | null {
  let t = raw.replace(/```(?:json)?/gi, '').trim();
  const s = t.indexOf('{');
  const e = t.lastIndexOf('}');
  if (s === -1 || e <= s) return null;
  t = t.slice(s, e + 1);
  try {
    const j = JSON.parse(t) as { title?: unknown; tasks?: unknown };
    const title =
      typeof j.title === 'string' && j.title.trim() ? j.title.trim().slice(0, 80) : null;
    const tasks = Array.isArray(j.tasks)
      ? j.tasks
          .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
          .map((x) => x.trim().slice(0, 220))
      : [];
    if (tasks.length === 5) return { title: title ?? 'مأموریت تیم', tasks };
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // abuse guard: هر IP حداکثر ۵ مأموریت در ساعت (هر اجرا ۷ فراخوانی LLM است)
  const rl = rateLimit(`teamroom:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let mission = '';
  try {
    const body = (await req.json()) as { mission?: unknown };
    if (typeof body?.mission === 'string') mission = body.mission.trim().slice(0, 600);
  } catch {
    return Response.json({ error: 'بدنه‌ی درخواست نامعتبر است.' }, { status: 400 });
  }
  if (mission.length < 5) {
    return Response.json({ error: 'مأموریت را کامل بنویس (حداقل ۵ حرف).' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const TOTAL = 7; // ۱ کاپیتان + ۵ متخصص + ۱ سنتز کاپیتان

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };
      try {
        // ── فاز ۱: کاپیتان مأموریت را تجزیه و تقسیم می‌کند ──
        send({ type: 'status', agent: CAPTAIN.name, color: CAPTAIN.color, step: 1, total: TOTAL });

        const planPrompt = `تو «کاپیتان» یک تیم ۵ نفره از ایجنت‌های متخصص هستی: پژوهشگر، استراتژیست، سازنده، ناقد، پرداخت‌گر. کاربر فقط یک مأموریت کلی می‌دهد و تو مثل رهبر تیم چندایجنتی، خودت آن را تجزیه می‌کنی و به هر عضو دقیقاً همان بخشی را می‌دهی که برای «این مأموریت خاص» لازم است. سهم‌ها مکمل هم باشند، نه هم‌پوشان.

مأموریت کاربر: ${mission}

فقط و فقط یک JSON خالص برگردان — بدون هیچ متن اضافه، بدون کدبلاک:

{"title":"عنوان کوتاه مأموریت","tasks":["سهم پژوهشگر","سهم استراتژیست","سهم سازنده","سهم ناقد","سهم پرداخت‌گر"]}

هر سهم حداکثر ۲۵ کلمه، فارسی، مشخص و اجراپذیر.`;

        let plan: Plan | null = null;
        try {
          const raw = await complete([
            {
              role: 'system',
              content: 'تو کاپیتان تیم چندایجنتی هستی؛ خروجی تو فقط JSON خالص است.',
            },
            { role: 'user', content: planPrompt },
          ]);
          plan = parsePlan(raw);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes('NO_PROVIDER') || msg.includes('No AI provider configured')) throw e;
          plan = null;
        }
        const finalPlan = plan ?? fallbackPlan(mission);

        send({
          type: 'plan',
          title: finalPlan.title,
          agents: SPECIALISTS.map((sp, i) => ({
            key: sp.key,
            name: sp.name,
            color: sp.color,
            task: finalPlan.tasks[i],
          })),
        });

        // ── فاز ۲: متخصص‌ها بحث و ساخت — هرکدام با سهمِ اختصاصی ──
        const transcript: { name: string; text: string }[] = [];
        const assignment = SPECIALISTS.map(
          (sp, i) => `${i + 1}. ${sp.name}: ${finalPlan.tasks[i]}`
        ).join('\n');

        for (let i = 0; i < SPECIALISTS.length; i++) {
          const sp = SPECIALISTS[i];
          const step = i + 2;
          send({ type: 'status', agent: sp.name, color: sp.color, step, total: TOTAL });

          const dialog =
            transcript.length === 0
              ? 'گفت‌وگوی تیم تازه شروع شده؛ نوبت اول توست.'
              : `گفت‌وگوی تیم تا این‌جا:\n\n${transcript
                  .map((t) => `«${t.name}»:\n${t.text}`)
                  .join('\n\n')}`;

          const turns: ChatTurn[] = [
            { role: 'system', content: sp.persona },
            {
              role: 'user',
              content: `مأموریت کلی تیم: ${mission}\n\nتقسیم کارِ کاپیتان:\n${assignment}\n\n${dialog}\n\nوظیفه‌ی اختصاصی تو (از کاپیتان): ${finalPlan.tasks[i]}\n\nنوبت توست — سهمت را اجرا کن و با کار بقیه هم‌راستا باش. حداکثر ۱۵۰ کلمه، فارسی، بدون مقدمه و تعارف.`,
            },
          ];

          const out = await complete(turns);
          transcript.push({ name: sp.name, text: out });
          send({ type: 'agent', agent: sp.name, color: sp.color, text: out, step, total: TOTAL });
        }

        // ── فاز ۳: کاپیتان بحث را جمع‌بندی و تحویل نهایی می‌دهد ──
        send({
          type: 'status',
          agent: CAPTAIN.name,
          color: CAPTAIN.color,
          step: TOTAL,
          total: TOTAL,
        });

        const synthesis = await complete([
          {
            role: 'system',
            content:
              'تو «کاپیتان» تیم چندایجنتی هستی و قبلاً خودت کار را بین اعضا تقسیم کرده‌ای. حالا مثل leader تیم، بحث را جمع‌بندی می‌کنی و «پاسخ نهایی» را تحویل می‌دهی. قوانین صادقگی: هیچ عدد، آمار یا تعریف جعلی ننویس.',
          },
          {
            role: 'user',
            content: `مأموریت کاربر: ${mission}\n\nنقشه‌ی تقسیم کار (خودت): ${finalPlan.tasks.join(' | ')}\n\nگفت‌وگوی کامل تیم:\n\n${transcript
              .map((t) => `«${t.name}»:\n${t.text}`)
              .join('\n\n')}\n\nحالا «خروجی نهایی» را خودت بنویس: کارِ کامل و آماده‌ی استفاده — نه گزارش فرایند، نه خلاصه‌ی حرف‌ها. اگر ناقد ایراد مهمی گذاشته، در نسخه‌ی نهایی اعمالش کن. حداکثر ۲۵۰ کلمه، فارسی.`,
          },
        ]);

        send({ type: 'deliverable', agent: CAPTAIN.name, text: synthesis });
        send({ type: 'done' });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('team-room orchestration failed:', msg);
        if (msg.includes('NO_PROVIDER') || msg.includes('No AI provider configured')) {
          send({
            type: 'error',
            message:
              'موتور هوش مصنوعی سایت هنوز تنظیم نشده است. در پنل مدیریت، یک Provider اضافه کن (مثلاً Gemini رایگان) و دوباره امتحان کن.',
          });
        } else {
          send({
            type: 'error',
            message: 'یکی از ایجنت‌ها پاسخ نداد — چند دقیقه بعد دوباره امتحان کن.',
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
