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
  | 'car'
  | 'book';

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
  /**
   * Optional MARKETING story block rendered BEFORE `story` (owner order
   * 2026-10-04: «ابتدای متن بیار یعنی فنی بره بعد» — market first, technical
   * after). health-app htmlEn = the owner's own "Market & Growth Section
   * (final copy)" memo placed VERBATIM, with the memo's implementation notes
   * excluded and its bracket rules applied as the memo itself prescribes:
   * [X]% → 74 (owner-confirmed the same day), the un-verifiable deliverable
   * sentence removed, the influencer line → "actively identifying" (the
   * memo's own prescribed fallback). htmlFa = faithful Persian rendering of
   * that final copy (translator: AI, pending the owner's own Persian
   * dictation — swap it in verbatim the moment he supplies one). The memo's
   * italic meta-notes (cite-source guidance, "measured than a pitch-deck"
   * rationale) are implementer notes, not page copy.
   */
  marketStory?: ProfileStory;
  /** label override for the build-progress box (e.g. «پیشرفت فاز اول»);
   *  falls back to the shared i18n label when absent */
  progressLabelEn?: string;
  progressLabelFa?: string;
  /** section-title override for the features block — the shared i18n title
   *  reads «Game highlights» (game-oriented); non-game profiles override it
   *  (driving-exam → «امکانات اپلیکیشن» — the app's own store wording) */
  featuresTitleEn?: string;
  featuresTitleFa?: string;
  /** same override pattern for the tech-section title (shared i18n FA copy
   *  reads «تکنولوژی‌های بازی» — game-oriented) */
  techTitleEn?: string;
  techTitleFa?: string;
  /**
   * Optional "intro meeting" CTA (owner's Market & Growth memo, For
   * Investors: "[Request an intro meeting →] (links to Contact)") — points
   * at an EXISTING site surface only. The optional lead-in paragraph renders
   * only when supplied.
   */
  contactCta?: {
    href: string;
    textEn?: string;
    textFa?: string;
    labelEn: string;
    labelFa: string;
  };
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
   * Driving License Exam — free, fully offline Iranian driving-license exam
   * trainer for Android. Owner approval 2026-10-13 («خیلی خوب انجام بده»)
   * to add it to the portfolio via the traffic-tempo pattern. Every number
   * below is the app's OWN Cafe Bazaar store copy (mix.azmon.app — v2.5.5
   * fetched 2026-10-13): 950+ questions / 270+ signs / two free golden mock
   * exams / 32 topic exams / 117 technical articles. No rating or install
   * figures are quoted anywhere (store shows «از ۰ رأی» — nothing to quote).
   * Persian copy obeys the editorial rule: no «،».
   */
  'driving-exam': {
    featuresTitleEn: 'App highlights',
    featuresTitleFa: 'امکانات اپلیکیشن',
    techTitleEn: 'Tech behind it',
    techTitleFa: 'تکنولوژی‌های اپلیکیشن',
    features: [
      {
        icon: 'brain',
        titleEn: '950+ practice questions',
        titleFa: 'بیش از ۹۵۰ سؤال با پاسخ',
        descEn:
          'The complete question bank for the license exam — every question with the correct answer, organized for targeted practice.',
        descFa:
          'بانک کامل سؤالات آزمون گواهینامه — هر سؤال با پاسخ درست و دسته‌بندی‌شده برای تمرین هدفمند.',
      },
      {
        icon: 'scan',
        titleEn: '270+ road signs',
        titleFa: 'بیش از ۲۷۰ تابلو راهنمایی و رانندگی',
        descEn:
          'Visual training for every regulatory / warning / prohibitory sign with a clear Persian explanation.',
        descFa:
          'آموزش تصویری همه تابلوهای انتظامی و هشداردهنده و بازدارنده با توضیح فارسی روان.',
      },
      {
        icon: 'trophy',
        titleEn: 'Two golden mock exams — free',
        titleFa: 'دو آزمون طلایی رایگان',
        descEn:
          'A real exam-session simulator with a timer and scoring and a detailed report card — no payment at all.',
        descFa:
          'شبیه‌ساز واقعی جلسه آزمون با زمان‌سنج و نمره‌دهی و کارنامه دقیق — بدون هیچ پرداختی.',
      },
      {
        icon: 'puzzle',
        titleEn: '32 topic exams',
        titleFa: '۳۲ آزمون موضوعی',
        descEn:
          'A dedicated exam for every section of the regulations — from laws and articles to violations and penalty points.',
        descFa:
          'آزمون تخصصی هر بخش آیین‌نامه — از قوانین و ماده‌ها تا جرائم و نمرات.',
      },
      {
        icon: 'book',
        titleEn: '117 technical articles',
        titleFa: '۱۱۷ مطلب فنی و آموزشی',
        descEn:
          'Driving tips and key regulations written in plain language plus short videos for the final days of prep.',
        descFa:
          'نکات رانندگی و قوانین مهم به زبان ساده به‌همراه ویدیوهای آموزشی کوتاه برای آمادگی روز آزمون.',
      },
      {
        icon: 'repeat',
        titleEn: 'Smart mistake review',
        titleFa: 'مرور هوشمند سؤال‌های اشتباه',
        descEn:
          'Every question you miss is saved to a personal review list — before the exam you study only your own weak spots.',
        descFa:
          'هر سؤالی را که اشتباه بزنید در بخش مرور ذخیره می‌شود تا قبل از آزمون فقط نکته‌های خودتان را بخوانید.',
      },
      {
        icon: 'car',
        titleEn: '100% offline — no ads',
        titleFa: '۱۰۰٪ آفلاین — بدون تبلیغ',
        descEn:
          'The whole bank lives on the phone: no internet and no SIM needed and no annoying ads — an 18 MB install.',
        descFa:
          'همه‌چیز آفلاین روی گوشی است — بدون اینترنت و سیم‌کارت و بدون تبلیغ مزاحم — با حجم فقط ۱۸ مگابایت.',
      },
    ],
    tech: [
      { labelEn: 'Android · Cafe Bazaar', labelFa: 'اندروید · کافه‌بازار' },
      { labelEn: '100% offline engine', labelFa: 'موتور کاملاً آفلاین' },
      { labelEn: 'Educational — free app', labelFa: 'آموزشی — رایگان' },
    ],
    /** official Cafe Bazaar store artwork (s.cafebazaar.ir, fetched 2026-10-13) */
    media: [
      {
        src: '/media/driving-exam-store-1.webp',
        altEn: 'Cafe Bazaar store art — a real license-exam simulator with a timer and instant scoring, fully free',
        altFa: 'پوستر کافه‌بازار — شبیه‌ساز آزمون گواهینامه با زمان‌سنج و نمره‌دهی — ۱۰۰٪ رایگان',
      },
      {
        src: '/media/driving-exam-store-4.webp',
        altEn: 'Cafe Bazaar store art — the complete driving-exam app home: questions and signs and resources and golden exams',
        altFa: 'پوستر کافه‌بازار — خانه کامل اپلیکیشن: سؤال‌ها و تابلوها و منابع و آزمون طلایی',
      },
      {
        src: '/media/driving-exam-store-3.webp',
        altEn: 'Cafe Bazaar store art — smart review turns every wrong answer into a one-tap study list',
        altFa: 'پوستر کافه‌بازار — مرور هوشمند: هر اشتباه با یک لمس مرور می‌شود',
      },
    ],
    phases: [
      {
        key: 'bazaar',
        icon: 'store',
        titleEn: 'Cafe Bazaar release',
        titleFa: 'انتشار در کافه‌بازار',
        stateEn: 'Live — published and maintained',
        stateFa: 'لایو — منتشر شد و در حال نگهداری',
        ring: 100,
        tone: 'done',
        badgeEn: '100%',
        badgeFa: '۱۰۰٪',
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
   *
   * 2026-10-04 owner additions around (never inside) the verbatim block:
   * Phase-1 card at 74% + phases 2–4 (sub-10%), progress-label override,
   * the Market & Growth block ABOVE this story (market first, technical
   * after) and the "Request an intro meeting" CTA — see the fields below.
   */
  'health-app': {
    features: [],
    tech: [],
    // Owner request 2026-10-04: «درصد پیشرفت را 74 درصد بزن — برای فاز اول
    // مشخص کن فاز اول 74 درصد پیشرفته» و همان روز: «مثل این 3 فاز دیگه قرار
    // بده اونها را عدد زیر 10 درصد بزار که اون قسمت پر بشه». The DB row's
    // progress field carries the 74 (one-time seed repair in seed-import.ts)
    // and the first card names it as PHASE ONE's figure. Scopes of the phases
    // are deliberately NOT described — the owner hasn't dictated what each
    // phase contains; phases 2–4 carry the owner-ordered sub-10% figures.
    phases: [
      {
        key: 'phase-1',
        icon: 'hammer',
        titleEn: 'Phase 1',
        titleFa: 'فاز اول',
        stateEn: '74% complete — build in progress',
        stateFa: '۷۴٪ پیشرفت — ساخت در جریان است',
        ring: 74,
        tone: 'active',
        badgeEn: '74%',
        badgeFa: '۷۴٪',
      },
      {
        key: 'phase-2',
        icon: 'hammer',
        titleEn: 'Phase 2',
        titleFa: 'فاز دوم',
        stateEn: '5% complete — just getting started',
        stateFa: '۵٪ پیشرفت — در ابتدای مسیر',
        ring: 5,
        tone: 'ready',
        badgeEn: '5%',
        badgeFa: '۵٪',
      },
      {
        key: 'phase-3',
        icon: 'hammer',
        titleEn: 'Phase 3',
        titleFa: 'فاز سوم',
        stateEn: '4% complete — just getting started',
        stateFa: '۴٪ پیشرفت — در ابتدای مسیر',
        ring: 4,
        tone: 'ready',
        badgeEn: '4%',
        badgeFa: '۴٪',
      },
      {
        key: 'phase-4',
        icon: 'hammer',
        titleEn: 'Phase 4',
        titleFa: 'فاز چهارم',
        stateEn: '3% complete — just getting started',
        stateFa: '۳٪ پیشرفت — در ابتدای مسیر',
        ring: 3,
        tone: 'ready',
        badgeEn: '3%',
        badgeFa: '۳٪',
      },
    ],
    // progress box label names the phase (owner request 2026-10-04)
    progressLabelEn: 'Phase 1 progress',
    progressLabelFa: 'پیشرفت فاز اول',
    // MARKET & GROWTH — owner's "final copy" memo (2026-10-04), rendered
    // FIRST (owner order: «ابتدای متن بیار یعنی فنی بره بعد»). EN = the
    // memo's page copy verbatim (its two italic meta-notes and the
    // "paste this in place of…" instruction are implementer notes, excluded;
    // brackets resolved per the memo's own rules — [X]% → 74 as the owner
    // confirmed, deliverable sentence removed, influencer line → the memo's
    // "actively identifying" fallback). FA = faithful rendering of the same
    // copy (no Persian comma rule respected) — pending the owner's own
    // Persian dictation. The LOC/API/test metrics strip was removed per the
    // memo: those numbers stay only inside the technical block below.
    marketStory: {
      htmlEn: [
        '<blockquote><p>The wellness app market is not a niche bet — it\'s one of the fastest-growing categories in consumer software, and still early enough for a focused, well-designed product to carve out real share.</p></blockquote>',
        '<h2>Market Opportunity</h2>',
        '<p><strong>Market size.</strong> Estimates vary by how narrowly the category is defined, so here are the relevant readings, named by scope:</p>',
        '<ul>',
        '<li><strong>Wellness apps</strong> (the closest match to this product): an estimated <strong>$15.3B in 2026</strong>, projected to reach <strong>$26.2B by 2030</strong> — a 14.9% CAGR (Grand View Research).</li>',
        '<li><strong>mHealth apps</strong> (the broader category covering all mobile health software): an estimated <strong>$45.1B in 2026</strong>, projected to reach <strong>$113.2B by 2034</strong> — an 11.8% CAGR, with wellness management already the largest single segment inside it (Fortune Business Insights).</li>',
        '<li><strong>Adoption context:</strong> global wellness-app users surpassed an estimated <strong>2.2 billion people in 2024</strong> — the audience already exists and is growing; the opportunity is capturing a meaningful share of it with a better product, not creating the category from scratch.</li>',
        '</ul>',
        '<p><strong>Why this segment, why now:</strong></p>',
        '<ul>',
        '<li>Rising chronic-disease awareness and preventive-health behavior are structurally increasing demand for self-monitoring tools, independent of any single product\'s marketing (Fortune Business Insights; Business Research Insights).</li>',
        '<li>Smartphone penetration and wearable adoption continue to lower the cost of the kind of continuous, everyday tracking this product is built around.</li>',
        '<li>The category is large enough to support multiple winners, but still fragmented enough that a genuinely well-designed, fast-to-use experience can stand out — most incumbents in this space are either narrow single-purpose trackers or bloated "do everything" platforms.</li>',
        '</ul>',
        '<h2>Our Approach (public version — no mechanism disclosed)</h2>',
        '<p>A wellness app built around two AI-driven assessment engines that turn everyday health signals into a clear, visual read on where the user\'s body stands — without the friction of manual logging that kills retention in most tracking apps. The specific mechanics are reserved for the in-person/NDA walkthrough; what\'s shared publicly is the outcome: a fast, visually clear, genuinely useful read on personal health trends, not a replacement for medical care.</p>',
        '<p><strong>Status:</strong> Building — 74% through Phase 1.</p>',
        '<h2>Growth Strategy</h2>',
        '<blockquote><p>The goal is 100,000 users within 6 months of public launch. This is a target we\'re building toward deliberately, not a guarantee — here\'s the reasoning and the plan behind it.</p></blockquote>',
        '<p><strong>1. Freemium as the acquisition engine.</strong><br/>A meaningful part of the assessment experience is free from day one. The logic: the product\'s core value (a genuinely useful, good-looking read on your own health data) is also its best advertisement — people share results, not feature lists. Conversion to paid tiers is designed around deeper tracking, history, and personalized recommendations once a user is already getting value for free.</p>',
        '<p><strong>2. Gamification for retention, not just acquisition.</strong><br/>Health apps typically lose most users within the first few weeks. The product\'s progress visuals, streaks, and milestone mechanics are designed specifically to counter that drop-off — growth only compounds if the people who join in month one are still active in month three.</p>',
        '<p><strong>3. Influencer and professional-network distribution.</strong><br/>The plan is to seed the free tier with health/fitness content creators, trainers, physicians, health &amp; wellness brand owners, and (longer-term) clinicians who can genuinely vouch for the product\'s output — not a paid blast to unrelated audiences. The first creators and professionals for this seeding phase are being actively identified.</p>',
        '<p><strong>4. What has to go right for this to work — stated plainly:</strong></p>',
        '<ul>',
        '<li>The free tier has to be good enough on its own to generate organic shares — this is being validated with real early users before scaling any paid or influencer spend.</li>',
        '<li>Retention in the first 30 days is the real leading indicator, more than raw signups — this is the number we\'re tracking most closely post-launch.</li>',
        '<li>100,000 in 6 months is the target scenario if the above two hold at the rates we\'re modeling; we\'ll share actual cohort data as it comes in rather than only the headline number.</li>',
        '</ul>',
        '<h2>For Investors</h2>',
        '<p>Execution on the core product is underway and can be shown in a live walkthrough. What\'s public here is the market case and the growth logic; the product mechanics, current metrics, and roadmap detail are covered in an intro call, after which an NDA can be arranged for a full technical and product walkthrough.</p>',
      ].join(''),
      htmlFa: [
        '<blockquote><p>بازار اپ‌های تندرستی یک شرط‌بندی حاشیه‌ای نیست — یکی از سریع‌ترین دسته‌های در حال رشد در نرم‌افزار مصرفی است و هنوز به‌قدر کافی جوان است که یک محصول متمرکز و خوش‌طرح بتواند سهم واقعی برای خود کنار بزند.</p></blockquote>',
        '<h2>فرصت بازار</h2>',
        '<p><strong>اندازهٔ بازار.</strong> برآوردها بسته به این‌که دسته چقدر محدود تعریف شود متفاوت‌اند؛ پس هر سه خوانش مرتبط را — با نام‌بردن دامنهٔ هر کدام — می‌آوریم:</p>',
        '<ul>',
        '<li><strong>اپ‌های تندرستی</strong> (نزدیک‌ترین تطابق با این محصول): برآورد <strong>۱۵٫۳ میلیارد دلار در ۲۰۲۶</strong> و پیش‌بینی رسیدن به <strong>۲۶٫۲ میلیارد دلار تا ۲۰۳۰</strong> — با نرخ رشد مرکب سالانه ۱۴٫۹٪ (Grand View Research).</li>',
        '<li><strong>اپ‌های mHealth</strong> (دستهٔ گسترده‌تر شامل همهٔ نرم‌افزارهای سلامت موبایل): برآورد <strong>۴۵٫۱ میلیارد دلار در ۲۰۲۶</strong> و پیش‌بینی رسیدن به <strong>۱۱۳٫۲ میلیارد دلار تا ۲۰۳۴</strong> — با نرخ رشد مرکب سالانه ۱۱٫۸٪؛ مدیریت تندرستی همین حالا بزرگ‌ترین تک‌بخش آن است (Fortune Business Insights).</li>',
        '<li><strong>بستر پذیرش:</strong> شمار کاربران جهانی اپ‌های تندرستی در ۲۰۲۴ از مرز برآوردی <strong>۲٫۲ میلیارد نفر</strong> گذشت — مخاطب از قبل وجود دارد و بزرگ می‌شود؛ فرصت سهم‌گرفتن معنادار از این مخاطب با محصولی بهتر است؛ نه ساختن دسته از صفر.</li>',
        '</ul>',
        '<p><strong>چرا این بخش از بازار و چرا حالا:</strong></p>',
        '<ul>',
        '<li>رشد آگاهی از بیماری‌های مزمن و گرایش به سلامت پیشگیرانه به‌صورت ساختاری تقاضا برای ابزارهای خودپایشی را بالا می‌برد — مستقل از بازاریابی هر محصول خاص (Fortune Business Insights؛ Business Research Insights).</li>',
        '<li>نفوذ گوشی هوشمند و پوشیدنی‌ها همچنان هزینهٔ آن ردیابی روزمره و پیوسته را پایین می‌آورد که این محصول حول آن ساخته شده است.</li>',
        '<li>این دسته به‌اندازهٔ کافی بزرگ است که جای چند برنده داشته باشد و همچنان آن‌قدر پراکنده است که یک تجربهٔ واقعاً خوش‌طرح و سریع بتواند خودش را نشان بدهد — بیشتر بازیگران فعلی یا ردیاب‌های تک‌منظورهٔ محدودند یا پلتفرم‌های شلوغ «همه‌کاره».</li>',
        '</ul>',
        '<h2>رویکرد ما (نسخهٔ عمومی — بدون افشای مکانیزم)</h2>',
        '<p>اپ تندرستی ساخته‌شده حول دو موتور ارزیابی مبتنی بر هوش مصنوعی که سیگنال‌های روزمرهٔ سلامت را به یک خوانش روشن و بصری از وضعیت بدن کاربر تبدیل می‌کنند — بدون اصطکاک ثبت دستی که در بیشتر اپ‌های ردیابی نگه‌داشت کاربر را از بین می‌برد. جزئیات مکانیزم برای پیمایش حضوری/محرمانگی (NDA) نگه داشته شده است؛ آنچه عمومی است نتیجه است: خوانشی سریع و بصری و واقعاً کاربردی از روند سلامت شخصی — نه جایگزینی برای مراقبت پزشکی.</p>',
        '<p><strong>وضعیت:</strong> در حال ساخت — ۷۴٪ فاز اول.</p>',
        '<h2>استراتژی رشد</h2>',
        '<blockquote><p>هدف ۱۰۰٬۰۰۰ کاربر در ۶ ماه پس از عرضهٔ عمومی است. هدفی است که آگاهانه به‌سویش می‌سازیم؛ نه یک تضمین — استدلال و برنامهٔ پشت آن این است:</p></blockquote>',
        '<p><strong>۱. فری‌میوم به‌عنوان موتور جذب.</strong><br/>بخش معناداری از تجربهٔ ارزیابی از روز اول رایگان است. منطق: ارزش اصلی محصول (خوانشی واقعاً مفید و خوش‌ظاهر از دادهٔ سلامت خودتان) بهترین تبلیغ آن هم هست — آدم‌ها نتیجه را به اشتراک می‌گذارند نه فهرست قابلیت‌ها را. تبدیل به پلن پولی حول ردیابی عمیق‌تر و تاریخچه و پیشنهادهای شخصی‌سازی‌شده طراحی شده است؛ برای وقتی که کاربر از نسخهٔ رایگان ارزش گرفته باشد.</p>',
        '<p><strong>۲. گیمیفیکیشن برای نگه‌داشت — نه فقط جذب.</strong><br/>اپ‌های سلامت معمولاً در هفته‌های نخست بیشتر کاربرانشان را از دست می‌دهند. نمای پیشرفت و استریک‌ها و مکانیک‌های نقاط عطف محصول دقیقاً برای مقابله با همان ریزش طراحی شده‌اند — رشد فقط وقتی مرکب می‌شود که کسانی که ماه اول آمده‌اند در ماه سوم هم فعال باشند.</p>',
        '<p><strong>۳. توزیع از طریق اینفلوئنسرها و شبکهٔ متخصصان.</strong><br/>برنامه این است که نسخهٔ رایگان با تولیدکننده‌های محتوای سلامت/فیتنس و مربیان و پزشکان و صاحبان برند در حوزهٔ سلامتی و تندرستی و (در بلندمدت) متخصصان بالینی بذرگذاری شود — کسانی که واقعاً از خروجی محصول پشتیبانی کنند؛ نه یک کمپین پولی به مخاطب بی‌ربط. نخستین خالق‌ها و متخصصان این مرحله در حال شناسایی فعال هستند.</p>',
        '<p><strong>۴. چه چیزهایی باید درست پیش برود — شفاف و رک:</strong></p>',
        '<ul>',
        '<li>نسخهٔ رایگان باید به‌تنهایی به‌قدر کافی خوب باشد که به‌صورت ارگانیک به اشتراک گذاشته شود — این با کاربران واقعی اولیه و پیش از هر هزینهٔ تبلیغاتی یا اینفلوئنسری اعتبارسنجی می‌شود.</li>',
        '<li>نگه‌داشت در ۳۰ روز نخست نشانگر پیشروی واقعی است؛ بیش از ثبت‌نام خام — این عددی است که بعد از عرضه بیش از همه رصد می‌کنیم.</li>',
        '<li>«۱۰۰٬۰۰۰ در ۶ ماه» سناریوی هدف است اگر دو مورد بالا با نرخ‌های مدل‌شده جلو بروند؛ دادهٔ واقعی کوهورت‌ها را همین‌طور که می‌رسد منتشر می‌کنیم؛ نه فقط عدد تیتری.</li>',
        '</ul>',
        '<h2>برای سرمایه‌گذاران</h2>',
        '<p>اجرای محصول اصلی در جریان است و در یک پیمایش زنده قابل مشاهده است. آنچه این‌جا عمومی است داستان بازار و منطق رشد است؛ مکانیزم محصول و متریک‌های فعلی و جزئیات نقشهٔ راه در یک جلسهٔ معارفه پوشش داده می‌شود و پس از آن توافق محرمانگی برای یک پیمایش فنی و محصولی کامل قابل ترتیب است.</p>',
      ].join(''),
    },
    // "Request an intro meeting →" CTA — the memo's own For Investors
    // closing ("links to Contact"); routes to the site's existing /contact
    // page. The verbatim [contact] placeholder in the technical block below
    // stays untouched until the owner supplies the real channel.
    contactCta: {
      href: '/contact',
      labelEn: 'Request an intro meeting',
      labelFa: 'درخواست جلسهٔ معارفه',
    },
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

  /**
   * KLIKA (kilika-fintech) — full investor story (owner order 2026-10-25:
   * «از روی پیج دک توضیحاتی بردار و متن طولانی با توضیحات کامل بنویس» —
   * the work page was a two-sentence skeleton while the owner's deck page
   * /s/kilika.html carries the complete pitch; D-055).
   *
   * DIRECTION REVERSED vs health-app: here the FA copy is the OWNER'S OWN
   * deck text (the deck page itself is Persian) re-flowed into long-form
   * sections — every sentence and every number comes verbatim from the
   * deck, only re-paragraphed; the zero-«،» standing rule is applied to the
   * re-flowed prose (deck punctuation was normalized to «؛»/«و» — wording
   * untouched). EN is the faithful rendering of the same sections
   * (EN-purity rule). ZERO invented facts: stats, percentages, partner
   * names, projections — all as printed on /s/kilika.html.
   */
  'kilika-fintech': {
    features: [],
    tech: [],
    phases: [],
    marketStory: {
      htmlFa: [
        '<blockquote><p>کلیکا یک سوپر اپلیکیشن و پلتفرم میان‌برنامه‌ای است؛ یک پلتفرم برای دسترسی به ده‌ها سرویس آنلاین؛ تجربه‌ای ساده و یکپارچه برای حمل‌ونقل و خرید و سفر و خدمات روزمره.</p></blockquote>',
        '<h2>مشکلی که حل می‌کنیم</h2>',
        '<p><strong>دنیای دیجیتال پراکنده است.</strong> در عصری که فناوری باید زندگی را ساده‌تر کند؛ کاربران همچنان غرق در پیچیدگی‌های غیرضروری هستند:</p>',
        '<ul>',
        '<li><strong>اتلاف زمان در جابجایی بین اپلیکیشن‌ها:</strong> کاربران روزانه بیش از ۲۰ بار بین اپلیکیشن‌های مختلف جابجا می‌شوند — این یعنی دست‌کم ۱۵ دقیقه وقت تلف‌شده در روز.</li>',
        '<li><strong>فقدان هوشمندسازی در خدمات آنلاین:</strong> هر سرویس به‌صورت جداگانه عمل می‌کند و هیچ ارتباط هوشمندی بین نیازهای مختلف کاربر برقرار نیست.</li>',
        '<li><strong>تجربه کاربری ناهمگون و پیچیده:</strong> یادگیری و استفاده از بیش از ۸ رابط کاربری متفاوت فرآیند پیچیده‌ای برای کاربران ساخته است.</li>',
        '</ul>',
        '<p><strong>هزینه‌های پنهان برای کاربران:</strong></p>',
        '<ul>',
        '<li><strong>کارمزدهای متفاوت</strong> — هر پلتفرم کارمزد جداگانه دریافت می‌کند.</li>',
        '<li><strong>عدم شفافیت قیمت‌ها</strong> — مقایسه قیمت‌ها در سرویس‌های مختلف دشوار است.</li>',
        '<li><strong>تخفیف‌های پراکنده</strong> — امتیازات وفاداری در هر اپ جداگانه است.</li>',
        '<li><strong>روش‌های پرداخت متنوع</strong> — نیاز به افزودن کارت در هر سرویس.</li>',
        '</ul>',
        '<p><strong>مشکلات کسب‌وکارها:</strong></p>',
        '<ul>',
        '<li><strong>هزینه جذب مشتری بالا</strong> — هر پلتفرم باید هزینه بازاریابی جداگانه صرف کند.</li>',
        '<li><strong>نرخ ریزش بالای کاربر</strong> — کاربران بین اپلیکیشن‌ها جابجا می‌شوند.</li>',
        '<li><strong>محدودیت در فروش متقاطع</strong> — عدم امکان ارائه خدمات مکمل.</li>',
        '<li><strong>داده‌های پراکنده</strong> — تحلیل رفتار کاربر محدود به یک سرویس است.</li>',
        '</ul>',
        '<h2>شکاف اکوسیستم دیجیتال</h2>',
        '<p>بازارهای پیشرو جهانی به سمت یکپارچه‌سازی حرکت کرده‌اند:</p>',
        '<ul>',
        '<li><strong>WeChat — چین:</strong> بیش از ۱.۳ میلیارد کاربر فعال؛ پرداخت و شبکه اجتماعی و خرید و حمل‌ونقل.</li>',
        '<li><strong>Paytm — هند:</strong> ۴۵۰ میلیون کاربر؛ کیف پول دیجیتال و بانکداری و بیمه.</li>',
        '<li><strong>Gojek — اندونزی:</strong> ۱۹۰ میلیون کاربر؛ حمل‌ونقل و غذا و پرداخت و لجستیک.</li>',
        '</ul>',
        '<p><strong>ایران با ۸۵ میلیون کاربر اینترنت هنوز فاقد یک سوپر اپلیکیشن ملی است.</strong> این یک فرصت بی‌نظیر برای ایجاد ارزش اقتصادی چند میلیارد دلاری است.</p>',
        '<h2>راه‌حل: یک اپ؛ همه سرویس‌ها</h2>',
        '<p>کلیکا یک پلتفرم هوشمند است که دسترسی به ده‌ها سرویس آنلاین را در یک اپلیکیشن ساده و امن فراهم می‌کند:</p>',
        '<ul>',
        '<li><strong>یک اپ؛ همه سرویس‌ها</strong> — دسترسی به تمام سرویس‌های روزمره از یک نقطه ورود واحد.</li>',
        '<li><strong>سرعت و سادگی</strong> — بدون نیاز به نصب چندین اپلیکیشن و جابجایی مداوم.</li>',
        '<li><strong>امنیت یکپارچه</strong> — یک بار احراز هویت؛ دسترسی امن به تمام سرویس‌ها.</li>',
        '</ul>',
        '<p><strong>استراتژی محصول: نسخه ایرانی و بین‌المللی.</strong></p>',
        '<ul>',
        '<li><strong>نسخه ایرانی (فاز ۱):</strong> سرویس‌های محلی (اسنپ؛ دیجی‌کالا؛ علی بابا)؛ یکپارچگی با بانک‌های ایرانی؛ پشتیبانی کامل از زبان فارسی؛ تطابق با قوانین و مقررات داخلی؛ راه‌اندازی در بازار ایران.</li>',
        '<li><strong>نسخه بین‌المللی (فاز ۲):</strong> سرویس‌های جهانی (Uber؛ Amazon؛ Booking)؛ پشتیبانی از ارزهای بین‌المللی؛ چندزبانه (انگلیسی؛ عربی؛ ترکی و...)؛ تطابق با استانداردهای جهانی؛ گسترش به خاورمیانه و آسیای مرکزی.</li>',
        '</ul>',
        '<p>نحوه کار ساده است: کاربر کلیکا را نصب می‌کند؛ به تمام سرویس‌ها دسترسی پیدا می‌کند؛ کلیکا به سرویس‌های شریک متصل می‌شود.</p>',
        '<h2>فرصت بازار</h2>',
        '<p>بازار جهانی سوپر اپ‌ها با رشد فوق‌العاده سریع پیش می‌رود:</p>',
        '<ul>',
        '<li><strong>بازار جهانی کیف پول دیجیتال:</strong> ۱۱.۴ میلیارد دلار (۲۰۲۶) — پیش‌بینی ۲۷.۳ میلیارد دلار (۲۰۳۱)؛ نرخ رشد سالانه (CAGR) ۱۹.۱٪.</li>',
        '<li><strong>بازار ایران:</strong> ۸۵۰ هزار میلیارد تومان تراکنش دیجیتال سالانه (۱۴۰۴)؛ ۴۵ میلیون کاربر فعال اینترنت موبایل؛ ۷۵٪ رشد تراکنش‌های آنلاین نسبت به سال گذشته؛ بیش از ۱۲ میلیون کاربر فعال ماهانه در پلتفرم‌های شریک؛ ۶۵٪ تمایل به کیف پول یکپارچه (بر اساس نظرسنجی).</li>',
        '</ul>',
        '<h2>قابلیت‌های پلتفرم</h2>',
        '<ul>',
        '<li><strong>مدیریت حساب یکپارچه</strong> — مدیریت متمرکز موجودی و تراکنش‌ها با امکان شارژ از تمام بانک‌ها.</li>',
        '<li><strong>پرداخت یک‌کلیکه</strong> — تراکنش فوری بدون نیاز به ورود مجدد اطلاعات کارت.</li>',
        '<li><strong>اتصال به سرویس‌ها</strong> — یکپارچگی با اسنپ و تپسی و دیجی‌کالا و صرافی‌ها و فروشگاه‌ها و اپراتورها.</li>',
        '<li><strong>امنیت چندلایه</strong> — رمزگذاری بانکی؛ احراز هویت دو مرحله‌ای؛ رصد تقلب.</li>',
        '<li><strong>تحلیل هوشمند</strong> — گزارش دقیق هزینه‌ها و دسته‌بندی خودکار تراکنش‌ها.</li>',
        '<li><strong>تجربه کاربری عالی</strong> — رابط کاربری ساده و سریع با پشتیبانی از تمام دستگاه‌ها.</li>',
        '</ul>',
        '<h2>مدل درآمدی: چهار جریان مستقل</h2>',
        '<ul>',
        '<li><strong>کمیسیون تراکنش — ۵۵٪:</strong> ۰.۵ تا ۲٪ از هر تراکنش خرید و پرداخت (خرید از دیجی‌کالا؛ پرداخت اسنپ؛ شارژ موبایل). جزئیات: خرید کالا و خدمات ۱.۵ تا ۲٪ (۴۰٪ حجم تراکنش‌ها)؛ حمل‌ونقل ۱ تا ۱.۵٪ (۳۰٪)؛ شارژ و قبوض ۰.۵ تا ۱٪ (۲۰٪)؛ خدمات دیجیتال ۱۰٪ حجم باقی‌مانده.</li>',
        '<li><strong>همکاری با فروشگاه‌ها — ۲۵٪:</strong> قرارداد B2B و کمیسیون از فروش — حق اشتراک ماهانه از ۵ میلیون تومان؛ کمیسیون فروش ۱ تا ۳٪؛ کمپین تبلیغاتی ۱۰ تا ۵۰ میلیون تومان؛ گزارش تحلیل و داده ۲ تا ۱۰ میلیون تومان. مثال ارائه: یک فروشگاه زنجیره‌ای با ۱۰۰ شعبه؛ ماهانه ۲۰ میلیون تومان حق اشتراک + ۲٪ کمیسیون از فروش = درآمد ماهانه ۵۰ تا ۱۰۰ میلیون تومان.</li>',
        '<li><strong>خدمات مالی — ۱۵٪:</strong> سود تسویه (Float) و تبدیل ارز و طلا و اعتبار کوتاه‌مدت و بیمه تراکنش. با میانگین ۱۰۰ میلیارد تومان موجودی در پلتفرم؛ سود سالانه ۳ میلیارد تومان (۳٪) از سپرده‌گذاری در بانک.</li>',
        '<li><strong>خدمات ویژه Premium — ۵٪:</strong> حساب VIP فردی ۲۰ هزار تومان در ماه (کمیسیون ۵۰٪ کمتر؛ برداشت فوری؛ پشتیبانی ۲۴/۷)؛ حساب Business ۱۰۰ تا ۵۰۰ هزار تومان در ماه (مدیریت چند حساب؛ API اختصاصی؛ فاکتور خودکار)؛ API Enterprise ۵ تا ۲۰ میلیون تومان در ماه.</li>',
        '</ul>',
        '<p><strong>جمع‌بندی درآمد ماهانه با ۱ میلیون کاربر: ۱۸ میلیارد تومان</strong> — کمیسیون تراکنش ۹.۹ میلیارد + همکاری فروشگاه‌ها ۴.۵ میلیارد + خدمات مالی ۲.۷ میلیارد + خدمات ویژه ۰.۹ میلیارد.</p>',
        '<p><strong>متریک‌های کلیدی:</strong> میانگین ارزش هر تراکنش ۲۵۰ هزار تومان؛ میانگین کمیسیون هر تراکنش ۱٬۵۰۰ تومان؛ ۱۲ تراکنش در ماه از هر کاربر؛ درآمد ماهانه از هر کاربر ۱۸ هزار تومان؛ هزینه جذب کاربر (CAC) ۱۵۰ هزار تومان؛ بازگشت سرمایه ۸.۳ ماه.</p>',
        '<p><strong>چرا پایدار است؟</strong> چهار جریان درآمدی مستقل (کاهش ریسک وابستگی) + درآمد تکراری و پیش‌بینی‌پذیر + حاشیه سود خالص بالای ۶۵٪.</p>',
        '<h2>همکاری B2B و Developer API</h2>',
        '<p>چرا اپلیکیشن‌های معتبر مثل اسنپ و تپسی و دیجی‌کالا باید از سرویس‌های کلیکا استفاده کنند؟</p>',
        '<ul>',
        '<li><strong>افزایش رضایت کاربران +۳۵٪</strong> — ارائه خدمات یکپارچه و تجربه کاربری بهتر.</li>',
        '<li><strong>کاهش هزینه‌های پشتیبانی ۴۰٪-</strong> — کاهش چشمگیر تماس‌های پشتیبانی و تیکت‌ها.</li>',
        '<li><strong>کاهش درگیری تیم پشتیبانی ۵۰٪-</strong> — کمتر شدن مشکلات فنی و سوالات تکراری.</li>',
        '<li><strong>افزایش کاربردی بودن اپلیکیشن +۶۰٪</strong> — تبدیل اپ به یک سوپر اپلیکیشن کامل.</li>',
        '<li><strong>Developer API تا ۹۰٪ سریع‌تر</strong> — یکپارچه‌سازی در کمتر از یک هفته به‌جای ماه‌ها (پرداخت؛ شارژ و قبض؛ گزارش‌گیری؛ رمزنگاری؛ احراز هویت؛ مانیتورینگ؛ داشبورد تحلیل رفتار و پیش‌بینی).</li>',
        '<li><strong>افزایش درآمد همکاران +۴۵٪</strong> — کاربران بیشتر استفاده می‌کنند = درآمد بیشتر.</li>',
        '</ul>',
        '<p>نتیجه ارائه: اپلیکیشن‌های همکار با افزایش ۳۵٪ رضایت کاربران و کاهش ۴۰٪ هزینه‌های پشتیبانی؛ در ماه اول همکاری ROI مثبت دارند.</p>',
        '<h2>جایگاه رقابتی</h2>',
        '<p><strong>کلیکا در مقابل بلوبانک:</strong> بلوبانک خدمات بانکی محدودی دارد — تمرکز فقط بر تراکنش‌های مالی؛ عدم یکپارچگی با سرویس‌های روزمره؛ رویکرد سنتی بانکداری دیجیتال. کلیکا بیش از ۲۰ دسته‌بندی خدمات یکپارچه ارائه می‌کند (بانکداری + خرید + حمل‌ونقل + سفر) — امکانات ۲۰ برابر بیشتر؛ API قدرتمند برای توسعه‌دهندگان؛ سوپر اپلیکیشن نسل آینده؛ و نسخه بین‌المللی: راه‌اندازی در کشورهای حاشیه خلیج فارس در سال اول — پل مالی بین ایران و جهان.</p>',
        '<p><strong>کلیکا در مقابل اپ:</strong> اپ محدود به پرداخت و انتقال وجه است — چندین سال بدون نوآوری قابل توجه؛ رابط کاربری پیچیده و قدیمی؛ پشتیبانی ضعیف و محدود به تماس تلفنی. کلیکا سوپر اپلیکیشن نوآورانه نسل جدید است — رابط کاربری مدرن؛ پشتیبانی ۲۴/۷ هوشمند (چت و صوتی و تصویری)؛ پرداخت + بانکداری + خرید + حمل‌ونقل + سفر در یک جا؛ اتصال به تمام پلتفرم‌های بزرگ کشور؛ اکوسیستم کامل توسعه‌دهندگان (SDK و API). سفر کاربر: در اپ حدود ۱۰ دقیقه با جابجایی بین چند اپلیکیشن؛ در کلیکا حدود ۱ دقیقه — همه کارها در یک جا.</p>',
        '<p><strong>پتانسیل مهاجرت:</strong> پیش‌بینی جابجایی ۳۰ تا ۵۰٪ کاربران اپ در سال اول؛ ارزش پیشنهادی ۱۰ برابر بیشتر با هزینه جذب کاربر ۷۰٪ کمتر؛ سوپر اپلیکیشن‌ها ۳ تا ۵ برابر ارزش‌گذاری بیشتری نسبت به اپ‌های تک‌منظوره دارند؛ بیش از ۱۰۰ ویژگی یکپارچه از روز اول؛ ۸۰٪ بودجه به مارکتینگ؛ ارزش طول عمر کاربر (LTV) دو تا سه برابر.</p>',
        '<h2>نسل جدید نئوبانک‌ها و جنبش دیجیتال</h2>',
        '<p>کلیکا سه لایه دارد: <strong>نئوبانک نسل جدید</strong> (بانکداری دیجیتال کامل + خدمات مالی پیشرفته + یکپارچگی با زندگی روزمره — فراتر از بلوبانک و دیجی‌پی)؛ <strong>میان‌برنامه‌ای واقعی</strong> (اتصال به تمام سرویس‌ها و پلتفرم‌ها بدون خروج از محیط کلیکا)؛ <strong>سوپر اپ هوشمند</strong> (هوش مصنوعی + پیشنهادهای شخصی‌سازی‌شده + تجربه یکپارچه). با اختصاص ۸۰٪ بودجه به مارکتینگ؛ کلیکا نه تنها یک اپلیکیشن بلکه یک جنبش دیجیتال خواهد بود که استاندارد جدیدی برای نئوبانک‌ها و سوپر اپلیکیشن‌های میان‌برنامه‌ای در منطقه تعریف می‌کند — هدف اصلی تبلیغات نسل Z و Y؛ رهبری بازار در دو سال. نوآوری‌ها هم به‌صورت حقوقی محافظت می‌شوند: ثبت اختراع (الگوریتم‌ها و فناوری‌های نوآورانه)؛ علائم تجاری (برند و هویت بصری)؛ قراردادهای NDA با شرکا؛ حقوق نرم‌افزاری (کد منبع و معماری سیستم).</p>',
        '<h2>تضمین ۱ میلیون کاربر در سال اول</h2>',
        '<p>دسترسی به بیش از ۱۵ میلیون کاربر بالقوه از طریق ۱۱ دسته مشتریان B2B:</p>',
        '<ul>',
        '<li><strong>حمل‌ونقل (اولویت بالا):</strong> اسنپ ۸ میلیون؛ تپسی ۶ میلیون؛ ماکسیم ۲ میلیون کاربر.</li>',
        '<li><strong>خرده‌فروشی آنلاین:</strong> دیجی‌کالا ۱۵ میلیون؛ دیجی‌پی ۵ میلیون؛ ازکی ۳ میلیون.</li>',
        '<li><strong>فروشگاه‌های زنجیره‌ای:</strong> افق کوروش ۳ میلیون؛ شهروند ۲ میلیون؛ دیلی مارکت ۱.۵ میلیون؛ رفاه ۱.۸ میلیون.</li>',
        '<li><strong>اپراتورهای موبایل:</strong> همراه اول ۵۵ میلیون؛ ایرانسل ۴۸ میلیون؛ رایتل ۱۲ میلیون مشترک.</li>',
        '<li><strong>سایر دسته‌ها:</strong> بلیط و گردشگری (علی بابا ۱۲ میلیون؛ اسنپ تریپ ۴ میلیون)؛ کافه و رستوران؛ خدمات حرفه‌ای؛ خرده‌فروش حضوری (۱۰ میلیون فروشگاه محلی)؛ بانک و مالی؛ شبکه‌های اجتماعی؛ دولت و عمومی.</li>',
        '</ul>',
        '<p>بیش از ۱۲۵ هزار مشتری بالقوه در دست اقدام؛ ۱۴۴ میلیون تراکنش سالانه با ۱ میلیون کاربر. <strong>اثر شبکه: یک مشتری؛ همه مشتریان.</strong> با جذب یک مشتری بزرگ (مثلاً اسنپ یا دیجی‌کالا)؛ سایر رقبا و مکمل‌ها نیز مجبور به عضویت می‌شوند تا رقابت‌پذیر بمانند: جذب یک پلتفرم بزرگ ← نیاز رقبا به کلیکا ← رشد تصاعدی شبکه.</p>',
        '<h2>مزیت برای بانک شریک</h2>',
        '<ul>',
        '<li><strong>افزایش تراکنش‌های درگاه پرداخت ۵۰ تا ۲۰۰٪</strong> در دو سال اول — با یکپارچه‌سازی کامل خدمات؛ تمام پرداخت‌های حمل‌ونقل و خرید و سفر و خدمات از درگاه بانک شریک انجام می‌شود.</li>',
        '<li><strong>افزایش تراکنش‌های بانکی ۱۰ تا ۱۰۰٪</strong> — جذب کاربران جدید؛ افزایش تراکنش‌های روزانه؛ ایجاد اکوسیستم مالی پویا.</li>',
        '</ul>',
        '<p>هدف: تبدیل بانک شریک به پیشرو بازار پرداخت دیجیتال — با دسترسی به بزرگ‌ترین اکوسیستم تراکنش‌های آنلاین کشور.</p>',
        '<h2>برای سرمایه‌گذاران</h2>',
        '<p>سرمایه درخواستی <strong>۴ میلیون دلار</strong>؛ ارائه رسمی فوریه ۲۰۲۶. پیش‌بینی: با توجه به تنوع درآمدی (کارمزد؛ تبلیغات؛ اشتراک؛ API) و حجم بالای کاربران؛ درآمد کلیکا در سه سال اول از بلوبانک پیشی می‌گیرد — مدل کسب‌وکار چند لایه؛ جریان نقدینگی سریع؛ ارزش‌گذاری بالاتر. این متن کامل‌تر شدهٔ همان ارائه است؛ <a href="https://mehrdad.ir/s/kilika.html">نسخه اصلی پیج دک کلیکا</a> نیز روی دامنه اصلی سایت فعال است.</p>',
      ].join(''),
      htmlEn: [
        '<blockquote><p>KLIKA is a super-app and middleware platform — one platform for access to dozens of online services; a simple, unified experience for transport, shopping, travel and everyday services.</p></blockquote>',
        '<h2>The Problem We Solve</h2>',
        '<p><strong>The digital world is fragmented.</strong> In an era where technology should simplify life, users are still drowning in unnecessary complexity:</p>',
        '<ul>',
        '<li><strong>Time wasted switching between apps:</strong> users switch between different apps 20+ times a day — at least 15 minutes of lost time daily.</li>',
        '<li><strong>No intelligence in online services:</strong> every service operates in isolation; no smart connection exists between a user\'s different needs.</li>',
        '<li><strong>Inconsistent, complex user experience:</strong> learning and using 8+ different interfaces creates a genuinely complicated process.</li>',
        '</ul>',
        '<p><strong>Hidden costs for users:</strong></p>',
        '<ul>',
        '<li><strong>Different fees</strong> — every platform charges its own commission.</li>',
        '<li><strong>Price opacity</strong> — comparing prices across services is difficult.</li>',
        '<li><strong>Scattered discounts</strong> — loyalty points live separately inside each app.</li>',
        '<li><strong>Fragmented payment methods</strong> — a card must be added to every service.</li>',
        '</ul>',
        '<p><strong>Business-side pains:</strong></p>',
        '<ul>',
        '<li><strong>High customer-acquisition cost</strong> — every platform spends on its own marketing.</li>',
        '<li><strong>High churn</strong> — users drift between apps.</li>',
        '<li><strong>No cross-selling</strong> — complementary services cannot be offered.</li>',
        '<li><strong>Siloed data</strong> — behavior analysis is capped at one service.</li>',
        '</ul>',
        '<h2>The Ecosystem Gap</h2>',
        '<p>Leading global markets have already moved to integration:</p>',
        '<ul>',
        '<li><strong>WeChat — China:</strong> 1.3+ billion active users; payments, social, shopping, transport.</li>',
        '<li><strong>Paytm — India:</strong> 450 million users; digital wallet, banking, insurance.</li>',
        '<li><strong>Gojek — Indonesia:</strong> 190 million users; transport, food, payments, logistics.</li>',
        '</ul>',
        '<p><strong>Iran — with 85 million internet users — still has no national super-app.</strong> This is a unique opportunity to create multi-billion-dollar economic value.</p>',
        '<h2>The Solution: One App; Every Service</h2>',
        '<p>KLIKA is an intelligent platform that puts dozens of online services behind one simple, secure app:</p>',
        '<ul>',
        '<li><strong>One app; every service</strong> — all everyday services behind a single entry point.</li>',
        '<li><strong>Speed and simplicity</strong> — no more installing multiple apps and constant switching.</li>',
        '<li><strong>Unified security</strong> — authenticate once; access every service securely.</li>',
        '</ul>',
        '<p><strong>Product strategy: an Iranian and an international version.</strong></p>',
        '<ul>',
        '<li><strong>Iranian version (Phase 1):</strong> local services (Snapp; Digikala; Alibaba.ir); integration with Iranian banks; full Persian-language support; compliance with domestic regulations; launch in the Iranian market.</li>',
        '<li><strong>International version (Phase 2):</strong> global services (Uber; Amazon; Booking); international-currency support; multilingual (English; Arabic; Turkish and more); global standards compliance; expansion into the Middle East and Central Asia.</li>',
        '</ul>',
        '<p>How it works is simple: the user installs KLIKA; gets access to every service; KLIKA connects to the partner services.</p>',
        '<h2>Market Opportunity</h2>',
        '<p>The global super-app market is moving at extraordinary speed:</p>',
        '<ul>',
        '<li><strong>Global digital-wallet market:</strong> $11.4B (2026) — projected $27.3B (2031); 19.1% CAGR.</li>',
        '<li><strong>Iran:</strong> 850 trillion toman in annual digital transactions (1404); 45 million active mobile-internet users; 75% growth in online transactions year over year; 12M+ monthly active users across partner platforms; 65% preference for a unified wallet (survey-based).</li>',
        '</ul>',
        '<h2>Platform Capabilities</h2>',
        '<ul>',
        '<li><strong>Unified account management</strong> — centralized balance and transaction management with top-ups from every bank.</li>',
        '<li><strong>One-click payment</strong> — instant transactions without re-entering card details.</li>',
        '<li><strong>Service connections</strong> — integration with Snapp; Tapsi; Digikala; exchanges; stores; mobile operators.</li>',
        '<li><strong>Multi-layer security</strong> — banking-grade encryption; two-factor authentication; fraud monitoring.</li>',
        '<li><strong>Smart analytics</strong> — precise spending reports and automatic transaction categorization.</li>',
        '<li><strong>Excellent UX</strong> — a simple, fast interface across every device.</li>',
        '</ul>',
        '<h2>Revenue Model: Four Independent Streams</h2>',
        '<ul>',
        '<li><strong>Transaction commission — 55%:</strong> 0.5–2% of every purchase/payment transaction (Digikala purchases; Snapp payments; mobile top-ups). Detail: goods & services 1.5–2% (40% of volume); transport 1–1.5% (30%); top-ups & bills 0.5–1% (20%); digital services the remaining 10% of volume.</li>',
        '<li><strong>Store partnerships — 25%:</strong> B2B contracts and sales commissions — monthly subscriptions from 50M toman; 1–3% sales commission; ad campaigns 10–50M toman; data/analytics reports 2–10M toman. Deck example: a 100-branch retail chain pays 20M toman/month subscription + 2% sales commission = 50–100M toman monthly revenue.</li>',
        '<li><strong>Financial services — 15%:</strong> float income and currency/gold conversion and short-term credit and transaction insurance. With an average 100B toman balance on the platform; 3B toman annual income (3%) from bank deposits.</li>',
        '<li><strong>Premium services — 5%:</strong> personal VIP account 20K toman/month (50% lower commission; instant withdrawals; 24/7 support); Business account 100–500K toman/month (multi-account management; dedicated API; automated invoicing); Enterprise API 5–20M toman/month.</li>',
        '</ul>',
        '<p><strong>Monthly revenue with 1M users: 18B toman</strong> — transaction commission 9.9B + store partnerships 4.5B + financial services 2.7B + premium 0.9B.</p>',
        '<p><strong>Key metrics:</strong> average transaction value 250K toman; average commission per transaction 1,500 toman; 12 transactions per user per month; monthly revenue per user 18K toman; customer-acquisition cost (CAC) 150K toman; payback 8.3 months.</p>',
        '<p><strong>Why it is sustainable:</strong> four independent revenue streams (lower dependency risk) + recurring, predictable income + a net profit margin above 65%.</p>',
        '<h2>B2B Partnerships and the Developer API</h2>',
        '<p>Why should established apps like Snapp; Tapsi and Digikala use KLIKA\'s services?</p>',
        '<ul>',
        '<li><strong>User satisfaction +35%</strong> — unified services and a better experience.</li>',
        '<li><strong>Support costs −40%</strong> — a sharp drop in support calls and tickets.</li>',
        '<li><strong>Support-team load −50%</strong> — fewer technical issues and repetitive questions.</li>',
        '<li><strong>App usefulness +60%</strong> — turning an app into a full super-app.</li>',
        '<li><strong>Developer API up to 90% faster</strong> — integration in under a week instead of months (payments; top-ups & bills; reporting; encryption; authentication; monitoring; a behavioral-analytics dashboard with forecasting).</li>',
        '<li><strong>Partner revenue +45%</strong> — users use the app more = more revenue.</li>',
        '</ul>',
        '<p>Deck conclusion: partner apps — with +35% satisfaction and −40% support costs — reach positive ROI in the first month of cooperation.</p>',
        '<h2>Competitive Position</h2>',
        '<p><strong>KLIKA vs Blubank:</strong> Blubank offers limited banking services — payments-only focus; no integration with everyday services; a traditional digital-banking approach. KLIKA offers 20+ integrated service categories (banking + shopping + transport + travel) — 20× more capabilities; a powerful developer API; a next-generation super-app; and an international version: launching in Persian-Gulf countries in year one — a financial bridge between Iran and the world.</p>',
        '<p><strong>KLIKA vs App:</strong> App is capped at payments and money transfer — years without notable innovation; an outdated, complicated UI; weak phone-call-only support. KLIKA is an innovative next-gen super-app — a modern interface; smart 24/7 support (chat; voice; video); payments + banking + shopping + transport + travel in one place; connections to every major national platform; a complete developer ecosystem (SDK & API). User journey: ~10 minutes in App with switching between several apps; ~1 minute in KLIKA — everything in one place.</p>',
        '<p><strong>Migration potential:</strong> a projected 30–50% of App users moving in year one; a 10× value proposition at a 70% lower acquisition cost; super-apps command 3–5× the valuation of single-purpose apps; 100+ integrated features from day one; 80% of budget on marketing; 2–3× user lifetime value (LTV).</p>',
        '<h2>Next-Gen Neobanks and the Digital Movement</h2>',
        '<p>KLIKA has three layers: a <strong>next-generation neobank</strong> (complete digital banking + advanced financial services + everyday-life integration — beyond Blubank and Digipay); a <strong>true middleware</strong> (connections to every service and platform without leaving the KLIKA environment); a <strong>smart super-app</strong> (AI + personalized suggestions + a unified experience). With 80% of the budget allocated to marketing, KLIKA is not just an app but a digital movement that will set a new standard for neobanks and middleware super-apps in the region — the primary ad target is Generations Z & Y; market leadership within two years. The innovations are legally protected too: patents (novel algorithms and technologies); trademarks (brand and visual identity); NDA contracts with partners; software rights (source code and system architecture).</p>',
        '<h2>The 1-Million-User Year-One Guarantee</h2>',
        '<p>Access to 15M+ potential users through 11 B2B customer categories:</p>',
        '<ul>',
        '<li><strong>Transport (high priority):</strong> Snapp 8M; Tapsi 6M; Maxim 2M users.</li>',
        '<li><strong>Online retail:</strong> Digikala 15M; Digipay 5M; Azki 3M.</li>',
        '<li><strong>Chain stores:</strong> Ofogh Koorosh 3M; Shahrvand 2M; Daily Market 1.5M; Refah 1.8M.</li>',
        '<li><strong>Mobile operators:</strong> MCI 55M; Irancell 48M; Rightel 12M subscribers.</li>',
        '<li><strong>Other categories:</strong> travel & ticketing (Alibaba 12M; SnappTrip 4M); cafés & restaurants; professional services; offline retail (10M local stores); banking & finance; social networks; government & public sector.</li>',
        '</ul>',
        '<p>125K+ potential customers in active pursuit; 144M annual transactions with 1M users. <strong>Network effect: one customer; every customer.</strong> Landing one big customer (say Snapp or Digikala) forces the competitors and complements to join too, just to stay competitive: land one big platform → rivals need KLIKA → exponential network growth.</p>',
        '<h2>The Bank-Partner Advantage</h2>',
        '<ul>',
        '<li><strong>Payment-gateway transactions +50% to +200%</strong> in the first two years — with full service integration, every transport/shopping/travel/services payment runs through the partner bank\'s gateway.</li>',
        '<li><strong>Banking transactions +10% to +100%</strong> — new users; more daily transactions; a dynamic financial ecosystem.</li>',
        '</ul>',
        '<p>The goal: turning the partner bank into the digital-payments market leader — with access to the country\'s largest online-transaction ecosystem.</p>',
        '<h2>For Investors</h2>',
        '<p>Requested funding: <strong>$4M</strong>; official presentation February 2026. Projection: given the revenue diversity (commissions; advertising; subscriptions; API) and the large user base, KLIKA\'s revenue surpasses Blubank\'s within the first three years — a multi-layer business model; fast cash flow; a higher valuation. This text is the deck itself, written out in full; <a href="https://mehrdad.ir/s/kilika.html">the original KLIKA pitch-deck page</a> is live on the site\'s main domain.</p>',
      ].join(''),
    },
  },
};

/** profile for a slug, or null when the project has none */
export function getProjectProfile(slug: string): ProjectProfile | null {
  return PROJECT_PROFILES[slug] ?? null;
}
