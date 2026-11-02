/**
 * Seed the 19 Vivora investor-deck blog posts (owner order 2026-10-17:
 * «تک تک صفحات را بزاریم بصورت pdf هم برای هر کدام از صفحات توضیح بدهیم» —
 * one blog post per slide, each carrying the slide's own PDF + an original
 * bilingual explanation written for search engines).
 *
 * IDEMPOTENT: upserts by slug. On re-run it refreshes titles/excerpts/
 * content and category links but never touches `date`, `published`, or
 * `featured` — re-seeding against any environment cannot clobber
 * owner-managed state (same contract as seed-investor-posts.ts).
 *
 * Assets: public/media/vivora-deck/vivora-deck-slide-XX.{pdf,png}
 * (LibreOffice PPTX→PDF, per-page split, Ghostscript-optimised, PNG covers
 * at 110 dpi). The script FAILS LOUD if any asset is missing before it
 * touches the database.
 *
 * Facts policy (OWNER_RULES law #9 / D-029): every statement and figure in
 * the copy below traces to the text of ITS OWN slide (extracted from
 * upload/Vivora-investor-deck (1).pptx). Nothing is invented; each slide's
 * own caveat is quoted as a blockquote. Persian copy contains no «،»
 * (standing editorial rule).
 *
 *   bun run scripts/seed-vivora-deck-posts.ts          # local SQLite
 *   bun run scripts/seed-vivora-deck-posts-supabase.ts # production Supabase
 */
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';

export type SlideSeed = {
  n: number;
  slugSuffix: string;
  titleEn: string;
  titleFa: string;
  excerptEn: string;
  excerptFa: string;
  leadEn: string;
  leadFa: string;
  bulletsEn: string[];
  bulletsFa: string[];
  caveatEn?: string;
  caveatFa?: string;
};

export const DECK_EN_URL = 'https://mehrdad.ir/deck/health';
export const DECK_FA_URL = 'https://mehrdad.ir/deck/health/fa';
export const ASSET_DIR = 'public/media/vivora-deck';

