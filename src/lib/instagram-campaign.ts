// D-059 (growth content, 2026-10-25): the owner asked for a two-week
// Instagram campaign for @startup_mt — inviting collaboration and app /
// website / pitch-deck orders. 14 days: intro → flagship service → real
// cases → education → behind-the-scenes → FAQ → final CTA.
//
// FACTS POLICY (same as social-studio.ts): every claim traces to public
// mehrdad.ir content — MVP Sprint promise («idea → live product in ~2
// weeks», the /mvp-sprint page), the kilika fintech super-app story
// (public/s/kilika.html: unified account, one-click payment, top-ups from
// all banks, no Iranian national super-app), the Vivora deck series
// (19 bilingual articles), the work/blog indexes (12+ projects, 100+
// articles), and the @startup_mt handle. Zero invented numbers. Persian
// copy contains zero «،» per the standing rule.
//
// Seeded through POST /api/admin/social/instagram-campaign (admin-gated,
// idempotent by `topic`) — the owner loads it with one button in the
// Social Studio; drafts ship with their campaign image attached.

export interface InstagramCampaignPost {
  day: number;
  topic: string;
  image: string; // repo-shipped /media path — also the public URL Composio needs
  content: string;
}

export const INSTAGRAM_CAMPAIGN: InstagramCampaignPost[] = [
  {
    day: 1,
    topic: 'ig-campaign-day-01-intro',
    image: '/media/instagram/day-01.png',
    content: `سلام! من مهردادم — کسی که ایده‌ها را به محصول واقعی تبدیل می‌کند 🚀
سال‌هاست اپلیکیشن و وب‌سایت می‌سازم؛ از ابراپ فین‌تک تا دِک سرمایه‌گذاری برای استارتاپ‌ها. در این صفحه قرار است پشت‌صحنهٔ ساختن را با هم ببینیم: از اولین طرح روی کاغذ تا روزی که محصول زنده می‌شود.
اگر ایده‌ای در ذهن داری که باید زنده شود — این صفحه مال توست.
👉 همین حالا فالو کن و مسیر را با هم برویم
🔗 mehrdad.ir
#استارتاپ #کارآفرینی #اپلیکیشن #وبسایت #فناوری #دیجیتال #startup #productbuilder #mvp #webdevelopment`,
  },
  {
    day: 2,
    topic: 'ig-campaign-day-02-mvp-sprint',
    image: '/media/instagram/day-02.png',
    content: `ایده‌ات فقط ۲ هفته با دنیای واقعی فاصله دارد ⚡
اسپرینت MVP یعنی: از اولین طرح تا محصول زنده در حدود دو هفته. طراحی و توسعه و استقرار — همه در یک مسیر شفاف با گزارش پیشرفت مرحله‌به‌مرحله.
نه ماه‌ها انتظار؛ نه هزینه‌های نجومی؛ فقط تمرکز روی هستهٔ محصول.
اگر ایده‌ای داری که باید ساخته شود؛ DM بزن یا صفحهٔ اسپرینت را ببین:
🔗 mehrdad.ir/mvp-sprint
#mvp #استارتاپ #اپلیکیشن_موبایل #توسعه_وب #ایده #کارآفرینی #appdevelopment #startup #productlaunch #ساخت_اپلیکیشن`,
  },
  {
    day: 3,
    topic: 'ig-campaign-day-03-klika-case',
    image: '/media/instagram/day-03.png',
    content: `یک ابراپ فین‌تک برای ایران — این‌طوری روایتش کردم 💳
کلیکا: یک حساب واحد برای همهٔ سرویس‌ها؛ پرداخت یک‌کلیکی؛ شارژ از همهٔ بانک‌ها. بازار موبایل‌پرداخت ایران دارد سریع رشد می‌کند ولی یک ابراپ ملی وجود ندارد — این شکاف شد قلب داستان دِک سرمایه‌گذاری کلیکا.
داستان کامل محصول و دِک در صفحهٔ پروژه:
🔗 mehrdad.ir/work/kilika-fintech
#فین_تک #استارتاپ #دِک_سرمایه_گذاری #پرداخت #فناوری_مالی #pitchdeck #fintech #superapp #استارتاپ_ایرانی #سرمایه_گذاری`,
  },
  {
    day: 4,
    topic: 'ig-campaign-day-04-five-mistakes',
    image: '/media/instagram/day-04.png',
    content: `۵ اشتباهی که ایده‌های خوب را می‌کُشد ❌
۱) منتظر لحظهٔ کامل ماندن — هیچ‌وقت نمی‌آید
۲) ساختن همه‌چیز با هم به‌جای یک هستهٔ کوچک
۳) ترس از نشان دادن نسخهٔ اول به کاربر واقعی
۴) خرج کردن زیاد قبل از اولین مشتری
۵) ول کردن ایده بعد از اولین «نه»
کدامش برای تو آشناست؟ زیر همین پست بنویس 👇
#استارتاپ #ایده #کارآفرینی #پروداکت #توسعه_محصول #اپلیکیشن #فناوری #startup #productdesign #entrepreneur #leanstartup`,
  },
  {
    day: 5,
    topic: 'ig-campaign-day-05-vivora-deck',
    image: '/media/instagram/day-05.png',
    content: `دِکی که سلامت دیجیتال را سرمایه‌گذارپذیر می‌کند 🩺
سری ویورا — ۱۹ مقاله دربارهٔ یک پلتفرم سلامت دیجیتال: از تحلیل بازار و رقبا تا مدل درآمدی و نقشهٔ راه. نتیجه‌اش یک دِک سرمایه‌گذاری کامل شد که داستان محصول را شفاف تعریف می‌کند.
اگر استارتاپت به سرمایه نیاز دارد؛ دِک تو ویترین توست.
🔗 mehrdad.ir/blog
#دِک_سرمایه_گذاری #سلامت_دیجیتال #استارتاپ #سرمایه_گذاری #healthtech #pitchdeck #investor #مدل_درآمدی #استارتاپ_ایرانی`,
  },
  {
    day: 6,
    topic: 'ig-campaign-day-06-why-two-weeks',
    image: '/media/instagram/day-06.png',
    content: `چرا ۲ هفته؟ چون تمرکز معجزه می‌کند 🎯
اسپرینت MVP من چهار مرحله دارد:
🔹 روز ۱ و ۲ — برش دقیق دامنه: فقط همان چیزی که هستهٔ ارزش است
🔹 هفتهٔ اول — ساخت هستهٔ محصول
🔹 هفتهٔ دوم — پرداخت جزئیات و استقرار
🔹 تحویل — محصولی زنده که می‌توانی به مشتری نشان بدهی
شفاف و بدون سورپرایز. آماده‌ای؟ DM بزن.
#mvp #استارتاپ #اپلیکیشن #مدیریت_پروژه #توسعه_محصول #فناوری #sprint #startup #appdevelopment #productlaunch`,
  },
  {
    day: 7,
    topic: 'ig-campaign-day-07-question',
    image: '/media/instagram/day-07.png',
    content: `سوال امروز: اگر فقط یک اپ می‌توانستی بسازی — چه می‌ساختی؟ 💬
هر ایده‌ای که زیر این پست بنویسی را جدی می‌خوانم؛ بهترین‌ها را با هم باز می‌کنیم: از کجا شروع شود و هسته‌اش چی باشد.
ایده‌های خودت را در کامنت‌ها ببینم 👇
#ایده #استارتاپ #اپلیکیشن #خلاقیت #کارآفرینی #فناوری #startupideas #appideas #entrepreneur #نوآوری`,
  },
  {
    day: 8,
    topic: 'ig-campaign-day-08-websites',
    image: '/media/instagram/day-08.png',
    content: `کسب‌وکارت هنوز وب‌سایت ندارد؟ 😅
مشتری امروز اول گوگل می‌کند؛ اگر تو نبودی رقیب است. لندینگ حرفه‌ای و سایت شرکتی و فروشگاه آنلاین — سریع و تمیز و موبایل‌فرست؛ از دامنه تا آنلاین‌شدن همه‌چیز با خودم.
برای شروع یک DM کافی است یا از صفحهٔ تماس برو:
🔗 mehrdad.ir/contact
#طراحی_سایت #وبسایت #لندینگ_پیج #فروشگاه_آنلاین #سئو #برندینگ #webdesign #landingpage #کسب_وکار #دیجیتال_مارکتینگ`,
  },
  {
    day: 9,
    topic: 'ig-campaign-day-09-validation',
    image: '/media/instagram/day-09.png',
    content: `قبل از هر خط کد — ۱۰ دقیقه این سه سوال را جواب بده ✅
۱) چه کسی دقیقاً این درد را دارد؟
۲) حاضر است چقدر برای حلش بپردازد؟
۳) کوچک‌ترین نسخهٔ قابل‌تست چیست؟
اگر جواب سوال ۱ مبهم است؛ هنوز وقت ساختن نیست — وقت گفتگوست.
با کدام سوال شروع می‌کنی؟ 👇
#استارتاپ #اعتبارسنجی #ایده #کسب_وکار #کارآفرینی #leanstartup #mvp #productmanagement #شروع_استارتاپ #فناوری`,
  },
  {
    day: 10,
    topic: 'ig-campaign-day-10-behind-scenes',
    image: '/media/instagram/day-10.png',
    content: `یک روز واقعی از ساختن محصول ☕
صبح: بازخورد کارفرما روی طرح‌ها
ظهر: کدنویسی هسته
عصر: تست روی گوشی واقعی
شب: استقرار نسخهٔ جدید
این چرخهٔ ساده‌ای است که ایده‌ها را محصول می‌کند. از کدام مرحله توقع داری بیشتر پشت‌صحنه ببینم؟ 👇
#پشت_صحنه #برنامه_نویسی #توسعه_محصول #استارتاپ #فناوری #دیجیتال #developerlife #coding #appdevelopment #کارآفرینی`,
  },
  {
    day: 11,
    topic: 'ig-campaign-day-11-decks',
    image: '/media/instagram/day-11.png',
    content: `سرمایه‌گذار فقط ۳ دقیقه وقت دارد؛ دِک تو آماده است؟ 📊
دِک سرمایه‌گذاری حرفه‌ای یعنی: روایتی که گره می‌خورد؛ اعدادی که اعتماد می‌سازد؛ طراحی‌ای که حرفه‌ای بودن را فریاد می‌زند. ساخته‌شده برای استارتاپ‌هایی که راند بعدی را هدف گرفته‌اند.
اگر راند سرمایه‌گذاری‌ات نزدیک است؛ DM بزن.
🔗 mehrdad.ir/contact
#دِک_سرمایه_گذاری #pitchdeck #استارتاپ #سرمایه_گذار #fundraising #investor #مدل_کسب_وکار #استارتاپ_ایرانی`,
  },
  {
    day: 12,
    topic: 'ig-campaign-day-12-track-record',
    image: '/media/instagram/day-12.png',
    content: `کارنامه این صفحه چه می‌گوید؟ 🏆
در mehrdad.ir همه‌چیز علنی است: بیش از ۱۰ پروژهٔ واقعی با داستان کامل؛ بیش از ۱۰۰ مقالهٔ تخصصی؛ و سرویس‌هایی که از ایده تا محصول همراهی می‌کنند.
هیچ وعدهٔ مخفی‌ای در کار نیست — کارها خودشان حرف می‌زنند.
🔗 mehrdad.ir/work
#نمونه_کار #استارتاپ #اپلیکیشن #وبسایت #طراحی_سایت #فناوری #portfolio #webdevelopment #اعتماد #کیفیت`,
  },
  {
    day: 13,
    topic: 'ig-campaign-day-13-faq',
    image: '/media/instagram/day-13.png',
    content: `سه سوالی که همیشه ازم می‌پرسید 🤔
«چقدر طول می‌کشد؟» — برای اپ: یک اسپرینت دو هفته‌ای برای هستهٔ محصول.
«چقدر هزینه دارد؟» — بستگی به دامنه دارد؛ بعد از یک گفتگوی ۱۵ دقیقه‌ای عدد شفاف می‌گیری.
«از کجا شروع می‌کنیم؟» — از ایده‌ات؛ همین‌جا.
سوال تو چیست؟ DM بزن؛ جواب می‌دهم.
#استارتاپ #سوالات_متداول #اپلیکیشن #وبسایت #فناوری #کارآفرینی #mvp #appdevelopment #consulting #مشاوره`,
  },
  {
    day: 14,
    topic: 'ig-campaign-day-14-final-cta',
    image: '/media/instagram/day-14.png',
    content: `۱۴ روز است با هم هستیم؛ حالا نوبت ایدهٔ توست 🚀
در این دو هفته دیدی: اپلیکیشن و وب‌سایت و دِک سرمایه‌گذاری — هر سه یک مسیر روشن دارند: از ایده تا محصول واقعی.
پیشنهاد همکاری یا سفارش؟ فقط یک DM فاصله داری؛ یا از فرم تماس:
🔗 mehrdad.ir/contact
بیا بسازیمش ✌️
#همکاری #سفارش_اپلیکیشن #طراحی_سایت #استارتاپ #اپلیکیشن_موبایل #دِک_سرمایه_گذاری #فناوری #کارآفرینی #startup #letsbuild`,
  },
];

// ─────────── D-062: reel videos (D-061 impact standard) ───────────
// Days that already have a produced reel (scripts/reels/build_dayXX.sh —
// 2-second hook captions + animated Persian typography via libass/Vazirmatn +
// baked royalty-free synth music + whoosh cuts, loudness −14 LUFS; see
// docs/INSTAGRAM_GROWTH_PLAN.md §11). Publishing prefers the reel and falls
// back to the campaign image. Produce more reels with the reproducible
// pipeline and add them here — seeding + publishing pick them up by topic.
export const CAMPAIGN_REELS: Record<number, string> = {
  2: '/media/instagram/reels/day-02-reel.mp4',
  4: '/media/instagram/reels/day-04-reel.mp4',
};

/** Public /media path of the reel for a campaign topic, or null. */
export function campaignReelForTopic(topic: string): string | null {
  const match = /^ig-campaign-day-(\d{2})/.exec(topic);
  if (!match) return null;
  return CAMPAIGN_REELS[Number(match[1])] ?? null;
}
