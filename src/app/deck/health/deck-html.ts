// Health & Wellness investor deck — standalone HTML surface.
//
// Owner order 2026-10-13: the owner supplied a single-file HTML deck and
// ordered it shown EXACTLY as delivered («دقیق می خواهیم همینو نشون بدهیم نه
// اینکه تو قالب وب سایت بره») — outside the site template — and bilingual
// («دو زبان قرار بده»), with the English address /deck/health reserved in
// D-034. The owner also said their own edits to the deck are NOT done yet
// («تغییرات را هنوز انجام ندادیم») — so every placeholder slot in the file
// ([Brand], [$X], [Y%], [K], [figure + source], [Founding story],
// [% complete / current stage], [prototype / alpha / beta],
// [waitlist or sign-ups]) is kept VERBATIM in both languages. No numbers are
// invented: every figure comes from the owner's file; the FA version only
// translates labels (numeric tokens stay identical). Per standing rule the
// FA copy never uses the Persian comma «،».
//
// Served by:
//   src/app/deck/health/route.ts    -> EN (default, /deck/health)
//   src/app/deck/health/fa/route.ts -> FA (/deck/health/fa)

export type HealthDeckLang = 'en' | 'fa';

interface DeckStrings {
  htmlOpen: string;
  fontsHref: string;
  title: string;
  toggleLabel: string;
  toggleHref: string;
  nav: [string, string, string, string, string, string];
  invest: string;
  arrow: string;
  eyebrow: string;
  h1: string;
  lead: string;
  cta1: string;
  cta2: string;
  statPhases: string;
  statAssistants: string;
  statUsers12: string;
  kProblem: string;
  h2Problem: string;
  leadProblem: string;
  kSolution: string;
  h2Solution: string;
  kProduct: string;
  h2Product: string;
  leadProduct: string;
  requestDemo: string;
  scrHello: string;
  scrPlan: string;
  scrSession: string;
  kMarket: string;
  h2Market: string;
  kModel: string;
  h2Model: string;
  kGrowth: string;
  h2Growth: string;
  leadGrowth: string;
  statUsers3: string;
  statK: string;
  thUsers: string;
  th20: string;
  th50: string;
  noteGrowth: string;
  kRoadmap: string;
  h2Roadmap: string;
  leadRoadmap: string;
  kTraction: string;
  h2Traction: string;
  kRound: string;
  h2Round: string;
  leadRound: string;
  ctaCall: string;
  ctaTop: string;
  footer: string;
  liveTag: string;
}

const EN: DeckStrings = {
  htmlOpen: '<html lang="en">',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=Space+Grotesk:wght@500;700&display=swap',
  title: '[Brand] — The Health & Wellness Super App',
  toggleLabel: 'فارسی',
  toggleHref: '/deck/health/fa',
  nav: ['Problem', 'Product', 'Market', 'Revenue', 'Growth', 'Roadmap'],
  invest: 'Invest',
  arrow: '→',
  eyebrow: 'Health & Wellness Super App · Seed Round Open',
  h1: 'One app for <span class="gt">every part of your health.</span>',
  lead: 'Two proprietary AI assistants, verified specialists and a wellness marketplace, unified in a single platform on iOS, Android and web.',
  cta1: 'Become an investor',
  cta2: 'Explore the product',
  statPhases: 'Product phases',
  statAssistants: 'AI assistants',
  statUsers12: 'Users in 12 months',
  kProblem: 'The problem',
  h2Problem: 'Health is scattered across <span class="gt">a dozen apps.</span>',
  leadProblem:
    'Users juggle separate tools for fitness, nutrition, sleep and care. Advice is generic, expert access is costly, and most people drop off within weeks.',
  kSolution: 'The solution',
  h2Solution: 'From data to action, <span class="gt">without leaving the app.</span>',
  kProduct: 'Product',
  h2Product: 'Built for <span class="gt">everyone.</span>',
  leadProduct:
    'A public-first platform: simple for individuals, powerful for specialists. Proprietary logic stays under NDA and is shown in due-diligence.',
  requestDemo: 'Request a demo',
  scrHello: 'Good morning! Ready for today?',
  scrPlan: "Today's plan",
  scrSession: 'Specialist session · 4:30 PM',
  kMarket: 'Market',
  h2Market: 'A large market, <span class="gt">no unified leader.</span>',
  kModel: 'Business model',
  h2Model: 'Multiple, <span class="gt">compounding</span> revenue streams.',
  kGrowth: 'Growth',
  h2Growth: 'Built to <span class="gt">spread itself.</span>',
  leadGrowth:
    'Viral mechanics are native to the product, lowering acquisition cost while volume compounds.',
  statUsers3: 'Users in 3 months',
  statK: 'Target viral coefficient',
  thUsers: 'Users',
  th20: '@ $20 / user',
  th50: '@ $50 / user',
  noteGrowth:
    'Illustrative potential value, not a current valuation. Per-user value depends on retention and ARPU.',
  kRoadmap: 'Roadmap',
  h2Roadmap: 'Five phases, <span class="gt">capital-efficient.</span>',
  leadRoadmap:
    'Phase 1 is underway. Phases 2–5 are staged within a year and unlock as each stage proves traction.',
  kTraction: 'Progress',
  h2Traction: 'What is <span class="gt">already built.</span>',
  kRound: 'The round',
  h2Round: 'Raising <span class="gt">[$X]</span> for <span class="gt">[Y%]</span>.',
  leadRound:
    'Funds go to product build-out, growth and team. Join us at the start of the five-phase journey.',
  ctaCall: 'Schedule an investor call',
  ctaTop: 'Back to top',
  footer: 'Health & Wellness Super App',
  liveTag: 'LIVE',
};

