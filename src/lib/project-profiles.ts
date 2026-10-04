/**
 * Rich per-slug project profile — feature highlights + tech notes rendered
 * by ProjectDetail (/work/<slug>) for projects that deserve a fuller story
 * (e.g. a live playable product). Deliberately a typed code map instead of
 * new DB columns: content travels with git, zero production migration risk.
 * Graduates to DB fields only if many projects ever need this.
 *
 * Feature copy is grounded in the product's own public messaging
 * (quizofkoko.com): adaptive AI learning, real-time 1v1 duels, weekly
 * leagues Bronze→Champion, spaced repetition, continuous diagnosis.
 */
export type ProfileFeatureIcon =
  | 'brain'
  | 'swords'
  | 'trophy'
  | 'repeat'
  | 'scan'
  | 'puzzle'
  | 'calendar'
  | 'car';

export interface ProfileFeature {
  icon: ProfileFeatureIcon;
  titleEn: string;
  titleFa: string;
  descEn: string;
  descFa: string;
}

export interface ProfileTechItem {
  labelEn: string;
  labelFa: string;
}

export type RoadmapTone = 'done' | 'ready' | 'active';

export interface ProfilePhase {
  key: string;
  icon: 'check' | 'store' | 'hammer';
  titleEn: string;
  titleFa: string;
  stateEn: string;
  stateFa: string;
  /** ring fill 0-100 — purely visual; the state text carries the honest meaning */
  ring: number;
  tone: RoadmapTone;
  /** short badge (not a fake-precise %) — e.g. «100٪» / «آماده» / «شروع شد» */
  badgeEn: string;
  badgeFa: string;
}

export interface RelatedPost {
  slug: string;
  titleEn: string;
  titleFa: string;
}

export interface ProfileShot {
  src: string;
  altEn: string;
  altFa: string;
}

/**
 * Owner-dictated long-form story block rendered on /work/<slug> right under
 * the summary. Both strings are the OWNER'S OWN COPY placed verbatim
 * (owner rule 2026-10-02: «دقیق بزاری … هیچ کاری دیگری غیر از اینکه گفتم
 * نکن») — never paraphrase, never translate between them: htmlFa is the
 * owner's full Persian text, htmlEn is the owner's own compact English
 * text. The EN string must stay Persian-free (EN-purity rule).
 */
export interface ProfileStory {
  htmlEn: string;
  htmlFa: string;
}

export interface ProjectProfile {
  features: ProfileFeature[];
  tech: ProfileTechItem[];
  phases: ProfilePhase[];
  /** optional gallery of official store artwork / screenshots (Cafe Bazaar etc.) */
  media?: ProfileShot[];
  /** optional link to the owner's own published research/pitch post for this idea */
  relatedPost?: RelatedPost;
  /** optional owner-dictated story block (stealth teaser, marketing stages …) */
  story?: ProfileStory;
}

