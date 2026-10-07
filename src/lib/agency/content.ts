/**
 * Content Studio server helpers (استودیو محتوا) — Task 55.
 *
 * Pipeline: reference reel → LLM ideation (5 similar-not-copied concepts per
 * sample, with Persian caption + hashtags) → CogVideoX text-to-video via the
 * z-ai SDK (async task) → status polling → branded outro card at the end.
 *
 * The outro card is a committed static asset (public/agency-content/
 * outro-card.png, 720×1280) so Persian text renders exactly — no AI text.
 */

import { db } from '@/lib/db';

// ── types ────────────────────────────────────────────────────────────────

export interface StudioIdea {
  idx: number;
  title: string;
  hook: string;
  script: string;
  videoPrompt: string;
  caption: string;
  hashtags: string[];
}

export interface StudioSampleSeed {
  reelId: string;
  url: string;
  account: string;
  styleTag: string;
  title: string;
  note: string;
  likes: string;
  hashtags: string[];
}

// ── seed data: the owner's 10 reference reels (captions fetched 2026-10-07) ─

export const SAMPLE_SEED: StudioSampleSeed[] = [
  {
    reelId: 'DYTZGk0gTRO',
    url: 'https://www.instagram.com/reel/DYTZGk0gTRO/',
    account: 'hellopersonality',
    styleTag: 'ai-cinematic',
    title: 'سوارِ ستاره‌ها (۱۲M لایک)',
    note: 'ویدیوی سینمایی AI با فضای کهکشانی و رؤیایی، حرکت بسیار آهسته دوربین، نور طلایی-آبی، حس پرواز و آرامش؛ بدون متن، فقط تصویر + موزیک.',
    likes: '12M',
    hashtags: ['aivideo', 'cinematic', 'dreamscape', 'reels', 'visualart'],
  },
  {
    reelId: 'DcTtRd_zM0i',
    url: 'https://www.instagram.com/reel/DcTtRd_zM0i/',
    account: 'goated_arts',
    styleTag: 'ai-art',
    title: 'هنر AI انیمه (۱۷۴K لایک)',
    note: 'هنر دیجیتال انیمه ساخته‌شده با AI، شخصیت کارتونی قدرتمند، رنگ‌های اشباع، ذرات نور و افکت سینمایی؛ حس حماسه.',
    likes: '174K',
    hashtags: ['anime', 'aiart', 'digitalart', 'animeart', 'ai'],
  },
  {
    reelId: 'DeCLuBwMIOO',
    url: 'https://www.instagram.com/reel/DeCLuBwMIOO/',
    account: 'apexmarkhortours',
    styleTag: 'nature',
    title: 'طبیعت بدون استرس (۷۲K لایک)',
    note: 'فیلم‌برداری طبیعت و کوهستان با حس سفر و آرامش، هوای مه‌آلود صبحگاهی، drone shot آرام، حس «اینجا بدون استرس است».',
    likes: '72K',
    hashtags: ['foryou', 'instagram', 'viral', 'videography', 'foryoupage'],
  },
  {
    reelId: 'DdxJxRBiKEA',
    url: 'https://www.instagram.com/reel/DdxJxRBiKEA/',
    account: 'hellopersonality',
    styleTag: 'ai-cinematic',
    title: 'بازآرایی (۶۷K لایک)',
    note: 'ویدیوی سینمایی AI با المان‌های شناور و نئون، فضای تاریک لوکس، حرکت آهسته، حس تحول و دگرگونی.',
    likes: '67K',
    hashtags: ['aivideo', 'cinematic', 'neon', 'reels'],
  },
  {
    reelId: 'DdD5JKqokQA',
    url: 'https://www.instagram.com/reel/DdD5JKqokQA/',
    account: 'aicrystalsq',
    styleTag: 'motivation-fa',
    title: 'آهنربای ثروت (۱۰۶K لایک)',
    note: 'ویدیوی انگیزشی فارسی با جلوه طلایی و کوهستان، حس جذب ثروت و فراوانی، ذرات طلایی شناور، حس لوکس و قدرتمند؛ کپشن affirmations فارسی.',
    likes: '106K',
    hashtags: ['mountain', 'golden', 'wealth', 'money', 'diamante'],
  },
  {
    reelId: 'DbR8ySkmWb6',
    url: 'https://www.instagram.com/reel/DbR8ySkmWb6/',
    account: 'hellothoughtpalace',
    styleTag: 'ai-cinematic',
    title: 'ساده‌سازی (۹۰۶K لایک)',
    note: 'ویدیوی سینمایی AI مینیمال با حس شفافیت و سادگی، فضاهای باز و نور ملایم، حرکت روان، حس «پیچیدگی را ساده کن».',
    likes: '906K',
    hashtags: ['aivideo', 'minimal', 'cinematic', 'reels'],
  },
  {
    reelId: 'DcU13RzsgUd',
    url: 'https://www.instagram.com/reel/DcU13RzsgUd/',
    account: 'nexyra.visuals',
    styleTag: 'ai-art',
    title: 'قلب بر فراز افق (۳۳۵K لایک)',
    note: 'هنر رؤیایی AI با اقیانوس و ماه، فضای سوررئال و احساسی، رنگ‌های گرم و سرد در تضاد، حس عظمت و رویا.',
    likes: '335K',
    hashtags: ['dreamscape', 'oceanart', 'visualart', '4kwallpaper', 'surreal'],
  },
  {
    reelId: 'DYdsRJyHc7g',
    url: 'https://www.instagram.com/reel/DYdsRJyHc7g/',
    account: 'hellopersonality',
    styleTag: 'ai-cinematic',
    title: 'نگاهی به آینده (۵۹۵K لایک)',
    note: 'ویدیوی سینمایی AI با فضای آینده‌نگر، شهرهای نورانی و تکنولوژی، حس کنجکاوی برای دیدن آینده.',
    likes: '595K',
    hashtags: ['aivideo', 'future', 'cinematic', 'futuristic'],
  },
  {
    reelId: 'Dc3F7idt7Wt',
    url: 'https://www.instagram.com/reel/Dc3F7idt7Wt/',
    account: 'pearlmetalsafrica',
    styleTag: 'brand',
    title: 'طلا؛ فراتر از فلز (۲۹۰K لایک)',
    note: 'ویدیوی برند-محور با شمش‌ها و جواهرات طلایی درخشان، فضای لوکس حرفه‌ای، حس اعتماد و ثروت و امنیت؛ پیام برند واضح.',
    likes: '290K',
    hashtags: ['gold', 'luxury', 'business', 'investment', 'wealth'],
  },
  {
    reelId: 'DeLc2YDDqlO',
    url: 'https://www.instagram.com/reel/DeLc2YDDqlO/',
    account: 'lifewithshadow1',
    styleTag: 'pets',
    title: 'حیوانات بامزه (۴K لایک)',
    note: 'ویدیوی بامزه و شن‌دار از حیوانات خانگی با حرکات طنز، حس شادی و سرگرمی، ریتم سریع.',
    likes: '4K',
    hashtags: ['dogs', 'husky', 'funny', 'viralpost', 'reels', 'shorts'],
  },
];

