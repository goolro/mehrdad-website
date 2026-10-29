/**
 * Content source for the kilika short SEO post (D-056) — owner order:
 * «یک نسخه کوتاه سئو شده توی بلاگ بزار --- حتما لینک این فحات مرتبط با کلیکا
 * داخلش باشه سئو حرفه ای انجام بده با لینک سازی داخلی».
 *
 * SINGLE SOURCE OF TRUTH for both seeders:
 *   - scripts/seed-klika-seo-post-supabase.ts → production (Supabase
 *     Postgres over the Management API, same channel as the koko seed)
 *   - local dev SQLite insert → used by the pre-deploy E2E
 *
 * FACTS POLICY (OWNER_RULES #5 / D-029): every statement and every number
 * below traces to the owner's kilika deck page (public/s/kilika.html,
 * extracted verbatim 2026-10-25):
 *   - "WeChat چین بیش از 1.3 میلیارد کاربر فعال پرداخت و شبکه اجتماعی و خرید
 *     و حمل‌ونقل / Paytm هند بیش از 450 میلیون کاربر / Gojek اندونزی بیش از
 *     190 میلیون کاربر / ایران با ۸۵ میلیون کاربر اینترنت هنوز فاقد یک سوپر
 *     اپلیکیشن ملی است"
 *   - "۱۱.۴B$ بازار جهانی کیف پول دیجیتال (۲۰۲۶) / ۲۷.۳B$ پیش‌بینی بازار
 *     (۲۰۳۱) / ۱۹.۱٪ نرخ رشد سالانه (CAGR)"
 *   - "بازار ایران — حجم تراکنش‌های سالانه ۸۵۰ هزار میلیارد تومان
 *     تراکنش‌های دیجیتال در ایران (۱۴۰۴) / کاربران بالقوه ۴۵ میلیون نفر
 *     کاربران فعال اینترنت موبایل در ایران / ۷۵٪ رشد تراکنش‌های آنلاین نسبت
 *     به سال گذشته / ۶۵٪ تمایل به کیف پول یکپارچه بر اساس نظرسنجی محصول ما"
 *   - "راه‌حل ما کلیکا: سوپر اپلیکیشن یکپارچه برای زندگی دیجیتال — پلتفرم
 *     هوشمند که دسترسی به ده‌ها سرویس آنلاین را در یک اپلیکیشن ساده و امن
 *     فراهم می‌کند / یک اپ و همه سرویس‌ها / مدیریت متمرکز موجودی و تراکنش‌ها
 *     با امکان شارژ از تمام بانک‌ها / پرداخت یک‌کلیکه"
 *   - deck ask "$4M" + "Feb 2026 deck" (D-055 profile trace).
 *
 * This post is the SHORT, rewritten, keyword-focused version — it must NOT
 * copy the /work/kilika-fintech long-form paragraphs (D-055); it links to
 * them instead (hub-and-spoke: short post → long hub + deck page).
 *
 * HTML CONSTRAINTS: content is stored raw and sanitized on READ by
 * src/lib/sanitize.ts — only allowlisted tags/attributes are used here
 * (no class/style; internal links stay followed, external links are
 * auto-nofollowed by the sanitizer).
 *
 * PERSIAN PUNCTUATION RULE: no «،» anywhere in Persian text — «؛» / «و» /
 * «—» instead (standing owner rule).
 *
 * STANDING LINK RULE: every link carries the full https://mehrdad.ir domain.
 */

export const KLIKA_POST_SLUG = 'klika-fintech-superapp';