export const PROJECT_PROFILES: Record<string, ProjectProfile> = {
  'quiz-of-koko': {
    features: [
      {
        icon: 'brain',
        titleEn: 'Adaptive AI learning',
        titleFa: 'یادگیری تطبیقی با هوش مصنوعی',
        descEn:
          'Questions calibrate to your age and knowledge gaps — never too easy, never frustrating.',
        descFa:
          'سوال‌ها بر اساس سن و نقاط ضعف تو تنظیم می‌شوند — نه خیلی آسان، نه ناامیدکننده.',
      },
      {
        icon: 'swords',
        titleEn: 'Real-time 1v1 duels',
        titleFa: 'دوئل زندهٔ ۱ به ۱',
        descEn:
          'Challenge friends and players worldwide in fast-paced vocabulary showdowns.',
        descFa:
          'با دوستان و بازیکنان سراسر جهان در نبردهای سریع واژگان رقابت کن.',
      },
      {
        icon: 'trophy',
        titleEn: 'Weekly tournaments',
        titleFa: 'لیگ هفتگی',
        descEn:
          'Climb the league from Bronze to Champion and unlock exclusive rewards.',
        descFa:
          'در لیگ هفتگی از برنز تا قهرمانی بالا برو و جوایز اختصاصی باز کن.',
      },
      {
        icon: 'repeat',
        titleEn: 'Spaced repetition',
        titleFa: 'مرور با فاصله‌گذاری',
        descEn:
          'Missed words resurface at optimal forgetting-curve intervals until they stick.',
        descFa:
          'کلمه‌های جاافتاده در بهترین فاصلهٔ منحنی فراموشی برمی‌گردند تا در ذهن بمانند.',
      },
      {
        icon: 'scan',
        titleEn: 'Continuous diagnosis',
        titleFa: 'تشخیص پیوستهٔ سطح',
        descEn:
          'Answer accuracy is tracked across semantic word clusters to map your true mastery.',
        descFa:
          'دقت پاسخ‌هایت در خوشه‌های معنایی کلمات ردیابی می‌شود تا تسلط واقعی‌ات نقشه‌برداری شود.',
      },
    ],
    tech: [
      { labelEn: 'Next.js + React', labelFa: 'Next.js + React' },
      { labelEn: 'Real-time multiplayer engine', labelFa: 'موتور رقابت بلادرنگ چندنفره' },
      { labelEn: 'AI adaptive question engine', labelFa: 'موتور سوالِ تطبیقی با هوش مصنوعی' },
      { labelEn: 'Spaced-repetition scheduler', labelFa: 'زمان‌بند مرور فاصله‌دار' },
      { labelEn: 'Hosted on Vercel', labelFa: 'میزبانی روی Vercel' },
    ],
    phases: [
      {
        key: 'phase-1',
        icon: 'check',
        titleEn: 'Phase 1 — First playable version',
        titleFa: 'فاز ۱ — نسخهٔ اول بازی',
        stateEn: 'Complete — live and playable today',
        stateFa: 'کامل شد — همین حالا زنده و قابل بازی است',
        ring: 100,
        tone: 'done',
        badgeEn: '100%',
        badgeFa: '۱۰۰٪',
      },
      {
        key: 'market-entry',
        icon: 'store',
        titleEn: 'Market entry',
        titleFa: 'ورود به مارکت',
        stateEn: 'Cleared — initial tests passed, rollout in progress',
        stateFa: 'اوکی شده — تست‌های اولیه انجام شد، در حال پیگیری انتشار',
        ring: 100,
        tone: 'ready',
        badgeEn: 'Ready',
        badgeFa: 'آماده',
      },
      {
        key: 'phase-2',
        icon: 'hammer',
        titleEn: 'Phase 2 — Next development cycle',
        titleFa: 'فاز ۲ — فاز بعدی برنامه‌نویسی',
        stateEn: 'Kicked off — in progress',
        stateFa: 'استارت خورده — در جریان',
        ring: 14,
        tone: 'active',
        badgeEn: 'Started',
        badgeFa: 'شروع شد',
      },
    ],
  },

  /**
   * Traffic Tempo — live Android puzzle game (Cafe Bazaar, Sep 2026).
   * Feature copy is grounded in the store listing: 50 handcrafted campaign
   * levels ×3 difficulties, global daily challenge, live leaderboard,
   * five boosters + impatient VIP cars, algorithmic solver guarantee,
   * no forced ads mid-game.
   */
  'traffic-tempo': {
    features: [
      {
        icon: 'puzzle',
        titleEn: '50 handcrafted levels',
        titleFa: '۵۰ مرحله دست‌ساز',
        descEn:
          'A hand-designed campaign across 3 difficulty tiers — no filler levels, no luck-based layouts.',
        descFa:
          'کمپین دست‌طراحی‌شده در سه سطح سختی — بدون مرحله پرکننده و بدون چیدمان شانسی.',
      },
      {
        icon: 'calendar',
        titleEn: 'Global daily challenge',
        titleFa: 'چالش روزانهٔ جهانی',
        descEn:
          'Every day the whole world gets the same intersection — one shared puzzle, one fair shot.',
        descFa:
          'هر روز کل جهان یک تقاطع یکسان می‌گیرد — یک پازل مشترک برای همه.',
      },
      {
        icon: 'trophy',
        titleEn: 'Live leaderboard',
        titleFa: 'لیدربورد زنده',
        descEn:
          'Daily-challenge scores land on the worldwide board the moment you finish.',
        descFa:
          'امتیاز چالش روزانه همین لحظه روی جدول جهانی می‌نشیند.',
      },
      {
        icon: 'scan',
        titleEn: 'Solver-verified puzzles',
        titleFa: 'پازل‌های تأییدشده با حل‌کننده',
        descEn:
          'Every level is checked by an algorithmic solver — provably solvable, never a dead end.',
        descFa:
          'هر مرحله با حل‌کننده الگوریتمی بررسی می‌شود — قطعاً قابل حل است.',
      },
      {
        icon: 'car',
        titleEn: 'Boosters & impatient VIPs',
        titleFa: 'بوسترها و خودروهای ویژه',
        descEn:
          'Five boosters (undo, +3 moves, pulse, smart hint, shuffle) plus VIP cars with limited patience.',
        descFa:
          'پنج بوستر (واگرد و ۳+ حرکت و پالس و راهنمای هوشمند و بُر) به‌همراه خودروهای VIP کم‌حوصله.',
      },
    ],
    tech: [
      { labelEn: 'Android · Cafe Bazaar', labelFa: 'اندروید · کافه‌بازار' },
      { labelEn: 'Firebase Firestore + FCM', labelFa: 'فایربیس Firestore و FCM' },
      { labelEn: 'Algorithmic level solver', labelFa: 'حل‌کننده الگوریتمی مراحل' },
    ],
    /** official Cafe Bazaar store artwork — owner-supplied originals (Sep 2026) */
    media: [
      {
        src: '/media/traffic-tempo-store-1.webp',
        altEn: 'Cafe Bazaar store art — 50 handcrafted levels plus an endless solver-verified stage machine',
        altFa: 'پوستر کافه‌بازار — ۵۰ مرحله دست‌ساز و موتور مراحل بی‌نهایت تأییدشده با حل‌کننده',
      },
      {
        src: '/media/traffic-tempo-store-2.webp',
        altEn: 'Cafe Bazaar store art — fully offline and lightweight with no forced mid-game ads',
        altFa: 'پوستر کافه‌بازار — کاملاً آفلاین و کم‌حجم و بدون تبلیغ اجباری وسط بازی',
      },
    ],
    phases: [
      {
        key: 'bazaar',
        icon: 'store',
        titleEn: 'Cafe Bazaar release',
        titleFa: 'انتشار در کافه‌بازار',
        stateEn: 'Live — published',
        stateFa: 'لایو — منتشر شد',
        ring: 100,
        tone: 'done',
        badgeEn: '100%',
        badgeFa: '۱۰۰٪',
      },
      {
        key: 'google-play',
        icon: 'hammer',
        titleEn: 'Google Play release',
        titleFa: 'انتشار در گوگل‌پلی',
        stateEn: 'In preparation — privacy policy page is already live',
        stateFa: 'در آماده‌سازی — صفحه سیاست حریم خصوصی از قبل لایو است',
        ring: 15,
        tone: 'active',
        badgeEn: 'Started',
        badgeFa: 'شروع شد',
      },
    ],
  },

  /**
   * Health & Wellness Super App — stealth teaser stage. Owner request
   * 2026-10-02: «اینو برای سوپر اپ سلامتی و تندرستی باید دقیق بزاری …
   * هیچ کاری دیگری غیر از اینکه گفتم نکن». Both blocks are the OWNER'S
   * dictated copy placed VERBATIM (technical stage); the owner will supply
   * the marketing stage next and it gets APPENDED to these same two
   * strings. The bracketed contact line is the owner's own placeholder
   * until he supplies the real contact. htmlEn must stay Persian-free.
   */
  'health-app': {
    features: [],
    tech: [],
    phases: [],
    story: {
      htmlEn: [
        '<h2>Idea is worth . Execution is everything. We already executed.</h2>',
        '<p>A complete product has been built in silence. This page won\'t tell you what it does — no name, no domain, no details. But everything here is real:</p>',
        '<ul>',
        '<li><strong>Live beta</strong> running on real production infrastructure</li>',
        '<li><strong>Two independent AI engines</strong> at the core — functions undisclosed</li>',
        '<li><strong>Global from day one</strong> — 4 languages, full RTL</li>',
        '<li><strong>Enterprise-grade security</strong> — strict tenant isolation, RBAC, audit trails</li>',
        '</ul>',
        '<p><strong>The numbers:</strong> 125,933 lines of code · 225 API services · 115 data models · 711 automated tests with zero-failure automated releases · 4,293 translated strings · 42 internal documents · 25+ formal architecture decisions.</p>',
        '<p><strong>For investors:</strong> execution risk is already eliminated — capital goes to growth, not to building. Intro meeting + NDA first; live product, market and roadmap at the reveal session.</p>',
        '<p>📩 <strong>[contact]</strong></p>',
        '<blockquote><em>Coming soon. See it first.</em></blockquote>',
      ].join(''),
      htmlFa: [
        '<h2>ایده ارزش . اجرا هست. و ما اجرا را تمام کرده‌ایم.</h2>',
        '<hr/>',
        '<p>یک محصول کامل، در سکوت ساخته شده است.</p>',
        '<p>این صفحه قرار نیست به شما بگوید این محصول چه می‌کند؛ نه نامی می‌آید، نه حوزه، نه جزئیات. اما یک چیز از همین ابتدا شفاف است: <strong>هر عددی که در این‌جا می‌بینید واقعی است</strong> — حاصل هزاران ساعت مهندسی واقعی، نه ادعای بازاریابی.</p>',
        '<h3>چرا سکوت؟</h3>',
        '<p>چون در دنیای استارتاپ‌ها، ایده کپی می‌شود — اجرا نه. ما ترجیح داده‌ایم محصول اول کامل شود، بعد معرفی. این سکوتِ انتخابی، اولین نشانهٔ جدی‌بودن این پروژه است: کسی که چیزی برای پنهان‌کردن ندارد، دربارهٔ خودش شعار می‌دهد؛ کسی که چیزی ساخته، دربارهٔ اعدادش حرف می‌زند.</p>',
        '<h3>آنچه مجازیم بگوییم</h3>',
        '<ul>',
        '<li>✅ <strong>یک پلتفرم کامل و چندوجهی</strong> که نسخهٔ آزمایشی‌اش همین حالا روی زیرساخت production واقعی <strong>زنده</strong> است</li>',
        '<li>✅ <strong>دو موتور مستقل هوش مصنوعی</strong> در هستهٔ محصول — کارکردشان فعلاً محرمانه است</li>',
        '<li>✅ <strong>آمادهٔ بازار جهانی از روز اول</strong> — چهار زبان، با پشتیبانی کامل راست‌به‌چپ</li>',
        '<li>✅ <strong>امنیت در سطح سازمانی</strong> — ایزوله‌سازی کامل داده در سطح هر مشتری، کنترل دسترسی نقش‌محور، لاگ حسابرسی، محدودسازی نرخ</li>',
        '<li>✅ <strong>مهندسی مستند‌محور</strong> — ۴۲ سند داخلی و بیش از ۲۵ تصمیم معماری رسمی ثبت‌شده</li>',
        '</ul>',
        '<h3>اعداد واقعی پشت این محصول</h3>',
        '<table><thead><tr><th>سنجه</th><th>مقدار</th></tr></thead><tbody>',
        '<tr><td>خطوط کد (TypeScript)</td><td><strong>۱۲۵٬۹۳۳</strong> در ۵۸۲ فایل</td></tr>',
        '<tr><td>سرویس‌های API</td><td><strong>۲۲۵</strong></td></tr>',
        '<tr><td>مدل‌های داده</td><td><strong>۱۱۵</strong></td></tr>',
        '<tr><td>تست‌های خودکار</td><td><strong>۷۱۱</strong> — انتشار خودکار با صفر شکست</td></tr>',
        '<tr><td>زبان‌ها</td><td><strong>۴</strong> + RTL کامل (۴٬۲۹۳ عبارت ترجمه‌شده با هم‌ارزی صددرصد)</td></tr>',
        '<tr><td>اجزای رابط کاربری</td><td><strong>۱۴۴</strong> کامپوننت</td></tr>',
        '</tbody></table>',
        '<h3>استاندارد مهندسی</h3>',
        '<ul>',
        '<li>انتشار خودکار (CI/CD) با دروازه‌های سخت: صفر خطای بررسی کد، صفر خطای تایپ، تست کامل سبز — هر بار</li>',
        '<li>پردازه‌های زمان‌بندی‌شدهٔ پس‌زمینه و پشتیبان‌گیری خودکار</li>',
        '<li>تراکنش‌های مالی رقابت‌امن (race-safe) و دفترهای حسابرسی برای اعمال حساس</li>',
        '</ul>',
        '<h3>برای سرمایه‌گذاران</h3>',
        '<p>این پروژه در مرحله‌ای است که کمتر استارتاپی به آن می‌رسد: <strong>محصول ساخته شده، کار می‌کند و زنده است.</strong> یعنی ریسک اجرا — بزرگ‌ترین ریسک هر سرمایه‌گذاری فناوری — عملاً حذف شده و منابع به‌جای ساخت، صرف رشد می‌شود.</p>',
        '<p>مسیر آشنایی:</p>',
        '<ol>',
        '<li><strong>جلسهٔ اول (معارفه):</strong> آشنایی با تیم و امضای توافق محرمانگی</li>',
        '<li><strong>جلسهٔ دوم (رونمایی):</strong> مشاهدهٔ زندهٔ محصول، حوزهٔ بازار، مدل کسب‌وکار و نقشهٔ راه</li>',
        '</ol>',
        '<p>📩 <strong>ارتباط: [راه تماس — ایمیل اختصاصی پیشنهاد می‌شود]</strong></p>',
        '<blockquote><em>به‌زودی معرفی می‌شود. زودتر از همه ببینید.</em></blockquote>',
      ].join(''),
    },
  },

  /**
   * Early-idea profiles — no features/tech/roadmap (those render only when
   * non-empty); they just link the idea page to Mehrdad's own published
   * research so an exploratory page has real depth instead of a bare title.
   */
  bizpal: {
    features: [],
    tech: [],
    phases: [],
    relatedPost: {
      slug: 'bizpal-digital-sales-marketing-and-advertising-startup',
      titleEn: 'BIZPAL Startup for Sales, Marketing, and Digital Advertising',
      titleFa: 'استارتاپ فروش، بازاریابی و تبلیغات دیجیتال BIZPAL',
    },
  },
  'iran-rail-revolution': {
    features: [],
    tech: [],
    phases: [],
    relatedPost: {
      slug: 'iran-railway-technology-startup',
      titleEn: 'Plan to Create a Railway Revolution — Advanced Transportation Corridor',
      titleFa: 'طرح ایجاد کریدور حمل‌ونقل ریلی پیشرفته ایران',
    },
  },
};

/** profile for a slug, or null when the project has none */
export function getProjectProfile(slug: string): ProjectProfile | null {
  return PROJECT_PROFILES[slug] ?? null;
}
