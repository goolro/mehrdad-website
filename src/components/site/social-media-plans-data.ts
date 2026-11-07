/**
 * Bilingual content for the social-media plans section (owner request
 * 2026-11-07: «دو صفحه باید جدا بسازی با صفحات داخلی جداگانه برای هر زبان
 * برای هر قسمت توضیحات هم صفحات جدا باید باشه») — one source of truth that
 * feeds BOTH language trees:
 *
 *   EN main     /social-media            FA main     /fa/social-media
 *   EN details  /social-media/[plan]     FA details  /fa/social-media/[plan]
 *
 * The FA strings are the owner-approved tariff panel, copied 1:1 from
 * download/پیش‌نمایش-پنل-تعرفه.html; EN is the faithful twin so the site
 * stays symmetrically bilingual (hreflang pairs, sitemap alternates).
 * Plain data module (no JSX) — importable from server components.
 */

export type Lang = 'en' | 'fa';

export const SOCIAL_PLANS = ['auto', 'companion', 'business'] as const;
export type SocialPlanId = (typeof SOCIAL_PLANS)[number];

/** detail-page slugs, identical across both language trees for clean hreflang pairs */
export const PLAN_SLUGS: Record<SocialPlanId, string> = {
  auto: 'auto',
  companion: 'companion',
  business: 'business',
};

export const isSocialPlanId = (v: string): v is SocialPlanId =>
  (SOCIAL_PLANS as readonly string[]).includes(v);

export type PlanCopy = {
  id: SocialPlanId;
  name: string;
  tag: string;
  price: string;
  hot: boolean;
  cta: string;
  detailsCta: string;
  waMsg: string;
  features: readonly string[];
  /** «توضیحات بیشتر» — promoted to standalone detail pages (owner request) */
  detail: {
    h1: string;
    intro: string;
    sections: readonly { h: string; p: string }[];
    terms: string;
  };
};

const TERMS_FA = 'بدون قفل قرارداد — هر زمان می‌توانی لغو یا ارتقا بدهی.';