const SLIDES: SlideSeed[] = [
  {
    n: 1,
    slugSuffix: 'cover',
    titleEn: 'Vivora investor deck — slide 01: One app for every part of your health',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۱: یک اپ برای همه‌ی بخش‌های سلامتی',
    excerptEn:
      'The opening slide of the Vivora investor deck: the product promise, the angel round of $200K to $300K, and the working-title badge — the series starts here.',
    excerptFa:
      'اسلاید آغازین دک سرمایه‌گذاری ویورا: وعده‌ی محصول و دور فرشته با $200K تا $300K و برچسب نام کاری — شروع سری از این‌جاست.',
    leadEn:
      'This opening slide sets the frame for the whole deck in one line: <strong>Vivora</strong> — one app for every part of your health. It also names the round this deck is written for: an <strong>angel round of $200K to $300K</strong>. The name itself carries a «working title» badge, because naming is deliberately not settled yet.',
    leadFa:
      'این اسلاید آغازین چارچوب کل دک را در یک خط می‌سازد: <strong>ویورا</strong> — یک اپ برای همه‌ی بخش‌های سلامتی. همچنین دورِ هدف دک را نام می‌برد: <strong>دور فرشته با $200K تا $300K</strong>. خود نام هم برچسب «نام کاری» دارد چون نام‌گذاری آگاهانه هنوز نهایی نشده است.',
    bulletsEn: [
      'Product promise: a single app covering every part of health.',
      'Round context: angel investors, $200K to $300K.',
      'Honesty marker: «Vivora» is a working title, not a final brand decision.',
    ],
    bulletsFa: [
      'وعده‌ی محصول: یک اپ واحد برای همه‌ی بخش‌های سلامتی.',
      'بافت دور: سرمایه‌گذار فرشته با $200K تا $300K.',
      'نشان صداقت: «ویورا» نام کاری است نه تصمیم نهایی برند.',
    ],
  },
  {
    n: 2,
    slugSuffix: 'problem',
    titleEn: 'Vivora investor deck — slide 02: Health is scattered across a dozen apps',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۲: سلامتی بین دوازده اپ پراکنده شده است',
    excerptEn:
      'The problem slide: fragmentation, generic advice and high churn — the three reasons today\u2019s health apps lose the user journey.',
    excerptFa:
      'اسلاید مسئله: پراکندگی و توصیه‌های عمومی و ریزش بالا — سه دلیلی که اپ‌های سلامتی امروز مسیر کاربر را از دست می‌دهند.',
    leadEn:
      'The deck states the problem as three numbered failures of the current health-app landscape:',
    leadFa:
      'دک مسئله را به‌شکل سه شکست شماره‌گذاری‌شده در وضعیت فعلی اپ‌های سلامتی بیان می‌کند:',
    bulletsEn: [
      '01 · Fragmented — fitness, food, sleep and care live in different apps.',
      '02 · Generic advice — one-size-fits-all plans that ignore the individual.',
      '03 · High churn — engagement fades because nothing connects the journey.',
    ],
    bulletsFa: [
      '۰۱ · پراکندگی — تناسب اندام و تغذیه و خواب و مراقبت هرکدام در اپ جدا هستند.',
      '۰۲ · توصیه‌ی عمومی — برنامه‌های یک‌سان که فرد را نادیده می‌گیرند.',
      '۰۳ · ریزش بالا — تعامل کم‌رنگ می‌شود چون هیچ‌چیز مسیر را به هم وصل نمی‌کند.',
    ],
  },
  {
    n: 3,
    slugSuffix: 'platform',
    titleEn: 'Vivora investor deck — slide 03: One platform for AI guidance, care and real specialists',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۳: یک پلتفرم برای راهنمای AI و مراقبت و متخصص واقعی',
    excerptEn:
      'The answer to the problem slide: four pillars — personal intelligence, real specialists, care and wellness, and a phase-2 marketplace.',
    excerptFa:
      'پاسخ به اسلاید مسئله: چهار ستون — هوش شخصی و متخصص واقعی و مراقبت و سلام روزانه و مارکت‌پلیس در فاز ۲.',
    leadEn:
      'Vivora\u2019s answer is a single platform built on four pillars:',
    leadFa:
      'پاسخ ویورا یک پلتفرم واحد است که روی چهار ستون بنا شده:',
    bulletsEn: [
      '01 · Personal intelligence — focused AI assistants learn each user and adapt recommendations.',
      '02 · Real specialists — a specialist panel serves the public inside the app.',
      '03 · Care and wellness — daily guidance across activity, heart, breathing and more.',
      '04 · Marketplace — curated health products arrive in phase 2.',
    ],
    bulletsFa: [
      '۰۱ · هوش شخصی — دستیارهای AI متمرکز هر کاربر را می‌آموزند و توصیه‌ها را تطبیق می‌دهند.',
      '۰۲ · متخصص واقعی — پنل متخصصان درون اپ به عموم مردم خدمت می‌دهد.',
      '۰۳ · مراقبت و سلام — راهنمای روزانه برای فعالیت و قلب و تنفس و بیشتر.',
      '۰۴ · مارکت‌پلیس — محصولات سلامتی منتخب در فاز ۲ می‌آیند.',
    ],
  },
  {
    n: 4,
    slugSuffix: 'mvp',
    titleEn: 'Vivora investor deck — slide 04: What already runs in the MVP',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۴: چه چیزهایی هم‌اکنون در MVP کار می‌کند',
    excerptEn:
      'Five live areas of the MVP today: walking analysis, heart monitoring, guided breathing, two AI assistants, and care and wellness — the most-used area in testing.',
    excerptFa:
      'پنج بخش زنده‌ی MVP امروز: تحلیل پیاده‌روی و پایش قلب و تنفس هدایت‌شده و دو دستیار AI و بخش مراقبت و سلام — پراستفاده‌ترین بخش در تست.',
    leadEn:
      'This slide lists what already runs — not a roadmap item, but working software:',
    leadFa:
      'این اسلاید چیزی را فهرست می‌کند که همین حالا کار می‌کند — نه یک قلم از نقشه‌ی راه بلکه نرم‌افزار واقعی:',
    bulletsEn: [
      'Walking analysis — steps, weekly trend and pace.',
      'Heart monitoring — live rate, HRV and zones.',
      'Guided breathing — paced sessions with stress tracking.',
      'AI assistants — two live today, up to ten planned.',
      'Care and wellness — the most-used area in testing.',
    ],
    bulletsFa: [
      'تحلیل پیاده‌روی — قدم‌ها و روند هفتگی و سرعت.',
      'پایش قلب — ضربان زنده و HRV و زون‌ها.',
      'تنفس هدایت‌شده — نشست‌های زمان‌بندی‌شده با ثبت استرس.',
      'دستیارهای AI — امروز دو عدد زنده و تا ده عدد در برنامه.',
      'مراقبت و سلام — پراستفاده‌ترین بخش در تست.',
    ],
    caveatEn:
      'Simplified screen. The real product is shown live under NDA.',
    caveatFa:
      'نمای ساده‌شده. محصول واقعی به‌صورت زنده و زیر NDA نمایش داده می‌شود.',
  },
  {
    n: 5,
    slugSuffix: 'mvp-screens',
    titleEn: 'Vivora investor deck — slide 05: Inside the MVP — four screens',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۵: داخل MVP — چهار صفحه',
    excerptEn:
      'Three shipping screens (walking, heart, breathing) plus the phase-2 wellness store — with sample data on simplified screens.',
    excerptFa:
      'سه صفحه‌ی عرضه‌شده (پیاده‌روی و قلب و تنفس) به‌علاوه‌ی فروشگاه سلام فاز ۲ — با داده‌ی نمونه روی صفحات ساده‌شده.',
    leadEn:
      'The slide shows four screens with their status labels:',
    leadFa:
      'این اسلاید چهار صفحه را با برچسب وضعیت نشان می‌دهد:',
    bulletsEn: [
      'IN MVP · Walking analysis — weekly bar chart, pace curve and a goal progress bar.',
      'IN MVP · Heart monitoring — live waveform, pulsing heart, HRV and a zone gauge.',
      'IN MVP · Guided breathing — a breathing orb that expands and contracts with stress and streak.',
      'PHASE 2 · Wellness store — product tiles picked by your assistant plus a recommended bundle.',
    ],
    bulletsFa: [
      'در MVP · تحلیل پیاده‌روی — نمودار میله‌ای هفتگی و منحنی سرعت و نوار پیشرفت هدف.',
      'در MVP · پایش قلب — موج زنده و قلب تپنده و HRV و گیج زون.',
      'در MVP · تنفس هدایت‌شده — گوی تنفس با باز و بسته‌شدن به‌همراه استرس و زنجیره‌ی روزها.',
      'فاز ۲ · فروشگاه سلام — محصولات منتخب دستیار به‌همراه بسته‌ی پیشنهادی.',
    ],
    caveatEn:
      'Simplified screens with sample data. The real product is shown live under NDA.',
    caveatFa:
      'صفحات ساده‌شده با داده‌ی نمونه. محصول واقعی به‌صورت زنده و زیر NDA نمایش داده می‌شود.',
  },
  {
    n: 6,
    slugSuffix: 'specialists',
    titleEn: 'Vivora investor deck — slide 06: Specialists — book, chat, find, navigate',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۶: متخصصان — رزرو و گفت‌وگو و یافتن و مسیریابی',
    excerptEn:
      'Four concept screens for the specialist layer: online booking, specialist chat, a health map with clinic and pharmacy pins, and ranked specialist matching.',
    excerptFa:
      'چهار صفحه‌ی مفهومی برای لایه‌ی متخصص: رزرو آنلاین و چت متخصص و نقشه‌ی سلامتی با پین کلینیک و داروخانه و رتبه‌بندی متخصصان.',
    leadEn:
      'The specialist layer is presented as four concept screens:',
    leadFa:
      'لایه‌ی متخصص در قالب چهار صفحه‌ی مفهومی ارائه می‌شود:',
    bulletsEn: [
      'CONCEPT · Online booking — a date strip, time-slot grid and one-tap confirmation.',
      'CONCEPT · Specialist chat and support — an animated conversation, shared reports and a switch to support.',
      'CONCEPT · Health map — a pulsing location, route line and clinic, lab and pharmacy pins.',
      'CONCEPT · Find specialists — ranked match rings by goal and availability.',
    ],
    bulletsFa: [
      'مفهومی · رزرو آنلاین — نوار تاریخ و شبکه‌ی ساعت‌های خالی و تأیید با یک لمس.',
      'مفهومی · چت و پشتیبانی متخصص — گفت‌وگوی زنده و گزارش‌های مشترک و سوییچ به پشتیبانی.',
      'مفهومی · نقشه‌ی سلامتی — موقعیت تپنده و خط مسیر و پین کلینیک و آزمایشگاه و داروخانه.',
      'مفهومی · یافتن متخصص — حلقه‌های تطبیق رتبه‌بندی‌شده بر اساس هدف و دسترس‌پذیری.',
    ],
    caveatEn:
      'Concept screens with sample data. Final UI and features may differ.',
    caveatFa:
      'صفحات مفهومی با داده‌ی نمونه. رابط و امکانات نهایی می‌تواند متفاوت باشد.',
  },
  {
    n: 7,
    slugSuffix: 'family',
    titleEn: 'Vivora investor deck — slide 07: One platform for every member of the family',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۷: یک پلتفرم برای همه‌ی اعضای خانواده',
    excerptEn:
      'Four concept screens for family care: seniors (blood pressure and mobility), mothers (pregnancy progress), children (growth percentiles) and smart devices.',
    excerptFa:
      'چهار صفحه‌ی مفهومی برای مراقبت خانوادگی: سالمندان (فشار خون و تحرک) و مادران (پیشرفت بارداری) و کودکان (درصد رشد) و دستگاه‌های هوشمند.',
    leadEn:
      'Family care extends the platform across four more concept screens:',
    leadFa:
      'مراقبت خانوادگی پلتفرم را با چهار صفحه‌ی مفهومی دیگر گسترش می‌دهد:',
    bulletsEn: [
      'CONCEPT · Senior care — blood-pressure trend lines, mobility gauge and medication dots.',
      'CONCEPT · Mother care — pregnancy progress ring, wellbeing curves and a trimester bar.',
      'CONCEPT · Child growth — growth percentile curves with a pulsing marker and a daily-balance donut.',
      'CONCEPT · Smart devices — watch rings, device sync list and a sleep-stage step chart.',
    ],
    bulletsFa: [
      'مفهومی · مراقبت از سالمند — خط روند فشار خون و گیج تحرک و نقطه‌های دارو.',
      'مفهومی · مراقبت از مادر — حلقه‌ی پیشرفت بارداری و منحنی‌های سلام و نوار سه‌ماهه.',
      'مفهومی · رشد کودک — منحنی‌های صدک رشد با نشانگر تپنده و دونات توازن روزانه.',
      'مفهومی · دستگاه‌های هوشمند — حلقه‌های ساعت و فهرست همگام‌سازی و نمودار مراحل خواب.',
    ],
    caveatEn:
      'Concept screens with sample data. Final UI and features may differ.',
    caveatFa:
      'صفحات مفهومی با داده‌ی نمونه. رابط و امکانات نهایی می‌تواند متفاوت باشد.',
  },
  {
    n: 8,
    slugSuffix: 'engineering',
    titleEn: 'Vivora investor deck — slide 08: Engineering proof — a platform in production',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۸: اثبات مهندسی — پلتفرمی در حال تولید',
    excerptEn:
      '149,962 lines of TypeScript. 303 API services. 147 data models. 1,139 automated tests with 0 failures. 4 languages with full RTL. 2 signed Android releases — measured 15 Oct 2026.',
    excerptFa:
      '۱۴۹٬۹۶۲ خط TypeScript. سه‌صد و سه سرویس API. صد و ۴۷ مدل داده. ۱٬۱۳۹ تست خودکار با صفر خطا. ۴ زبان با RTL کامل. ۲ نسخه‌ی امضاشده‌ی اندروید — اندازه‌گیری ۱۵ اکتبر ۲۰۲۶.',
    leadEn:
      'The engineering slide backs the product story with measured numbers from the codebase:',
    leadFa:
      'اسلاید مهندسی روایت محصول را با اعداد اندازه‌گیری‌شده از کدبیس پشتیبانی می‌کند:',
    bulletsEn: [
      '149,962 lines of TypeScript.',
      '303 API services.',
      '147 data models.',
      '1,139 automated tests, 0 failures.',
      '4 languages, full RTL.',
      '2 signed Android releases.',
    ],
    bulletsFa: [
      '۱۴۹٬۹۶۲ خط TypeScript.',
      '۳۰۳ سرویس API.',
      '۱۴۷ مدل داده.',
      '۱٬۱۳۹ تست خودکار با صفر خطا.',
      '۴ زبان با پشتیبانی کامل RTL.',
      '۲ نسخه‌ی امضاشده‌ی اندروید.',
    ],
    caveatEn:
      'Measured 15 Oct 2026. About 100 simulated test users in controlled testing; retention and paid conversion are not yet established.',
    caveatFa:
      'اندازه‌گیری‌شده در ۱۵ اکتبر ۲۰۲۶. حدود ۱۰۰ کاربر آزمایشی شبیه‌سازی‌شده در تست کنترل‌شده؛ نگه‌داشت و تبدیل پرداختی هنوز تثبیت نشده‌اند.',
  },
  {
    n: 9,
    slugSuffix: 'market',
    titleEn: 'Vivora investor deck — slide 09: A $6.8 trillion market with no unified leader',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۰۹: بازار ۶٫۸ تریلیون دلاری بدون رهبر یکپارچه',
    excerptEn:
      'The wellness economy reached $6.8T with +7.9% growth in 2024 and about 7.6% a year projected to 2029 — North America is the largest region at $2.3T.',
    excerptFa:
      'اقتصاد سلام به ۶٫۸ تریلیون دلار رسید با رشد ۷٫۹ درصدی در ۲۰۲۴ و پیش‌بینی حدود ۷٫۶ درصد در سال تا ۲۰۲۹ — آمریکای شمالی بزرگ‌ترین منطقه با $2.3T است.',
    leadEn:
      'The market slide sizes the opportunity with Global Wellness Institute figures:',
    leadFa:
      'اسلاید بازار فرصت را با ارقام Global Wellness Institute اندازه می‌گیرد:',
    bulletsEn: [
      '$6.8 trillion global wellness economy.',
      '+7.9% growth in 2024; about 7.6% a year projected to 2029.',
      '$2.3T — North America, the largest region.',
    ],
    bulletsFa: [
      '۶٫۸ تریلیون دلار اقتصاد جهانی سلام.',
      'رشد +۷٫۹ درصدی در ۲۰۲۴ و پیش‌بینی حدود ۷٫۶ درصد در سال تا ۲۰۲۹.',
      '$2.3T — آمریکای شمالی به‌عنوان بزرگ‌ترین منطقه.',
    ],
    caveatEn:
      'Source: Global Wellness Institute, Global Wellness Economy Monitor 2025.',
    caveatFa:
      'منبع: Global Wellness Institute و Global Wellness Economy Monitor 2025.',
  },
  {
    n: 10,
    slugSuffix: 'competitors',
    titleEn: 'Vivora investor deck — slide 10: Strong players, each solving one slice',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۰: بازیگران قوی که هرکدام یک برش را حل می‌کنند',
    excerptEn:
      'A competitor table: MyFitnessPal, Noom, Headspace, Fitbit and Flo each own one slice — Vivora\u2019s bet is AI assistants plus specialists plus marketplace in one platform.',
    excerptFa:
      'جدول رقبا: MyFitnessPal و Noom و Headspace و Fitbit و Flo هرکدام یک برش را دارند — شرط‌بندی ویورا دستیار AI به‌علاوه‌ی متخصص به‌علاوه‌ی مارکت‌پلیس در یک پلتفرم است.',
    leadEn:
      'The competitive slide pairs each strong player with its gap:',
    leadFa:
      'اسلاید رقابت هر بازیگر قوی را با شکافش کنار هم می‌گذارد:',
    bulletsEn: [
      'MyFitnessPal — nutrition and calorie tracking; gap: mostly self-service logging.',
      'Noom — behavior-focused programs; gap: narrow goal, program based.',
      'Headspace — meditation and sleep content; gap: one dimension, no expert layer.',
      'Fitbit — activity tracking and insights; gap: hardware dependent.',
      'Flo Health — personalized tracking for one audience; gap: focused on one segment.',
      'Vivora — AI assistants + specialists + marketplace; one platform for the whole journey.',
    ],
    bulletsFa: [
      'MyFitnessPal — تغذیه و کالری‌شماری؛ شکاف: ثبت عمدتاً خودخدمتی.',
      'Noom — برنامه‌های رفتارمحور؛ شکاف: هدف باریک و برنامه‌بنیاد.',
      'Headspace — محتوای مراقبه و خواب؛ شکاف: یک بُعد و بدون لایه‌ی متخصص.',
      'Fitbit — ردیابی فعالیت و بینش؛ شکاف: وابسته به سخت‌افزار.',
      'Flo Health — ردیابی شخصی‌سازی‌شده برای یک مخاطب؛ شکاف: متمرکز بر یک سگمنت.',
      'Vivora — دستیار AI + متخصص + مارکت‌پلیس؛ یک پلتفرم برای کل مسیر.',
    ],
    caveatEn:
      'Our assessment from public positioning. Verify pricing, reach and features per company before external distribution.',
    caveatFa:
      'ارزیابی ما از جایگاه عمومی. قیمت و دسترسی و امکانات هر شرکت را پیش از هر توزیع بیرونی راستی‌آزمایی کنید.',
  },
  {
    n: 11,
    slugSuffix: 'capability',
    titleEn: 'Vivora investor deck — slide 11: Capability coverage',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۱: پوشش قابلیت‌ها',
    excerptEn:
      'Six capabilities compared across six products: AI personalization, live specialists, whole-health scope, marketplace, device integration and multilingual + RTL.',
    excerptFa:
      'شش قابلیت در شش محصول مقایسه شده‌اند: شخصی‌سازی AI و متخصص زنده و دامنه‌ی کل سلامتی و مارکت‌پلیس و اتصال دستگاه و چندزبانه با RTL.',
    leadEn:
      'This slide turns the competitor story into a capability matrix:',
    leadFa:
      'این اسلاید روایت رقابت را به یک ماتریس قابلیت تبدیل می‌کند:',
    bulletsEn: [
      'Capabilities compared: AI personalization · live specialists · whole-health scope · marketplace · device integration · multilingual + RTL.',
      'Legend: strong (filled) · partial or planned (half) · limited (empty).',
      'The Vivora row (MVP + roadmap) is the only line marked across all six capabilities.',
    ],
    bulletsFa: [
      'قابلیت‌های مقایسه‌شده: شخصی‌سازی AI · متخصص زنده · دامنه‌ی کل سلامتی · مارکت‌پلیس · اتصال دستگاه · چندزبانه با RTL.',
      'راهنما: قوی (پر) · نسبی یا در برنامه (نیمه) · محدود (خالی).',
      'ردیف ویورا (MVP + نقشه‌ی راه) تنها سطری است که هر شش قابلیت را علامت دارد.',
    ],
    caveatEn:
      'Our assessment of category tendencies; individual products vary.',
    caveatFa:
      'ارزیابی ما از گرایش‌های دسته است؛ محصولات منفرد متفاوت‌اند.',
  },
  {
    n: 12,
    slugSuffix: 'business-model',
    titleEn: 'Vivora investor deck — slide 12: Business model',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۲: مدل کسب‌وکار',
    excerptEn:
      'Planned subscription tiers ($9/month, $19 for 3 months, $79/year) plus four additional streams: advertising, in-app packages, specialist commission and the phase-2 marketplace.',
    excerptFa:
      'سطح‌های اشتراک برنامه‌ریزی‌شده ($9 ماهانه و $19 برای ۳ ماه و $79 سالانه) به‌علاوه‌ی چهار جریان دیگر: تبلیغات و بسته‌های درون‌برنامه‌ای و کمیسیون متخصص و مارکت‌پلیس فاز ۲.',
    leadEn:
      'The business-model slide lays out the subscription core and the surrounding streams:',
    leadFa:
      'اسلاید مدل کسب‌وکار هسته‌ی اشتراک و جریان‌های پیرامونش را نشان می‌دهد:',
    bulletsEn: [
      '$9 per month · $19 for 3 months · $79 per year — planned prices, to be validated.',
      'Advertising — packages from about $1 to $1,000+, daily and monthly.',
      'In-app packages — one-time programs and services.',
      'Specialist commission — revenue share on expert sessions.',
      'Marketplace — health products from phase 2.',
    ],
    bulletsFa: [
      '$9 ماهانه · $19 برای ۳ ماه · $79 سالانه — قیمت‌های برنامه‌ریزی‌شده در انتظار اعتبارسنجی.',
      'تبلیغات — بسته‌ها از حدود $1 تا بالای $1,000 به‌صورت روزانه و ماهانه.',
      'بسته‌های درون‌برنامه‌ای — برنامه‌ها و خدمات یک‌بارمصرف.',
      'کمیسیون متخصص — تسهیم درآمد بر جلسات متخصصان.',
      'مارکت‌پلیس — محصولات سلامتی از فاز ۲.',
    ],
    caveatEn:
      'Planned subscription prices, to be validated.',
    caveatFa:
      'قیمت‌های اشتراک برنامه‌ریزی‌شده‌اند و باید اعتبارسنجی شوند.',
  },
  {
    n: 13,
    slugSuffix: 'unit-economics',
    titleEn: 'Vivora investor deck — slide 13: Unit economics — illustrative 100,000-user scenario',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۳: اقتصاد واحد — سناریوی فرضی ۱۰۰هزار کاربر',
    excerptEn:
      'Three acquisition scenarios at 5% conversion and 8% monthly churn — from $0.50 CAC with a 6x LTV/CAC to the conservative $5 case. Scenarios, not forecasts.',
    excerptFa:
      'سه سناریوی جذب با تبدیل ۵ درصدی و ریزش ماهانه ۸ درصدی — از CAC برابر $0.50 با LTV/CAC شش برابر تا حالت محافظه‌کارانه‌ی $5. سناریو است نه پیش‌بینی.',
    leadEn:
      'The unit-economics slide models a 100,000-user scenario at three acquisition costs:',
    leadFa:
      'اسلاید اقتصاد واحد سناریوی ۱۰۰هزار کاربر را در سه هزینه‌ی جذب مدل می‌کند:',
    bulletsEn: [
      'CAC $0.50 → $10 cost per paying user · 2-month payback · 6x LTV/CAC.',
      'CAC $2 → $40 cost per paying user · 8-month payback · 1.6x LTV/CAC.',
      'CAC $5 → $100 cost per paying user · 20-month payback · 0.6x LTV/CAC.',
      'At 5% conversion and 8% monthly churn. The first experiment targets $0.50 per install; $2 to $5 is the conservative range to plan against.',
      'Operating cost $24K to $96K a year and about $50K acquisition at $0.50 — surplus before fees, taxes and refunds: roughly $154K to $226K.',
    ],
    bulletsFa: [
      'CAC برابر $0.50 → $10 هزینه به‌ازای هر کاربر پرداخت‌کننده · بازگشت دوماهه · LTV/CAC شش برابر.',
      'CAC برابر $2 → $40 هزینه به‌ازای هر کاربر پرداخت‌کننده · بازگشت هشت‌ماهه · LTV/CAC برابر ۱٫۶ برابر.',
      'CAC برابر $5 → $100 هزینه به‌ازای هر کاربر پرداخت‌کننده · بازگشت بیستماهه · LTV/CAC برابر ۰٫۶.',
      'با تبدیل ۵ درصدی و ریزش ماهانه ۸ درصدی. نخستین آزمایش هدف $0.50 به‌ازای هر نصب را نشانه گرفته؛ بازه‌ی محافظه‌کارانه برای برنامه‌ریزی $2 تا $5 است.',
      'هزینه‌ی عملیاتی $24K تا $96K در سال و حدود $50K جذب در نرخ $0.50 — مازاد پیش از کارمزد و مالیات و بازپرداخت: تقریباً $154K تا $226K.',
    ],
    caveatEn:
      'Scenarios, not forecasts.',
    caveatFa:
      'این‌ها سناریو هستند نه پیش‌بینی.',
  },
  {
    n: 14,
    slugSuffix: 'growth',
    titleEn: 'Vivora investor deck — slide 14: Growth targets, not forecasts',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۴: اهداف رشد نه پیش‌بینی',
    excerptEn:
      '100K users targeted in 3 months and 1M in 12 months — with the referral coefficient K measured in beta, where each 0.1 of K cuts effective acquisition cost by about 10%.',
    excerptFa:
      'هدف ۱۰۰هزار کاربر در ۳ ماه و یک میلیون در ۱۲ ماه — با ضریب ارجاع K که در بتا اندازه‌گیری می‌شود و هر ۰٫۱ از آن هزینه‌ی مؤثر جذب را حدود ۱۰ درصد کم می‌کند.',
    leadEn:
      'The growth slide states two explicit targets and one measured lever:',
    leadFa:
      'اسلاید رشد دو هدف صریح و یک اهرم اندازه‌گیری‌پذیر را بیان می‌کند:',
    bulletsEn: [
      '100K — target in 3 months.',
      '1M — target in 12 months.',
      'Referral effect K is measured in beta. Each 0.1 of K cuts effective acquisition cost by about 10%.',
    ],
    bulletsFa: [
      '۱۰۰هزار — هدف در ۳ ماه.',
      'یک میلیون — هدف در ۱۲ ماه.',
      'اثر ارجاع K در بتا اندازه‌گیری می‌شود. هر ۰٫۱ از K هزینه‌ی مؤثر جذب را حدود ۱۰ درصد کاهش می‌دهد.',
    ],
    caveatEn:
      'Growth targets, not forecasts.',
    caveatFa:
      'این‌ها اهداف رشد هستند نه پیش‌بینی.',
  },
  {
    n: 15,
    slugSuffix: 'roadmap',
    titleEn: 'Vivora investor deck — slide 15: Five phases, capital-efficient',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۵: پنج فاز با سرمایه‌گذاری بهینه',
    excerptEn:
      'From the built core platform and two assistants to the full super-app ecosystem — with the assistant strategy: acquire through focused assistants, retain in one shared experience.',
    excerptFa:
      'از پلتفرم هسته‌ی ساخته‌شده با دو دستیار تا اکوسیستم کامل سوپراپ — با راهبرد دستیار: جذب با دستیارهای متمرکز و نگه‌داشت در یک تجربه‌ی مشترک.',
    leadEn:
      'The roadmap slide sequences the platform in five phases:',
    leadFa:
      'اسلاید نقشه‌ی راه پلتفرم را در پنج فاز مرتب می‌کند:',
    bulletsEn: [
      'Phase 1 — core platform and two assistants. Built; controlled testing.',
      'Phase 2 — wellness marketplace launch.',
      'Phase 3 — deeper personalization.',
      'Phase 4 — specialist tools at scale.',
      'Phase 5 — full super-app ecosystem.',
      'Assistant strategy: acquire users through focused assistants (two live, up to ten planned) and retain them in one shared experience, with one engine, profile and specialist layer behind all of them.',
    ],
    bulletsFa: [
      'فاز ۱ — پلتفرم هسته و دو دستیار. ساخته شده؛ در تست کنترل‌شده.',
      'فاز ۲ — راه‌اندازی مارکت‌پلیس سلام.',
      'فاز ۳ — شخصی‌سازی عمیق‌تر.',
      'فاز ۴ — ابزارهای متخصص در مقیاس.',
      'فاز ۵ — اکوسیستم کامل سوپراپ.',
      'راهبرد دستیار: جذب کاربر با دستیارهای متمرکز (دو عدد زنده و تا ده عدد در برنامه) و نگه‌داشت آن‌ها در یک تجربه‌ی مشترک با یک موتور و یک پروفایل و یک لایه‌ی متخصص پشت همه.',
    ],
  },
  {
    n: 16,
    slugSuffix: 'privacy',
    titleEn: 'Vivora investor deck — slide 16: Privacy, regulation and AI safety',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۶: حریم خصوصی و مقررات و ایمنی AI',
    excerptEn:
      'Eight commitments from privacy by design to clear published policies — framed honestly as a proposed framework, not a claim of certification or full compliance.',
    excerptFa:
      'هشت تعهد از حریم خصوصی طراحی‌محور تا سیاست‌های شفاف منتشرشده — با قاب صادقانه‌ی «چارچوب پیشنهادی» نه ادعای گواهی یا انطباق کامل.',
    leadEn:
      'The trust slide lists eight commitments and their scope:',
    leadFa:
      'اسلاید اعتماد هشت تعهد و دامنه‌ی هرکدام را فهرست می‌کند:',
    bulletsEn: [
      'Privacy by design — collect only what is needed.',
      'GDPR readiness — lawful basis, rights, health data.',
      'US assessment — HIPAA depends on our role.',
      'Wellness, not diagnosis — AI states its limits.',
      'Human escalation — emergencies go to people.',
      'Security controls — encryption, access, monitoring.',
      'Device review — check medical-device rules.',
      'Clear policies — published before launch.',
    ],
    bulletsFa: [
      'حریم خصوصی طراحی‌محور — فقط داده‌ی لازم جمع می‌شود.',
      'آمادگی GDPR — مبنای قانونی و حقوق کاربر و داده‌ی سلامتی.',
      'ارزیابی آمریکا — HIPAA به نقش ما بستگی دارد.',
      'سلام نه تشخیص — AI حدود خودش را بیان می‌کند.',
      'ارسال به انسان — موارد اورژانسی به افراد واقعی می‌رسد.',
      'کنترل‌های امنیتی — رمزنگاری و دسترسی و پایش.',
      'بررسی دستگاه — قواعد دستگاه‌های پزشکی چک می‌شود.',
      'سیاست‌های شفاف — پیش از عرضه منتشر می‌شوند.',
    ],
    caveatEn:
      'A proposed framework, not a claim of certification or full compliance. A technical and legal review will confirm status.',
    caveatFa:
      'یک چارچوب پیشنهادی است نه ادعای گواهی یا انطباق کامل. بازبینی فنی و حقوقی وضعیت را تأیید خواهد کرد.',
  },
  {
    n: 17,
    slugSuffix: 'use-of-funds',
    titleEn: 'Vivora investor deck — slide 17: Use of funds — illustrative $250K round',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۷: مصرف سرمایه — دور فرضی $250K',
    excerptEn:
      'Six allocations inside the illustrative $250K round: 35% product, 25% acquisition, 15% AI infrastructure, 10% hosting, 10% compliance and 5% contingency — within the $200K to $300K target.',
    excerptFa:
      'شش تخصیص درون دور فرضی $250K: سی‌وپنج درصد محصول و بیست‌وپنج درصد جذب کاربر و پانزده درصد زیرساخت AI و ده درصد میزبانی و ده درصد انطباق و پنج درصد ذخیره — درون هدف $200K تا $300K.',
    leadEn:
      'The use-of-funds slide breaks the illustrative round into six buckets:',
    leadFa:
      'اسلاید مصرف سرمایه دور فرضی را به شش سطل تقسیم می‌کند:',
    bulletsEn: [
      'Product, reliability and security — 35% · $87.5K.',
      'User acquisition and validation — 25% · $62.5K.',
      'AI infrastructure and automation — 15% · $37.5K.',
      'Hosting, analytics, tech operations — 10% · $25K.',
      'Compliance, privacy and legal — 10% · $25K.',
      'Contingency — 5% · $12.5K.',
    ],
    bulletsFa: [
      'محصول و پایداری و امنیت — ۳۵٪ · $87.5K.',
      'جذب کاربر و اعتبارسنجی — ۲۵٪ · $62.5K.',
      'زیرساخت AI و اتوماسیون — ۱۵٪ · $37.5K.',
      'میزبانی و تحلیل و عملیات فنی — ۱۰٪ · $25K.',
      'انطباق و حریم خصوصی و حقوقی — ۱۰٪ · $25K.',
      'ذخیره‌ی احتیاطی — ۵٪ · $12.5K.',
    ],
    caveatEn:
      'Within a $200K to $300K target. Final budget depends on terms and roadmap.',
    caveatFa:
      'درون هدف $200K تا $300K. بودجه‌ی نهایی به شرایط و نقشه‌ی راه بستگی دارد.',
  },
  {
    n: 18,
    slugSuffix: 'round-deliverables',
    titleEn: 'Vivora investor deck — slide 18: What this round delivers',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۸: این دور چه چیزی تحویل می‌دهد',
    excerptEn:
      'The $200K to $300K angel round buys six concrete outcomes — from finishing controlled MVP testing to measuring CAC, referral and AI cost per active user, and preparing for Europe.',
    excerptFa:
      'دور فرشته‌ی $200K تا $300K شش نتیجه‌ی مشخص می‌خرد — از تکمیل تست کنترل‌شده‌ی MVP تا اندازه‌گیری CAC و ارجاع و هزینه‌ی AI به‌ازای کاربر فعال و آماده‌سازی اروپا.',
    leadEn:
      'The deliverables slide turns the round into a checklist:',
    leadFa:
      'اسلاید تحویل‌ها دور سرمایه‌گذاری را به یک چک‌لیست تبدیل می‌کند:',
    bulletsEn: [
      '1 · Finish controlled MVP testing and fix critical defects.',
      '2 · Reliable analytics and retention measurement.',
      '3 · Validate subscription pricing and paid conversion.',
      '4 · Launch first US acquisition experiments.',
      '5 · Measure CAC, referral and AI cost per active user.',
      '6 · Prepare for Europe.',
      'The round: $200K to $300K from angel investors; instrument and terms to be discussed.',
    ],
    bulletsFa: [
      '۱ · تکمیل تست کنترل‌شده‌ی MVP و رفع نقص‌های بحرانی.',
      '۲ · تحلیل مطمئن و اندازه‌گیری نگه‌داشت.',
      '۳ · اعتبارسنجی قیمت اشتراک و تبدیل پرداختی.',
      '۴ · راه‌اندازی نخستین آزمایش‌های جذب کاربر در آمریکا.',
      '۵ · اندازه‌گیری CAC و ارجاع و هزینه‌ی AI به‌ازای کاربر فعال.',
      '۶ · آماده‌سازی برای اروپا.',
      'دور: $200K تا $300K از سرمایه‌گذاران فرشته؛ ابزار و شرایط برای گفت‌وگو باقی مانده است.',
    ],
  },
  {
    n: 19,
    slugSuffix: 'team',
    titleEn: 'Vivora investor deck — slide 19: Team and contact',
    titleFa: 'دک سرمایه‌گذاری ویورا — اسلاید ۱۹: تیم و تماس',
    excerptEn:
      'The closing slide: Mehrdad as founder and designer, two planned hires (a named clinical advisor and a technical lead), and the standing invitation to see the live MVP under NDA.',
    excerptFa:
      'اسلاید پایانی: مهرداد به‌عنوان بنیان‌گذار و طراح و دو استخدام در برنامه (مشاور بالینی نامدار و لید فنی) و دعوت همیشگی برای دیدن MVP زنده زیر NDA.',
    leadEn:
      'The deck closes with the team slide:',
    leadFa:
      'دک با اسلاید تیم بسته می‌شود:',
    bulletsEn: [
      'Mehrdad — founder and designer.',
      'Medical advisor — planned: a named clinical advisor for content and safety review.',
      'Technical lead — planned: co-founder or CTO as the platform scales.',
      'See the live MVP under NDA — the real product is a live demo, not a mockup.',
      'Mehrdad.ir — where this deck and the live product live.',
    ],
    bulletsFa: [
      'مهرداد — بنیان‌گذار و طراح.',
      'مشاور پزشکی — در برنامه: مشاور بالینی نامدار برای بازبینی محتوا و ایمنی.',
      'لید فنی — در برنامه: هم‌بنیان‌گذار یا CTO هم‌زمان با مقیاس‌گیری پلتفرم.',
      'دیدن MVP زنده زیر NDA — محصول واقعی یک دموی زنده است نه ماکت.',
      'Mehrdad.ir — جایی که این دک و محصول زنده در آن قرار دارند.',
    ],
  },
];

