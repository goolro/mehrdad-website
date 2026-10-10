/**
 * Seed the two Quiz of Koko investor blog posts (owner order 2026-10-11:
 * «اینو دو صفحه را بصورت مجزا در بلاگ بزار» — the investor overview and the
 * 19-section pitch deck each get their own blog post).
 *
 * IDEMPOTENT: upserts by slug. On re-run it refreshes titles/excerpts/content
 * and category links but never touches `date`, `published`, or `featured` —
 * so re-seeding against any environment cannot clobber owner-managed state.
 *
 * Works against WHATEVER database the Prisma client resolves for the current
 * environment: the local SQLite file in development. For the PRODUCTION
 * Supabase Postgres instance use scripts/seed-investor-posts-supabase.ts
 * (HTTPS via the Supabase Management API — no DB password needed), which
 * reuses the POSTS data exported below.
 *
 *   bun run scripts/seed-investor-posts.ts          # local SQLite
 *   bun run scripts/seed-investor-posts-supabase.ts # production Supabase
 *
 * Facts policy (OWNER_RULES law #9 / D-029): every figure traces to the two
 * published funnel pages — 1,287 questions, 10+10 languages, web-live-today,
 $25k–$30k target, $500–$3,000/month project support, FREE / KOKO PLUS
 * (price to confirm) / future tier, evidence-gated roadmap. No invented
 * traction; placeholders stay labelled.
 */
import { PrismaClient } from '@prisma/client';

export type PostSeed = {
  slug: string;
  titleEn: string;
  titleFa: string;
  excerptEn: string;
  excerptFa: string;
  contentEn: string;
  contentFa: string;
  categorySlugs: string[];
};

const OVERVIEW_URL = 'https://mehrdad.ir/investors-koko';
const DECK_URL = 'https://mehrdad.ir/investors-koko/deck';
const BRIEFING_URL = 'https://mehrdad.ir/investors-koko#briefing';