export const PLANS: Record<Lang, Record<SocialPlanId, PlanCopy>> = {
  fa: {
    auto: {
      id: 'auto',
      name: 'اتومات',
      tag: 'پیجت کاملاً خودکار اداره می‌شود؛ بدون نیاز به وقت و پیگیری تو',
      price: '$59',
      hot: false,
      cta: 'خرید پلن اتومات',
      detailsCta: 'توضیحات بیشتر',
      waMsg: 'سلام! می‌خوام پلن اتومات (۵۹ دلار در ماه) رو فعال کنم.',
      features: [
        '۱۲ پست اختصاصی در ماه (گرافیک + کپشن + هشتگ)',
        '۸ استوری در ماه',
        'انتشار زمان‌بندی‌شده و منظم',
        'پاسخ خودکار دایرکت با هوش مصنوعی',
        'گزارش عملکرد ماهانه',
      ],
      detail: {
        h1: 'پلن اتومات — مدیریت کاملاً خودکار پیج',
        intro: 'پیجت کاملاً خودکار اداره می‌شود؛ بدون نیاز به وقت و پیگیری تو.',
        sections: [
          { h: 'چطور شروع می‌شود؟', p: 'بعد از ثبت سفارش، یک فرم کوتاه دربارهٔ برندت پر می‌کنی. تا ۷۲ ساعت اولین بچ محتوا را برای تأیید می‌بینی؛ از آن به بعد همه‌چیز خودکار پیش می‌رود.' },
          { h: 'چه چیزی تحویل می‌گیری؟', p: 'محتوای یکتا برای برند خودت (کپی رد نمی‌شود)، تقویم انتشار شفاف، پاسخ‌گویی دایرکت شبانه‌روزی و گزارش ماهانهٔ رشد.' },
          { h: 'مناسب چه کسی؟', p: 'کسب‌وکارهایی که وقت ادارهٔ پیج را ندارند و می‌خواهند پیج‌شان همیشه فعال و مرتب باشد.' },
        ],
        terms: TERMS_FA,
      },
    },
    companion: {
      id: 'companion',
      name: 'همراه',
      tag: 'همهٔ مزایای اتومات + چشم انسانی روی هر محتوا و هر پیام',
      price: '$75',
      hot: true,
      cta: 'خرید پلن همراه',
      detailsCta: 'توضیحات بیشتر',
      waMsg: 'سلام! می‌خوام پلن همراه (۷۵ دلار در ماه) رو فعال کنم.',
      features: [
        'همهٔ امکانات پلن اتومات',
        'بازبینی انسانی هر پست و استوری قبل از انتشار',
        'پاسخ دایرکت با AI + تأیید انسانی پیام‌های مهم',
        'اولویت پشتیبانی و پاسخ‌گویی سریع',
        '۱۵ دقیقه مشاورهٔ ماهانه',
      ],
      detail: {
        h1: 'پلن همراه — اتوماسیون با چشم انسانی',
        intro: 'همهٔ مزایای اتومات + چشم انسانی روی هر محتوا و هر پیام.',
        sections: [
          { h: 'فرقش با اتومات چیست؟', p: 'در پلن اتومات سیستم همه‌چیز را خودش انجام می‌دهد؛ در پلن همراه، یک انسان قبل از انتشار هر محتوا کیفیتش را چک می‌کند و پیام‌های مهم دایرکت (سفارش، شکایت، همکاری) دست انسان تأیید می‌شود.' },
          { h: 'چه چیزی تحویل می‌گیری؟', p: 'خیال راحت: هیچ محتوای ضعیفی منتشر نمی‌شود و هیچ پیام مشتری بی‌جواب نمی‌ماند. جلسهٔ ماهانه هم برای هم‌راستایی محتوا با اهداف فروش توست.' },
          { h: 'مناسب چه کسی؟', p: 'برندهایی که اعتبار برند برایشان حیاتی است و می‌خواهند کیفیت خروجی همیشه یکدست بماند.' },
        ],
        terms: TERMS_FA,
      },
    },
    business: {
      id: 'business',
      name: 'بیزینس',
      tag: 'برای برندهایی که جدی رشد می‌کنند — ویدیو، استراتژی و گزارش هفتگی',
      price: '$245',
      hot: false,
      cta: 'خرید پلن بیزینس',
      detailsCta: 'توضیحات بیشتر',
      waMsg: 'سلام! می‌خوام پلن بیزینس (۲۴۵ دلار در ماه) رو فعال کنم.',
      features: [
        'همهٔ امکانات پلن همراه',
        '۴ ریلز اختصاصی در ماه (سناریو + تولید با AI)',
        'جلسهٔ استراتژی ماهانهٔ اختصاصی',
        'گزارش هفتگی + تحلیل رقبا',
        'پیشنهاد کمپین ماهانه',
      ],
      detail: {
        h1: 'پلن بیزینس — رشد جدی با ویدیو و استراتژی',
        intro: 'برای برندهایی که جدی رشد می‌کنند — ویدیو، استراتژی و گزارش هفتگی.',
        sections: [
          { h: 'چه چیزی اضافه می‌گیری؟', p: 'ریلز موتور رشد اینستاگرام است — هر ماه ۴ ریلز با سناریوی نوشته‌شده و تولید هوش مصنوعی می‌گیری. جلسهٔ ماهانه هم مسیر ماه بعد را بر اساس داده‌های واقعی پیجت تعیین می‌کند.' },
          { h: 'چه چیزی تحویل می‌گیری؟', p: 'گزارش هفتگی کوتاه و قابل‌فهم + تحلیل رقبای مستقیم + برنامهٔ محتوایی ماه بعد، آماده و هم‌راستا با فروش.' },
          { h: 'مناسب چه کسی؟', p: 'برندهای در حال رشد که اینستاگرام برایشان کانال فروش اصلی است.' },
        ],
        terms: TERMS_FA,
      },
    },
  },
  en: {
    auto: {
      id: 'auto',
      name: 'Auto',
      tag: 'Your page runs fully on autopilot — none of your time required',
      price: '$59',
      hot: false,
      cta: 'Buy the Auto plan',
      detailsCta: 'Learn more',
      waMsg: 'Hi! I want to activate the Auto plan ($59/mo).',
      features: [
        '12 custom posts per month (graphics + caption + hashtags)',
        '8 stories per month',
        'Scheduled, consistent publishing',
        'AI-powered DM auto-replies',
        'Monthly performance report',
      ],
      detail: {
        h1: 'Auto Plan — fully automated page management',
        intro: 'Your page runs fully on autopilot — none of your time required.',
        sections: [
          { h: 'How does it start?', p: 'After you order, you fill out a short form about your brand. Within 72 hours you see the first batch of content for approval; from then on, everything runs automatically.' },
          { h: 'What do you get?', p: 'Content unique to your brand (never copied), a transparent publishing calendar, 24/7 DM handling, and a monthly growth report.' },
          { h: 'Who is it for?', p: 'Businesses that have no time to run a page and want it active and tidy at all times.' },
        ],
        terms: 'No contract lock-in — upgrade or cancel anytime.',
      },
    },
    companion: {
      id: 'companion',
      name: 'Companion',
      tag: 'Everything in Auto + a human eye on every post and every message',
      price: '$75',
      hot: true,
      cta: 'Buy the Companion plan',
      detailsCta: 'Learn more',
      waMsg: 'Hi! I want to activate the Companion plan ($75/mo).',
      features: [
        'Everything in the Auto plan',
        'Human review of every post and story before it goes live',
        'AI DM replies + human approval for important messages',
        'Priority support and faster response times',
        '15-minute monthly consultation',
      ],
      detail: {
        h1: 'Companion Plan — automation with a human eye',
        intro: 'Everything in Auto + a human eye on every post and every message.',
        sections: [
          { h: 'How is it different from Auto?', p: 'In Auto, the system does everything itself; in Companion, a human checks the quality of every piece of content before it is published, and important DMs (orders, complaints, partnerships) are approved by a human.' },
          { h: 'What do you get?', p: 'Peace of mind: no weak content goes live and no customer message is left unanswered. The monthly session also aligns the content with your sales goals.' },
          { h: 'Who is it for?', p: 'Brands whose reputation is critical and that want their output quality to stay consistently uniform.' },
        ],
        terms: 'No contract lock-in — upgrade or cancel anytime.',
      },
    },
    business: {
      id: 'business',
      name: 'Business',
      tag: 'For brands growing seriously — video, strategy, and weekly reporting',
      price: '$245',
      hot: false,
      cta: 'Buy the Business plan',
      detailsCta: 'Learn more',
      waMsg: 'Hi! I want to activate the Business plan ($245/mo).',
      features: [
        'Everything in the Companion plan',
        '4 custom reels per month (script + AI production)',
        'Dedicated monthly strategy session',
        'Weekly report + competitor analysis',
        'Monthly campaign proposal',
      ],
      detail: {
        h1: 'Business Plan — serious growth with video and strategy',
        intro: 'For brands growing seriously — video, strategy, and weekly reporting.',
        sections: [
          { h: 'What do you get on top?', p: 'Reels are Instagram’s growth engine — every month you get 4 reels with written scripts and AI production. The monthly session sets the next month’s direction based on your page’s real data.' },
          { h: 'What do you get?', p: 'A short, understandable weekly report + direct competitor analysis + next month’s content plan, ready and aligned with sales.' },
          { h: 'Who is it for?', p: 'Growing brands for which Instagram is the main sales channel.' },
        ],
        terms: 'No contract lock-in — cancel anytime.',
      },
    },
  },
} as const;