/** Popular hashtags merged into every idea (owner asked for «هشتگ‌های پر کاربرد»). */
export const HASHTAG_SEED: { tag: string; lang: string; category: string }[] = [
  { tag: 'استارتاپ', lang: 'fa', category: 'startup' },
  { tag: 'موفقیت', lang: 'fa', category: 'motivation' },
  { tag: 'انگیزه', lang: 'fa', category: 'motivation' },
  { tag: 'کسب_و_کار', lang: 'fa', category: 'startup' },
  { tag: 'کارآفرینی', lang: 'fa', category: 'startup' },
  { tag: 'ثروت', lang: 'fa', category: 'motivation' },
  { tag: 'بیزینس', lang: 'fa', category: 'startup' },
  { tag: 'هدف_گذاری', lang: 'fa', category: 'motivation' },
  { tag: 'توسعه_فردی', lang: 'fa', category: 'motivation' },
  { tag: 'هوش_مصنوعی', lang: 'fa', category: 'general' },
  { tag: 'سرمایه_گذاری', lang: 'fa', category: 'startup' },
  { tag: 'برنامه_ریزی', lang: 'fa', category: 'motivation' },
  { tag: 'startup', lang: 'en', category: 'startup' },
  { tag: 'entrepreneur', lang: 'en', category: 'startup' },
  { tag: 'business', lang: 'en', category: 'startup' },
  { tag: 'motivation', lang: 'en', category: 'motivation' },
  { tag: 'success', lang: 'en', category: 'motivation' },
  { tag: 'mindset', lang: 'en', category: 'motivation' },
  { tag: 'money', lang: 'en', category: 'motivation' },
  { tag: 'viral', lang: 'en', category: 'viral' },
  { tag: 'foryou', lang: 'en', category: 'viral' },
  { tag: 'fyp', lang: 'en', category: 'viral' },
  { tag: 'explore', lang: 'en', category: 'viral' },
  { tag: 'reels', lang: 'en', category: 'viral' },
  { tag: 'trending', lang: 'en', category: 'viral' },
  { tag: 'ai', lang: 'en', category: 'general' },
];

