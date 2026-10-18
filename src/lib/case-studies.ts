/**
 * Case study content — phase 2 credibility (2026-10-18).
 *
 * Deliberately a typed code map, same philosophy as project-profiles.ts:
 * content travels with git, zero production migration risk.
 *
 * EVIDENCE RULE (owner plan, phase 2): every claim below is verifiable on
 * public surfaces — the live product (quizofkoko.com: free in browser and
 * on Android), the /work/quiz-of-koko detail page, the /investors-koko
 * funnel with its published deck, and the 19-post bilingual deck series on
 * the blog. NO invented metrics: growth numbers are presented as
 * PRE-REGISTERED GATES (the measurement discipline), never as achieved
 * results. When real numbers exist and the owner approves publishing them,
 * add them to `results` with their source.
 *
 * EN-purity rule (owner rule 2026-10-02): en strings stay Persian-free.
 */

export interface CaseStudyFeature {
  icon: 'brain' | 'swords' | 'trophy' | 'repeat' | 'scan';
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
}

export interface CaseStudyStep {
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
}

export interface CaseStudyLink {
  href: string;
  labelEn: string;
  labelFa: string;
  noteEn: string;
  noteFa: string;
}

export interface CaseStudy {
  slug: string;
  liveUrl: string;
  roleEn: string;
  roleFa: string;
  statusEn: string;
  statusFa: string;
  headlineEn: string;
  headlineFa: string;
  challengeEn: string[];
  challengeFa: string[];
  approachTitleEn: string;
  approachTitleFa: string;
  approachSteps: CaseStudyStep[];
  shippedTitleEn: string;
  shippedTitleFa: string;
  features: CaseStudyFeature[];
  measurementTitleEn: string;
  measurementTitleFa: string;
  measurementEn: string[];
  measurementFa: string[];
  deepLinks: CaseStudyLink[];
}