// ── Content builder ──────────────────────────────────────────────────────────
function pad(n: number): string {
  return String(n).padStart(2, '0');
}
function slugFor(s: { n: number; slugSuffix: string }): string {
  return `vivora-deck-${pad(s.n)}-${s.slugSuffix}`;
}
function pdfPath(s: { n: number }): string {
  return `/media/vivora-deck/vivora-deck-slide-${pad(s.n)}.pdf`;
}
function pngPath(s: { n: number }): string {
  return `/media/vivora-deck/vivora-deck-slide-${pad(s.n)}.png`;
}

function ul(items: string[]): string {
  return `<ul>\n${items.map((i) => `<li>${i}</li>`).join('\n')}\n</ul>`;
}

function contentEn(s: SlideSeed, all: SlideSeed[]): string {
  const prev = all.find((x) => x.n === s.n - 1);
  const next = all.find((x) => x.n === s.n + 1);
  const nav: string[] = [];
  if (prev) nav.push(`Previous slide: <a href="/blog/${slugFor(prev)}">${prev.titleEn.split(': ')[1]}</a>`);
  if (next) nav.push(`Next slide: <a href="/blog/${slugFor(next)}">${next.titleEn.split(': ')[1]}</a>`);
  return `
<p>${s.leadEn}</p>
${ul(s.bulletsEn)}
${s.caveatEn ? `<blockquote><strong>From the slide:</strong> ${s.caveatEn}</blockquote>` : ''}
<p>This post is part <strong>${pad(s.n)} of 19</strong> in a series that publishes the Vivora investor deck slide by slide — one post per slide, each with that slide\u2019s own PDF. The interactive deck itself is live at <a href="${DECK_EN_URL}">mehrdad.ir/deck/health</a>.</p>
<p><a href="${pdfPath(s)}">Download this slide as PDF</a>${nav.length > 0 ? ' · ' + nav.join(' · ') : ''}</p>
`;
}