/** localized section chrome (main panel + detail pages) */
export const SECTION_UI: Record<
  Lang,
  {
    titleLead: string;
    titleAccent: string;
    sub: string;
    perMonth: string;
    perAccount: string;
    networkTitle: string;
    networkTag: string;
    networkFeatures: readonly string[];
    networkCta: string;
    networkWaMsg: string;
    networkTiers: readonly { price: string; label: string }[];
    perAccountMonth: string;
    account1Title: string;
    account1Tag: string;
    account2Title: string;
    account2Tag: string;
    trust: readonly string[];
    note: string;
    backToPlans: string;
    otherPlans: string;
    buyNow: string;
    breadcrumbHome: string;
    breadcrumbPlans: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  fa: {
    titleLead: 'مدیریت سوشال‌مدیا با ',
    titleAccent: 'هوش مصنوعی',
    sub: 'پیج تو را سیستم راه می‌اندازد: محتوای اختصاصی، انتشار منظم و پاسخ دایرکت — هر روز، بدون وقفه. تو فقط سفارش می‌گیری.',
    perMonth: '/ ماه',
    perAccount: '/ هر اکانت',
    networkTitle: 'شبکه — مدیریت انبوه اکانت‌ها',
    networkTag:
      'برای آژانس‌ها، شبکه‌های فروش و برندهای چندشعبه‌ای. هر اکانت روی دستگاه و آی‌پی جداگانه اجرا می‌شود؛ محتوای هر اکانت یکتاست و هیچ اکانتی به دیگری وصل نیست.',
    networkFeatures: ['محتوای اختصاصی و یکتا برای هر اکانت', 'جداسازی کامل امنیتی هر اکانت', 'یک گزارش جمع‌بندی برای همهٔ اکانت‌ها'],
    networkCta: 'دریافت مشاورهٔ پلن شبکه',
    networkWaMsg: 'سلام! برای پلن شبکه (مدیریت انبوه اکانت‌ها) مشاوره می‌خوام.',
    networkTiers: [
      { price: '$35', label: '۲۰ تا ۴۹ اکانت' },
      { price: '$32', label: '۵۰ تا ۹۹ اکانت' },
      { price: '$30', label: '۱۰۰ تا ۲۴۹ اکانت' },
      { price: '$28', label: '۵۰۰ به بالا' },
    ],
    perAccountMonth: 'هر اکانت / ماه',
    account1Title: 'ساخت اکانت — حالت اول',
    account1Tag: 'با ایمیل و شمارهٔ خودت؛ پیج از روز اول مال خودت است',
    account2Title: 'ساخت اکانت — حالت دوم',
    account2Tag: 'شماره و جیمیل امن اختصاصی + ۷ روز گرم‌سازی روی دستگاه واقعی برای شروع مطمئن',
    trust: ['بدون قفل قرارداد — لغو هر زمان', 'گزارش شفاف، هر ماه در دسترس تو', 'راه‌اندازی اولین محتوا حداکثر ۷۲ ساعت', 'تسویهٔ تومانی با نرخ روز'],
    note: 'قیمت‌ها ماهانه و به دلار است؛ معادل تومانی در زمان عقد قرارداد با نرخ روز محاسبه می‌شود.',
    backToPlans: 'بازگشت به تعرفه‌ها',
    otherPlans: 'پلن‌های دیگر',
    buyNow: 'خرید پلن',
    breadcrumbHome: 'خانه',
    breadcrumbPlans: 'تعرفه سوشال‌مدیا',
    metaTitle: 'تعرفه مدیریت سوشال‌مدیا — پلن‌های ماهانه از ۵۹ دلار | مهرداد',
    metaDescription:
      'پیج تو را سیستم راه می‌اندازد: محتوای اختصاصی، انتشار منظم و پاسخ دایرکت — هر روز، بدون وقفه. پلن اتومات ۵۹ دلار · همراه ۷۵ دلار · بیزینس ۲۴۵ دلار در ماه · پلن شبکه برای مدیریت انبوه اکانت‌ها. بدون قفل قرارداد، تسویهٔ تومانی.',
  },
  en: {
    titleLead: 'AI-Powered ',
    titleAccent: 'Social Media Management',
    sub: 'A system runs your page: custom content, consistent posting, and DM replies — every day, without a break. You just take the orders.',
    perMonth: '/ mo',
    perAccount: '/ per account',
    networkTitle: 'Network — bulk account management',
    networkTag:
      'For agencies, sales networks, and multi-branch brands. Every account runs on its own device and IP; each account’s content is unique and no account is linked to another.',
    networkFeatures: ['Unique, custom content for every account', 'Full security isolation per account', 'One summary report for all accounts'],
    networkCta: 'Get a Network plan consultation',
    networkWaMsg: 'Hi! I’d like a consultation for the Network plan (bulk account management).',
    networkTiers: [
      { price: '$35', label: '20–49 accounts' },
      { price: '$32', label: '50–99 accounts' },
      { price: '$30', label: '100–249 accounts' },
      { price: '$28', label: '500+' },
    ],
    perAccountMonth: 'per account / mo',
    account1Title: 'Account setup — mode 1',
    account1Tag: 'With your own email and number; the page is yours from day one',
    account2Title: 'Account setup — mode 2',
    account2Tag: 'A secure dedicated number + Gmail + 7 days of warm-up on a real device for a safe start',
    trust: ['No contract lock-in — cancel anytime', 'Transparent reports, available to you every month', 'First content live within 72 hours', 'Settled in tomans at the daily rate'],
    note: 'Prices are monthly in USD; the toman equivalent is calculated at the daily rate when the contract is signed.',
    backToPlans: 'Back to all plans',
    otherPlans: 'Other plans',
    buyNow: 'Buy this plan',
    breadcrumbHome: 'Home',
    breadcrumbPlans: 'Social media plans',
    metaTitle: 'Social Media Management Plans — from $59/mo | Mehrdad',
    metaDescription:
      'A system runs your page: custom content, consistent posting, and DM replies — every day, without a break. Auto $59 · Companion $75 · Business $245 per month · Network for bulk account management. No contract lock-in.',
  },
} as const;

