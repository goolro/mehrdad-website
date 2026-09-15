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
export type ProfileFeatureIcon = 'brain' | 'swords' | 'trophy' | 'repeat' | 'scan';

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

export interface ProjectProfile {
  features: ProfileFeature[];
  tech: ProfileTechItem[];
  phases: ProfilePhase[];
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
};

/** profile for a slug, or null when the project has none */
export function getProjectProfile(slug: string): ProjectProfile | null {
  return PROJECT_PROFILES[slug] ?? null;
}
