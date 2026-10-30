/**
 * Content source for the Koko-on-Telegram announcement post (D-049).
 *
 * SINGLE SOURCE OF TRUTH for both seeders:
 *   - scripts/seed-koko-telegram-post-supabase.ts → production (Supabase
 *     Postgres over the Management API, same channel as the investor/vivora
 *     seeds)
 *   - local dev SQLite insert → used by the pre-deploy E2E
 *
 * FACTS POLICY (OWNER_RULES #5 / D-029): every statement below traces to a
 * verifiable source —
 *   - game summary: production Project row quiz-of-koko (fetched 2026-10-23)
 *   - bot address @quizkokobot → https://t.me/quizkokobot (HTTP 200;
 *     og:title "Quiz of Koko Game", og:description "…Play in Telegram or get
 *     the app. quizofkoko.com")
 *   - web edition https://quizofkoko.com + Android Cafe Bazaar
 *     com.quizofkoko.game + channel t.me/quizofkoko + Instagram
 *     instagram.com/quizofkoko → src/lib/project-links.ts (D-033/D-047/D-048)
 *   - QR image /media/quizkokobot-qr.png → owner upload byte-identical copy
 *     (sha256 1fafcdb06ee27e669f940b3b1de2f2ab6a3bcba291ccd30da656a6afef1c46a3)
 *
 * HTML CONSTRAINTS: content is stored raw and sanitized on READ by
 * src/lib/sanitize.ts — only its allowlisted tags/attributes are used here
 * (no class/style; img may carry src/alt/width/height; internal links stay
 * followed, external links are auto-nofollowed by the sanitizer).
 *
 * PERSIAN PUNCTUATION RULE: no «،» anywhere in Persian text — «؛» / «و» / «—»
 * instead (standing owner rule).
 */

export const KOKO_POST_SLUG = 'quiz-of-koko-telegram-app';