function contentFa(s: SlideSeed, all: SlideSeed[]): string {
  const prev = all.find((x) => x.n === s.n - 1);
  const next = all.find((x) => x.n === s.n + 1);
  const nav: string[] = [];
  if (prev) nav.push(`اسلاید قبلی: <a href="/blog/${slugFor(prev)}">${prev.titleFa.split(': ')[1]}</a>`);
  if (next) nav.push(`اسلاید بعدی: <a href="/blog/${slugFor(next)}">${next.titleFa.split(': ')[1]}</a>`);
  return `
<p>${s.leadFa}</p>
${ul(s.bulletsFa)}
${s.caveatFa ? `<blockquote><strong>از متن اسلاید:</strong> ${s.caveatFa}</blockquote>` : ''}
<p>این نوشته <strong>بخش ${pad(s.n)} از ۱۹</strong> سریِ انتشار اسلایدبهاسلاید دک سرمایه‌گذاری ویوراست — در هر پست یک اسلاید و PDF همان اسلاید. نسخه‌ی تعاملی دک در <a href="${DECK_FA_URL}">mehrdad.ir/deck/health/fa</a> زنده است.</p>
<p><a href="${pdfPath(s)}">دانلود PDF این اسلاید</a>${nav.length > 0 ? ' · ' + nav.join(' · ') : ''}</p>
`;
}

