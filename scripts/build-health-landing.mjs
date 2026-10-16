// Health & Wellness landing — generator for /deck/health surfaces.
//
// Owner order 2026-10-16: the uploaded file (health-superapp-landing-en (1).html)
// is FINAL. The ENGLISH version ships BYTE-EXACT — zero modification (no font,
// no wording, no injected UI). The PERSIAN version is built from the same bytes:
// identical design/fonts/layout, translated strings, dir=rtl, Vazirmatn added
// only as the Persian glyph font, placeholder slots ([CTO], [$X], [Y%], …)
// kept verbatim, numeric tokens identical, and no Persian comma «،» anywhere.
//
// Usage: bun scripts/build-health-landing.mjs
// Outputs: src/app/deck/health/landing-en.ts + landing-fa.ts (generated — do not hand-edit).

import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'upload/health-superapp-landing-en (1).html';
const en = readFileSync(SRC, 'utf8');

// ---- ordered replacement map (EN exact string -> FA string) ---------------
// Order matters only where strings overlap; entries use full-context targets.
const R = [
  // ---- head ----
  ['<html lang="en">', '<html lang="fa" dir="rtl">'],
  ['<title>Vivora (working title) — The Health & Wellness Super App</title>',
   '<title>Vivora (عنوان موقت) — ابر اپلیکیشن سلامت و تندرستی</title>'],
  ['family=Inter:wght@400;500;600;800&family=Space+Grotesk:wght@500;700&display=swap',
   'family=Inter:wght@400;500;600;800&family=Space+Grotesk:wght@500;700&family=Vazirmatn:wght@400;500;600;700;800&display=swap'],

  // ---- FA-only CSS additions (same design؛ Persian glyphs؛ RTL fixes) ----
  ['</style>',
   `/* ==== FA additions: same design؛ Persian glyphs via Vazirmatn؛ RTL fixes ==== */
body{font-family:Vazirmatn,Inter,system-ui,sans-serif}
h1,h2,h3{font-family:Vazirmatn,'Space Grotesk',Inter,sans-serif;letter-spacing:0}
.k,th{letter-spacing:0}
td.l,th.l{text-align:right}
.tl .tag{right:auto;left:18px}
.btn:hover .ar{transform:translateX(-6px)}
.gr h4,.ps .big,.tl2 b,.tl3 b,.bc span{font-family:'Space Grotesk',Vazirmatn,sans-serif}
.sc{left:auto;right:3cqw}
.pl2 p em,.rg li b,.sp .jn,.dv li b{margin-left:0;margin-right:auto}
</style>`],

  // ---- nav ----
  ['font:500 10px Inter;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px;letter-spacing:.06em">WORKING TITLE</small>',
   'font:500 10px Vazirmatn;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px">عنوان موقت</small>'],
  ['<a href="#product">Product</a>', '<a href="#product">محصول</a>'],
  ['<a href="#traction">Proof</a>', '<a href="#traction">اثبات</a>'],
  ['<a href="#showcase">Screens</a>', '<a href="#showcase">نماها</a>'],
  ['<a href="#market">Market</a>', '<a href="#market">بازار</a>'],
  ['<a href="#compare">Compare</a>', '<a href="#compare">مقایسه</a>'],
  ['<a href="#model">Revenue</a>', '<a href="#model">درآمد</a>'],
  ['<a href="#growth">Growth</a>', '<a href="#growth">رشد</a>'],
  ['<a href="#roadmap">Roadmap</a>', '<a href="#roadmap">نقشه راه</a>'],
  ['>Invest <span class="ar">→</span></a>', '>سرمایه‌گذاری <span class="ar">←</span></a>'],

  // ---- hero ----
  ['<div class="eyebrow">MVP live · Seed round open</div>', '<div class="eyebrow">MVP زنده است · دور اولیه باز است</div>'],
  ['<h1>One app for <span class="gt">every part of your health.</span></h1>',
   '<h1>یک اپ برای <span class="gt">هر بخش از سلامت شما.</span></h1>'],
  ['<p class="lead">Proprietary AI assistants, verified specialists and a wellness marketplace in one platform for iOS, Android and web. Two assistants are live today, up to ten planned.</p>',
   '<p class="lead">دستیارهای هوش مصنوعی اختصاصی و متخصصان تاییدشده و بازارچهٔ سلامت در یک پلتفرم برای iOS و Android و وب. امروز دو دستیار زنده است و تا ده دستیار برنامه‌ریزی شده است.</p>'],
  ['>See the live MVP <span class="ar">→</span></a>', '>دیدن MVP زنده <span class="ar">←</span></a>'],
  ['>Explore the product</a>', '>کاوش در محصول</a>'],
  ['<span>Product phases</span>', '<span>فازهای محصول</span>'],
  ['<span>AI assistants</span>', '<span>دستیارهای هوش مصنوعی</span>'],
  ['<span>Users in 12 months</span>', '<span>کاربر در 12 ماه</span>'],

  // ---- problem ----
  ['<div class="k rv">The problem</div>', '<div class="k rv">مسئله</div>'],
  ['Health is scattered across <span class="gt">a dozen apps.</span>',
   'سلامت پراکنده شده بین <span class="gt">دوجین اپ.</span>'],
  ['<p class="lead rv">Users juggle separate tools for fitness, nutrition, sleep and care. Advice is generic, expert access is costly, and most people drop off within weeks.</p>',
   '<p class="lead rv">کاربران ابزارهای جدا برای تناسب اندام و تغذیه و خواب و مراقبت را همزمان مدیریت می‌کنند. توصیه‌ها عمومی است و دسترسی به متخصص پرهزینه است و بیشتر افراد ظرف چند هفته رها می‌کنند.</p>'],
  ['"Fragmented",', '"تکه‌تکه",'],
  ['"Fitness, food, sleep and care live in different apps."', '"تناسب اندام و غذا و خواب و مراقبت هر کدام در اپهای جدا هستند."'],
  ['"Generic advice",', '"توصیهٔ عمومی",'],
  ['"One-size-fits-all plans that ignore the individual."', '"برنامه‌های یکسان برای همه که فرد را نادیده می‌گیرند."'],
  ['"High churn",', '"ریزش بالا",'],
  ['"Engagement fades because nothing connects the journey."', '"تعهد محو می‌شود چون هیچ چیز مسیر را به هم متصل نمی‌کند."'],

  // ---- solution ----
  ['<div class="k rv">The solution</div>', '<div class="k rv">راه‌حل</div>'],
  ['From data to action, <span class="gt">without leaving the app.</span>',
   'از داده تا اقدام <span class="gt">بدون ترک اپ.</span>'],
  ['"Personal intelligence",', '"هوش شخصی",'],
  ['"Two AI assistants learn each user and adapt recommendations continuously."', '"دو دستیار هوش مصنوعی هر کاربر را می‌شناسند و توصیه‌ها را پیوسته به‌روز می‌کنند."'],
  ['"Real specialists",', '"متخصصان واقعی",'],
  ['"A dedicated expert panel serves the general public inside the app."', '"هیئت متخصصان اختصاصی داخل اپ به عموم مردم خدمت می‌دهد."'],
  ['"Wellness marketplace","Curated health products arrive in phase two, right in the user journey."',
   '"بازارچهٔ سلامت","محصولات سلامت منتخب از فاز دو درست در مسیر کاربر ظاهر می‌شوند."'],

  // ---- product ----
  ['<div class="k rv">Product</div>', '<div class="k rv">محصول</div>'],
  ['Built for <span class="gt">everyone.</span>', 'ساخته‌شده برای <span class="gt">همه.</span>'],
  ['<p class="lead rv">A public-first platform: simple for individuals, powerful for specialists. Assistants collect context, adapt recommendations and keep users on a personal path. Proprietary logic is shown under NDA.</p>',
   '<p class="lead rv">پلتفرمی با اولویت عموم: ساده برای افراد و قدرتمند برای متخصصان. دستیارها زمینه را جمع می‌کنند و توصیه‌ها را تطبیق می‌دهند و کاربر را در مسیر شخصی نگه می‌دارند. منطق اختصاصی تحت NDA نشان داده می‌شود.</p>'],
  ['>Request the MVP demo</a>', '>درخواست دموی MVP</a>'],
  ['<small>Good morning</small><h4>Alex</h4>', '<small>صبح بخیر</small><h4>آلکس</h4>'],
  ['</i>Activity<b>82%</b>', '</i>فعالیت<b>82%</b>'],
  ['</i>Sleep<b>64%</b>', '</i>خواب<b>64%</b>'],
  ['</i>Nutrition<b>90%</b>', '</i>تغذیه<b>90%</b>'],
  ['<small>Your assistant</small><p>Great sleep last night. Ready for a 20 minute walk?</p>',
   '<small>دستیار شما</small><p>دیشب خواب عالی داشتی. آمادهٔ پیاده‌روی 20 دقیقه‌ای هستی؟</p>'],
  ['<div class="card2"><small>Steps</small><b>8,420</b>', '<div class="card2"><small>قدم</small><b>8,420</b>'],
  ['<small>Sleep</small><b>7h 40m</b>', '<small>خواب</small><b>7 ساعت 40 دقیقه</b>'],
  ['<small>Plan for today</small>', '<small>برنامهٔ امروز</small>'],
  ['<span>Morning stretch</span><em>8:00</em>', '<span>نرمش صبحگاهی</span><em>8:00</em>'],
  ['<span>Walk, 20 minutes</span><em>12:30</em>', '<span>پیاده‌روی · 20 دقیقه</span><em>12:30</em>'],
  ['<span>Balanced lunch</span><em>13:00</em>', '<span>ناهار متعادل</span><em>13:00</em>'],
  ['<b>Nutrition specialist</b>', '<b>متخصص تغذیه</b>'],
  ['<small>Today · 4:30 PM</small>', '<small>امروز · 4:30 بعدازظهر</small>'],
  ['<span class="jn">Join</span>', '<span class="jn">پیوستن</span>'],

  // ---- showcase ----
  ['<div class="k rv">Inside the MVP</div>', '<div class="k rv">درون MVP</div>'],
  ['A glimpse <span class="gt">inside the super app.</span>', 'نگاهی <span class="gt">درون ابر اپ.</span>'],
  ['<p class="lead rv">Walking analysis, heart monitoring and guided breathing already run in the MVP. The wellness store is planned for phase 2. Screens are simplified for this page; the real product is shown live under NDA.</p>',
   '<p class="lead rv">تحلیل پیاده‌روی و پایش قلب و تنفس هدایت‌شده هم‌اکنون در MVP اجرا می‌شود. بازارچهٔ سلامت برای فاز 2 برنامه‌ریزی شده است. نماها برای این صفحه ساده شده‌اند؛ محصول واقعی به‌صورت زنده تحت NDA نشان داده می‌شود.</p>'],
  // fig 1 — walking
  ['<small>Walking</small><h4>Today</h4>', '<small>پیاده‌روی</small><h4>امروز</h4>'],
  ['<span class="tg">Goal 10k</span>', '<span class="tg">هدف 10k</span>'],
  ['<small style="display:inline">steps</small>', '<small style="display:inline">قدم</small>'],
  ['<small>1,580 to goal · +12% vs yesterday</small>', '<small>1,580 تا هدف · +12% نسبت به دیروز</small>'],
  ['<small>This week</small>', '<small>این هفته</small>'],
  ['<text x="10" y="55">M</text>', '<text x="10" y="55">د</text>'],
  ['<text x="30" y="55">T</text>', '<text x="30" y="55">س</text>'],
  ['<text x="50" y="55">W</text>', '<text x="50" y="55">چ</text>'],
  ['<text x="70" y="55">T</text>', '<text x="70" y="55">پ</text>'],
  ['<text x="90" y="55">F</text>', '<text x="90" y="55">ج</text>'],
  ['<text x="110" y="55">S</text>', '<text x="110" y="55">ش</text>'],
  ['<text x="130" y="55">S</text>', '<text x="130" y="55">ی</text>'],
  ['<b>6.2</b><small>km</small>', '<b>6.2</b><small>کیلومتر</small>'],
  ['<b>412</b><small>kcal</small>', '<b>412</b><small>کیلوکالری</small>'],
  ['<b>74</b><small>active min</small>', '<b>74</b><small>دقیقه فعالی</small>'],
  ['<small>Pace analysis</small>', '<small>تحلیل تمپو</small>'],
  ['<div class="chp2">Best average pace this month</div>', '<div class="chp2">بهترین میانگین تمپوی این ماه</div>'],
  ['<em class="bd">In MVP</em>', '<em class="bd">در MVP</em>'],
  ['<h3>Walking and activity analysis</h3>', '<h3>تحلیل پیاده‌روی و فعالیت</h3>'],
  ['<p>Steps, weekly trend, pace analysis and goals.</p>', '<p>قدم‌ها و روند هفتگی و تحلیل تمپو و اهداف.</p>'],
  // fig 2 — heart
  ['<small>Heart</small><h4>Live</h4>', '<small>قلب</small><h4>زنده</h4>'],
  ['<span class="tg g">Calm</span>', '<span class="tg g">آرام</span>'],
  ['<small>Resting average 58</small>', '<small>میانگین استراحت 58</small>'],
  ['<b>64</b><small>HRV ms</small>', '<b>64</b><small>HRV میلی‌ثانیه</small>'],
  ['<b>58</b><small>resting</small>', '<b>58</b><small>استراحت</small>'],
  ['<b>86%</b><small>recovery</small>', '<b>86%</b><small>ریکاوری</small>'],
  ['<small>Heart rate zones</small>', '<small>مناطق ضربان قلب</small>'],
  ['<span>Rest</span><span>Fat burn</span><span>Cardio</span><span>Peak</span>',
   '<span>استراحت</span><span>چربی‌سوزی</span><span>هوازی</span><span>اوج</span>'],
  ['<div class="chp2">Trending healthier this week</div>', '<div class="chp2">این هفته روند سلامت بهتر است</div>'],
  ['<h3>Heart monitoring</h3>', '<h3>پایش قلب</h3>'],
  ['<p>Live heart rate, rhythm, HRV and training zones.</p>', '<p>ضربان زنده و ریتم و HRV و مناطق تمرین.</p>'],
  // fig 3 — breathing
  ['<small>Breathe</small><h4>Calm</h4>', '<small>تنفس</small><h4>آرام</h4>'],
  ['<span class="tg">5 min</span>', '<span class="tg">5 دقیقه</span>'],
  ['<span class="t1">Inhale</span><span class="t2">Exhale</span>', '<span class="t1">دم</span><span class="t2">بازدم</span>'],
  ['<b>28%</b><small>stress</small>', '<b>28%</b><small>استرس</small>'],
  ['<b>6</b><small>day streak</small>', '<b>6</b><small>روز پیوسته</small>'],
  ['<b>4-4</b><small>pattern</small>', '<b>4-4</b><small>الگو</small>'],
  ['<span>Box</span><span>4-7-8</span>', '<span>جعبه‌ای</span><span>4-7-8</span>'],
  ['<span class="on">Calm</span>', '<span class="on">آرام</span>'],
  ['<div class="bt">Start session</div>', '<div class="bt">شروع جلسه</div>'],
  ['<h3>Guided breathing</h3>', '<h3>تنفس هدایت‌شده</h3>'],
  ['<p>Calming sessions with live pacing and stress tracking.</p>', '<p>جلسه‌های آرام‌سازی با تمپوی زنده و ردیابی استرس.</p>'],
  // fig 4 — store
  ['<small>Wellness store</small><h4>For you</h4>', '<small>بازارچهٔ سلامت</small><h4>برای شما</h4>'],
  ['<span class="tg g">Phase 2</span>', '<span class="tg g">فاز 2</span>'],
  ['<div class="sr">Search products</div>', '<div class="sr">جستجوی محصولات</div>'],
  ['<span class="on">All</span><span>Sleep</span><span>Fitness</span><span>Nutrition</span>',
   '<span class="on">همه</span><span>خواب</span><span>تناسب اندام</span><span>تغذیه</span>'],
  ['<b>Sleep</b><small>Picked by assistant</small>', '<b>خواب</b><small>انتخاب دستیار</small>'],
  ['<b>Fitness</b><small>Picked by assistant</small>', '<b>تناسب اندام</b><small>انتخاب دستیار</small>'],
  ['<b>Nutrition</b><small>Specialist approved</small>', '<b>تغذیه</b><small>تأیید متخصص</small>'],
  ['<b>Recovery</b><small>Picked by assistant</small>', '<b>ریکاوری</b><small>انتخاب دستیار</small>'],
  ['<b>Recommended bundle</b><small>Based on your goals</small>', '<b>بستهٔ پیشنهادی</b><small>بر اساس اهداف شما</small>'],
  ['<span class="jn">View</span>', '<span class="jn">مشاهده</span>'],
  ['<em class="bd p">Phase 2</em>', '<em class="bd p">فاز 2</em>'],
  ['<h3>Wellness store</h3>', '<h3>بازارچهٔ سلامت</h3>'],
  ['<p>Curated products picked by assistants, planned for phase 2.</p>', '<p>محصولات منتخبِ دستیارها؛ برنامه‌ریزی‌شده برای فاز 2.</p>'],

  // ---- assistants ----
  ['<div class="k rv">Assistant network</div>', '<div class="k rv">شبکهٔ دستیارها</div>'],
  ['Two live today. <span class="gt">Up to ten planned.</span>', 'امروز دو تا زنده. <span class="gt">تا ده تا برنامه‌ریزی شده.</span>'],
  ['<p class="lead rv">Each assistant owns one part of a user health journey and users are acquired around them. As the network grows, assistants may converge into one unified assistant, with the same user data and the same expert layer behind it.</p>',
   '<p class="lead rv">هر دستیار یک بخش از مسیر سلامت کاربر را دارد و کاربران حول آن جذب می‌شوند. با بزرگ‌تر شدن شبکه ممکن است دستیارها در یک دستیار یکپارچه همگرا شوند؛ با همان دادهٔ کاربر و همان لایهٔ متخصص پشت آن.</p>'],
  ['<span class="chip on">Assistant 1 · LIVE</span>', '<span class="chip on">دستیار 1 · فعال</span>'],
  ['<span class="chip on">Assistant 2 · LIVE</span>', '<span class="chip on">دستیار 2 · فعال</span>'],
  ['<span class="chip">Assistant 3</span>', '<span class="chip">دستیار 3</span>'],
  ['<span class="chip">Assistant 4</span>', '<span class="chip">دستیار 4</span>'],
  ['<span class="chip">Assistant 5</span>', '<span class="chip">دستیار 5</span>'],
  ['<span class="chip">Assistant 6</span>', '<span class="chip">دستیار 6</span>'],
  ['<span class="chip">Assistant 7</span>', '<span class="chip">دستیار 7</span>'],
  ['<span class="chip">Assistant 8</span>', '<span class="chip">دستیار 8</span>'],
  ['<span class="chip">Assistant 9</span>', '<span class="chip">دستیار 9</span>'],
  ['<span class="chip">Assistant 10</span>', '<span class="chip">دستیار 10</span>'],
  ['"One user, many journeys",', '"یک کاربر و چند مسیر",'],
  ['"Each assistant is an entry point that attracts its own audience into the same platform."', '"هر دستیار یک نقطهٔ ورود است که مخاطب خودش را به همان پلتفرم می‌آورد."'],
  ['"Shared intelligence",', '"هوش مشترک",'],
  ['"One profile and one recommendation engine serve every assistant, so each new assistant starts smarter."', '"یک پروفایل و یک موتور پیشنهاد به همهٔ دستیارها خدمت می‌دهد؛ پس هر دستیار تازه از همان ابتدا باهوش‌تر شروع می‌کند."'],
  ['"Human layer",', '"لایهٔ انسانی",'],
  ['"Specialists plug into every assistant, adding trust and a second revenue stream."', '"متخصصان به هر دستیار وصل می‌شوند؛ هم اعتماد می‌سازند هم جریان درآمدی دوم."'],

  // ---- specialists ----
  ['<div class="k rv">Specialist network</div>', '<div class="k rv">شبکهٔ متخصصان</div>'],
  ['Find, book and talk to <span class="gt">real specialists.</span>', 'پیدا کردن و رزرو و گفتگو با <span class="gt">متخصصان واقعی.</span>'],
  ['<p class="lead rv">Concept screens for the specialist side of the platform: online booking, secure chat with specialists and support, a health map and smart matching. Final UI and feature set may differ.</p>',
   '<p class="lead rv">نماهای مفهومی سمت متخصص پلتفرم: رزرو آنلاین و چت امن با متخصصان و پشتیبانی و نقشهٔ سلامت و تطبیق هوشمند. UI و فهرست فیچرهای نهایی ممکن است متفاوت باشد.</p>'],
  // fig 1 — booking
  ['<small>Book a visit</small><h4>Pick a time</h4>', '<small>رزرو ویزیت</small><h4>انتخاب زمان</h4>'],
  ['<span class="tg g">Online</span>', '<span class="tg g">آنلاین</span>'],
  ['<small>★ 4.9 · 12 yrs experience</small>', '<small>★ 4.9 · 12 سال تجربه</small>'],
  ['<small>October</small>', '<small>اکتبر</small>'],
  ['<span>Mon<b>19</b></span><span>Tue<b>20</b></span><span class="on">Wed<b>21</b></span><span>Thu<b>22</b></span><span>Fri<b>23</b></span>',
   '<span>دو<b>19</b></span><span>سه<b>20</b></span><span class="on">چهار<b>21</b></span><span>پنج<b>22</b></span><span>جمعه<b>23</b></span>'],
  ['<small>Available times</small>', '<small>زمان‌های آزاد</small>'],
  ['<b>30</b><small>minutes</small>', '<b>30</b><small>دقیقه</small>'],
  ['<b>Video</b><small>or chat</small>', '<b>تصویری</b><small>یا چت</small>'],
  ['<b>Free</b><small>reschedule</small>', '<b>رایگان</b><small>جابه‌جایی</small>'],
  ['<div class="bt sh2">Confirm booking</div>', '<div class="bt sh2">تأیید رزرو</div>'],
  ['<em class="bd p">Concept</em>', '<em class="bd p">مفهومی</em>'],
  ['<h3>Online booking</h3>', '<h3>رزرو آنلاین</h3>'],
  ['<p>Pick a specialist, a day and a time in seconds.</p>', '<p>انتخاب متخصص و روز و زمان در چند ثانیه.</p>'],
  // fig 2 — chat
  ['<b>Specialist chat</b><small>Online now</small>', '<b>چت با متخصص</b><small>الان آنلاین است</small>'],
  ['<span class="tg">Secure</span>', '<span class="tg">امن</span>'],
  ['<span class="on">Specialist</span><span>Support</span>', '<span class="on">متخصص</span><span>پشتیبانی</span>'],
  ['>I feel tired after lunch lately.<', '>این روزها بعد از ناهار خسته‌ام.<'],
  ['>Thanks. Let us check your sleep and meals from this week.<', '>ممنون. بگذار خواب و وعده‌های غذایی این هفته‌ات را بررسی کنیم.<'],
  ['<span>Sleep report</span>', '<span>گزارش خواب</span>'],
  ['>Try a lighter lunch and a 10 minute walk. I will adjust your plan.<', '>ناهار سبک‌تر و یک پیاده‌روی 10 دقیقه‌ای را امتحان کن. برنامه‌ات را تنظیم می‌کنم.<'],
  ['<span>Book a visit</span><span>Send photo</span>', '<span>رزرو ویزیت</span><span>ارسال عکس</span>'],
  ['<div class="inp"><span>Write a message</span><i></i></div>', '<div class="inp"><span>پیام بنویسید</span><i></i></div>'],
  ['<h3>Specialist chat and support</h3>', '<h3>چت با متخصص و پشتیبانی</h3>'],
  ['<p>Secure conversation with a specialist or the support team.</p>', '<p>گفتگوی امن با متخصص یا تیم پشتیبانی.</p>'],
  // fig 3 — map
  ['<small>Health map</small><h4>Near you</h4>', '<small>نقشهٔ سلامت</small><h4>نزدیک شما</h4>'],
  ['<span class="tg g">12 places</span>', '<span class="tg g">12 مکان</span>'],
  ['<span class="on">All</span><span>Clinics</span><span>Labs</span><span>Pharmacy</span>',
   '<span class="on">همه</span><span>کلینیک‌ها</span><span>آزمایشگاه‌ها</span><span>داروخانه</span>'],
  ['<b>City Health Clinic</b><small>0.8 km · Open · 6 min</small>', '<b>کلینیک سلامت شهر</b><small>0.8 کیلومتر · باز · 6 دقیقه</small>'],
  ['<span class="jn">Go</span>', '<span class="jn">برو</span>'],
  ['<b>5</b><small>clinics</small>', '<b>5</b><small>کلینیک</small>'],
  ['<b>3</b><small>labs</small>', '<b>3</b><small>آزمایشگاه</small>'],
  ['<b>4</b><small>pharmacies</small>', '<b>4</b><small>داروخانه</small>'],
  ['<h3>Health map</h3>', '<h3>نقشهٔ سلامت</h3>'],
  ['<p>Clinics, labs and pharmacies around you, with routes.</p>', '<p>کلینیک‌ها و آزمایشگاه‌ها و داروخانه‌های اطراف شما؛ همراه با مسیر.</p>'],
  // fig 4 — find
  ['<small>Find specialists</small><h4>Top matches</h4>', '<small>یافتن متخصصان</small><h4>بهترین تطبیق‌ها</h4>'],
  ['<span class="tg">3 online</span>', '<span class="tg">3 آنلاین</span>'],
  ['<div class="sr">Search a specialist or goal</div>', '<div class="sr">جستجوی متخصص یا هدف</div>'],
  ['<span class="on">Nutrition</span><span>Cardio</span><span>Sleep</span><span>Mind</span>',
   '<span class="on">تغذیه</span><span>قلبی</span><span>خواب</span><span>ذهن</span>'],
  ['<small>★ 4.9 · Today 16:00</small>', '<small>★ 4.9 · امروز 16:00</small>'],
  ['<b>Sleep coach</b><small>★ 4.8 · Tomorrow 10:30</small>', '<b>مربی خواب</b><small>★ 4.8 · فردا 10:30</small>'],
  ['<b>Fitness trainer</b><small>★ 4.7 · Today 18:00</small>', '<b>مربی تناسب اندام</b><small>★ 4.7 · امروز 18:00</small>'],
  ['<span class="jn">Book</span>', '<span class="jn">رزرو</span>'],
  ['<div class="chp2">Matched to your goals by your assistant</div>', '<div class="chp2">تطبیق‌یافته با اهداف شما توسط دستیارتان</div>'],
  ['<h3>Find specialists</h3>', '<h3>یافتن متخصصان</h3>'],
  ['<p>Ranked matches by goal, availability and fit.</p>', '<p>تطبیق‌های رتبه‌بندی‌شده بر اساس هدف و زمان آزاد و تناسب.</p>'],

  // ---- traction (engineering proof) — numeric tokens identical ----
  ['<div class="k rv">Engineering proof</div>', '<div class="k rv">اثبات مهندسی</div>'],
  ['Not a pitch on paper. <span class="gt">A platform in production.</span>',
   'ادعا روی کاغذ نیست. <span class="gt">یک پلتفرم در پروداکشن است.</span>'],
  ['<p class="lead rv">Measured directly from the codebase on 15 Oct 2026. Product identity and features are shared under NDA at the reveal session.</p>',
   '<p class="lead rv">اندازه‌گیری‌شده مستقیماً از کدبیس در 15 اکتبر 2026. هویت محصول و فیچرها تحت NDA در نشست رونمایی به اشتراک گذاشته می‌شود.</p>'],
  ['<span>Lines of TypeScript, 685 files</span>', '<span>خط TypeScript در 685 فایل</span>'],
  ['<span>API services</span>', '<span>سرویس API</span>'],
  ['<span>Data models, dev/prod parity</span>', '<span>مدل داده · پاریتی dev/prod</span>'],
  ['<span>Automated tests, 0 failures</span>', '<span>تست خودکار · 0 شکست</span>'],
  ['<span>Languages, full RTL, 100% parity</span>', '<span>زبان · RTL کامل · پاریتی 100%</span>'],
  ['<span>Signed Android releases</span>', '<span>ریلیز امضاشدهٔ اندروید</span>'],
  ['"Live in production",', '"زنده در پروداکشن",'],
  ['"Web platform deployed on real infrastructure with automated health checks."', '"پلتفرم وب روی زیرساخت واقعی مستقر است با چک سلامت خودکار."'],
  ['"Native Android",', '"اندروید نیتیو",'],
  ['"Native Kotlin app with zero third-party SDKs and secure device-bound sign-in."', '"اپ Kotlin نیتیو با صفر SDK شخص‌ثالث و ورود امن متصل به دستگاه."'],
  ['"Two AI engines",', '"دو موتور هوش مصنوعی",'],
  ['"Independent engines with tested failover, spend caps and encrypted credentials."', '"دو موتور مستقل با failover آزمایش‌شده و سقف هزینه و رمزنگاری credentials."'],
  ['"Security first",', '"امنیت اول",'],
  ['"Role-based access, tenant isolation, audit trails and a binary-level leak audit with zero findings."', '"دسترسی نقش‌محور و ایزوله‌سازی tenant و لاگ حسابرسی و ممیزی نشت باینری با صفر یافته."'],
  ['"Disciplined delivery",', '"تحویل منضبط",'],
  ['"Hard CI gates and 27 additive migrations; nothing ships unless lint, types and tests pass."', '"دروازه‌های سخت CI و 27 مهاجرت افزایدنی؛ هیچ چیز بدون پاس شدن lint و تایپ و تست منتشر نمی‌شود."'],

  // ---- demo ----
  ['See it work, <span class="gt">not just read about it.</span>', 'کارکردنش را ببینید <span class="gt">نه فقط درباره‌اش بخوانید.</span>'],
  ['<p class="lead rv">The MVP is built and running in production. We show it live, with the real product, to qualified investors.</p>',
   '<p class="lead rv">MVP ساخته شده و در پروداکشن اجرا می‌شود. آن را به‌صورت زنده و با محصول واقعی به سرمایه‌گذاران واجد شرایط نشان می‌دهیم.</p>'],
  ['"Intro and NDA",', '"معارفه و NDA",'],
  ['"Short call. We align on scope and sign an NDA."', '"تماس کوتاه. دامنه را هم‌راستا می‌کنیم و NDA امضا می‌شود."'],
  ['"Live MVP walkthrough",', '"نمایش زندهٔ MVP",'],
  ['"Product identity, features and both assistants shown on the real build."', '"هویت محصول و فیچرها و هر دو دستیار روی بیلد واقعی نشان داده می‌شود."'],
  ['"Technical deep-dive",', '"عمق فنی",'],
  ['"Architecture, security, metrics and the 5-phase plan with the team."', '"معماری و امنیت و متریک‌ها و برنامهٔ 5 فازی همراه تیم."'],
  ['>Request the live MVP demo <span class="ar">→</span></a>', '>درخواست دموی زندهٔ MVP <span class="ar">←</span></a>'],

  // ---- market ----
  ['<div class="k rv">Market</div>', '<div class="k rv">بازار</div>'],
  ['A <span class="gt">$6.8 trillion</span> market with no unified leader.', 'بازار <span class="gt">6.8 تریلیون دلاری</span> بدون رهبر یکپارچه.'],
  ['<p class="lead rv">People already spend heavily on wellness, but the tools are fragmented by category. The first platform to combine personal AI, real specialists and commerce can own the daily health habit.</p>',
   '<p class="lead rv">مردم هم‌اکنون خرج سنگینی برای سلامت می‌کنند اما ابزارها بر اساس دسته پراکنده‌اند. اولین پلتفرمی که هوش مصنوعی شخصی و متخصصان واقعی و تجارت را ترکیب کند می‌تواند عادت روزانهٔ سلامت را در اختیار بگیرد.</p>'],
  ['"Global wellness economy",', '"اقتصاد جهانی سلامت",'],
  ['"2024 size, up 7.9% year on year. Larger than sports, tourism and pharmaceuticals."', '"اندازهٔ 2024 با رشد 7.9% سالانه. بزرگ‌تر از ورزش و گردشگری و دارو."'],
  ['"Projected by 2029",', '"پیش‌بینی تا 2029",'],
  ['"About 7.6% annual growth, well above projected global GDP growth."', '"رشد سالانه حدود 7.6% به‌مراتب بالاتر از رشد پیش‌بینی‌شدهٔ GDP جهانی."'],
  ['"North America",', '"آمریکای شمالی",'],
  ['"The largest region, ahead of Asia-Pacific ($2.0T) and Europe ($1.7T)."', '"بزرگ‌ترین منطقه؛ جلوتر از آسیا-اقیانوسیه ($2.0T) و اروپا ($1.7T)."'],
  ['"Why now","Four tailwinds",', '"چرا حالا","چهار باد موافق",'],
  ['"Prevention over cure, subscription habit, mature AI and near-universal mobile reach."', '"پیشگیری به‌جای درمان و عادت اشتراک و هوش مصنوعی بالغ و دسترسی موبایل تقریباً همگانی."'],
  ['<small class="n rv">Source: Global Wellness Institute, Global Wellness Economy Monitor 2025.</small>',
   '<small class="n rv">منبع: Global Wellness Institute · Global Wellness Economy Monitor 2025.</small>'],
  ['"Subscription-ready",', '"آمادهٔ اشتراک",'],
  ['"US users already pay monthly for wellness apps and services."', '"کاربران آمریکا همین حالا ماهانه برای اپ‌ها و سرویس‌های سلامت پرداخت می‌کنند."'],
  ['"Global headroom",', '"ظرفیت جهانی",'],
  ['"Europe, MENA, Asia and LatAm: high mobile reach and low saturation, served by 4 launch languages with full RTL."',
   '"اروپا و MENA و آسیا و آمریکای لاتین: دسترسی موبایل بالا و اشباع پایین؛ با 4 زبان عرضه و RTL کامل پوشش داده می‌شود."'],
  ['"Why we are in",', '"چرا وارد این میدان شدیم",'],
  ['"[Founding story, one honest sentence]. AI plus human experts in one place is rarely done."',
   '"[Founding story, one honest sentence]. هوش مصنوعی به‌همراه متخصصان انسانی در یک جا به‌ندرت دیده می‌شود."'],

  // ---- compare ----
  ['<div class="k rv">Competitive landscape</div>', '<div class="k rv">چشم‌انداز رقابتی</div>'],
  ['Strong players, <span class="gt">each solving one slice.</span>', 'بازیگران قدرتمندی که <span class="gt">هر کدام فقط یک بخش را حل می‌کنند.</span>'],
  ['<th class="l">Category</th>', '<th class="l">دسته</th>'],
  ['<th class="l">Examples</th>', '<th class="l">نمونه‌ها</th>'],
  ['<th class="l">What they do well</th>', '<th class="l">نقطهٔ قوت</th>'],
  ['<th class="l">The gap</th>', '<th class="l">شکاف</th>'],
  ['<td class="l">Nutrition and fitness tracking</td>', '<td class="l">ردیابی تغذیه و تناسب اندام</td>'],
  ['<td class="l">MyFitnessPal, Lifesum</td>', '<td class="l">MyFitnessPal · Lifesum</td>'],
  ['<td class="l">Logging, habit data</td>', '<td class="l">ثبت داده و عادت</td>'],
  ['<td class="l">Mostly self-service, limited personal guidance</td>', '<td class="l">عمدتاً خودخدمتی؛ راهنمای شخصی محدود</td>'],
  ['<td class="l">Coaching and weight management</td>', '<td class="l">کوچینگ و مدیریت وزن</td>'],
  ['<td class="l">Behavior coaching</td>', '<td class="l">کوچینگ رفتاری</td>'],
  ['<td class="l">Narrow focus, one goal</td>', '<td class="l">تمرکز باریک و یک هدف</td>'],
  ['<td class="l">Mental wellness</td>', '<td class="l">سلامت روان</td>'],
  ['<td class="l">Calm, Headspace</td>', '<td class="l">Calm · Headspace</td>'],
  ['<td class="l">Content and mindfulness</td>', '<td class="l">محتوا و ذهن‌آگاهی</td>'],
  ['<td class="l">One dimension, little expert access</td>', '<td class="l">یک بُعد؛ دسترسی اندک به متخصص</td>'],
  ['<td class="l">Wearables</td>', '<td class="l">گجت‌های پوشیدنی</td>'],
  ['<td class="l">WHOOP, Oura, Fitbit</td>', '<td class="l">WHOOP · Oura · Fitbit</td>'],
  ['<td class="l">Biometrics</td>', '<td class="l">بیومتریکس</td>'],
  ['<td class="l">Hardware dependent, weak action layer</td>', '<td class="l">وابسته به سخت‌افزار؛ لایهٔ اقدام ضعیف</td>'],
  ['<td class="l">Telehealth</td>', '<td class="l">درمان از راه دور</td>'],
  ['<td class="l">Teladoc, Amwell</td>', '<td class="l">Teladoc · Amwell</td>'],
  ['<td class="l">Clinician access</td>', '<td class="l">دسترسی به درمانگر</td>'],
  ['<td class="l">Reactive care, not daily guidance</td>', '<td class="l">مراقبت واکنشی؛ نه راهنمای روزانه</td>'],
  ['<td class="l">Us</td>', '<td class="l">ما</td>'],
  ['<td class="l">AI assistants + specialists + marketplace</td>', '<td class="l">دستیارهای AI + متخصصان + بازارچه</td>'],
  ['<td class="l">One platform for the whole journey</td>', '<td class="l">یک پلتفرم برای کل مسیر</td>'],
  ['<h3 class="rv" style="margin:46px 0 0;font:700 22px \'Space Grotesk\'">Capability coverage</h3>',
   '<h3 class="rv" style="margin:46px 0 0;font:700 22px Vazirmatn,\'Space Grotesk\'">پوشش قابلیت‌ها</h3>'],
  ['<th>AI personalization</th>', '<th>شخصی‌سازی AI</th>'],
  ['<th>Live specialists</th>', '<th>متخصص زنده</th>'],
  ['<th>Whole-health scope</th>', '<th>دامنهٔ کل سلامت</th>'],
  ['<th>Marketplace</th>', '<th>بازارچه</th>'],
  ['<th>Device integration</th>', '<th>یکپارچگی دستگاه‌ها</th>'],
  ['<th>Multilingual + RTL</th>', '<th>چندزبانه + RTL</th>'],
  ['<td class="l">Vivora (MVP + roadmap)</td>', '<td class="l">Vivora (MVP + نقشه راه)</td>'],
  ['<small class="n rv">● strong · ◐ partial or planned · ○ limited. Our assessment of category tendencies from public positioning; individual products vary. Verify before external distribution.</small>',
   '<small class="n rv">● قوی · ◐ جزئی یا برنامه‌ریزی‌شده · ○ محدود. ارزیابی ما از گرایش دسته‌ها بر اساس جایگاه عمومی؛ محصولات فردی متفاوت‌اند. پیش از انتشار بیرونی راستی‌آزمایی کنید.</small>'],

  // ---- moat ----
  ['<div class="k rv">Defensibility</div>', '<div class="k rv">مزیت دفاعی</div>'],
  ['Why this is <span class="gt">hard to copy.</span>', 'چرا کپی‌کردنش <span class="gt">سخت است.</span>'],
  ['"Data flywheel",', '"چرخ‌لنگر داده",'],
  ['"Every interaction sharpens personalization across all assistants."', '"هر تعامل شخصی‌سازی را در همهٔ دستیارها تیزتر می‌کند."'],
  ['"Two-sided network",', '"شبکهٔ دوطرفه",'],
  ['"Users and specialists attract each other."', '"کاربران و متخصصان یکدیگر را جذب می‌کنند."'],
  ['"Full-stack ownership",', '"مالکیت فول‌استک",'],
  ['"Own stack, zero third-party SDKs in the native app and our own release pipeline."', '"استک خودمان و صفر SDK شخص‌ثالث در اپ نیتیو و خط لولهٔ ریلیز خودمان."'],
  ['"Privacy by design",', '"حریم خصوصی از مبنا",'],
  ['"Role-based access, tenant isolation and encrypted credentials. Compliance scope: [HIPAA / GDPR roadmap]."',
   '"دسترسی نقش‌محور و ایزوله‌سازی tenant و رمزنگاری credentials. دامنهٔ انطباق: [HIPAA / GDPR roadmap]."'],
  ['"Global from day one",', '"جهانی از روز اول",'],
  ['"Four languages with 100 percent string parity and right-to-left support."', '"چهار زبان با پاریتی 100 درصد عبارت‌ها و پشتیبانی راست‌به‌چپ."'],

  // ---- model ----
  ['<div class="k rv">Business model</div>', '<div class="k rv">مدل کسب‌وکار</div>'],
  ['Multiple, <span class="gt">compounding</span> revenue streams.', 'جریان‌های درآمدی متعدد و <span class="gt">مضاعف‌شونده.</span>'],
  ['"In-app packages",', '"بسته‌های درون‌اپ",'],
  ['"One-time purchases of programs and services."', '"خرید یک‌بارهٔ برنامه‌ها و سرویس‌ها."'],
  ['"Subscriptions","Monthly, 3, 6 and 12-month plans."', '"اشتراک‌ها","پلن‌های ماهانه و 3 و 6 و 12 ماهه."'],
  ['"Premium services",', '"سرویس‌های پرمیوم",'],
  ['"Exclusive services delivered inside the app."', '"سرویس‌های اختصاصی داخل اپ."'],
  ['"Specialist commission",', '"کمیسیون متخصصان",'],
  ['"Revenue share on expert sessions."', '"تقسیم درآمد روی جلسات متخصصان."'],
  ['"Marketplace","Health & wellness products, from phase 2."', '"بازارچه","محصولات سلامت و تندرستی؛ از فاز 2."'],

  // ---- calc ----
  ['<div class="k rv">Unit economics</div>', '<div class="k rv">اقتصاد واحد</div>'],
  ['Run the numbers <span class="gt">yourself.</span>', 'اعداد را <span class="gt">خودتان محاسبه کنید.</span>'],
  ['<p class="lead rv">Defaults follow our planned prices and first-stage cost estimates. They are scenarios to be validated with real conversion, retention and cost data, not forecasts.</p>',
   '<p class="lead rv">مقدارهای پیش‌فرض از قیمت‌های برنامه‌ریزی‌شده و برآورد هزینهٔ مرحلهٔ اول ما پیروی می‌کنند. این‌ها سناریوهایی برای اعتبارسنجی با دادهٔ واقعی تبدیل و ماندگاری و هزینه‌اند؛ نه پیش‌بینی.</p>'],
  ['<label>Registered users <b id="o_u"></b></label>', '<label>کاربران ثبت‌نام‌شده <b id="o_u"></b></label>'],
  ['<label>Paid conversion <b id="o_c"></b></label>', '<label>تبدیل به پرداخت <b id="o_c"></b></label>'],
  ['<label>Realized revenue per paying user, per year <b id="o_p"></b></label>', '<label>درآمد محقق‌شدهٔ سالانه هر کاربر پرداخت‌کننده <b id="o_p"></b></label>'],
  ['<label>Ads and other revenue per user, per year <b id="o_s"></b></label>', '<label>درآمد تبلیغات و سایر · سالانه هر کاربر <b id="o_s"></b></label>'],
  ['<label>Referral effect K <b id="o_k"></b></label>', '<label>اثر ارجاع K <b id="o_k"></b></label>'],
  ['<label>Paid acquisition cost per install <b id="o_a"></b></label>', '<label>هزینهٔ جذب پرداختی هر نصب <b id="o_a"></b></label>'],
  ['<label>Operating cost per month <b id="o_x"></b></label>', '<label>هزینهٔ عملیاتی ماهانه <b id="o_x"></b></label>'],
  ['<small class="n">Planned plans: $9 monthly, $19 for 3 months, $79 annual. Churn fixed at 6 percent per month for LTV. Excludes app-store fees, payment fees, taxes and refunds.</small>',
   '<small class="n">پلن‌های برنامه‌ریزی‌شده: ماهانه $9 و 3 ماهه $19 و سالانه $79. نرخ ریزش برای LTV ثابت 6 درصد در ماه در نظر گرفته شده است. کارمزد استور و کارمزد پرداخت و مالیات و بازگشت وجه لحاظ نشده است.</small>'],
  ['<small>Annual revenue</small>', '<small>درآمد سالانه</small>'],
  ['<small>Subscriptions</small>', '<small>اشتراک‌ها</small>'],
  ['<small>Ads and other</small>', '<small>تبلیغات و سایر</small>'],
  ['<span>Month 0</span><span>Month 6</span><span>Month 12 · scenario</span>',
   '<span>ماه 0</span><span>ماه 6</span><span>ماه 12 · سناریو</span>'],
  ['<small>Effective CAC per install</small>', '<small>CAC مؤثر هر نصب</small>'],
  ['<small>Payback</small>', '<small>بازگشت سرمایه</small>'],
  ['<small>Operating cost / year</small>', '<small>هزینهٔ عملیاتی / سال</small>'],
  ['<small>Acquisition spend</small>', '<small>هزینهٔ جذب</small>'],
  ['<small>Illustrative surplus</small>', '<small>مازاد تخمینی</small>'],
  ['<span>Per-user view ($20 to $50)</span>', '<span>دید ارزش هر کاربر ($20 تا $50)</span>'],
  ['<span>Revenue multiple view (4x to 8x)</span>', '<span>دید ضریب درآمد (4x تا 8x)</span>'],
  ['<h3>Illustrative 100,000-user scenario</h3>', '<h3>سناریوی تخمینی 100,000 کاربر</h3>'],
  ['<span>2% paid</span><i style="width:20%"></i>', '<span>2% پرداخت‌کننده</span><i style="width:20%"></i>'],
  ['<span>5% paid</span><i style="width:50%"></i>', '<span>5% پرداخت‌کننده</span><i style="width:50%"></i>'],
  ['<span>10% paid</span><i style="width:100%"></i>', '<span>10% پرداخت‌کننده</span><i style="width:100%"></i>'],
  ['<p>At 5 percent conversion and $60 realized per paying user: 5,000 paying users and about $25K per month. With $24K to $96K annual operating cost and about $50K acquisition at $0.50 per user, the surplus before fees, taxes and refunds is roughly $154K to $226K. A reliable break-even needs measured conversion, retention, AI cost per active user and full acquisition cost.</p>',
   '<p>با تبدیل 5 درصد و $60 محقق‌شده از هر کاربر پرداخت‌کننده: 5,000 کاربر پرداخت‌کننده و حدود $25K در ماه. با هزینهٔ عملیاتی سالانه $24K تا $96K و حدود $50K برای جذب با نرخ $0.50 برای هر کاربر؛ مازاد پیش از کارمزد و مالیات و بازگشت وجه تقریباً $154K تا $226K است. یک سر‌به‌سر قابل‌اعتماد به تبدیل و ماندگاری و هزینهٔ AI هر کاربر فعال و هزینهٔ کامل جذبِ اندازه‌گیری‌شده نیاز دارد.</p>'],

  // ---- growth ----
  ['Built to <span class="gt">spread itself.</span>', 'ساخته‌شده برای <span class="gt">خودگسترده‌شدن.</span>'],
  ['<p class="lead rv">Viral mechanics are native to the product, lowering acquisition cost while volume compounds.</p>',
   '<p class="lead rv">مکانیک‌های وایرال در خود محصول تعبیه شده‌اند؛ هزینهٔ جذب را پایین می‌آورند در حالی که حجم مضاعف می‌شود.</p>'],
  ['<span>Users in 3 months</span>', '<span>کاربر در 3 ماه</span>'],
  ['<span>Invites per user, design target</span>', '<span>دعوت از هر کاربر · هدف طراحی</span>'],
  ['<th>Users</th>', '<th>کاربران</th>'],
  ['<th>@ $20 / user</th>', '<th>@ $20 / کاربر</th>'],
  ['<th>@ $50 / user</th>', '<th>@ $50 / کاربر</th>'],
  ['<p class="rv" style="color:var(--mu);font-size:13px;margin-top:10px">Illustrative potential value, not a current valuation. Per-user value depends on retention and ARPU.</p>',
   '<p class="rv" style="color:var(--mu);font-size:13px;margin-top:10px">ارزش بالقوهٔ تخمینی؛ نه ارزش‌گذاری فعلی. ارزش هر کاربر به ماندگاری و ARPU بستگی دارد.</p>'],

  // ---- family (concept screens) ----
  ['<div class="k rv">Concept screens</div>', '<div class="k rv">نماهای مفهومی</div>'],
  ['One platform, <span class="gt">every member of the family.</span>', 'یک پلتفرم <span class="gt">برای هر عضو خانواده.</span>'],
  ['<p class="lead rv">Roadmap concepts for seniors, mothers, children and connected devices. They show where the same engine goes next; the final UI and feature set may differ.</p>',
   '<p class="lead rv">مفاهیم نقشه راه برای سالمندان و مادران و کودکان و دستگاه‌های متصل. نشان می‌دهند همان موتور بعداً کجا می‌رود؛ UI و فهرست فیچرهای نهایی ممکن است متفاوت باشد.</p>'],
  // senior
  ['<small>Senior care</small><h4>Today</h4>', '<small>مراقبت از سالمند</small><h4>امروز</h4>'],
  ['<span class="tg g">Safe</span>', '<span class="tg g">ایمن</span>'],
  ['<small>Blood pressure · 7 days</small>', '<small>فشار خون · 7 روز</small>'],
  ['<small>Mobility</small>', '<small>تحرک</small>'],
  ['<small>Medication</small>', '<small>دارو</small>'],
  ['<small>Next: 8 PM</small>', '<small>بعدی: 8 شب</small>'],
  ['<b>3,120</b><small>steps</small>', '<b>3,120</b><small>قدم</small>'],
  ['<b>7h</b><small>sleep</small>', '<b>7 ساعت</b><small>خواب</small>'],
  ['<b>96%</b><small>adherence</small>', '<b>96%</b><small>پایبندی</small>'],
  ['<div class="chp2">Fall detection active</div>', '<div class="chp2">تشخیص سقوط فعال است</div>'],
  ['<h3>Senior care</h3>', '<h3>مراقبت از سالمند</h3>'],
  ['<p>Vitals trends, mobility, medication and safety.</p>', '<p>روند علائم حیاتی و تحرک و دارو و ایمنی.</p>'],
  // mother
  ['<small>Mother care</small><h4>Week 24</h4>', '<small>مراقبت از مادر</small><h4>هفتهٔ 24</h4>'],
  ['<span class="tg">2nd trimester</span>', '<span class="tg">تریمستر دوم</span>'],
  ['>of 40 weeks</text>', '>از 40 هفته</text>'],
  ['<small>Energy</small>', '<small>انرژی</small>'],
  ['<small>Mood</small>', '<small>روحیه</small>'],
  ['<small>Rest</small>', '<small>استراحت</small>'],
  ['<b>1.8L</b><small>water</small>', '<b>1.8L</b><small>آب</small>'],
  ['<b>12</b><small>kicks/h</small>', '<b>12</b><small>لگد در ساعت</small>'],
  ['<b>7h</b><small>rest</small>', '<b>7 ساعت</b><small>استراحت</small>'],
  ['<div class="chp2">Next check-up in 5 days</div>', '<div class="chp2">ویزیت بعدی 5 روز دیگر</div>'],
  ['<h3>Mother care</h3>', '<h3>مراقبت از مادر</h3>'],
  ['<p>Pregnancy progress, wellbeing trends and check-ups.</p>', '<p>پیشرفت بارداری و روند سلامت و ویزیت‌ها.</p>'],
  // child
  ['<small>Child growth</small><h4>Sam · 6 yrs</h4>', '<small>رشد کودک</small><h4>سام · 6 ساله</h4>'],
  ['<span class="tg g">On track</span>', '<span class="tg g">در مسیر نرمال</span>'],
  ['<small>Growth curve</small>', '<small>منحنی رشد</small>'],
  ['</i>Sleep<b>10h</b>', '</i>خواب<b>10 ساعت</b>'],
  ['</i>Play<b>5h</b>', '</i>بازی<b>5 ساعت</b>'],
  ['</i>Screen<b>1.5h</b>', '</i>صفحه<b>1.5 ساعت</b>'],
  ['</i>School<b>6h</b>', '</i>مدرسه<b>6 ساعت</b>'],
  ['<b>118</b><small>cm</small>', '<b>118</b><small>سانتی‌متر</small>'],
  ['<b>21</b><small>kg</small>', '<b>21</b><small>کیلوگرم</small>'],
  ['<b>9.2k</b><small>steps</small>', '<b>9.2k</b><small>قدم</small>'],
  ['<div class="chp2">5 day activity streak ★★★★★</div>', '<div class="chp2">5 روز فعالیت پیوسته ★★★★★</div>'],
  ['<h3>Child growth</h3>', '<h3>رشد کودک</h3>'],
  ['<p>Growth percentiles, daily balance and activity.</p>', '<p>صدک‌های رشد و تعادل روزانه و فعالیت.</p>'],
  // devices
  ['<small>Devices</small><h4>Connected</h4>', '<small>دستگاه‌ها</small><h4>متصل</h4>'],
  ['<span class="tg g">4 synced</span>', '<span class="tg g">4 همگام</span>'],
  ['</i>Smartwatch<b>82%</b>', '</i>ساعت هوشمند<b>82%</b>'],
  ['</i>Smart scale<b>synced</b>', '</i>ترازوی هوشمند<b>همگام</b>'],
  ['</i>BP monitor<b>2m ago</b>', '</i>فشارسنج<b>2 دقیقه پیش</b>'],
  ['</i>Smart ring<b>91%</b>', '</i>حلقه هوشمند<b>91%</b>'],
  ['<small>Sleep stages · last night</small>', '<small>مراحل خواب · دیشب</small>'],
  ['<span>Deep</span><span>Light</span><span>REM</span><span>Awake</span>',
   '<span>عمیق</span><span>سبک</span><span>REM</span><span>بیدار</span>'],
  ['<b>7h 40m</b><small>sleep</small>', '<b>7 ساعت 40 دقیقه</b><small>خواب</small>'],
  ['<span class="pd"></span>Real-time sync · 4 devices</div>', '<span class="pd"></span>همگام‌سازی زنده · 4 دستگاه</div>'],
  ['<h3>Smart devices</h3>', '<h3>دستگاه‌های هوشمند</h3>'],
  ['<p>Watch, scale, ring and monitors in one live view.</p>', '<p>ساعت و ترازو و حلقه و مانیتورها در یک نمای زنده.</p>'],

  // ---- roadmap ----
  ['<div class="k rv">Roadmap</div>', '<div class="k rv">نقشه راه</div>'],
  ['Five phases, <span class="gt">capital-efficient.</span>', 'پنج فاز <span class="gt">با سرمایهٔ بهینه.</span>'],
  ['<p class="lead rv">Phase 1 is underway. Phases 2–5 are staged within a year and unlock as each stage proves traction.</p>',
   '<p class="lead rv">فاز 1 در جریان است. فازهای 2 تا 5 ظرف یک سال پله‌پله فعال می‌شوند؛ هر مرحله با اثبات کشش باز می‌شود.</p>'],
  ['"Phase 1","Core platform built and live in production.",', '"فاز 1","پلتفرم اصلی ساخته شده و در پروداکشن زنده است.",'],
  ['"Phase 2","Wellness marketplace launch."', '"فاز 2","راه‌اندازی بازارچهٔ سلامت."'],
  ['"Phase 3","Deeper personalization."', '"فاز 3","شخصی‌سازی عمیق‌تر."'],
  ['"Phase 4","Specialist tooling at scale."', '"فاز 4","ابزار متخصصان در مقیاس."'],
  ['"Phase 5","Full super-app ecosystem."', '"فاز 5","اکوسیستم کامل ابر اپ."'],

  // ---- funds + team ----
  ['<div class="k rv">Use of funds and team</div>', '<div class="k rv">استفاده از سرمایه و تیم</div>'],
  ['Where the round <span class="gt">goes.</span>', 'سرمایه <span class="gt">کجا می‌رود.</span>'],
  ['"[ ]%","Product and assistants","Assistants 3 to 10 and phases 2 to 5."', '"[ ]%","محصول و دستیارها","دستیارهای 3 تا 10 و فازهای 2 تا 5."'],
  ['"[ ]%","Growth","Viral loops, launches and user acquisition."', '"[ ]%","رشد","حلقه‌های وایرال و لانچ‌ها و جذب کاربر."'],
  ['"[ ]%","Team","Engineering, specialists network and operations."', '"[ ]%","تیم","مهندسی و شبکهٔ متخصصان و عملیات."'],
  ['"[ ]%","Security and compliance","Audits and regulatory readiness."', '"[ ]%","امنیت و انطباق","ممیزی‌ها و آمادگی مقرراتی."'],
  ['"Founder and designer · Mehrdad.ir"', '"بنیانگذار و طراح · Mehrdad.ir"'],

  // ---- CTA ----
  ['<div class="k">The round</div>', '<div class="k">دور سرمایه‌گذاری</div>'],
  ['Raising <span class="gt">[$X]</span> for <span class="gt">[Y%]</span>.', 'جذب <span class="gt">[$X]</span> در ازای <span class="gt">[Y%]</span>.'],
  ['<p class="lead" style="margin-bottom:30px">Funds go to product build-out, growth and team. Join us at the start of the five-phase journey.</p>',
   '<p class="lead" style="margin-bottom:30px">سرمایه صرف تکمیل محصول و رشد و تیم می‌شود. در آغاز مسیر پنج‌فازی همراه ما باشید.</p>'],
  ['>See the MVP live <span class="ar">→</span></a>', '>دیدن زندهٔ MVP <span class="ar">←</span></a>'],
  ['>Back to top</a>', '>بازگشت به بالا</a>'],

  // ---- founder ----
  ['<div class="k">Founder and designer</div>', '<div class="k">بنیانگذار و طراح</div>'],
  ['Let us build this <span class="gt">together.</span>', 'بیایید این را <span class="gt">با هم بسازیم.</span>'],
  ['<p class="lead" style="margin:0 auto 28px">For questions, a private walkthrough or to talk about the round, reach me directly.</p>',
   '<p class="lead" style="margin:0 auto 28px">برای سؤال و نمایش اختصاصی یا صحبت دربارهٔ دور سرمایه‌گذاری مستقیم با من در تماس باشید.</p>'],
  ['>Visit Mehrdad.ir <span class="ar">↗</span></a>', '>بازدید از Mehrdad.ir <span class="ar">↗</span></a>'],

  // ---- footer ----
  ['© Vivora · Health & Wellness Super App · “Vivora” is a temporary working title ·',
   '© Vivora · ابر اپلیکیشن سلامت و تندرستی · “Vivora” عنوان موقت است ·'],

  // ---- JS visible strings ----
  ["'<span class=\"tag\">LIVE</span>'", "'<span class=\"tag\">فعال</span>'"],
  ["+' mo'", "+' ماه'"],
  ["' to '", "' تا '"],
];