// ── brand constants ──────────────────────────────────────────────────────

export const BRAND = {
  instagram: '@startup_mt',
  site: 'Mehrdad.ir',
  tagline: 'کسب‌وکارت را با هوش مصنوعی بساز',
  /** committed static asset — publicly fetchable by the video provider */
  outroCardUrl: '/agency-content/outro-card.png',
};

// ── LLM ideation ─────────────────────────────────────────────────────────

const IDEATION_SYSTEM = `تو استراتژیست محتوای اینستاگرام هستی برای پیج فارسی startup_mt@ (مالک: مهرداد، سازنده محصول با AI، سایت Mehrdad.ir).
تیم هدف: تولید ایده ویدیوی ریلز «مشابه اما هرگز کپی نکن» از یک نمونه مرجع، اما محتوا باید برای مخاطب استارتاپ/موفقیت/کسب‌وکار/انگیزه/هوش مصنوعی فارسی‌زبان باشد.
قوانین سخت:
- هر ایده یک شات پیوسته ۵ تا ۱۰ ثانیه‌ای است (بدون برش لازم).
- videoPrompt باید انگلیسی، سینمایی، غنی از جزئیات نور/حرکت دوربین/فضا باشد و حتماً حال‌وهوای نمونه را نگه دارد اما صحنه جدید و متفاوت بسازد. هیچ متن یا حروفی داخل تصویر نخواه (متن روی ویدیو خراب می‌شود). بدون چهره نزدیک افراد واقعی.
- caption فارسی گرم و کوتاه (حداکثر ۳ جمله) + یک دعوت به اقدام مثل «فالو کن @startup_mt».
- hashtags دقیقاً ۱۰ عدد بدون #، ترکیبی از هشتگ‌های نمونه مرجع، هشتگ‌های پرکاربرد و هشتگ‌های موضوعی استارتاپ.
- هوک (hook) جمله اول کپشن یا متن شروع ویدیو است — باید ۳ ثانیه اول قلاب کند.
خروجی: فقط JSON معتبر، بدون هیچ متن اضافه:
[{"idx":1,"title":"...","hook":"...","script":"...","videoPrompt":"...","caption":"...","hashtags":["..."]}]
فیلد script = سناریوی صحنه‌به‌صحنه به فارسی برای فیلم‌برداری/بازتولید توسط انسان (۳ تا ۵ خط).`;

export async function generateIdeasForSample(sampleId: string): Promise<StudioIdea[]> {
  const sample = await db.contentSample.findUnique({ where: { id: sampleId } });
  if (!sample) throw new Error('نمونه پیدا نشد');

  const bank = await db.hashtagBank.findMany();
  const bankTags = bank.map((b) => b.tag);

  const { default: ZAI } = await import('z-ai-web-dev-sdk');
  const zai = await ZAI.create();
  const userPrompt = [
    'نمونه مرجع اینستاگرام:',
    `اکانت: @${sample.account}`,
    `سبک: ${sample.styleTag}`,
    `توضیح سبک: ${sample.note}`,
    `هشتگ‌های خود نمونه: ${JSON.stringify((JSON.parse(sample.hashtags) as string[]) ?? [])}`,
    `هشتگ‌های پرکاربرد موجود در بانک: ${JSON.stringify(bankTags)}`,
    'برای همین نمونه دقیقاً ۵ ایده متفاوت بساز (idx 1 تا ۵). هر ایده زاویه متفاوتی از همان حس/سبک را بگیرد.',
  ].join('\n');

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: IDEATION_SYSTEM },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.85,
  });

  const raw = String(completion?.choices?.[0]?.message?.content ?? '');
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('پاسخ هوش مصنوعی قابل خواندن نبود');
  const ideas = JSON.parse(cleaned.slice(start, end + 1)) as StudioIdea[];
  if (!Array.isArray(ideas) || ideas.length < 1) throw new Error('ایده‌ای تولید نشد');

  return ideas.slice(0, 5).map((idea, i) => ({
    ...idea,
    idx: idea.idx || i + 1,
    hashtags: Array.isArray(idea.hashtags) ? idea.hashtags.slice(0, 12) : [],
  }));
}

