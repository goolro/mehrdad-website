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

export interface ProjectProfile {
  features: ProfileFeature[];
  tech: ProfileTechItem[];
  phases: ProfilePhase[];
  /** optional gallery of official store artwork / screenshots (Cafe Bazaar etc.) */
  media?: ProfileShot[];
  /** optional link to the owner's own published research/pitch post for this idea */
  relatedPost?: RelatedPost;
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