export type PostSeed = {
  slug: string;
  cover: string;
  titleEn: string;
  titleFa: string;
  excerptEn: string;
  excerptFa: string;
  contentEn: string;
  contentFa: string;
  categorySlugs: string[];
};

/** Slide 01 gets the NEWEST date so the blog feed reads 01 → 19 top-down. */
export function buildPosts(now: Date = new Date()): PostSeed[] {
  return SLIDES.map((s, idx) => ({
    slug: slugFor(s),
    cover: pngPath(s),
    titleEn: s.titleEn,
    titleFa: s.titleFa,
    excerptEn: s.excerptEn,
    excerptFa: s.excerptFa,
    contentEn: contentEn(s, SLIDES),
    contentFa: contentFa(s, SLIDES),
    categorySlugs: ['سرمایه-گذاری'],
    date: new Date(now.getTime() - idx * 60_000),
  })) as PostSeed[];
}

// ── Asset check (fail loud BEFORE any DB write) ──────────────────────────────
function assertAssets(): void {
  const missing: string[] = [];
  for (const s of SLIDES) {
    for (const p of [pdfPath(s), pngPath(s)]) {
      if (!existsSync(p.replace('/media/', 'public/media/'))) missing.push(p);
    }
  }
  if (missing.length > 0) {
    throw new Error(`missing deck assets — generate them first:\n${missing.join('\n')}`);
  }
}