// ── video generation (CogVideoX via z-ai SDK, async task) ────────────────

export const VIDEO_SIZE = '720x1280'; // 9:16 vertical for Reels
export const VIDEO_DURATION = 10; // seconds (plan default approved by owner)

export interface SubmitResult {
  ok: boolean;
  error?: string;
  video?: { id: string; providerTaskId: string };
}

/**
 * Submit one video task for an idea. The provider rate-limits hard (429) and
 * generation takes ~2-3 minutes, so the UI submits one video at a time and
 * polls via /api/agency/content/video.
 */
export async function submitVideoForIdea(ideaId: string, duration = VIDEO_DURATION): Promise<SubmitResult> {
  const idea = await db.contentIdea.findUnique({ where: { id: ideaId } });
  if (!idea) return { ok: false, error: 'ایده پیدا نشد' };

  const { default: ZAI } = await import('z-ai-web-dev-sdk');
  const zai = await ZAI.create();

  let task;
  try {
    task = await zai.video.generations.create({
      prompt: idea.videoPrompt,
      quality: 'speed',
      with_audio: false, // owner adds trending music in Instagram for better reach
      watermark_enabled: false,
      size: VIDEO_SIZE,
      fps: 30,
      duration,
    });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    if (msg.includes('429')) {
      return { ok: false, error: 'سرویس ویدیو شلوغ است — حدود ۲ دقیقه دیگر دوباره امتحان کن' };
    }
    return { ok: false, error: `خطای سرویس ویدیو: ${msg.slice(0, 160)}` };
  }

  const video = await db.contentVideo.create({
    data: {
      ideaId,
      providerTaskId: task.id,
      status: 'generating',
    },
  });

  return { ok: true, video: { id: video.id, providerTaskId: task.id } };
}

export interface PollOutcome {
  id: string;
  status: 'generating' | 'ready' | 'failed';
  url?: string;
  coverUrl?: string;
  error?: string;
}

/** Query one pending video's provider task and sync the DB row. */
export async function pollVideo(videoId: string): Promise<PollOutcome> {
  const video = await db.contentVideo.findUnique({ where: { id: videoId } });
  if (!video) throw new Error('ویدیو پیدا نشد');

  if (video.status !== 'generating') {
    return { id: video.id, status: video.status as PollOutcome['status'], url: video.url ?? undefined, coverUrl: video.coverUrl ?? undefined, error: video.error ?? undefined };
  }

  const { default: ZAI } = await import('z-ai-web-dev-sdk');
  const zai = await ZAI.create();
  let res;
  try {
    res = await zai.async.result.query(video.providerTaskId);
  } catch (e) {
    // transient provider hiccup — stay in generating state
    return { id: video.id, status: 'generating', error: String((e as Error).message ?? e).slice(0, 120) };
  }

  const status = String(res?.task_status ?? 'PROCESSING');

  if (status === 'SUCCESS') {
    const url = res?.video_result?.[0]?.url ?? res?.video_url ?? null;
    const coverUrl = res?.video_result?.[0]?.cover_image_url ?? null;
    if (url) {
      await db.contentVideo.update({ where: { id: video.id }, data: { status: 'ready', url, coverUrl, error: null } });
      return { id: video.id, status: 'ready', url, coverUrl: coverUrl ?? undefined };
    }
    await db.contentVideo.update({ where: { id: video.id }, data: { status: 'failed', error: 'خروجی ویدیو خالی بود' } });
    return { id: video.id, status: 'failed', error: 'خروجی ویدیو خالی بود' };
  }

  if (status === 'FAIL') {
    const err = String(res?.error?.message ?? 'تولید ویدیو شکست خورد').slice(0, 200);
    await db.contentVideo.update({ where: { id: video.id }, data: { status: 'failed', error: err } });
    return { id: video.id, status: 'failed', error: err };
  }

  return { id: video.id, status: 'generating' };
}

// ── seeding ──────────────────────────────────────────────────────────────

/** Insert the 10 reference samples + hashtag bank once (idempotent). */
export async function ensureStudioSeed(): Promise<void> {
  const sampleCount = await db.contentSample.count();
  if (sampleCount === 0) {
    for (const s of SAMPLE_SEED) {
      await db.contentSample.create({ data: { ...s, hashtags: JSON.stringify(s.hashtags) } });
    }
  }
  const tagCount = await db.hashtagBank.count();
  if (tagCount === 0) {
    for (const t of HASHTAG_SEED) {
      await db.hashtagBank.create({ data: t });
    }
  }
}