// ---- apply + report ---------------------------------------------------------
let fa = en;
const missing = [];
let total = 0;
for (const [from, to] of R) {
  const n = fa.split(from).length - 1;
  if (n === 0) { missing.push(from); continue; }
  total += n;
  fa = fa.split(from).join(to);
}
if (missing.length) {
  console.error('MISSING TARGETS (' + missing.length + '):');
  for (const m of missing) console.error('  - ' + JSON.stringify(m.slice(0, 120)));
  process.exit(1);
}

// ---- assertions -------------------------------------------------------------
const assert = (cond, msg) => { if (!cond) { console.error('ASSERT FAIL: ' + msg); process.exit(1); } };
assert(!fa.includes('،'), 'FA must not contain the Persian comma «،»');
assert(fa.includes('dir="rtl"'), 'FA must be dir=rtl');
assert(fa.includes('lang="fa"'), 'FA must be lang=fa');
assert(fa.includes('Vazirmatn'), 'FA must load Vazirmatn');
assert(fa.includes('[$X]') && fa.includes('[Y%]') && fa.includes('[CTO]') && fa.includes('[Medical advisor]') && fa.includes('[One line of relevant experience]') && fa.includes('[Founding story, one honest sentence]') && fa.includes('[HIPAA / GDPR roadmap]') && fa.includes('[ ]%'), 'placeholders must stay verbatim');
assert(!fa.includes('WORKING TITLE'), 'EN nav pill must be translated');
assert(fa.split('<section').length === en.split('<section').length, 'section count must match');
assert(fa.split('data-r=').length === en.split('data-r=').length, 'data-r count must match');
assert(fa.split('data-c=').length === en.split('data-c=').length, 'data-c count must match');
for (const token of ['149962','303','147','1139','$6.8T','$9.8T','$2.3T','100,000','1,000,000','$2M','$5M','$20M','$50M','$120K','$300K','$600K','8,420','9:41','$9','$19','$79']) {
  assert(fa.includes(token), 'numeric token must survive: ' + token);
}
assert(!fa.includes('Lines of TypeScript'), 'EN stat label must be translated');