// FA copy rule: the Persian comma «،» is banned — lists use «و» / «؛» instead.
const FA: DeckStrings = {
  htmlOpen: '<html lang="fa" dir="rtl">',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=Space+Grotesk:wght@500;700&family=Vazirmatn:wght@400;500;600;700;800&display=swap',
  title: '[Brand] — سوپراپ سلامت و تندرستی',
  toggleLabel: 'EN',
  toggleHref: '/deck/health',
  nav: ['مسئله', 'محصول', 'بازار', 'درآمد', 'رشد', 'نقشهٔ راه'],
  invest: 'سرمایه‌گذاری',
  arrow: '←',
  eyebrow: 'سوپراپ سلامت و تندرستی · دور سرمایه‌گذاری اولیه باز است',
  h1: 'یک اپلیکیشن برای <span class="gt">هر بخش از سلامت شما.</span>',
  lead: 'دو دستیار هوش مصنوعی اختصاصی و متخصصان تأییدشده و بازارک سلامت؛ همه در یک پلتفرم واحد روی iOS و Android و وب.',
  cta1: 'سرمایه‌گذار شوید',
  cta2: 'محصول را ببینید',
  statPhases: 'فازهای محصول',
  statAssistants: 'دستیار هوش مصنوعی',
  statUsers12: 'کاربر در ۱۲ ماه',
  kProblem: 'مسئله',
  h2Problem: 'سلامت بین <span class="gt">دوجین اپلیکیشن</span> پراکنده است.',
  leadProblem:
    'کاربران برای تمرین و تغذیه و خواب و مراقبت از ابزارهای جداگانه استفاده می‌کنند. توصیه‌ها عمومی است. دسترسی به متخصص پرهزینه است و بیشتر افراد ظرف چند هفته رها می‌کنند.',
  kSolution: 'راه‌حل',
  h2Solution: 'از داده تا اقدام <span class="gt">بدون خروج از اپلیکیشن.</span>',
  kProduct: 'محصول',
  h2Product: 'ساخته‌شده برای <span class="gt">همه.</span>',
  leadProduct:
    'پلتفرمی با اولویت عموم: ساده برای افراد و قدرتمند برای متخصصان. منطق اختصاصی زیر NDA محفوظ می‌ماند و در فرایند بررسی دقیق نمایش داده می‌شود.',
  requestDemo: 'درخواست دمو',
  scrHello: 'صبح بخیر! آمادهٔ امروز هستی؟',
  scrPlan: 'برنامهٔ امروز',
  scrSession: 'جلسه با متخصص · ۱۶:۳۰',
  kMarket: 'بازار',
  h2Market: 'بازاری بزرگ <span class="gt">بدون رهبر یکپارچه.</span>',
  kModel: 'مدل کسب‌وکار',
  h2Model: 'جریان‌های درآمدی متنوع و <span class="gt">مرکب.</span>',
  kGrowth: 'رشد',
  h2Growth: 'ساخته‌شده برای <span class="gt">انتشار زنجیره‌ای.</span>',
  leadGrowth:
    'مکانیک ویروسی بخشی از خود محصول است و هزینهٔ جذب را کاهش می‌دهد در حالی که حجم به‌صورت مرکب رشد می‌کند.',
  statUsers3: 'کاربر در ۳ ماه',
  statK: 'ضریب ویروسی هدف',
  thUsers: 'کاربران',
  th20: 'با $20 به ازای هر کاربر',
  th50: 'با $50 به ازای هر کاربر',
  noteGrowth:
    'ارزش بالقوهٔ نمایشی است نه ارزش‌گذاری فعلی. ارزش هر کاربر به ماندگاری و ARPU بستگی دارد.',
  kRoadmap: 'نقشهٔ راه',
  h2Roadmap: 'پنج فاز با <span class="gt">هزینهٔ بهینه.</span>',
  leadRoadmap:
    'فاز 1 در جریان است. فازهای 2 تا 5 در طول یک سال چیده شده‌اند و با اثبات کشش هر مرحله فعال می‌شوند.',
  kTraction: 'پیشرفت',
  h2Traction: 'چه چیزهایی <span class="gt">از قبل ساخته شده.</span>',
  kRound: 'دور سرمایه‌گذاری',
  h2Round: 'جمع‌آوری <span class="gt">[$X]</span> در ازای <span class="gt">[Y%]</span>.',
  leadRound:
    'سرمایه صرف ساخت محصول و رشد و تیم می‌شود. در آغاز مسیر پنج‌فازی همراه ما باشید.',
  ctaCall: 'هماهنگی جلسهٔ سرمایه‌گذار',
  ctaTop: 'بازگشت به بالا',
  footer: 'سوپراپ سلامت و تندرستی',
  liveTag: 'فعال',
};

