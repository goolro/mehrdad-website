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
        '<p><strong>3. Influencer and professional-network distribution.</strong><br/>The plan is to seed the free tier with health/fitness content creators, trainers, and (longer-term) clinicians who can genuinely vouch for the product\'s output — not a paid blast to unrelated audiences. The first creators and professionals for this seeding phase are being actively identified.</p>',
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
        '<p><strong>۳. توزیع از طریق اینفلوئنسرها و شبکهٔ متخصصان.</strong><br/>برنامه این است که نسخهٔ رایگان با تولیدکننده‌های محتوای سلامت/فیتنس و مربیان و (در بلندمدت) متخصصان بالینی بذرگذاری شود — کسانی که واقعاً از خروجی محصول پشتیبانی کنند؛ نه یک کمپین پولی به مخاطب بی‌ربط. نخستین خالق‌ها و متخصصان این مرحله در حال شناسایی فعال هستند.</p>',
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
};

/** profile for a slug, or null when the project has none */
export function getProjectProfile(slug: string): ProjectProfile | null {
  return PROJECT_PROFILES[slug] ?? null;
}