export const KOKO_POST = {
  slug: KOKO_POST_SLUG,

  titleFa: 'کوکو به تلگرام آمد — بازی کوییز واژگان بدون نصب با بات @quizkokobot',
  titleEn: 'Koko is now on Telegram — play the word quiz instantly with @quizkokobot',

  excerptFa:
    'کوییز کوکو حالا به‌صورت اپ داخل تلگرام بالا آمده — بات @quizkokobot را باز کن؛ Start بزن و بدون هیچ نصبی وارد دوئل واژگان شو. در این نوشته آدرس بات و کد QR ورود سریع و تفاوت بات با کانال کوکو را یک‌جا می‌بینی.',
  excerptEn:
    'Quiz of Koko is now live inside Telegram — open the @quizkokobot bot, hit Start and jump into word duels with zero installs. This post has the bot link, a scan-ready QR code and the difference between the bot and the Koko channel.',

  // listing thumbnail + OG card: reuse the official project cover (no new asset invented)
  cover: '/media/quiz-of-koko-cover.png',

  contentFa: `
<p><strong>خبر خوب برای دوست‌داران بازی با کلمه‌ها: کوییز کوکو حالا داخل تلگرام قابل بازی است. بات رسمی بازی با آدرس <a href="https://t.me/quizkokobot">@quizkokobot</a> بالا آمده و کافی است آن را باز کنی و Start بزن تا بدون نصب هیچ اپلیکیشنی وارد دوئل واژگان شوی.</strong> در ادامه لینک مستقیم بات و کد QR ورود سریع و توضیح کوتاهی از خود بازی را می‌بینی.</p>

<h2>کوییز کوکو چیست؟</h2>
<p>کوکو یک <strong>بازی کوییز واژگان با هوش مصنوعی</strong> است — دوئل زندهٔ ۱ به ۱؛ چالش‌های تطبیقی و لیگ هفتگی از برنز تا قهرمانی. سوال‌ها متناسب با سن و سطح تو تنظیم می‌شوند و کلمه‌های جاافتاده با مرور فاصله‌دار برمی‌گردند. جزئیات کامل محصول را در <a href="https://mehrdad.ir/work/quiz-of-koko">صفحه پروژه کوییز کوکو در همین سایت</a> می‌توانی بخوانی.</p>
<p>تا امروز کوکو از دو راه در دسترس بود: <a href="https://quizofkoko.com">نسخه وب در quizofkoko.com</a> که در مرورگر باز می‌شود و <a href="https://cafebazaar.ir/app/com.quizofkoko.game">نسخه اندروید در کافه‌بازار</a>. از امروز راه سوم هم باز شده — <strong>همان بازی به‌صورت اپ داخل تلگرام</strong>.</p>

<h2>چطور در تلگرام بازی کنم؟ — سه قدم</h2>
<ol>
<li>آدرس <a href="https://t.me/quizkokobot">t.me/quizkokobot</a> را باز کن — یا کد QR پایین همین نوشته را با دوربین گوشی اسکن کن.</li>
<li>در پنجره بات دکمه <strong>Start</strong> را بزن.</li>
<li>بازی شروع می‌شود — سوال‌ها می‌آیند و می‌توانی دوئل بزنی؛ شناسایی هم با همان حساب تلگرام انجام می‌شود و ثبت‌نام جداگانه‌ای لازم نیست.</li>
</ol>

<h2>چرا نسخه تلگرام؟</h2>
<ul>
<li><strong>بدون نصب</strong> — نه دانلود از اپ‌استور لازم است و نه حجم اضافه؛ هر جا تلگرام داشته باشی کوکو هم همان‌جاست.</li>
<li><strong>روی همه دستگاه‌ها</strong> — موبایل و تبلت و دسکتاپ؛ بازی داخل خود تلگرام اجرا می‌شود.</li>
<li><strong>ورود سریع</strong> — یک لینک یا یک اسکن QR تا شروع بازی فاصله است.</li>
</ul>

<h2>لینک بات و کد QR</h2>
<p>آدرس مستقیم بات: <a href="https://t.me/quizkokobot">t.me/quizkokobot</a> — برای ورود سریع با گوشی کد QR زیر را اسکن کن.</p>
<figure>
<img src="/media/quizkokobot-qr.png" alt="کد QR بات تلگرام بازی کوییز کوکو — quizkokobot" width="420" height="442" loading="lazy" />
<figcaption>کد QR بات @quizkokobot — با دوربین گوشی اسکن کن و مستقیم وارد بازی شو.</figcaption>
</figure>

<h2>تفاوت بات @quizkokobot با کانال @quizofkoko چیست؟</h2>
<p>این دو را نباید با هم اشتباه برد:</p>
<ul>
<li><a href="https://t.me/quizkokobot">بات @quizkokobot</a> — یعنی خود بازی؛ جایی که سوال‌ها و دوئل‌ها اجرا می‌شوند.</li>
<li><a href="https://t.me/quizofkoko">کانال @quizofkoko</a> — یعنی خبررسانی؛ خبرهای نسخه‌های جدید و اعلان‌های کوکو اینجا منتشر می‌شوند. کد QR کانال هم در <a href="https://mehrdad.ir/work/quiz-of-koko">صفحه پروژه</a> موجود است.</li>
</ul>

<h2>همه راه‌های همراهی با کوکو</h2>
<ul>
<li>وب — <a href="https://quizofkoko.com">quizofkoko.com</a></li>
<li>اندروید — <a href="https://cafebazaar.ir/app/com.quizofkoko.game">دریافت از کافه‌بازار</a></li>
<li>اپ داخل تلگرام — <a href="https://t.me/quizkokobot">t.me/quizkokobot</a></li>
<li>کانال تلگرام — <a href="https://t.me/quizofkoko">t.me/quizofkoko</a></li>
<li>اینستاگرام — <a href="https://www.instagram.com/quizofkoko/">instagram.com/quizofkoko</a></li>
<li>صفحه محصول — <a href="https://mehrdad.ir/work/quiz-of-koko">mehrdad.ir/work/quiz-of-koko</a></li>
</ul>
<p>فهرست بقیه نوشته‌ها هم در <a href="https://mehrdad.ir/blog">وبلاگ mehrdad.ir</a> در دسترس است.</p>

<h2>پرسش‌های پرتکرار</h2>
<h3>برای بازی در تلگرام باید اپ کوکو را نصب کنم؟</h3>
<p>نه — بازی داخل خود تلگرام اجرا می‌شود؛ فقط بات <a href="https://t.me/quizkokobot">@quizkokobot</a> را باز کن و Start بزن. اگر دوست داشتی، نسخه اندروید هم به‌صورت جداگانه در <a href="https://cafebazaar.ir/app/com.quizofkoko.game">کافه‌بازار</a> موجود است.</p>
<h3>نسخه تلگرام چه فرقی با نسخه وب دارد؟</h3>
<p>هر دو یک بازی‌اند؛ نسخه تلگرام بدون نصب و داخل چت اجرا می‌شود و <a href="https://quizofkoko.com">نسخه وب</a> در مرورگر باز می‌شود — هر کدام که راحت‌تری.</p>
<h3>خبرهای بعدی کوکو را از کجا دنبال کنم؟</h3>
<p>عضو <a href="https://t.me/quizofkoko">کانال تلگرام کوکو</a> شو یا صفحه <a href="https://www.instagram.com/quizofkoko/">اینستاگرام کوکو</a> را دنبال کن؛ خبرهای نسخه‌ها آنجا منتشر می‌شوند.</p>
`.trim(),

  contentEn: `
<p><strong>Good news for word-game fans: Quiz of Koko is now playable inside Telegram. The game's official bot is live at <a href="https://t.me/quizkokobot">@quizkokobot</a> — open it, hit Start and jump into word duels without installing anything.</strong> Below you will find the direct bot link and a scan-ready QR code plus a quick tour of the game itself.</p>

<h2>What is Quiz of Koko?</h2>
<p>Koko is an <strong>AI-powered word quiz game</strong> — real-time 1v1 duels, adaptive AI challenges and weekly leagues from Bronze to Champion. Questions calibrate to your age and level, and missed words return on a spaced-repetition curve. The full product story lives on <a href="https://mehrdad.ir/work/quiz-of-koko">the Quiz of Koko project page on this site</a>.</p>
<p>Until today Koko was reachable two ways: the <a href="https://quizofkoko.com">web edition at quizofkoko.com</a> that opens in your browser and the <a href="https://cafebazaar.ir/app/com.quizofkoko.game">Android edition on Cafe Bazaar</a>. As of today a third door opened — <strong>the same game as an app inside Telegram</strong>.</p>

<h2>How to play on Telegram — three steps</h2>
<ol>
<li>Open <a href="https://t.me/quizkokobot">t.me/quizkokobot</a> — or scan the QR code at the bottom of this post with your phone camera.</li>
<li>Tap the <strong>Start</strong> button in the bot chat.</li>
<li>The game begins — questions arrive and you can duel right away; identification happens through your Telegram account with no separate sign-up.</li>
</ol>

<h2>Why a Telegram edition?</h2>
<ul>
<li><strong>Zero installs</strong> — no app-store download and no extra storage; wherever Telegram runs, Koko runs.</li>
<li><strong>Every device</strong> — phone and tablet and desktop; the game runs inside Telegram itself.</li>
<li><strong>Instant entry</strong> — one link or one QR scan between you and the first question.</li>
</ul>

<h2>Bot link and QR code</h2>
<p>Direct bot address: <a href="https://t.me/quizkokobot">t.me/quizkokobot</a> — to enter fast on a phone scan the QR code below.</p>
<figure>
<img src="/media/quizkokobot-qr.png" alt="QR code of the Quiz of Koko Telegram bot — quizkokobot" width="420" height="442" loading="lazy" />
<figcaption>The @quizkokobot QR code — scan it with your phone camera and land straight in the game.</figcaption>
</figure>

<h2>@quizkokobot bot vs @quizofkoko channel — what is the difference?</h2>
<p>Do not mix these two up:</p>
<ul>
<li><a href="https://t.me/quizkokobot">The @quizkokobot bot</a> — the game itself; where questions and duels run.</li>
<li><a href="https://t.me/quizofkoko">The @quizofkoko channel</a> — announcements; new-version news and Koko updates are posted there. The channel's QR code also lives on the <a href="https://mehrdad.ir/work/quiz-of-koko">project page</a>.</li>
</ul>

<h2>Every way to follow Koko</h2>
<ul>
<li>Web — <a href="https://quizofkoko.com">quizofkoko.com</a></li>
<li>Android — <a href="https://cafebazaar.ir/app/com.quizofkoko.game">get it on Cafe Bazaar</a></li>
<li>App inside Telegram — <a href="https://t.me/quizkokobot">t.me/quizkokobot</a></li>
<li>Telegram channel — <a href="https://t.me/quizofkoko">t.me/quizofkoko</a></li>
<li>Instagram — <a href="https://www.instagram.com/quizofkoko/">instagram.com/quizofkoko</a></li>
<li>Product page — <a href="https://mehrdad.ir/work/quiz-of-koko">mehrdad.ir/work/quiz-of-koko</a></li>
</ul>
<p>The rest of the posts live in the <a href="https://mehrdad.ir/blog">mehrdad.ir blog</a>.</p>

<h2>FAQ</h2>
<h3>Do I need to install the Koko app to play on Telegram?</h3>
<p>No — the game runs inside Telegram itself; just open the <a href="https://t.me/quizkokobot">@quizkokobot</a> bot and hit Start. If you prefer, the Android edition is also available separately on <a href="https://cafebazaar.ir/app/com.quizofkoko.game">Cafe Bazaar</a>.</p>
<h3>How is the Telegram edition different from the web edition?</h3>
<p>Both are the same game; the Telegram edition runs inside the chat with no install while the <a href="https://quizofkoko.com">web edition</a> opens in your browser — pick whichever feels easier.</p>
<h3>Where do I follow future Koko news?</h3>
<p>Join the <a href="https://t.me/quizofkoko">Koko Telegram channel</a> or follow the <a href="https://www.instagram.com/quizofkoko/">Koko Instagram page</a>; version news is posted there.</p>
`.trim(),
} as const;

/** Curated topic tags (SEO keywords for JSON-LD + the blog filter row). */
export const KOKO_POST_TAGS = [
  { slug: 'telegram', nameEn: 'Telegram', nameFa: 'تلگرام' },
  { slug: 'koko', nameEn: 'Koko', nameFa: 'کوکو' },
  { slug: 'quiz', nameEn: 'Quiz', nameFa: 'کوییز' },
  { slug: 'word-game', nameEn: 'Word Game', nameFa: 'بازی کلمات' },
] as const;