// Card grids rendered by the deck's own script from the data-r attribute
// (same mechanism as the owner's original file — content translated, numbers
// and placeholder slots untouched).
const CARDS: Record<HealthDeckLang, Record<'problem' | 'solution' | 'market' | 'model' | 'roadmap' | 'traction', unknown[][]>> = {
  en: {
    problem: [
      ['01', 'Fragmented', 'Fitness, food, sleep and care live in different apps.'],
      ['02', 'Generic advice', 'One-size-fits-all plans that ignore the individual.'],
      ['03', 'High churn', 'Engagement fades because nothing connects the journey.'],
    ],
    solution: [
      ['01', 'Personal intelligence', 'Two AI assistants learn each user and adapt recommendations continuously.'],
      ['02', 'Real specialists', 'A dedicated expert panel serves the general public inside the app.'],
      ['03', 'Wellness marketplace', 'Curated health products arrive in phase two, right in the user journey.'],
    ],
    market: [
      ['US', 'Subscription-ready', 'US users already pay monthly for wellness. Market size: [figure + source].'],
      ['GL', 'Global headroom', 'Europe, MENA, Asia and LatAm: high mobile reach, low saturation.'],
      ['WHY', 'Why we are in', '[Founding story]. AI plus human experts in one place is rarely done.'],
    ],
    model: [
      ['01', 'In-app packages', 'One-time purchases of programs and services.'],
      ['02', 'Subscriptions', 'Monthly, 3, 6 and 12-month plans.'],
      ['03', 'Premium services', 'Exclusive services delivered inside the app.'],
      ['04', 'Specialist commission', 'Revenue share on expert sessions.'],
      ['05', 'Marketplace', 'Health & wellness products, from phase 2.'],
    ],
    roadmap: [
      ['01', 'Phase 1', 'Core product and assistants. Live build.', 'now'],
      ['02', 'Phase 2', 'Wellness marketplace launch.'],
      ['03', 'Phase 3', 'Deeper personalization.'],
      ['04', 'Phase 4', 'Specialist tooling at scale.'],
      ['05', 'Phase 5', 'Full super-app ecosystem.'],
    ],
    traction: [
      ['✓', 'Phase 1 build', '[% complete / current stage]'],
      ['✓', 'Assistants', '[prototype / alpha / beta]'],
      ['✓', 'Early demand', '[waitlist or sign-ups]'],
    ],
  },
  fa: {
    problem: [
      ['01', 'پراکنده', 'تمرین و تغذیه و خواب و مراقبت هر کدام در اپلیکیشنی جدا هستند.'],
      ['02', 'توصیهٔ عمومی', 'برنامه‌های یکسان برای همه که فرد را نادیده می‌گیرند.'],
      ['03', 'ترک بالا', 'تعامل کم‌رنگ می‌شود چون هیچ چیز مسیر را به هم پیوند نمی‌دهد.'],
    ],
    solution: [
      ['01', 'هوش شخصی', 'دو دستیار هوش مصنوعی هر کاربر را می‌آموزند و توصیه‌ها را پیوسته به‌روز می‌کنند.'],
      ['02', 'متخصصان واقعی', 'هیئت متخصصان اختصاصی درون همان اپلیکیشن به عموم مردم خدمت می‌رساند.'],
      ['03', 'بازارک سلامت', 'محصولات سلامت گزینش‌شده از فاز دو در دل مسیر کاربر ارائه می‌شوند.'],
    ],
    market: [
      ['US', 'آمادهٔ اشتراک', 'کاربران آمریکایی هم‌اکنون ماهانه برای سلامت پرداخت می‌کنند. اندازهٔ بازار: [figure + source].'],
      ['GL', 'ظرفیت جهانی', 'اروپا و MENA و آسیا و آمریکای لاتین: پوشش موبایل بالا و اشباع کم.'],
      ['WHY', 'انگیزهٔ ما', '[Founding story]. ترکیب هوش مصنوعی و متخصصان انسانی در یک محل به‌ندرت انجام می‌شود.'],
    ],
    model: [
      ['01', 'بسته‌های درون‌برنامه‌ای', 'خرید یک‌بارهٔ برنامه‌ها و خدمات.'],
      ['02', 'اشتراک‌ها', 'پلان ماهانه و ۳ ماهه و ۶ ماهه و ۱۲ ماهه.'],
      ['03', 'خدمات پریمیوم', 'خدمات انحصاری ارائه‌شده درون اپلیکیشن.'],
      ['04', 'کمیسیون متخصصان', 'تقسیم درآمد جلسات با متخصصان.'],
      ['05', 'بازارک', 'محصولات سلامت و تندرستی از فاز 2.'],
    ],
    roadmap: [
      ['01', 'فاز 1', 'محصول اصلی و دستیارها. ساخت در جریان.', 'now'],
      ['02', 'فاز 2', 'راه‌اندازی بازارک سلامت.'],
      ['03', 'فاز 3', 'شخصی‌سازی عمیق‌تر.'],
      ['04', 'فاز 4', 'ابزار متخصصان در مقیاس.'],
      ['05', 'فاز 5', 'اکوسیستم کامل سوپراپ.'],
    ],
    traction: [
      ['✓', 'ساخت فاز 1', '[% complete / current stage]'],
      ['✓', 'دستیارها', '[prototype / alpha / beta]'],
      ['✓', 'تقاضای اولیه', '[waitlist or sign-ups]'],
    ],
  },
};

// Bilingual switch pill + (FA only) RTL mirroring rules. These are NEW rules
// for NEW elements; the owner's original CSS below is untouched.
const EXTRA_CSS_EN = `/* deck language switch */
nav .nact{display:flex;align-items:center;gap:10px}
nav .lng{display:inline-flex;align-items:center;padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--mu);font:600 13.5px Inter,sans-serif;text-decoration:none;transition:.2s}
nav .lng:hover{color:var(--tx);border-color:var(--b)}`;

const EXTRA_CSS_FA = `/* deck language switch */
nav .nact{display:flex;align-items:center;gap:10px}
nav .lng{display:inline-flex;align-items:center;padding:8px 15px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--mu);font:600 13.5px Inter,sans-serif;text-decoration:none;transition:.2s}
nav .lng:hover{color:var(--tx);border-color:var(--b)}
/* Persian (RTL) mirroring — additive only, zero changes to the EN rules */
html[dir="rtl"] body{font-family:'Vazirmatn',Inter,system-ui,sans-serif}
html[dir="rtl"] h1,html[dir="rtl"] h2,html[dir="rtl"] h3{font-family:'Vazirmatn',Inter,sans-serif;letter-spacing:0}
html[dir="rtl"] .k,html[dir="rtl"] th{letter-spacing:0}
html[dir="rtl"] nav{padding:10px 22px 10px 12px}
html[dir="rtl"] nav .lng{font-family:'Vazirmatn',Inter,sans-serif}
html[dir="rtl"] .btn:hover .ar{transform:translateX(-6px)}
html[dir="rtl"] .tl .tag{right:auto;left:18px}
html[dir="rtl"] .phone{transform:perspective(1100px) rotateY(16deg) rotateX(7deg);animation-name:flr}
@keyframes flr{50%{transform:perspective(1100px) rotateY(9deg) rotateX(4deg) translateY(-16px)}}`;

function attrJson(rows: unknown[][]): string {
  // Single-quoted HTML attribute: JSON uses double quotes only in our data;
  // & is escaped for strict validity (the parser decodes it back).
  return JSON.stringify(rows).replace(/&/g, '&amp;');
}