export const KLIKA_POST = {
  slug: KLIKA_POST_SLUG,

  titleFa: 'کلیکا چیست؟ سوپر اپلیکیشن فینتک ایرانی — یک اپ و همه سرویس‌ها',
  titleEn: "What Is kilika? Iran's Fintech Super-App — One App, All Services",

  excerptFa:
    'کلیکا یک سوپر اپلیکیشن فینتک برای زندگی دیجیتال است — پرداخت یک‌کلیکه و کیف پول یکپارچه و ده‌ها سرویس آنلاین در یک اپ ساده و امن. در این نسخه کوتاه شکاف بازار سوپراپ در ایران و اعداد بازار فینتک را می‌خوانی و لینک متن کامل معرفی و دک سرمایه‌گذاری کلیکا یک‌جا جلوی توست.',
  excerptEn:
    "kilika is a fintech super-app for digital life — one-click payments, a unified wallet and dozens of online services in one simple, secure app. This short edition covers the super-app gap in Iran and the fintech market numbers, with direct links to the full product story and the kilika pitch deck.",

  // listing thumbnail + OG card: purpose-built cover (public/media, ships with the repo)
  cover: '/media/klika-superapp-seo-cover.png',

  contentFa: `
<p><strong>کلیکا یک سوپر اپلیکیشن یکپارچه برای زندگی دیجیتال است — پلتفرمی هوشمند که دسترسی به ده‌ها سرویس آنلاین را در یک اپلیکیشن ساده و امن فراهم می‌کند.</strong> شعار کلیکا یک جمله است: یک اپ و همه سرویس‌ها. اگر می‌خواهی بدون خواندن متن طولانی فقط منابع اصلی را ببینی؛ <a href="https://mehrdad.ir/work/kilika-fintech">متن کامل معرفی کلیکا</a> و <a href="https://mehrdad.ir/s/kilika.html">دک سرمایه‌گذاری کلیکا</a> هر دو در همین سایت منتشر شده‌اند.</p>

<h2>چرا سوپراپ؟ شکاف بزرگ بازار ایران</h2>
<p>بازارهای پیشروی جهان به سمت یکپارچه‌سازی حرکت کرده‌اند: WeChat در چین بیش از 1.3 میلیارد کاربر فعال دارد؛ Paytm در هند بیش از 450 میلیون کاربر و Gojek در اندونزی بیش از 190 میلیون کاربر. اما ایران با ۸۵ میلیون کاربر اینترنت هنوز فاقد یک سوپر اپلیکیشن ملی است — طبق دک کلیکا همین شکاف یک فرصت بی‌نظیر برای ایجاد ارزش اقتصادی چند میلیارد دلاری است.</p>

<h2>اعداد بازار فینتک در یک نگاه</h2>
<ul>
<li>بازار جهانی کیف پول دیجیتال: ۱۱.۴ میلیارد دلار در ۲۰۲۶ — پیش‌بینی ۲۷.۳ میلیارد دلار در ۲۰۳۱ با نرخ رشد سالانه ۱۹.۱٪ (CAGR)</li>
<li>حجم تراکنش‌های دیجیتال ایران: ۸۵۰ هزار میلیارد تومان در ۱۴۰۴</li>
<li>۴۵ میلیون کاربر فعال اینترنت موبایل در ایران — با ۷۵٪ رشد تراکنش‌های آنلاین نسبت به سال گذشته</li>
<li>۶۵٪ تمایل به کیف پول یکپارچه بر اساس نظرسنجی محصول کلیکا</li>
</ul>
<p>تحلیل کامل این اعداد و استراتژی نسخه ایرانی و بین‌المللی در <a href="https://mehrdad.ir/work/kilika-fintech">صفحه محصول کلیکا</a> آمده است.</p>

<h2>کلیکا چه می‌کند؟</h2>
<ul>
<li><strong>یک نقطه ورود واحد</strong> — دسترسی به تمام سرویس‌های روزمره از یک اپلیکیشن؛ با سرعت و سادگی.</li>
<li><strong>مدیریت حساب یکپارچه</strong> — مدیریت متمرکز موجودی و تراکنش‌ها با امکان شارژ از تمام بانک‌ها.</li>
<li><strong>پرداخت یک‌کلیکه</strong> — پلتفرم پرداخت یکپارچه با امکانات پیشرفته.</li>
<li><strong>امنیت و سادگی</strong> — یک اپلیکیشن ساده و امن به‌جای ده‌ها اپ پراکنده.</li>
</ul>

<h2>دک سرمایه‌گذاری کلیکا</h2>
<p>روایت کامل محصول برای سرمایه‌گذاران در قالب یک صفحه تعاملی منتشر شده است: <a href="https://mehrdad.ir/s/kilika.html">دک سرمایه‌گذاری کلیکا — mehrdad.ir/s/kilika.html</a>. مسیر بازار و مدل درآمدی و نقشه راه و شراکت‌های B2B همه در همان دک آمده است؛ برای جمع‌بندی سریع هم <a href="https://mehrdad.ir/work/kilika-fintech">متن کامل معرفی کلیکا در بخش کارها</a> را بخوان.</p>

<h2>سوال‌های پرتکرار</h2>
<dl>
<dt>کلیکا چیست؟</dt>
<dd>یک سوپر اپلیکیشن فینتک برای زندگی دیجیتال — پرداخت و کیف پول و ده‌ها سرویس آنلاین در یک اپ ساده و امن؛ تعریف کامل در <a href="https://mehrdad.ir/work/kilika-fintech">صفحه محصول کلیکا</a>.</dd>
<dt>دک سرمایه‌گذاری کلیکا را از کجا ببینم؟</dt>
<dd>مستقیم از این آدرس: <a href="https://mehrdad.ir/s/kilika.html">mehrdad.ir/s/kilika.html</a> — نسخه تعاملی و کامل دک محصول.</dd>
<dt>بقیه محصولات و نوشته‌های مرتبط کجاست؟</dt>
<dd>فهرست همه محصولات در <a href="https://mehrdad.ir/work">بخش کارها</a> و تحلیل‌های سرمایه‌گذاری در <a href="https://mehrdad.ir/blog">بلاگ</a> منتشر می‌شود؛ برای همکاری هم <a href="https://mehrdad.ir/contact">صفحه تماس</a> در دسترس است.</dd>
</dl>

<h2>لینک‌های مرتبط با کلیکا</h2>
<ul>
<li>متن کامل معرفی — <a href="https://mehrdad.ir/work/kilika-fintech">mehrdad.ir/work/kilika-fintech</a></li>
<li>دک سرمایه‌گذاری — <a href="https://mehrdad.ir/s/kilika.html">mehrdad.ir/s/kilika.html</a></li>
<li>همه محصولات — <a href="https://mehrdad.ir/work">mehrdad.ir/work</a></li>
<li>بلاگ تحلیل‌ها — <a href="https://mehrdad.ir/blog">mehrdad.ir/blog</a></li>
<li>تماس — <a href="https://mehrdad.ir/contact">mehrdad.ir/contact</a></li>
</ul>
`,

  contentEn: `
<p><strong>kilika is a unified super-app for digital life — an intelligent platform that brings dozens of online services into one simple, secure application.</strong> The pitch is one sentence: one app, all services. If you want just the primary sources without a long read, both the <a href="https://mehrdad.ir/work/kilika-fintech">full kilika product story</a> and the <a href="https://mehrdad.ir/s/kilika.html">kilika investor pitch deck</a> are published on this site.</p>

<h2>Why a super-app? Iran's giant market gap</h2>
<p>The world's leading markets have moved toward unification: WeChat in China serves over 1.3 billion active users across payments and social and shopping and transport; Paytm in India serves over 450 million; Gojek in Indonesia over 190 million. Iran — with 85 million internet users — still has no national super-app. Per the kilika deck, that gap is a rare opportunity to create multi-billion-dollar economic value.</p>

<h2>The fintech market in four numbers</h2>
<ul>
<li>Global digital wallet market: $11.4B in 2026 — projected $27.3B by 2031 at a 19.1% CAGR</li>
<li>Iran's annual digital transactions: 850 trillion toman in 1404</li>
<li>45 million active mobile-internet users in Iran — with 75% online-transaction growth year over year</li>
<li>65% preference for a unified wallet, based on the kilika product survey</li>
</ul>
<p>The full analysis of these numbers — plus the Iranian and international edition strategy — lives on the <a href="https://mehrdad.ir/work/kilika-fintech">kilika product page</a>.</p>

<h2>What does kilika do?</h2>
<ul>
<li><strong>One single entry point</strong> — every everyday service from one application; fast and simple.</li>
<li><strong>Unified account management</strong> — centralized balance and transaction management with top-ups from all banks.</li>
<li><strong>One-click payment</strong> — a unified payment platform with advanced capabilities.</li>
<li><strong>Security and simplicity</strong> — one simple, secure app instead of dozens of scattered ones.</li>
</ul>

<h2>The kilika investor pitch deck</h2>
<p>The complete investor narrative is published as an interactive page: <a href="https://mehrdad.ir/s/kilika.html">kilika pitch deck — mehrdad.ir/s/kilika.html</a>. Market path and revenue model and roadmap and B2B partnerships are all in the deck; for a quick synthesis read the <a href="https://mehrdad.ir/work/kilika-fintech">full kilika story in the work section</a>.</p>

<h2>Frequently asked questions</h2>
<dl>
<dt>What is kilika?</dt>
<dd>A fintech super-app for digital life — payments and a unified wallet and dozens of online services in one simple, secure app; the full definition is on the <a href="https://mehrdad.ir/work/kilika-fintech">kilika product page</a>.</dd>
<dt>Where can I see the kilika pitch deck?</dt>
<dd>Directly at this address: <a href="https://mehrdad.ir/s/kilika.html">mehrdad.ir/s/kilika.html</a> — the interactive, complete product deck.</dd>
<dt>Where are the related products and articles?</dt>
<dd>All products are listed in the <a href="https://mehrdad.ir/work">work section</a> and investment analyses are published on the <a href="https://mehrdad.ir/blog">blog</a>; for collaboration the <a href="https://mehrdad.ir/contact">contact page</a> is open.</dd>
</dl>

<h2>kilika-related links</h2>
<ul>
<li>Full story — <a href="https://mehrdad.ir/work/kilika-fintech">mehrdad.ir/work/kilika-fintech</a></li>
<li>Investor deck — <a href="https://mehrdad.ir/s/kilika.html">mehrdad.ir/s/kilika.html</a></li>
<li>All products — <a href="https://mehrdad.ir/work">mehrdad.ir/work</a></li>
<li>Analysis blog — <a href="https://mehrdad.ir/blog">mehrdad.ir/blog</a></li>
<li>Contact — <a href="https://mehrdad.ir/contact">mehrdad.ir/contact</a></li>
</ul>
`,
};

/** Curated topic tags — ALL pre-existing production tags (no new tag invented). */
export const KLIKA_POST_TAGS = [
  { slug: 'fintech', nameEn: 'Fintech', nameFa: 'فینتک' },
  { slug: 'neo-bank', nameEn: 'Neo-bank', nameFa: 'نئوبانک' },
  { slug: 'pitch-deck', nameEn: 'Pitch deck', nameFa: 'پیچ دک' },
  { slug: 'startup', nameEn: 'Startup', nameFa: 'استارتاپ' },
] as const;

/** Investment category (same as the vivora deck series; production stored slug is percent-encoded). */
export const KLIKA_POST_CATEGORY = {
  slugEncoded: '%d8%b3%d8%b1%d9%85%d8%a7%db%8c%d9%87-%da%af%d8%b0%d8%a7%d8%b1%db%8c', // سرمایه-گذاری
  slugRaw: 'سرمایه-گذاری',
  nameEn: 'سرمایه-گذاری',
} as const;