console.log('OK: ' + R.length + ' replacements applied (' + total + ' occurrences). FA length=' + fa.length + ' EN length=' + en.length);

// ---- write generated modules -------------------------------------------------
writeFileSync('src/app/deck/health/landing-en.ts',
  '// GENERATED FILE — byte-exact copy of the owner\'s final upload\n' +
  '// (health-superapp-landing-en (1).html). The EN version ships VERBATIM —\n' +
  '// never hand-edit this file. Regenerate via: bun scripts/build-health-landing.mjs\n' +
  'export const LANDING_EN = ' + JSON.stringify(en) + ';\n');

writeFileSync('src/app/deck/health/landing-fa.ts',
  '// GENERATED FILE — Persian mirror of the owner\'s final landing, built by\n' +
  '// scripts/build-health-landing.mjs from the same uploaded bytes: identical\n' +
  '// design/fonts/layout، translated strings، dir=rtl، Vazirmatn added only for\n' +
  '// Persian glyphs، placeholder slots verbatim، numeric tokens identical،\n' +
  '// and zero Persian comma «،» (standing rule). Never hand-edit.\n' +
  'export const LANDING_FA = ' + JSON.stringify(fa) + ';\n');

console.log('WROTE src/app/deck/health/landing-en.ts + landing-fa.ts');