export function buildHealthDeckHtml(lang: HealthDeckLang): string {
  const S = lang === 'fa' ? FA : EN;
  const C = CARDS[lang];
  const extraCss = lang === 'fa' ? EXTRA_CSS_FA : EXTRA_CSS_EN;

  return `<!DOCTYPE html>
${S.htmlOpen}
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${S.title}</title>
<link rel="stylesheet" href="${S.fontsHref}">
<style>
@property --ang{syntax:'<angle>';initial-value:0deg;inherits:false}
:root{--bg:#050816;--tx:#eef1ff;--mu:#9aa5cf;--card:rgba(255,255,255,.05);--line:rgba(255,255,255,.1);--a:#7c5cff;--b:#19e3c1;--c:#4f8cff;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){--bg:#f3f5ff;--tx:#0a1030;--mu:#4a557f;--card:rgba(255,255,255,.7);--line:rgba(20,30,90,.12)}}
:root[data-theme="light"]{--bg:#f3f5ff;--tx:#0a1030;--mu:#4a557f;--card:rgba(255,255,255,.7);--line:rgba(20,30,90,.12)}
*{box-sizing:border-box;margin:0}html{scroll-behavior:smooth;scroll-padding-top:90px}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--tx);line-height:1.65;overflow-x:hidden}
#bg{position:fixed;inset:0;width:100%;height:100%;z-index:0}
body:after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 0,transparent 40%,var(--bg) 120%)}
header,main,footer{position:relative;z-index:1}
h1,h2,h3,.sg{font-family:'Space Grotesk',Inter,sans-serif}
nav{position:fixed;top:calc(14px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(1120px,94%);z-index:9;display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 22px;border-radius:999px;background:var(--card);border:1px solid var(--line);backdrop-filter:blur(20px)}
nav .logo{font:700 20px 'Space Grotesk';display:flex;gap:10px;align-items:center}
nav .logo i{width:22px;height:22px;border-radius:7px;background:conic-gradient(from 200deg,var(--a),var(--b),var(--c),var(--a));box-shadow:0 0 18px var(--a)}
nav .l{display:flex;gap:26px;font-size:14.5px}nav .l a{color:var(--mu);text-decoration:none;transition:.2s}nav .l a:hover{color:var(--tx)}
/* BUTTONS */
.btn{--x:0px;--y:0px;position:relative;display:inline-flex;align-items:center;gap:10px;padding:15px 30px;border-radius:999px;font:600 15.5px Inter;color:#fff;text-decoration:none;border:0;cursor:pointer;overflow:hidden;isolation:isolate;background:linear-gradient(110deg,var(--a),var(--c),var(--b),var(--a));background-size:300% 100%;animation:flow 6s linear infinite;box-shadow:0 12px 34px -8px rgba(124,92,255,.8),0 0 0 1px rgba(255,255,255,.2) inset;transform:translate(var(--x),var(--y));transition:transform .2s,box-shadow .3s}
.btn:after{content:"";position:absolute;top:0;left:-80%;width:50%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);transition:left .7s;z-index:-1}
.btn:hover{box-shadow:0 18px 50px -6px rgba(25,227,193,.75),0 0 0 1px rgba(255,255,255,.4) inset}.btn:hover:after{left:130%}
.btn .ar{display:inline-block;transition:transform .3s}.btn:hover .ar{transform:translateX(6px)}
@keyframes flow{to{background-position:300% 0}}
.btn.ring{background:var(--bg);animation:none;color:var(--tx);box-shadow:none}
.btn.ring:before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--ang),var(--a),var(--b),var(--c),var(--a));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:spin 4s linear infinite}
@keyframes spin{to{--ang:360deg}}
.btn.ring:hover{box-shadow:0 0 40px -6px var(--a)}
.btn.sm{padding:10px 22px;font-size:14px}
section{padding:120px 6% 20px;max-width:1220px;margin:auto}
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;gap:28px;padding-top:140px}
.eyebrow{width:fit-content;display:flex;align-items:center;gap:10px;padding:7px 16px;border-radius:999px;border:1px solid var(--line);background:var(--card);backdrop-filter:blur(10px);font-size:13.5px;color:var(--mu)}
.eyebrow:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--b);box-shadow:0 0 12px var(--b);animation:pl 2s infinite}@keyframes pl{50%{opacity:.3}}
h1{font-size:clamp(40px,6.4vw,84px);line-height:1.04;font-weight:700;letter-spacing:-.03em;max-width:980px}
h2{font-size:clamp(30px,4.2vw,54px);line-height:1.1;font-weight:700;letter-spacing:-.02em;margin:14px 0 10px;max-width:800px}
.gt{background:linear-gradient(95deg,#a99bff,var(--b) 60%,var(--c));-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{color:var(--mu);font-size:clamp(16px,1.6vw,20px);max-width:620px}
.k{color:var(--b);font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:600}
.row{display:flex;gap:14px;flex-wrap:wrap}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;max-width:720px;margin-top:18px}
.stat{padding:20px;border-radius:22px;background:var(--card);border:1px solid var(--line);backdrop-filter:blur(14px)}
.stat b{display:block;font:700 34px 'Space Grotesk'}.stat span{color:var(--mu);font-size:14px}
.grid{display:grid;gap:20px;margin-top:38px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.card{--mx:50%;--my:50%;position:relative;padding:30px;border-radius:26px;background:var(--card);border:1px solid var(--line);backdrop-filter:blur(16px);overflow:hidden;transition:transform .35s,border-color .3s;will-change:transform}
.card:before{content:"";position:absolute;inset:0;background:radial-gradient(380px circle at var(--mx) var(--my),rgba(124,92,255,.28),transparent 60%);opacity:0;transition:opacity .3s}
.card:hover:before{opacity:1}.card:hover{border-color:rgba(124,92,255,.6)}
.card>*{position:relative}.card h3{font-size:21px;margin:14px 0 6px}.card p{color:var(--mu);font-size:15.5px}
.num{font:700 14px 'Space Grotesk';width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(135deg,var(--a),var(--b));color:#fff;box-shadow:0 10px 26px -8px var(--a)}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:50px;align-items:center}
.phone{width:min(310px,82%);margin:auto;aspect-ratio:9/18.5;border-radius:48px;padding:13px;background:linear-gradient(160deg,#38417a,#0b1129);border:1px solid var(--line);box-shadow:0 60px 100px -30px var(--a),0 0 0 7px rgba(255,255,255,.04);transform:perspective(1100px) rotateY(-16deg) rotateX(7deg);animation:fl 7s ease-in-out infinite}
@keyframes fl{50%{transform:perspective(1100px) rotateY(-9deg) rotateX(4deg) translateY(-16px)}}
.scr{height:100%;border-radius:36px;padding:22px 16px;background:linear-gradient(180deg,#141c44,#080c20);display:flex;flex-direction:column;gap:11px;color:#eef1ff;font-size:13.5px}
.scr i{font-style:normal;padding:11px 13px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.07)}
.orb{width:104px;height:104px;margin:6px auto;border-radius:50%;background:radial-gradient(circle at 30% 28%,#d6ceff,var(--a) 45%,#150f48);box-shadow:0 0 50px var(--a),inset -10px -14px 30px rgba(0,0,0,.4);animation:fl2 4s ease-in-out infinite}@keyframes fl2{50%{transform:scale(1.07)}}
.scr .bar{height:8px;border-radius:9px;background:linear-gradient(90deg,var(--b),var(--a))}
.scroll{overflow-x:auto;margin-top:34px;border-radius:24px;border:1px solid var(--line);background:var(--card);backdrop-filter:blur(14px)}
table{width:100%;border-collapse:collapse;min-width:520px}th,td{padding:18px;text-align:center;border-bottom:1px solid var(--line)}th{color:var(--b);font-size:13px;letter-spacing:.12em;text-transform:uppercase}tr:last-child td{border:0}td b{font:700 22px 'Space Grotesk'}
.tl{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-top:38px;position:relative}
.tl .card.now{border-color:var(--b)}.tl .tag{position:absolute;top:18px;right:18px;font-size:11px;padding:3px 10px;border-radius:999px;background:var(--b);color:#04141a;font-weight:700}
.cta{margin:100px auto 40px;max-width:1080px;padding:80px 6%;text-align:center;border-radius:44px;border:1px solid var(--line);background:linear-gradient(145deg,rgba(124,92,255,.28),rgba(25,227,193,.14));backdrop-filter:blur(20px);position:relative;overflow:hidden}
.cta h2,.cta .lead{margin-left:auto;margin-right:auto}
.rv{opacity:0;transform:translateY(36px);transition:opacity .9s,transform .9s cubic-bezier(.2,.7,.2,1)}.rv.in{opacity:1;transform:none}
footer{text-align:center;color:var(--mu);font-size:14px;padding:30px 6% calc(34px + env(safe-area-inset-bottom,0px))}
@media(max-width:820px){nav .l{display:none}.split{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}
${extraCss}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<nav><div class="logo"><i></i>[Brand]</div><div class="l"><a href="#problem">${S.nav[0]}</a><a href="#product">${S.nav[1]}</a><a href="#market">${S.nav[2]}</a><a href="#model">${S.nav[3]}</a><a href="#growth">${S.nav[4]}</a><a href="#roadmap">${S.nav[5]}</a></div><div class="nact"><a class="lng" href="${S.toggleHref}" data-href="${S.toggleHref}">${S.toggleLabel}</a><a class="btn sm" href="#invest">${S.invest} <span class="ar">${S.arrow}</span></a></div></nav>
<header><section class="hero">
<div class="eyebrow">${S.eyebrow}</div>
<h1>${S.h1}</h1>
<p class="lead">${S.lead}</p>
<div class="row"><a class="btn" href="#invest">${S.cta1} <span class="ar">${S.arrow}</span></a><a class="btn ring" href="#product">${S.cta2}</a></div>
<div class="stats"><div class="stat"><b data-c="5">0</b><span>${S.statPhases}</span></div><div class="stat"><b data-c="2">0</b><span>${S.statAssistants}</span></div><div class="stat"><b>1M</b><span>${S.statUsers12}</span></div></div>
</section></header>
<main>
<section id="problem"><div class="k rv">${S.kProblem}</div><h2 class="rv">${S.h2Problem}</h2>
<p class="lead rv">${S.leadProblem}</p>
<div class="grid" data-r='${attrJson(C.problem)}'></div></section>
<section id="solution"><div class="k rv">${S.kSolution}</div><h2 class="rv">${S.h2Solution}</h2>
<div class="grid" data-r='${attrJson(C.solution)}'></div></section>
<section id="product" class="split"><div><div class="k rv">${S.kProduct}</div><h2 class="rv">${S.h2Product}</h2>
<p class="lead rv">${S.leadProduct}</p>
<div class="row rv" style="margin-top:26px"><a class="btn ring sm" href="#invest">${S.requestDemo}</a></div></div>
<div class="phone rv"><div class="scr"><i>${S.scrHello}</i><div class="orb"></div><i>${S.scrPlan}</i><div class="bar" style="width:78%"></div><div class="bar" style="width:52%"></div><i>${S.scrSession}</i></div></div></section>
<section id="market"><div class="k rv">${S.kMarket}</div><h2 class="rv">${S.h2Market}</h2>
<div class="grid" data-r='${attrJson(C.market)}'></div></section>
<section id="model"><div class="k rv">${S.kModel}</div><h2 class="rv">${S.h2Model}</h2>
<div class="grid" data-r='${attrJson(C.model)}'></div></section>
<section id="growth"><div class="k rv">${S.kGrowth}</div><h2 class="rv">${S.h2Growth}</h2>
<p class="lead rv">${S.leadGrowth}</p>
<div class="stats" style="max-width:none"><div class="stat rv"><b><span data-c="100">0</span>K</b><span>${S.statUsers3}</span></div><div class="stat rv"><b><span data-c="1">0</span>M</b><span>${S.statUsers12}</span></div><div class="stat rv"><b>[K]</b><span>${S.statK}</span></div></div>
<div class="scroll rv"><table><tr><th>${S.thUsers}</th><th>${S.th20}</th><th>${S.th50}</th></tr><tr><td>100,000</td><td><b>$2M</b></td><td><b>$5M</b></td></tr><tr><td>1,000,000</td><td><b>$20M</b></td><td><b>$50M</b></td></tr></table></div>
<p class="rv" style="color:var(--mu);font-size:13px;margin-top:10px">${S.noteGrowth}</p></section>
<section id="roadmap"><div class="k rv">${S.kRoadmap}</div><h2 class="rv">${S.h2Roadmap}</h2>
<p class="lead rv">${S.leadRoadmap}</p>
<div class="tl" data-r='${attrJson(C.roadmap)}'></div></section>
<section id="traction"><div class="k rv">${S.kTraction}</div><h2 class="rv">${S.h2Traction}</h2>
<div class="grid" data-r='${attrJson(C.traction)}'></div></section>
<div class="cta rv" id="invest"><div class="k">${S.kRound}</div><h2>${S.h2Round}</h2>
<p class="lead" style="margin-bottom:30px">${S.leadRound}</p>
<div class="row" style="justify-content:center"><a class="btn" href="#invest">${S.ctaCall} <span class="ar">${S.arrow}</span></a><a class="btn ring" href="#top">${S.ctaTop}</a></div></div>
</main>
<footer>© [Brand] · ${S.footer}</footer>
<script>(function(){var l=document.querySelector('.lng');if(l)l.addEventListener('click',function(e){e.preventDefault();location.href=l.getAttribute('data-href')+location.hash})})();</script>
<script>
(function(){
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;e.innerHTML=h||'';return e}
document.querySelectorAll('[data-r]').forEach(function(g){JSON.parse(g.dataset.r).forEach(function(r){var c=el('div','card rv'+(r[3]?' now':''),'<div class="num">'+r[0]+'</div><h3>'+r[1]+'</h3><p>'+r[2]+'</p>'+(r[3]?'<span class="tag">${S.liveTag}</span>':''));g.appendChild(c)})});
document.querySelectorAll('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');c.style.transform='perspective(900px) rotateX('+((y/b.height-.5)*-8)+'deg) rotateY('+((x/b.width-.5)*8)+'deg) translateY(-6px)'});c.addEventListener('pointerleave',function(){c.style.transform=''})});
document.querySelectorAll('.btn').forEach(function(b){b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--x',((e.clientX-r.left-r.width/2)*.18)+'px');b.style.setProperty('--y',((e.clientY-r.top-r.height/2)*.28)+'px')});b.addEventListener('pointerleave',function(){b.style.setProperty('--x','0px');b.style.setProperty('--y','0px')})});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('[data-c]').forEach(cnt);io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.rv').forEach(function(e,i){e.style.transitionDelay=(i%4)*.08+'s';io.observe(e)});
function cnt(n){var t=+n.dataset.c,s=performance.now();(function f(now){var p=Math.min((now-s)/1400,1);n.textContent=Math.round(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(s)}
document.querySelectorAll('.hero [data-c]').forEach(cnt);
try{
var cv=document.getElementById('bg'),cx=cv.getContext('2d'),W=0,H=0,D=Math.min(devicePixelRatio||1,2),mx=-1e4,my=-1e4,sy=0;
var th=document.documentElement.dataset.theme,light=th==='light'||(th!=='dark'&&matchMedia('(prefers-color-scheme:light)').matches);
addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY});addEventListener('scroll',function(){sy=scrollY});
var PAL={m:[[40,235,200],[90,160,255]],f:[[255,125,205],[175,125,255]],k:[[255,200,90],[255,140,120]]};
var SP={m:{sc:1,tf:[.062,.05,.072,.046,.021,.02],tb:[.07,.05,.062,.046,.021,.02],lg:[.06,.05,.034,.039,.021],ar:[.03,.028,.022,.021,.016,.01],hd:[.05,.064]},
f:{sc:.93,tf:[.052,.04,.062,.04,.018,.017],tb:[.074,.042,.05,.04,.018,.017],lg:[.056,.05,.032,.035,.019],ar:[.025,.024,.019,.018,.014,.009],hd:[.046,.06]},
k:{sc:.64,ll:.93,hdo:.08,cad:1.15,tf:[.052,.047,.056,.04,.02,.019],tb:[.058,.046,.05,.04,.02,.019],lg:[.052,.045,.032,.035,.02],ar:[.026,.024,.02,.019,.015,.01],hd:[.066,.082]}};
var DG=Math.PI/180,HIP=[30,16,2,-10,-20,-20,0,22,38,40].map(function(x){return x*DG}),KN=[20,38,42,30,30,50,70,72,52,28].map(function(x){return x*DG}),FT=[.12,0,0,-.1,-.4,-.7,-.7,-.55,-.3,0];
function cr(a,u){var n=a.length,x=((u%1)+1)%1*n,i=Math.floor(x),f=x-i,p0=a[(i-1+n)%n],p1=a[i%n],p2=a[(i+1)%n],p3=a[(i+2)%n];return .5*(2*p1+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)}
function pose(p,S){
var ll=S.ll||1,u=p/6.2832,L=.17+.02*Math.sin(12.566*u+1),sc=S.sc,j={},ux=Math.sin(L),uy=-Math.cos(L),hl=L*.3-.03;
j.hip=[0,0];j.sh=[ux*.3*sc,uy*.3*sc];
j.nk=[j.sh[0]+Math.sin(hl)*.045*sc,j.sh[1]-Math.cos(hl)*.045*sc];
j.hd=[j.nk[0]+Math.sin(hl)*(S.hdo||.065)*sc,j.nk[1]-Math.cos(hl)*(S.hdo||.065)*sc];j.tilt=hl;
function leg(w,n){var a=cr(HIP,w),b=a-cr(KN,w),fp=cr(FT,w),k=[Math.sin(a)*.245*sc*ll,Math.cos(a)*.245*sc*ll],an=[k[0]+Math.sin(b)*.245*sc*ll,k[1]+Math.cos(b)*.245*sc*ll];
j['k'+n]=k;j['a'+n]=an;j['t'+n]=[an[0]+Math.cos(fp)*.075*sc,an[1]-Math.sin(fp)*.075*sc]}
function arm(w,n){var a=cr(HIP,w),b=-(a-.1)*.95,c=b+1.55+.35*b,o=[j.sh[0]-ux*.02*sc,j.sh[1]-uy*.02*sc],e=[o[0]+Math.sin(b)*.17*sc,o[1]+Math.cos(b)*.17*sc];
j['o'+n]=o;j['e'+n]=e;j['h'+n]=[e[0]+Math.sin(c)*.17*sc,e[1]+Math.cos(c)*.17*sc];j['x'+n]=[j['h'+n][0]+Math.sin(c+.15)*.04*sc,j['h'+n][1]+Math.cos(c+.15)*.04*sc]}
leg(u,1);leg(u+.5,2);arm(u,1);arm(u+.5,2);
var m=Math.max(j.a1[1]+.021*sc,j.a2[1]+.021*sc,j.t1[1]+.012*sc,j.t2[1]+.012*sc);
for(var k in j)if(k!=='tilt')j[k]=[j[k][0],j[k][1]-m];
return j}
function cs(a,g){var n=a.length,s=Math.min(Math.floor(g),n-2),f=g-s,p0=a[Math.max(s-1,0)],p1=a[s],p2=a[s+1],p3=a[Math.min(s+2,n-1)];return .5*(2*p1+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)}
function cd(a,g){var n=a.length,s=Math.min(Math.floor(g),n-2),f=g-s,p0=a[Math.max(s-1,0)],p1=a[s],p2=a[s+1],p3=a[Math.min(s+2,n-1)];return .5*((-p0+p2)+2*(2*p0-5*p1+4*p2-p3)*f+3*(-p0+3*p1-3*p2+p3)*f*f)}
function L2(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
var RN=[],A=[],ST=[];
function build(){
W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);
var m=W<820,hp=m?Math.min(H*.42,W*.62):Math.min(H*.6,W*.34),gy=m?H*.82:H*.9,xx=m?W*.72:W*.78,gap=hp*.5;
var cfg=[['k',xx-gap*(m?1.7:1.85),gy-H*.03,hp*.93,.9,.8],['f',xx-gap,gy,hp,.35,.9],['m',xx,gy,hp,0,1]];
if(!m)cfg.unshift(['k',W*.24-gap*.925,H*.66-H*.015,hp*.465,.9,.35],['f',W*.24-gap*.5,H*.66,hp*.5,.35,.4],['m',W*.24,H*.66,hp*.5,0,.4]);
RN=cfg.map(function(c){return{S:SP[c[0]],g:c[0],ox:c[1],gy:c[2],hp:c[3],ph:c[4],al:c[5]}});
var na=m?50:100;A=[];for(var i=0;i<na;i++)A.push({x:Math.random()*W,y:Math.random()*H,vx:-.1-Math.random()*.3,vy:(Math.random()-.5)*.08,r:Math.random()*1.1+.4});
ST=[];for(var i=0;i<(m?10:24);i++)ST.push({x:Math.random()*W,y:Math.random()*H,l:60+Math.random()*200,v:.6+Math.random()*1.6,a:.04+Math.random()*.12})}
build();var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,t0=performance.now();
function C(c,a){var f=light?.55:1;return'rgba('+Math.round(c[0]*f)+','+Math.round(c[1]*f)+','+Math.round(c[2]*f)+','+a+')'}
/* a smooth body part: spline tube through ctrl points, with radii (front/back) and woven strands */
function tube(ctrl,rf,rb,ns,len,r,t,fa,pal,key){
var hp=r.hp,sc=r.S.sc,N=Math.max(8,Math.round(len*sc*hp/7)),xs=ctrl.map(function(p){return r.ox+p[0]*hp}),ys=ctrl.map(function(p){return r.gy+p[1]*hp}),sg=ctrl.length-1;
var buf=r['b'+key];if(!buf||buf.length!==N*ns*2)buf=r['b'+key]=new Float32Array(N*ns*2);
for(var q=0;q<N;q++){var g=q/(N-1)*sg,x=cs(xs,g),y=cs(ys,g),tx=cd(xs,g),ty=cd(ys,g),l=Math.sqrt(tx*tx+ty*ty)||1,nx=-ty/l,ny=tx/l,f=Math.max(.004,cs(rf,g))*sc*hp,b=Math.max(.004,cs(rb,g))*sc*hp;
for(var i=0;i<ns;i++){var k=-1+2*i/(ns-1),o=(k>0?k*f:k*b)+Math.sin(t*2+q*.6+i*1.3)*.0025*hp,ix=(q*ns+i)*2;buf[ix]=x+nx*o;buf[ix+1]=y+ny*o}}
cx.fillStyle=C(pal[0],.07*fa);cx.beginPath();for(var q=0;q<N;q++){var ix=q*ns*2;q?cx.lineTo(buf[ix],buf[ix+1]):cx.moveTo(buf[ix],buf[ix+1])}
for(var q=N-1;q>=0;q--){var ix=(q*ns+ns-1)*2;cx.lineTo(buf[ix],buf[ix+1])}cx.fill();
cx.lineWidth=.55;cx.strokeStyle=C(pal[0],.38*fa);cx.beginPath();
for(var i=1;i<ns-1;i++)for(var q=0;q<N;q++){var ix=(q*ns+i)*2;q?cx.lineTo(buf[ix],buf[ix+1]):cx.moveTo(buf[ix],buf[ix+1])}cx.stroke();
cx.strokeStyle=C(pal[1],.16*fa);cx.beginPath();
for(var q=1;q<N-1;q+=2)for(var i=0;i<ns;i++){var ix=(q*ns+i)*2;i?cx.lineTo(buf[ix],buf[ix+1]):cx.moveTo(buf[ix],buf[ix+1])}cx.stroke();
cx.lineWidth=.9;cx.strokeStyle=C(pal[0],.8*fa);cx.beginPath();
[0,ns-1].forEach(function(i){for(var q=0;q<N;q++){var ix=(q*ns+i)*2;q?cx.lineTo(buf[ix],buf[ix+1]):cx.moveTo(buf[ix],buf[ix+1])}});cx.stroke();
cx.fillStyle=C(pal[1],.75*fa);for(var q=0;q<N;q+=2)for(var i=0;i<ns;i++){var ix=(q*ns+i)*2;cx.fillRect(buf[ix]-.6,buf[ix+1]-.6,1.3,1.3)}}
function drawRunner(r,t){
var S=r.S,pal=PAL[r.g],p=t*6.6*(r.S.cad||1)+r.ph,j=pose(p,S),hp=r.hp,al=r.al,sc=S.sc,sh=Math.sin,ox=r.ox+sh(t*1.1)*2,gy=r.gy-sy*.1*al;
var rr={ox:ox,gy:gy,hp:hp,S:S,al:al};['bt','bn','bl1','bl2','bf1','bf2','ba1','ba2'].forEach(function(k){rr[k]=r[k]});
function leg(n,fa){var k=j['k'+n],a=j['a'+n],tt=j['t'+n];
tube([j.hip,L2(j.hip,k,.5),k,L2(k,a,.38),a],S.lg,S.lg,7,.55,rr,t,fa*al,pal,'l'+n);
var dx=tt[0]-a[0],dy=tt[1]-a[1],l=Math.sqrt(dx*dx+dy*dy);dx/=l;dy/=l;
tube([[a[0]-dx*.03*sc,a[1]-dy*.03*sc+.004],[a[0]+dx*.02*sc,a[1]+dy*.02*sc],tt],[.02,.018,.01],[.02,.018,.01],3,.1,rr,t,fa*al,pal,'f'+n)}
function arm(n,fa){tube([j['o'+n],L2(j['o'+n],j['e'+n],.5),j['e'+n],L2(j['e'+n],j['h'+n],.5),j['h'+n],j['x'+n]],S.ar,S.ar,4,.4,rr,t,fa*al,pal,'a'+n)}
leg(2,.55);arm(2,.55);
tube([j.hip,L2(j.hip,j.sh,.38),L2(j.hip,j.sh,.74),j.sh,j.nk,L2(j.nk,j.hd,.25)],S.tf,S.tb,9,.4,rr,t,al,pal,'t');
/* head */
var H0=j.hd,tl=j.tilt,rx=S.hd[0]*sc*hp,ry=S.hd[1]*sc*hp,cT=Math.cos(tl),sT=Math.sin(tl),cxh=ox+H0[0]*hp,cyh=gy+H0[1]*hp;
function HP(an,f,fr){var rf=fr?1+.09*Math.exp(-Math.pow((an-.12)/.2,2))+.06*Math.exp(-Math.pow((an-1.15)/.4,2)):1,lx=Math.cos(an)*rx*f*rf,ly=Math.sin(an)*ry*f*rf;return[cxh+lx*cT-ly*sT,cyh+lx*sT+ly*cT]}
var rg=[[1,22],[.68,13],[.36,6]],rp=rg.map(function(g){var a=[];for(var i=0;i<g[1];i++)a.push(HP(i/g[1]*6.283,g[0],g[0]===1));return a});
cx.fillStyle=C(pal[0],.08*al);cx.beginPath();rp[0].forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])});cx.fill();
cx.lineWidth=.55;cx.strokeStyle=C(pal[0],.45*al);cx.beginPath();rp.forEach(function(arr){arr.forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])});cx.lineTo(arr[0][0],arr[0][1])});cx.stroke();
cx.strokeStyle=C(pal[1],.2*al);cx.beginPath();for(var g=0;g<2;g++)rp[g].forEach(function(q,i){var o=rp[g+1][Math.floor(i*rp[g+1].length/rp[g].length)];cx.moveTo(q[0],q[1]);cx.lineTo(o[0],o[1])});cx.stroke();
cx.fillStyle=C(pal[1],.8*al);rp.forEach(function(arr){arr.forEach(function(q){cx.fillRect(q[0]-.6,q[1]-.6,1.3,1.3)})});
/* hair cap */
var hc=[[1.07,15],[1.14,13]].map(function(g,gi){var a=[];for(var i=0;i<g[1];i++)a.push(HP(-2.75+i/(g[1]-1)*(r.g==='m'?2.55:2.2),g[0]+(gi?.02:0),0));return a});
cx.lineWidth=.7;cx.strokeStyle=C(pal[1],.7*al);cx.beginPath();hc.forEach(function(arr){arr.forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])})});cx.stroke();
cx.strokeStyle=C(pal[1],.25*al);cx.beginPath();for(var i=0;i<13;i++){cx.moveTo(hc[0][i][0],hc[0][i][1]);cx.lineTo(hc[1][i][0],hc[1][i][1])}cx.stroke();
if(r.g==='f'){var bp=HP(-2.55,1.08,0),pq=[];
for(var i=0;i<4;i++){var arr=[];for(var k=0;k<15;k++){var f=k/14;arr.push([bp[0]-k*.0095*sc*hp+sh(p*2-k*.5)*.004*f*hp,bp[1]+(i-1.5)*.005*f*hp+k*.004*sc*hp+sh(p*2-k*.55)*.013*f*hp])}pq.push(arr)}
cx.lineWidth=.6;cx.strokeStyle=C(pal[1],.7*al);cx.beginPath();pq.forEach(function(arr){arr.forEach(function(q,i){i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1])})});cx.stroke();
cx.strokeStyle=C(pal[0],.25*al);cx.beginPath();for(var k=1;k<15;k+=2){pq.forEach(function(arr,i){i?cx.lineTo(arr[k][0],arr[k][1]):cx.moveTo(arr[k][0],arr[k][1])})}cx.stroke()}
leg(1,1);arm(1,1);
['bt','bn','bl1','bl2','bf1','bf2','ba1','ba2'].forEach(function(k){r[k]=rr[k]});
['l1','l2','f1','f2','a1','a2','t'].forEach(function(k){if(rr['b'+k])r['b'+k]=rr['b'+k]});
/* track */
cx.lineWidth=.7;cx.strokeStyle=C(pal[1],.3*al);cx.setLineDash([]);cx.beginPath();cx.moveTo(ox-hp*1.4,gy+3);cx.lineTo(ox+hp*1.2,gy+3);cx.stroke();
cx.setLineDash([2,12]);cx.lineDashOffset=t*70;cx.strokeStyle=C(pal[0],.25*al);cx.beginPath();cx.moveTo(ox-hp*1.4,gy+14);cx.lineTo(ox+hp*1.2,gy+14);cx.moveTo(ox-hp*1.4,gy+28);cx.lineTo(ox+hp*1.2,gy+28);cx.stroke();cx.setLineDash([])}
function frame(now){
var t=rm?1.5:(now-t0)/1000;
var g=cx.createLinearGradient(0,0,0,H);if(light){g.addColorStop(0,'#f6f7ff');g.addColorStop(1,'#e6eaff')}else{g.addColorStop(0,'#04071a');g.addColorStop(1,'#0a1130')}
cx.globalCompositeOperation='source-over';cx.fillStyle=g;cx.fillRect(0,0,W,H);
if(!light)cx.globalCompositeOperation='lighter';
cx.lineWidth=.6;
ST.forEach(function(s){s.x-=s.v;if(s.x+s.l<0){s.x=W+20;s.y=Math.random()*H}cx.strokeStyle=C([150,160,255],s.a);cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x+s.l,s.y);cx.stroke()});
A.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<-10)p.x=W+10;if(p.y<-10)p.y=H+10;if(p.y>H+10)p.y=-10;var dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);if(d<130&&d>1){p.x+=dx/d*(130-d)*.03;p.y+=dy/d*(130-d)*.03}});
cx.strokeStyle=C([120,140,255],.16);cx.beginPath();
for(var i=0;i<A.length;i++){var p=A[i];for(var j=i+1;j<A.length;j++){var q=A[j],dx=p.x-q.x,dy=p.y-q.y;if(dx*dx+dy*dy<10000){cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y)}}}cx.stroke();
cx.fillStyle=C([170,180,255],.6);A.forEach(function(p){cx.fillRect(p.x,p.y,p.r*1.5,p.r*1.5)});
RN.forEach(function(r){drawRunner(r,t)});
if(!rm)requestAnimationFrame(frame)}
requestAnimationFrame(frame);
}catch(e){console.error(e)}
})();
</script>
</body>
</html>`;
}