// ── Persian editorial rule: no «،» anywhere in the generated copy ────────────
function assertNoPersianComma(): void {
  const offenders: string[] = [];
  for (const s of SLIDES) {
    for (const v of [s.titleFa, s.excerptFa, s.leadFa, ...s.bulletsFa, s.caveatFa ?? '']) {
      if (v.includes('،')) offenders.push(`slide ${pad(s.n)}: ${v.slice(0, 60)}`);
    }
  }
  if (offenders.length > 0) throw new Error(`«،» found:\n${offenders.join('\n')}`);
}

// ── Category resolution (same contract as seed-investor-posts.ts) ────────────
async function resolveCategory(
  client: PrismaClient,
  slugOrName: string,
): Promise<string | null> {
  const bySlug = await client.category.findUnique({ where: { slug: slugOrName } });
  if (bySlug) return bySlug.slug;
  const byName = await client.category.findFirst({ where: { nameEn: slugOrName } });
  return byName?.slug ?? null;
}

async function main() {
  assertAssets();
  assertNoPersianComma();
  const posts = buildPosts();
  const db = new PrismaClient();
  try {
    for (const p of posts) {
      const resolved: string[] = [];
      for (const slug of p.categorySlugs) {
        const found = await resolveCategory(db, slug);
        if (found) resolved.push(found);
        else console.warn(`category not found locally, skipping link: ${slug}`);
      }
      const cats = { connect: resolved.map((slug) => ({ slug })) };
      const post = await db.post.upsert({
        where: { slug: p.slug },
        create: {
          slug: p.slug,
          cover: p.cover,
          titleEn: p.titleEn,
          titleFa: p.titleFa,
          excerptEn: p.excerptEn,
          excerptFa: p.excerptFa,
          contentEn: p.contentEn,
          contentFa: p.contentFa,
          date: p.date,
          published: true,
          source: 'ai',
          categories: cats,
        },
        // refresh content fields only — date/published/featured stay
        // owner-managed across re-runs
        update: {
          cover: p.cover,
          titleEn: p.titleEn,
          titleFa: p.titleFa,
          excerptEn: p.excerptEn,
          excerptFa: p.excerptFa,
          contentEn: p.contentEn,
          contentFa: p.contentFa,
          categories: { set: resolved.map((slug) => ({ slug })) },
        },
      });
      console.log(
        `${post.published ? 'seeded' : 'SEEDED-UNPUBLISHED'}: ${post.slug} (date ${post.date.toISOString()})`,
      );
    }
    console.log(`\n${posts.length} vivora-deck posts processed (local DB).`);
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