export const NETWORK_PRICE = { price: '', currency: 'USD' } as const;

/**
 * ui-ux-pro-max additions (pricing-page-cta pattern: hero → cards →
 * comparison table → FAQ → final CTA). Every string below is composed from
 * the owner-approved facts already on this page (features, trust strip,
 * network tag, terms, note) — no new claims.
 */

/** true = checkmark, false = dash, string = short label */
export type CompareCell = true | false | string;

export const COMPARE_UI: Record<Lang, { title: string; featuresCol: string }> = {
  fa: { title: 'مقایسهٔ سریع پلن‌ها', featuresCol: 'امکانات' },
  en: { title: 'Quick plan comparison', featuresCol: 'Features' },
};

export const COMPARE_ROWS: Record<
  Lang,
  readonly { label: string; cells: readonly [CompareCell, CompareCell, CompareCell] }[]
> = {
  fa: [
    { label: '۱۲ پست اختصاصی در ماه', cells: [true, true, true] },
    { label: '۸ استوری در ماه', cells: [true, true, true] },
    { label: 'پاسخ دایرکت با هوش مصنوعی', cells: [true, true, true] },
    { label: 'بازبینی انسانی هر محتوا قبل از انتشار', cells: [false, true, true] },
    { label: 'تأیید انسانی پیام‌های مهم دایرکت', cells: [false, true, true] },
    { label: 'اولویت پشتیبانی', cells: [false, true, true] },
    { label: '۴ ریلز اختصاصی در ماه', cells: [false, false, true] },
    { label: 'پیشنهاد کمپین ماهانه', cells: [false, false, true] },
    { label: 'گزارش عملکرد', cells: ['ماهانه', 'ماهانه', 'هفتگی + تحلیل رقبا'] },
    { label: 'مشاورهٔ ماهانه', cells: [false, '۱۵ دقیقه', 'جلسهٔ استراتژی اختصاصی'] },
  ],
  en: [
    { label: '12 custom posts per month', cells: [true, true, true] },
    { label: '8 stories per month', cells: [true, true, true] },
    { label: 'AI-powered DM replies', cells: [true, true, true] },
    { label: 'Human review before publishing', cells: [false, true, true] },
    { label: 'Human approval for important DMs', cells: [false, true, true] },
    { label: 'Priority support', cells: [false, true, true] },
    { label: '4 custom reels per month', cells: [false, false, true] },
    { label: 'Monthly campaign proposal', cells: [false, false, true] },
    { label: 'Performance reports', cells: ['Monthly', 'Monthly', 'Weekly + competitor analysis'] },
    { label: 'Monthly consultation', cells: [false, '15 minutes', 'Dedicated strategy session'] },
  ],
};