export const caseStudies: Record<string, CaseStudy> = {
  'quiz-of-koko': {
    slug: 'quiz-of-koko',
    liveUrl: 'https://quizofkoko.com',
    roleEn: 'Forward Deployed Engineering — idea to live product, end to end',
    roleFa: 'Forward Deployed Engineering — از ایده تا محصول زنده، تمام‌وقت و سرراست',
    statusEn: 'Live — free in the browser and on Android',
    statusFa: 'زنده — رایگان در مرورگر و اندروید',
    headlineEn:
      'How Quiz of Koko went from a real learning problem to a live, AI-powered vocabulary game — the same FDE loop I now run for clients.',
    headlineFa:
      'کوئیز کوکو چطور از یک مسئله واقعی یادگیری به یک بازی واژگان زنده با هوش مصنوعی رسید — همان حلقه FDE که حالا برای مشتری‌ها اجرا می‌کنم.',
    challengeEn: [
      'Vocabulary practice has a motivation problem, not a content problem: dictionaries and flashcards exist everywhere, yet learners quit within days because nothing adapts to them and nothing is at stake.',
      'The goal was never “another quiz app”. It was to prove that a small, sharply-scoped product — adaptive questions, real-time duels, weekly stakes — can keep a learner coming back without a content team or a marketing budget.',
    ],
    challengeFa: [
      'تمرین واژگان مسئله‌اش انگیزه است، نه محتوا: دیکشنری و فلش‌کارت همه‌جا هست، اما یادگیرنده‌ها چون هیچ‌چیز با آن‌ها تطبیق نمی‌شود و هیچ‌چیز در میان نیست، طی چند روز رها می‌کنند.',
      'هدف هرگز «یک اپ کویز دیگر» نبود. هدف این بود ثابت کنیم یک محصول کوچکِ با‌دقت‌دامنه‌دار — سؤال‌های تطبیقی، دوئل زنده، شرط هفتگی — می‌تواند بدون تیم محتوا و بدون بودجه تبلیغات، یادگیرنده را برگرداند.',
    ],
    approachTitleEn: 'The FDE loop, run for real',
    approachTitleFa: 'حلقه FDE، این‌بار روی محصول واقعی',
    approachSteps: [
      {
        titleEn: 'Scope — the honest cut',
        titleFa: 'دامنه‌یابی — برش صادقانه',
        descEn:
          'One job done completely: help a Persian-speaking learner keep and grow vocabulary. Everything that did not feed that job went to the kill list — a scope discipline now sold as the first step of every client sprint.',
        descFa:
          'یک کار، به‌طور کامل: کمک به یادگیرنده فارسی‌زبان برای ماندگاری و رشد واژگان. هر چیزی که به این کار خدمت نمی‌کرد به لیست حذف رفت — همان نظم دامنه‌ای که حالا به‌عنوان گام اول اسپرینت مشتری‌ها فروخته می‌شود.',
      },
      {
        titleEn: 'Design — riskiest assumptions first',
        titleFa: 'طراحی — ریسکی‌ترین فرض‌ها اول',
        descEn:
          'Adaptive difficulty and duel mechanics were designed before pixel-polish: if the questions did not feel personal and the duels did not feel alive, nothing else mattered.',
        descFa:
          'سختی تطبیقی و مکانیک دوئل قبل از جلا دادن رابط طراحی شدند: اگر سؤال‌ها شخصی حس نمی‌شدند و دوئل‌ها زنده نبودند، هیچ‌چیز دیگر اهمیت نداشت.',
      },
      {
        titleEn: 'Build — AI-accelerated, human-judged',
        titleFa: 'ساخت — سریع با هوش مصنوعی، داوری انسانی',
        descEn:
          'The product was built the way the MVP Sprint builds today: AI for speed on the well-understood parts, human judgment on architecture and the learning feel — shipped to real users in the browser first, then Android.',
        descFa:
          'محصول همان‌طور ساخته شد که امروز MVP Sprint می‌سازد: هوش مصنوعی برای سرعت روی بخش‌های روشن، داوری انسانی روی معماری و حس یادگیری — اول انتشار در مرورگر برای کاربر واقعی، سپس اندروید.',
      },
      {
        titleEn: 'Launch & learn — instrumented, not decorated',
        titleFa: 'انتشار و یادگیری — اندازه‌گیری‌شده، نه تزئینی',
        descEn:
          'Analytics tied to outcomes (retention, duel participation, review completion) instead of vanity counters — and the growth plan runs against pre-registered gates, so every decision has an evidence rule.',
        descFa:
          'آنالیتیکس به نتایج وصل شد (ماندگاری، مشارکت در دوئل، تکمیل مرور) نه شمارنده‌های تزئینی — و برنامه رشد با گیت‌های از پیش ثبت‌شده جلو می‌رود، پس هر تصمیم یک قاعده شواهد دارد.',
      },
    ],
    shippedTitleEn: 'What shipped',
    shippedTitleFa: 'چه چیزی منتشر شد',
    features: [
      {
        icon: 'brain',
        titleEn: 'Adaptive AI questions',
        titleFa: 'سؤال‌های تطبیقی با هوش مصنوعی',
        descEn: 'Personalized question generation that tracks each learner’s level and gaps.',
        descFa: 'تولید سؤال شخصی‌سازی‌شده که سطح و نقاط ضعف هر یادگیرنده را دنبال می‌کند.',
      },
      {
        icon: 'repeat',
        titleEn: 'Koko Plus — smart review',
        titleFa: 'کوکو پلاس — مرور هوشمند',
        descEn: 'Spaced-repetition vocabulary review, scheduled by what you actually forget.',
        descFa: 'مرور واژگان با تکرار فاصله‌دار، زمان‌بندی‌شده بر اساس چیزی که واقعاً فراموش می‌کنید.',
      },
      {
        icon: 'swords',
        titleEn: 'Live 1v1 duels',
        titleFa: 'دوئل زنده تک‌به‌تک',
        descEn: 'Real-time head-to-head matches — the stake that makes practice feel like play.',
        descFa: 'مسابقه هم‌زمان دو نفره — همان شرطی که تمرین را به بازی تبدیل می‌کند.',
      },
      {
        icon: 'trophy',
        titleEn: 'Weekly cup & leagues',
        titleFa: 'جام هفتگی و لیگ‌ها',
        descEn: 'Bronze→Champion weekly leagues — a reason to come back every week.',
        descFa: 'لیگ‌های هفتگی برنز تا قهرمانی — دلیلی برای بازگشت هر هفته.',
      },
      {
        icon: 'scan',
        titleEn: 'Continuous diagnosis',
        titleFa: 'تشخیص پیوسته',
        descEn: 'The app learns where you slip and re-tests exactly there.',
        descFa: 'اپ یاد می‌گیرد کجا می‌لغزید و دقیقاً همان‌جا دوباره می‌سنجد.',
      },
    ],
    measurementTitleEn: 'Evidence, not adjectives',
    measurementTitleFa: 'شواهد، نه صفت',
    measurementEn: [
      'The product is live and verifiable right now: free in the browser and on Android — no screenshots-only “case study”.',
      'Growth runs against pre-registered gates (day-1 retention, day-7 retention, conversion, CAC). The gates are public discipline; numbers get published when the evidence is honest and the owner approves.',
      'The entire investor funnel shipped through the same loop: an 11-slide pitch deck, an investor page, and a 19-post bilingual series documenting the deck slide by slide.',
    ],
    measurementFa: [
      'محصول همین حالا زنده و قابل‌راستی‌آزمایی است: رایگان در مرورگر و اندروید — نه «مطالعه موردیِ فقط‌اسکرین‌شات».',
      'رشد با گیت‌های از پیش ثبت‌شده جلو می‌رود (ماندگاری روز اول، روز هفتم، نرخ تبدیل، هزینه جذب). گیت‌ها نظمِ عمومی‌اند؛ اعداد وقتی منتشر می‌شوند که شواهد صادقانه باشد و مالک تأیید کند.',
      'تمام قیف سرمایه‌گذاری با همان حلقه ساخته شد: دِک ۱۱ اسلایدی، صفحه سرمایه‌گذاران، و مجموعه ۱۹ پست دوزبانه که دِک را اسلایدبه‌اسلاید مستند کرده است.',
    ],
    deepLinks: [
      {
        href: '/work/quiz-of-koko',
        labelEn: 'Project detail — /work/quiz-of-koko',
        labelFa: 'جزئیات پروژه — /work/quiz-of-koko',
        noteEn: 'Feature highlights, roadmap states, honest status labels.',
        noteFa: 'برجسته‌های ویژگی، وضعیت نقشه راه، برچسب‌های وضعیت صادقانه.',
      },
      {
        href: '/investors-koko',
        labelEn: 'Investor funnel — /investors-koko',
        labelFa: 'قیف سرمایه‌گذاری — /investors-koko',
        noteEn: 'The published pitch deck and investor materials.',
        noteFa: 'دِک منتشرشده و مستندات سرمایه‌گذاری.',
      },
      {
        href: '/blog',
        labelEn: 'The 19-post deck series — /blog',
        labelFa: 'مجموعه ۱۹ پستی دِک — /blog',
        noteEn: 'Slide-by-slide bilingual breakdowns with per-slide PDFs.',
        noteFa: 'تحلیل دوزبانه اسلایدبه‌اسلاید همراه با PDF هر اسلاید.',
      },
    ],
  },
};
