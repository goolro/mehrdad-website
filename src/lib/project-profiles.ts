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

export interface ProjectProfile {
  features: ProfileFeature[];
  tech: ProfileTechItem[];
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
  },
};

/** profile for a slug, or null when the project has none */
export function getProjectProfile(slug: string): ProjectProfile | null {
  return PROJECT_PROFILES[slug] ?? null;
}