export const FAQ: Record<Lang, readonly { q: string; a: string }[]> = {
  fa: [
    { q: 'اولین محتوا کی آماده می‌شود؟', a: 'راه‌اندازی اولین محتوا حداکثر ۷۲ ساعت بعد از ثبت سفارش انجام می‌شود.' },
    { q: 'قرارداد یا قفل زمانی وجود دارد؟', a: 'بدون قفل قرارداد — هر زمان می‌توانی لغو یا ارتقا بدهی.' },
    { q: 'تسویه چگونه است؟', a: 'قیمت‌ها ماهانه و به دلار است؛ معادل تومانی در زمان عقد قرارداد با نرخ روز محاسبه می‌شود.' },
    { q: 'از روند کار گزارش می‌گیری؟', a: 'گزارش عملکرد ماهانه شفاف ارائه می‌شود و در دسترس توست؛ در پلن بیزینس گزارش هفتگی + تحلیل رقبا هم اضافه می‌شود.' },
    { q: 'پلن شبکه مخصوص چه کسی است؟', a: 'برای آژانس‌ها، شبکه‌های فروش و برندهای چندشعبه‌ای. هر اکانت روی دستگاه و آی‌پی جداگانه اجرا می‌شود و محتوای هر اکانت یکتاست.' },
  ],
  en: [
    { q: 'When is the first content ready?', a: 'The first content goes live within 72 hours of ordering.' },
    { q: 'Is there a contract or lock-in?', a: 'No contract lock-in — upgrade or cancel anytime.' },
    { q: 'How does payment work?', a: 'Prices are monthly in USD; the toman equivalent is calculated at the daily rate when the contract is signed.' },
    { q: 'Do I get reports?', a: 'A transparent monthly performance report is always available to you; the Business plan adds a weekly report + competitor analysis.' },
    { q: 'Who is the Network plan for?', a: 'For agencies, sales networks, and multi-branch brands. Every account runs on its own device and IP, and each account’s content is unique.' },
  ],
};

export const FINAL_CTA: Record<Lang, { h: string; p: string; btn: string; waMsg: string }> = {
  fa: {
    h: 'هنوز سؤالی داری؟',
    p: 'سؤالت را مستقیم در واتساپ بپرس.',
    btn: 'پرسیدن سؤال در واتساپ',
    waMsg: 'سلام! دربارهٔ پلن‌های مدیریت سوشال‌مدیا سؤال دارم.',
  },
  en: {
    h: 'Still have a question?',
    p: 'Ask directly on WhatsApp.',
    btn: 'Ask on WhatsApp',
    waMsg: 'Hi! I have a question about the social media management plans.',
  },
};