export const POSTS: PostSeed[] = [
  {
    slug: 'koko-investor-overview',
    titleEn: 'Quiz of Koko — the investor overview is live on mehrdad.ir',
    titleFa: 'کوکو — نمای سرمایه‌گذاری حالا روی mehrdad.ir زنده است',
    excerptEn:
      'The investor overview for Quiz of Koko is now live: the product story, the 12-month evidence-gated plan, the $25k–$30k target, and a private briefing form — in English and Persian.',
    excerptFa:
      'نمای سرمایه‌گذاری کوکو منتشر شد: روایت محصول، برنامه ۱۲ماهه و مبتنی بر شواهد، هدف $25k–$30k، و فرم بریفینگ خصوصی — به دو زبان انگلیسی و فارسی.',
    contentEn: `
<p><strong>Quiz of Koko now has a permanent home for investors on this site.</strong> The new overview page gathers everything a potential partner needs in one scroll: what the product is, how it grows, what the funding is for, and how to talk to me — in English and in Persian.</p>
<p>Quiz of Koko is an AI-composed word-quiz game built around short, satisfying sessions. The live pool holds <strong>1,287 AI-validated questions</strong>, the interface and the question pool each support <strong>ten languages</strong>, and play adapts to every player. The web game is live today; the mobile release stays a milestone until it ships — never a claim.</p>
<h2>What the overview covers</h2>
<ul>
<li><strong>The product story</strong> — why a word quiz, why now, and how adaptive play turns a spare minute into a daily habit.</li>
<li><strong>The 12-month plan</strong> — milestone gates with honest status labels: what has shipped, what is being measured, and what gets decided only with evidence.</li>
<li><strong>The business model</strong> — freemium with advertising and subscription paths, plus a transparent allocation table for the <strong>$25k–$30k</strong> target.</li>
<li><strong>A private briefing form</strong> — one short form that routes straight to me, with no call required to start.</li>
</ul>
<p>Every number on the page traces to figures I have already published — no invented traction, and market sizes stay blank until sourced research backs them. That honesty is a feature, not a gap.</p>
<p>Read the overview at <a href="${OVERVIEW_URL}">mehrdad.ir/investors-koko</a>, or go straight to the <a href="${BRIEFING_URL}">private briefing form</a>. A deeper 19-section pitch deck walks through the same story in detail — see the next post.</p>
`,
    contentFa: `
<p><strong>کوکو حالا خانه‌ی دائمی سرمایه‌گذاران را روی همین سایت دارد.</strong> صفحه‌ی نمای سرمایه‌گذاری، هر چیزی که یک شریک بالقوه لازم دارد را در یک اسکرول جمع می‌کند: محصول چیست، چطور رشد می‌کند، بودجه برای چه می‌خواهد، و چطور با من صحبت کنید — به دو زبان انگلیسی و فارسی.</p>
<p>کوکو یک بازی کوئیز کلمه‌ای است که با هوش مصنوعی ساخته می‌شود و بر نشست‌های کوتاه و لذت‌بخش بنا شده است. مخزن زنده‌ی آن <strong>۱٬۲۸۷ سؤال اعتبارسنجی‌شده با هوش مصنوعی</strong> دارد، رابط کاربری و مخزن سؤال هرکدام از <strong>ده زبان</strong> پشتیبانی می‌کنند و بازی برای هر بازیکن تطبیق پیدا می‌کند. نسخه‌ی وب همین امروز زنده است؛ انتشار موبایل تا وقتی عرضه نشود یک «نقطه‌عطف» می‌ماند — هرگز یک ادعا.</p>
<h2>نما چه چیزهایی را پوشش می‌دهد</h2>
<ul>
<li><strong>روایت محصول</strong> — چرا کوئیز کلمه‌ای، چرا حالا، و چگونه بازی تطبیقی یک دقیقه‌ی آزاد را به عادت روزانه تبدیل می‌کند.</li>
<li><strong>برنامه‌ی ۱۲ماهه</strong> — نقاط عطف با برچسب‌های وضعیت صادقانه: چه چیزی عرضه شده، چه چیزی در حال اندازه‌گیری است، و چه چیزی فقط با شواهد تصمیم‌گیری می‌شود.</li>
<li><strong>مدل کسب‌وکار</strong> — فریمیوم با مسیرهای تبلیغات و اشتراک، به‌همراه جدول تخصیص شفاف برای هدف <strong>$25k–$30k</strong>.</li>
<li><strong>فرم بریفینگ خصوصی</strong> — یک فرم کوتاه که مستقیم به من می‌رسد؛ برای شروع نیازی به تماس نیست.</li>
</ul>
<p>هر عددی در این صفحه به آمارهایی برمی‌گردد که قبلاً منتشر کرده‌ام — بدون ترکشن ساختگی، و اندازه‌ی بازار تا وقتی پژوهشِ مستند پشتش نباشد خالی می‌ماند. این صداقت یک نقص نیست؛ یک ویژگی است.</p>
<p>نما را در <a href="${OVERVIEW_URL}">mehrdad.ir/investors-koko</a> بخوانید، یا مستقیم به <a href="${BRIEFING_URL}">فرم بریفینگ خصوصی</a> بروید. یک پیتچ‌دک عمیقِ ۱۹بخشی هم همان روایت را با جزئیات مرور می‌کند — پست بعدی را ببینید.</p>
`,
    categorySlugs: ['سرمایه-گذاری'],
  },
  {
    slug: 'koko-investor-pitch-deck',
    titleEn: 'Quiz of Koko — the full 19-section investor pitch deck',
    titleFa: 'کوکو — پیتچ‌دک کامل سرمایه‌گذاری در ۱۹ بخش',
    excerptEn:
      'The deep dive behind the Koko investor overview: nineteen sections from the engagement loop to the two support paths, every assumption labelled a founder input — bilingual, no invented numbers.',
    excerptFa:
      'جزئیات کامل پشت نمای سرمایه‌گذاری کوکو: نوزده بخش از حلقه‌ی تعامل تا دو مسیر حمایت، هر فرض با برچسب «ورودی بنیان‌گذار» — دوزبانه، بدون عدد ساختگی.',
    contentEn: `
<p><strong>The investor overview tells the story in one page. The new pitch deck tells it in nineteen.</strong> The <a href="${OVERVIEW_URL}">investor overview</a> went live on this site today; now its companion deck is live too — a single long scroll, numbered 01 to 19, in English and Persian.</p>
<h2>What the nineteen sections add</h2>
<ul>
<li><strong>The engagement loop</strong> — prompt, reward, progress, return: how one satisfying answer becomes tomorrow's session.</li>
<li><strong>The edge</strong> — a side-by-side comparison with traditional word quizzes: adaptive difficulty, context-rich feedback, character-led correction, and a progress-plus-streak loop.</li>
<li><strong>Business-model scenarios</strong> — the advertising and subscription formulas written out openly, every input labelled a <em>founder input</em> until real operating data replaces it. Nothing is presented as an actual.</li>
<li><strong>Proposed pricing</strong> — FREE at $0, KOKO PLUS with the price left "to confirm", and a future tier scoped for families and classrooms once demand is proven.</li>
<li><strong>Go-to-market</strong> — play, share, discover, return, grow: seeding a daily ritual, making progress social, and letting discovery compound.</li>
<li><strong>The roadmap</strong> — the same evidence-gated plan as the overview: mobile launch checks now, cohort measurement next, scale decisions later.</li>
</ul>
<h2>Two ways to support</h2>
<p>The deck closes with the two doors the overview opens: <strong>project support at $500–$3,000 per month</strong> for focused, defined milestones — the lighter path into the same 12-month plan — and <strong>angel investment with a $25k–$30k target</strong>, with instrument and valuation kept as explicit placeholders until we discuss them. A founder-handoff checklist lists every item that still needs verification before any external distribution.</p>
<p>No investment instrument, valuation, ownership, or financial outcome is offered or promised anywhere in the deck. It is a working document — every placeholder is intentional, and every number traces back to figures I have already published.</p>
<p>Start with the <a href="${DECK_URL}">full deck</a>, then use the <a href="${BRIEFING_URL}">briefing form</a> when you want to talk.</p>
`,
    contentFa: `
<p><strong>نمای سرمایه‌گذاری روایت را در یک صفحه می‌گوید؛ پیتچ‌دک جدید آن را در نوزده بخش می‌گوید.</strong> <a href="${OVERVIEW_URL}">نمای سرمایه‌گذاری</a> امروز روی این سایت منتشر شد؛ حالا دک همراهش هم زنده است: یک اسکرول بلند و پیوسته، شماره‌گذاری‌شده از ۰۱ تا ۱۹، به دو زبان انگلیسی و فارسی.</p>
<h2>نوزده بخش چه چیزهایی اضافه می‌کنند</h2>
<ul>
<li><strong>حلقه‌ی تعامل</strong> — محرک، پاداش، پیشرفت، بازگشت: چگونه یک پاسخ رضایت‌بخش به نشست فردا تبدیل می‌شود.</li>
<li><strong>مزیت</strong> — مقایسه‌ی روبه‌رو با کوئیزهای کلمه‌ای سنتی: سختی تطبیقی، بازخورد زمینه‌محور، اصلاح با شخصیت، و حلقه‌ی پیشرفت + زنجیره‌ی روزها.</li>
<li><strong>سناریوهای مدل کسب‌وکار</strong> — فرمول‌های تبلیغات و اشتراک، شفاف نوشته شده‌اند و هر ورودی تا وقتی داده‌ی عملیاتی واقعی جای آن را نگیرد با برچسب <em>ورودی بنیان‌گذار</em> مشخص شده است. هیچ‌چیز به‌عنوان عدد واقعی ارائه نمی‌شود.</li>
<li><strong>قیمت‌گذاری پیشنهادی</strong> — رایگان با $0، کوکو پلاس با قیمت «در انتظار تأیید»، و یک سطح آینده برای خانواده و کلاس درس پس از اثبات تقاضا.</li>
<li><strong>برنامه‌ی بازاریابی</strong> — بازی، اشتراک، کشف، بازگشت، رشد: کاشتن آیین روزانه، اجتماعی‌کردن پیشرفت، و مرکب‌شدن کشف.</li>
<li><strong>نقشه‌ی راه</strong> — همان برنامه‌ی مبتنی بر شواهدِ نما: بررسی‌های انتشار موبایل حالا، اندازه‌گیری گروه‌های کاربر بعد، تصمیم‌های مقیاس بعدتر.</li>
</ul>
<h2>دو مسیر حمایت</h2>
<p>دک با همان دو دری بسته می‌شود که نما باز می‌کند: <strong>حمایت پروژه‌ای با $500 تا $3,000 در ماه</strong> برای نقاط‌عطف مشخص و معین — مسیر سبک‌تر ورود به همان برنامه‌ی ۱۲ماهه — و <strong>سرمایه‌گذاری فرشته با هدف $25k–$30k</strong>، که ابزار و ارزش‌گذاری تا موقع گفت‌وگو به‌شکل صریح placeholder می‌مانند. یک چک‌لیست تحویل به بنیان‌گذار هم همه‌ی مواردی را فهرست می‌کند که پیش از هر توزیع بیرونی باید راستی‌آزمایی شوند.</p>
<p>هیچ ابزار سرمایه‌گذاری، ارزش‌گذاری، مالکیتی یا نتیجه‌ی مالی در هیچ‌جای این دک ارائه یا وعده داده نمی‌شود. این یک سند کاری است — هر placeholder عمدی است و هر عدد به آمارهایی برمی‌گردد که قبلاً منتشر کرده‌ام.</p>
<p>از <a href="${DECK_URL}">دک کامل</a> شروع کنید و وقتی خواستید صحبت کنیم از <a href="${BRIEFING_URL}">فرم بریفینگ</a> استفاده کنید.</p>
`,
    categorySlugs: ['سرمایه-گذاری'],
  },
];

async function main() {
  const db = new PrismaClient();
  try {
    for (const p of POSTS) {
      const cats = { connect: p.categorySlugs.map((slug) => ({ slug })) };
      const post = await db.post.upsert({
        where: { slug: p.slug },
        create: {
          slug: p.slug,
          titleEn: p.titleEn,
          titleFa: p.titleFa,
          excerptEn: p.excerptEn,
          excerptFa: p.excerptFa,
          contentEn: p.contentEn,
          contentFa: p.contentFa,
          date: new Date(),
          published: true,
          source: 'ai',
          categories: cats,
        },
        // refresh content fields only — date/published/featured stay
        // owner-managed across re-runs
        update: {
          titleEn: p.titleEn,
          titleFa: p.titleFa,
          excerptEn: p.excerptEn,
          excerptFa: p.excerptFa,
          contentEn: p.contentEn,
          contentFa: p.contentFa,
          categories: { set: p.categorySlugs.map((slug) => ({ slug })) },
        },
      });
      console.log(
        `${post.published ? 'seeded' : 'SEEDED-UNPUBLISHED'}: ${post.slug} (date ${post.date.toISOString()})`,
      );
    }
  } finally {
    await db.$disconnect();
  }
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
