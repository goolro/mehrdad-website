/**
 * Content seed importer — real site content that must exist in the
 * production database, shipped as code (same philosophy as
 * src/lib/project-profiles.ts: content travels with git, zero manual
 * production DB access needed).
 *
 * Behaviour:
 * - INSERT-IF-MISSING only: an existing row (e.g. edited later via the
 *   admin panel) is NEVER overwritten — admin stays the source of truth.
 * - Idempotent and cheap: after the first pass per process it no-ops.
 * - Fail-safe by design: any error (missing table on a fresh DB, remote
 *   DB hiccup during boot) is logged and swallowed — seeding must never
 *   crash the server or a deploy.
 *
 * Invoked from src/instrumentation.ts (server boot) and from the /work
 * page (build-time prerender, so the statically generated list includes
 * seeded rows on the very first deploy).
 */
import { db } from '@/lib/db';

interface SeedProject {
  slug: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  cover: string | null;
  section: 'work' | 'lab';
  status: 'live' | 'building' | 'testing' | 'idea' | 'concept' | 'paused' | 'archived';
  featured: boolean;
  order: number;
}

// cache-busting repair (2026-09-26): the traffic-tempo cover bytes were
// REPLACED (official app icon) while keeping the same URL — visitors whose
// browser/ISP proxy had cached the old bytes kept seeing the old icon.
// Fix: keep ONE file at the stable path and bust caches via a version query
// (?v=2) in the cover URL. The repair fires ONLY while the row still holds
// one of the previously-seeded raw values — a real admin edit (anything
// else) is never overwritten. INSERT-IF-MISSING stays the default.
const PREV_SEED_COVERS: Record<string, string[]> = {
  'traffic-tempo': ['/media/traffic-tempo-icon.webp', '/media/traffic-tempo-icon-2.webp'],
};

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: 'traffic-tempo',
    titleEn: 'Traffic Tempo',
    titleFa: 'ترافیک تمپو',
    summaryEn:
      'A traffic intersection puzzle for Android — 50 handcrafted levels across 3 difficulties, a global daily challenge and a live leaderboard. Every level is verified by an algorithmic solver.',
    summaryFa:
      'بازی پازل تقاطع برای اندروید با ۵۰ مرحله دست‌ساز در سه سختی و چالش روزانه جهانی و لیدربورد زنده. هر مرحله با حل‌کننده الگوریتمی تأیید شده است.',
    cover: '/media/traffic-tempo-icon.webp?v=2',
    section: 'work',
    status: 'live',
    featured: false,
    order: 50,
  },
];

/**
 * Daily articles (2026-09-27 redesign): REAL original editorials about
 * successful products — summary + full article + expert verdict in EN and
 * FA. No external links and no feed imports: the owner explicitly rejected
 * the old link-dump format («مگه ما تبلیغ کننده اون سایت هستیم؟»). The
 * Persian text follows the project-wide editorial rule: NO Persian comma
 * (،) anywhere.
 */
interface SeedArticle {
  slug: string;
  day: string;
  category: 'product' | 'ai' | 'startup';
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  bodyEn: string;
  bodyFa: string;
  verdictEn: string;
  verdictFa: string;
  tagsEn: string[];
  tagsFa: string[];
}

const SEED_ARTICLES: SeedArticle[] = [
  {
    slug: 'gpt-6-sol-luna',
    day: '2026-09-27',
    category: 'ai',
    titleEn: 'GPT-6 Sol and Luna: frontier AI at half the price changes the math for small teams',
    titleFa: 'GPT-6 سول و لونا — هوش مصنوعی مرزی با نصف قیمت و معادلهٔ تازهٔ تیم‌های کوچک',
    summaryEn:
      "GPT-6 ships as two tuned variants — Sol for deep reasoning and Luna for speed. The bigger story is the price: frontier capability at roughly half of last year's cost puts serious AI inside reach of one-person studios.",
    summaryFa:
      'GPT-6 در دو حالت عرضه شده — سول برای استدلال عمیق و لونا برای سرعت. اما داستان اصلی قیمت است: توان مرزی با حدود نصف هزینهٔ سال گذشته کارهای جدی هوش مصنوعی را به دست استودیوهای یک‌نفره می‌رساند.',
    bodyEn: `<p>On the surface this looks like a routine model announcement — a new name and a leaderboard bump. The interesting part is the packaging. GPT-6 arrives as two variants tuned for opposite trade-offs: <strong>Sol</strong> leans into slow and careful reasoning for hard problems while <strong>Luna</strong> is optimized for latency and cost on everyday work. One model family with two gears instead of a single model pretending to fit every job.</p>
<h2>Why the price cut matters more than the benchmark</h2>
<p>Benchmarks move the conversation but pricing moves behavior. When frontier capability costs half of what it did last year the math changes for anyone building on top of it. A feature that was too expensive to serve at scale yesterday becomes a default capability tomorrow. That is not a small step — it reopens product roadmaps that were quietly closed for cost reasons.</p>
<h3>The one-person studio wins first</h3>
<p>The clearest winners are small teams. An independent developer or a two-person studio can now prototype against the strongest model instead of settling for the cheap one and hoping the idea survives the downgrade. In my own workflow the model bill had quietly become a design constraint — it now reads like a bill I can afford again. I document exactly how I build products this way on the <a href="/fde">FDE page</a>.</p>
<h2>How to use two models without overthinking it</h2>
<ul>
<li><strong>Draft and plan with Sol.</strong> Architecture decisions and tricky bugs deserve the slow gear.</li>
<li><strong>Ship with Luna.</strong> Chat replies and classification and summaries should feel instant.</li>
<li><strong>Re-evaluate monthly.</strong> The frontier moves and yesterday's split may already be stale.</li>
</ul>
<p>The tooling you wrap around the model matters as much as the model itself — the same principle behind the <a href="/services">product services</a> I offer.</p>`,
    bodyFa: `<p>در نگاه اول این یک اعلام مدل معمولی است — یک نام تازه و رشدی روی لیدربورد. اما نکتهٔ مهم در بسته‌بندی است. GPT-6 با دو حالت تیون‌شده برای دو نیاز متضاد می‌آید. <strong>سول</strong> برای استدلال عمیق و کندتر روی مسائل سخت ساخته شده و <strong>لونا</strong> برای پاسخ سریع و ارزان روی کارهای روزمره. یک خانوادهٔ مدل با دو دنده به‌جای یک مدل که ادعا می‌کند برای هر کاری مناسب است.</p>
<h2>چرا کاهش قیمت مهم‌تر از بنچمارک است</h2>
<p>بنچمارک گفتگوها را جلو می‌برد اما قیمت رفتار را عوض می‌کند. وقتی توان مرزی نصف شود معادلهٔ همهٔ سازنده‌ها تغییر می‌کند. قابلیتی که دیروز به‌خاطر هزینهٔ سرو کردن در مقیاس غیرممکن بود فردا به قابلیت پیش‌فرض محصول تبدیل می‌شود. این یک قدم کوچک نیست — نقشهٔ راه محصولاتی را که به‌خاطر هزینه بسته شده بود دوباره باز می‌کند.</p>
<h3>اولین برنده‌ها استودیوهای یک‌نفره‌اند</h3>
<p>سود روشن این تغییر به دست تیم‌های کوچک می‌رسد. یک توسعه‌دهندهٔ مستقل یا استودیوی دونفره حالا می‌تواند نمونهٔ اولیه‌اش را روی قوی‌ترین مدل بسازد نه روی مدل ارزان با امید اینکه ایده از افت کیفیت جان سالم به در ببرد. در روند کاری خودم هزینهٔ مدل داشت بی‌سروصدا به یک محدودیت طراحی تبدیل می‌شد — حالا دوباره به هزینه‌ای قابل مدیریت برگشته است. جزئیات شیوهٔ ساخت من در <a href="/fde">صفحهٔ FDE</a> آمده است.</p>
<h2>استفاده از دو مدل بدون پیچیدگی</h2>
<ul>
<li><strong>برنامه‌ریزی و معماری با سول.</strong> تصمیم‌های سخت لایق دندهٔ کند و دقیق هستند.</li>
<li><strong>تحویل با لونا.</strong> جواب چت و دسته‌بندی و خلاصه‌سازی باید فوری باشند.</li>
<li><strong>هر ماه بازبینی کن.</strong> مرز توان مدل‌ها دائم جابه‌جا می‌شود و ترکیب دیروز ممکن است کهنه باشد.</li>
</ul>
<p>ابزارهایی که دور مدل می‌سازی به اندازهٔ خود مدل مهم‌اند — همان اصلی که در <a href="/services">خدمات ساخت محصول</a> من می‌بینید.</p>`,
    verdictEn: `<p>This launch is less about a smarter model and more about a cheaper one — and cheap frontier intelligence is the kind of change that quietly reshapes entire product categories. My take: treat Sol and Luna as two gears in one drivetrain. Think with Sol and ship with Luna. The teams that learn to alternate between the two will out-build teams still paying premium rates for every single token. For me this is the most practical AI release of the year.</p>`,
    verdictFa: `<p>نظر من این عرضه بیشتر از اینکه دربارهٔ مدل هوشمندتر است دربارهٔ مدل ارزان‌تر است — و ارزان شدن هوش مرزی همان نوع تغییری است که بی‌سروصدا کل دسته‌های محصول را بازتعریف می‌کند. سول و لونا را دو دندهٔ یک موتور بدان: با سول فکر کن و با لونا تحویل بده. تیم‌هایی که یاد می‌گیرند بین این دو جابه‌جا شوند از تیم‌هایی که برای هر توکن قیمت گرانی می‌پردازند جلوتر خواهند ساخت. برای من این عملی‌ترین عرضهٔ هوش مصنوعی امسال است.</p>`,
    tagsEn: ['AI', 'LLM pricing', 'OpenAI'],
    tagsFa: ['هوش مصنوعی', 'قیمت‌گذاری مدل‌ها'],
  },
  {
    slug: 'superhuman-go',
    day: '2026-09-27',
    category: 'ai',
    titleEn: 'Superhuman Go puts the AI assistant where the work actually happens',
    titleFa: 'Superhuman Go — دستیار هوشمند درست سر جای واقعی کار',
    summaryEn:
      'Superhuman Go skips the empty chat box and embeds assistance across the tools you already use — drafting replies and summarizing threads and prepping your next meeting in place. A quiet bet that the future of AI help is contextual and not another tab.',
    summaryFa:
      'Superhuman Go به‌جای یک چت خالی لایهٔ هوشمند را روی ابزارهایی می‌گذارد که همین حالا با آن‌ها کار می‌کنید — پاسخ‌نویسی و خلاصه‌سازی و آماده‌سازی جلسه در همان‌جا. شرط‌بندی کم‌سروصدا اما مهم: آیندهٔ کمک هوشمند درهم‌تنیده با متن کار است نه یک تب دیگر.',
    bodyEn: `<p>The default assistant experience still means copying context into a chat window and pasting the answer back. That round-trip is the hidden tax on every AI-assisted task. Superhuman Go attacks the tax itself: the assistant reads the surface you are already on and acts there — no copying and no context switching.</p>
<h2>What it looks like in practice</h2>
<ul>
<li>An email thread collapses into a three-line brief before you open it.</li>
<li>A reply is drafted in your own tone while you are still reading.</li>
<li>The meeting you walk into already has a one-page prep sheet waiting.</li>
</ul>
<h2>The trade nobody talks about</h2>
<p>Embedded assistance only works if it can see your work — and that is a trust decision rather than a feature toggle. Granting an assistant a standing view of your inbox and calendar buys speed with surface area. Every team will draw that line somewhere different and the product is honest enough to make the line visible instead of hiding it in a settings maze.</p>
<p>I keep the same principle in the products I build: context should be earned per surface instead of granted all at once. It costs more engineering time and it is the only version of this that ages well.</p>`,
    bodyFa: `<p>تجربهٔ رایج دستیارها هنوز یعنی کپی کردن بافت کار در یک پنجرهٔ چت و برگرداندن جواب به همان‌جا. این رفت‌وبرگشت مالیات پنهان هر کار هوشمند است. Superhuman Go خودِ مالیات را هدف گرفته: دستیار سطحی را که روی آن هستید می‌خواند و در همان سطح عمل می‌کند — نه کپی و نه جابه‌جایی بافت.</p>
<h2>در عمل چه شکلی دارد</h2>
<ul>
<li>رشتهٔ ایمیل پیش از باز کردن به خلاصه‌ای سه‌خطی تبدیل می‌شود.</li>
<li>پاسخ در حالی که شما مشغول خواندن هستید با لحن خودتان نوشته می‌شود.</li>
<li>جلسه‌ای که واردش می‌شوید از قبل برگهٔ آمادگی یک‌صفحه‌ای دارد.</li>
</ul>
<h2>معامله‌ای که کسی درباره‌اش حرف نمی‌زند</h2>
<p>دستیار درهم‌تنیده فقط زمانی کار می‌کند که کار شما را ببیند — و این یک تصمیم اعتماد است نه یک کلید قابلیت. دادن دید دائمی به صندوق ایمیل و تقویم سرعت را با سطح نفوذ می‌خرد. هر تیم این مرز را جای متفاوتی می‌کشد و محصول به اندازهٔ کافی صادق است که مرز را پیدا نشان دهد نه اینکه آن را در هزارتو تنظیمات پنهان کند.</p>
<p>من در محصولاتی که می‌سازم همین اصل را نگه می‌دارم: بافت باید سطح‌به‌سطح به دست بیاید نه یک‌جا اعطا شود. این راه مهندسی گران‌تری است و تنها نسخه‌ای است که با گذر زمان خوب پیر می‌شود.</p>`,
    verdictEn: `<p>Assistants that come to you will beat assistants you have to visit — of that much I am confident. The open question is whether a cross-tool layer can stay fast and trustworthy as it grows. Superhuman Go is the most serious attempt I have seen at making embedded help feel native instead of bolted on. For anyone whose day is a wall of threads and meetings it is worth a month of honest trial.</p>`,
    verdictFa: `<p>دستیاری که پیش تو می‌آید از دستیاری که باید سراغش بروی برنده است — در این تردیدی نیست. سؤال باز این است که آیا یک لایهٔ بین‌ابزاری می‌تواند هم‌زمان سریع بماند و قابل اعتماد. Superhuman Go جدی‌ترین تلاشی است که دیده‌ام برای بومی شدن کمکِ درهم‌تنیده به‌جای نصب اضافه روی سیستم. برای کسی که روزش دیواری از پیام و جلسه است یک ماه امتحان صادقانه می‌ارزد.</p>`,
    tagsEn: ['AI assistants', 'productivity'],
    tagsFa: ['دستیار هوشمند', 'بهره‌وری'],
  },
  {
    slug: 'cuey',
    day: '2026-09-26',
    category: 'ai',
    titleEn: 'Cuey compares ChatGPT and Claude and Gemini in a single tab',
    titleFa: 'Cuey — مقایسهٔ ChatGPT و Claude و Gemini در یک تب',
    summaryEn:
      'Cuey sends one prompt to the leading AI models and lines the answers up side by side. It turns the hunch every power user already has — that models are good at different things — into a visible and decision-ready habit.',
    summaryFa:
      'Cuey یک پرامپت را به مدل‌های اصلی هوش مصنوعی می‌فرستد و پاسخ‌ها را کنار هم می‌چیند. حدس مشترک کاربران حرفه‌ای را که هر مدل در کاری خوب است به یک عادت دیدنی و تصمیم‌پذیر تبدیل می‌کند.',
    bodyEn: `<p>Type once. Cuey fans the prompt out to the major models and returns the answers in one clean comparison view. No tab juggling and no subscription Tetris — the same question answered several ways with the differences impossible to miss.</p>
<h2>Why comparing models is now a real workflow</h2>
<p>The model market has stopped being a one-horse race. Writing quality and reasoning depth and code accuracy all drift apart across providers — and the gap is task-specific rather than general. Experienced users already behave this way by hand. Cuey simply removes the friction of doing it manually.</p>
<h3>A quiet pricing lesson</h3>
<p>Seeing answers side by side also makes subscription stacking visible. Most people do not need three premium plans — they need one good default plus a comparison habit for the few tasks where the choice actually matters.</p>
<p>My own rule after months of daily model use: pick the model per task instead of per brand. The <a href="/services">idea-to-product pipeline</a> I run works exactly the same way.</p>`,
    bodyFa: `<p>یک بار می‌نویسی. Cuey پرامپت را به مدل‌های اصلی می‌فرستد و پاسخ‌ها را در یک نمای مقایسه‌ای تمیز برمی‌گرداند. نه جابه‌جایی تب لازم است و نه پازل اشتراک‌ها — همان یک سؤال با چند جواب که تفاوت‌ها انکارناپذیرند.</p>
<h2>چرا مقایسهٔ مدل‌ها حالا یک روند کاری واقعی است</h2>
<p>بازار مدل‌ها از مسابقهٔ تک‌اسب عبور کرده است. کیفیت نوشتن و عمق استدلال و دقت کدنویسی بین سرویس‌دهنده‌ها فاصله می‌گیرد — و این فاصله وابسته به نوع کار است نه کلی. کاربران باتجربه همین رفتار را به‌صورت دستی دارند. Cuey فقط اصطکاک آن را برداشته است.</p>
<h3>درسی کم‌سروصدا دربارهٔ هزینه</h3>
<p>دیدن پاسخ‌ها کنار هم سبد اشتراک‌ها را هم شفاف می‌کند. بیشتر افراد به سه اشتراک گران نیاز ندارند — به یک پیش‌فرض خوب نیاز دارند به‌علاوهٔ یک عادت مقایسه برای کارهای معدودی که انتخاب در آن‌ها واقعا مهم است.</p>
<p>قانون من بعد از ماه‌ها استفادهٔ روزانه: مدل را بر اساس کار انتخاب کن نه بر اساس برند. <a href="/services">خط تولید ایده تا محصول</a> من هم دقیقا همین‌طور کار می‌کند.</p>`,
    verdictEn: `<p>Cuey is a small tool in the best sense — it does one job and that job has become strategic. Multi-model comparison is the closest thing to a daily driver for AI power users. If you ever hesitated over which model to trust with a task this is the fastest way to stop guessing. One request for the next version: keep the free tier honest — comparison layers die the moment they turn into ads for one provider.</p>`,
    verdictFa: `<p>Cuey در بهترین معنای کلمه ابزاری کوچک است — یک کار می‌کند و آن کار حالا راهبردی شده است. مقایسهٔ چندمدلی نزدیک‌ترین چیز به یک ابزار روزمره برای کاربران حرفه‌ای هوش مصنوعی است. اگر جایی مردد بوده‌ای کدام مدل را باور کنی سریع‌ترین راه برای توقف حدس‌زدن همین است. یک درخواست هم از نسخهٔ بعد دارم: پلن رایگان را منصف نگه دار — لایه‌های مقایسه همان لحظه‌ای می‌میرند که به تبلیغ یک سرویس‌دهنده تبدیل می‌شوند.</p>`,
    tagsEn: ['AI tools', 'model comparison'],
    tagsFa: ['ابزارهای AI', 'مقایسهٔ مدل‌ها'],
  },
  {
    slug: 'fewer',
    day: '2026-09-26',
    category: 'product',
    titleEn: 'Fewer is a launcher that counts how often you pick up your phone',
    titleFa: 'Fewer — لانچری که می‌شمارد چند بار در روز گوشی را برمی‌دارید',
    summaryEn:
      'Fewer replaces your home screen with a plain launcher and quietly shows the number most phones hide: how many times a day you pick the device up. Measurement as a design choice — and a rare anti-addiction stance in launch software.',
    summaryFa:
      'Fewer صفحهٔ خانه را با یک لانچر ساده عوض می‌کند و عددی را نشان می‌دهد که بیشتر گوشی‌ها پنهانش می‌کنند: در یک روز چند بار دستگاه را برمی‌دارید. سنجش به‌عنوان تصمیم طراحی — و موضعی نادر ضداعتیاد در نرم‌افزار لانچر.',
    bodyEn: `<p>Pickups are the honest metric of attention. Screen-time totals blur everything together but a count of how many times your hand reached for the phone lands differently. Fewer surfaces that number at every unlock — not as a guilt screen but as a plain fact.</p>
<h2>A launcher built on subtraction</h2>
<ul>
<li>No feeds and no badges shouting for one more swipe.</li>
<li>Apps are one search away — which turns out to be enough.</li>
<li>The counter sits quietly and does all the nudging.</li>
</ul>
<h2>The business model is both the risk and the point</h2>
<p>Almost every launcher on the market monetizes attention — that is the business. Fewer sells the opposite and that is exactly why it works. The open question is whether enough people will pay for less. My experience building small utilities says a focused niche will: the same lesson behind every product in <a href="/work">my work section</a>.</p>`,
    bodyFa: `<p>شمار برمیداشتن گوشی صادقانه‌ترین سنجهٔ توجه است. مجموع ساعت استفاده همه‌چیز را یک‌جور نشان می‌دهد اما شمار دفعاتی که دست به سمت گوشی رفت جور دیگری نشسته می‌شود. Fewer این عدد را در هر باز کردن نشان می‌دهد — نه به‌عنوان صفحهٔ عذاب وجدان بلکه به‌عنوان یک واقعیت ساده.</p>
<h2>لانچری ساخته‌شده با تفریق</h2>
<ul>
<li>نه فیدی دارد و نه نشان‌هایی که برای یک سوایپ دیگر فریاد بزنند.</li>
<li>اپ‌ها یک جست‌وجو با آن‌ها فاصله دارند — و همین کافی از آب درمی‌آید.</li>
<li>شمارنده آرام نشسته و همهٔ پیام را همان می‌دهد.</li>
</ul>
<h2>مدل درآمدی هم ریسک است هم نکته</h2>
<p>تقریبا همهٔ لانچرهای بازار از توجه پول درمی‌آورند — این ماهیت کارشان است. Fewer برعکسش را می‌فروشد و دقیقا به همین دلیل کار می‌کند. سؤال باز این است که آیا مردم حاضرند بابت «کمتر» پول بدهند. تجربهٔ من در ساخت ابزارهای کوچک می‌گوید یک جامعهٔ متمرکز خواهد پرداخت: همان درسی که پشت همهٔ <a href="/work">محصولات بخش کار من</a> نشسته است.</p>`,
    verdictEn: `<p>Fewer is one of those rare products whose success metric is the user leaving. As someone who builds products for a living I respect the discipline that takes. The launcher itself is deliberately plain — the counter is the product. If your pickup count scares you this is the cheapest intervention that actually works. And if it does not scare you yet — the number will.</p>`,
    verdictFa: `<p>Fewer از آن محصولات نادری است که سنجهٔ موفقیتش بیرون رفتن کاربر است. من که برای معیشت محصول می‌سازم به نظمی که این کار می‌طلبد احترام می‌گذارم. خود لانچر عمدا ساده است — محصول همان شمارنده است. اگر شمار برمیداشتن گوشی‌ات ترسناک است این ارزان‌ترین مداخله‌ای است که واقعا جواب می‌دهد. و اگر هنوز ترسناک نیست — همین عدد ترسناکش می‌کند.</p>`,
    tagsEn: ['digital wellbeing', 'launchers'],
    tagsFa: ['سلامت دیجیتال', 'لانچر'],
  },
  {
    slug: 'kiwidesk',
    day: '2026-09-25',
    category: 'product',
    titleEn: 'KiwiDesk brings macOS window tiling that feels built into the system',
    titleFa: 'KiwiDesk — چیدمان پنجره برای مک که انگار جزو خود سیستم است',
    summaryEn:
      'KiwiDesk adds keyboard-driven tiling and layouts to macOS that behave like a first-party feature — no overlay UI and no fighting the system. A study in how small utilities earn a permanent home on the dock.',
    summaryFa:
      'KiwiDesk چیدمان با کیبورد و چیدمان‌های آماده را به مک اضافه می‌کند به شکلی که مثل قابلیت رسمی سیستم رفتار می‌کند — نه رابط اضافه و نه درگیری با سیستم. نمونه‌ای از اینکه ابزارهای کوچک چطور جای دائمی در داک می‌خرند.',
    bodyEn: `<p>Window managers live or die by how much they feel like the operating system. The moment you notice an overlay or a permission dance the tool starts paying rent in trust. KiwiDesk takes the opposite path: shortcuts and layout actions that behave exactly the way macOS itself would have shipped them.</p>
<h2>What daily use looks like</h2>
<ul>
<li>Half and quarter tiles through a two-key habit.</li>
<li>A layout switch that survives display changes.</li>
<li>Nothing in your menu bar that you did not ask for.</li>
</ul>
<h2>Small tools compound</h2>
<p>A tiling tool saves a few seconds per window move — hundreds of times a day for a developer or a writer. The compounding is the entire value proposition and it only works because the tool never interrupts. My own rule for the <a href="/work">utilities I build</a>: the product must disappear into the motion of work.</p>`,
    bodyFa: `<p>مدیر پنجره با میزان بومی بودن زندگی و مرگ می‌کند. همان لحظه‌ای که رابط اضافه یا رقص دسترسی‌ها دیده شود ابزار شروع می‌کند از اعتماد کاربر اجاره بگیرد. KiwiDesk راه مقابل را رفته: میانبرها و چیدمان‌ها دقیقا طوری رفتار می‌کنند که اگر اپل خودش عرضه کرده بود.</p>
<h2>استفادهٔ روزمره چه شکلی دارد</h2>
<ul>
<li>کاشی نیم و یک‌چهارم با یک عادت دومنظوره.</li>
<li>تعویض چیدمان که با تغییر نمایشگر از دست نمی‌رود.</li>
<li>هیچ چیزی در منوبار نیست که خودت نخواسته باشی.</li>
</ul>
<h2>ابزارهای کوچک اثر مرکب دارند</h2>
<p>ابزار چیدمان در هر جابه‌جایی چند ثانیه صرفه‌جویی می‌کند — برای توسعه‌دهنده یا نویسنده صدها بار در روز. این اثر مرکب تمام ارزش پیشنهادی است و فقط وقتی کار می‌کند که ابزار هیچ‌وقت مزاحم نشود. قانون خودم برای <a href="/work">ابزارهایی که می‌سازم</a>: محصول باید در حرکت کار محو شود.</p>`,
    verdictEn: `<p>KiwiDesk is the kind of craft product that is easy to underestimate. It does not ask for attention and that is precisely why it keeps it. For anyone on a 13-inch screen or a single-monitor desk this is the fastest path to a calmer desktop. It will be on my essential list for every new Mac this year.</p>`,
    verdictFa: `<p>KiwiDesk از آن محصولات باصرفه‌گری است که دست‌کم گرفتنش آسان است. تقاضای توجه ندارد و دقیقا به همین دلیل توجه را نگه می‌دارد. برای کسی که با نمایشگر ۱۳ اینچی یا یک مانیتور کار می‌کند سریع‌ترین راه به یک دسکتاپ آرام‌تر همین است. امسال در فهرست ضروری‌های من برای هر مک تازه‌ای خواهد بود.</p>`,
    tagsEn: ['macOS', 'utilities'],
    tagsFa: ['مک', 'ابزارها'],
  },
  {
    slug: 'paragraph-notes',
    day: '2026-09-25',
    category: 'product',
    titleEn: 'Paragraph Notes is a private Markdown home for your Mac',
    titleFa: 'Paragraph Notes — خانهٔ خصوصی Markdown برای مک شما',
    summaryEn:
      'Paragraph Notes keeps your notes as plain Markdown files on your own disk — no account and no lock-in and no telemetry drama. Part of a wider local-first swing that treats owning your files as a feature again.',
    summaryFa:
      'Paragraph Notes یادداشت‌ها را به‌شکل فایل‌های سادهٔ Markdown روی دیسک خودتان نگه می‌دارد — بدون حساب و بدون قفل‌شدگی و بدون جنجال داده. بخشی از موج بازگشت local-first که مالکیت فایل را دوباره قابلیت حساب می‌کند.',
    bodyEn: `<p>The pitch is one sentence: your notes live as Markdown files in a folder you control. That single decision answers the questions cloud note apps keep reopening — what happens if the service shuts down and what happens to search inside someone else's database and who can read your drafts.</p>
<h2>Local-first is having a moment again</h2>
<p>A few years ago everything had to become a cloud workspace. The pendulum is swinging back as people watch services get acquired and shut down and repriced. Local-first apps like Paragraph Notes sell something older than the cloud: possession. Sync exists where it helps but the source of truth stays on your disk.</p>
<h2>Where the trade-off lives</h2>
<ul>
<li>No web app — your notes are only where your Mac is.</li>
<li>Sharing means files rather than links.</li>
<li>Backups are your job — and Time Machine makes that trivial.</li>
</ul>
<p>I hold the same view for anything I build that touches writing: the user must be able to walk away with their data in an open format. It is the quiet backbone of <a href="/fde">the way I build</a>.</p>`,
    bodyFa: `<p>پیشنهادش یک جمله است: یادداشت‌های شما به‌شکل فایل‌های Markdown در پوشه‌ای زیر کنترل خودتان زندگی می‌کنند. همین یک تصمیم به همهٔ سؤال‌هایی جواب می‌دهد که اپ‌های ابری یادداشت مدام بازشان می‌کنند — اگر سرویس تعطیل شود چه می‌شود و جست‌وجو داخل دیتابیس دیگری چه سرنوشتی دارد و چه کسی پیش‌نویس‌های شما را می‌خواند.</p>
<h2>موج local-first دوباره برگشته</h2>
<p>چند سال پیش همه‌چیز باید فضای کاری ابری می‌شد. عقربه حالا برمی‌گردد چون مردم دیدند سرویس‌ها خریداری و تعطیل و گران می‌شوند. اپ‌های local-first مثل Paragraph Notes چیزی قدیمی‌تر از ابر می‌فروشند: مالکیت. همگام‌سازی هست اما منبع حقیقت روی دیسک خودت می‌ماند.</p>
<h2>جای معامله کجاست</h2>
<ul>
<li>وب‌اپ ندارد — یادداشت‌ها فقط جایی هستند که مک شماست.</li>
<li>اشتراک یعنی فایل نه لینک.</li>
<li>پشتیبان‌گیری کار خودت است — و Time Machine آن را پیش‌پاافتاده می‌کند.</li>
</ul>
<p>من هم برای هر چیزی که می‌سازم و به نوشتن دست می‌زند همین نگاه را دارم: کاربر باید بتواند داده‌اش را در قالبی باز با خودش ببرد. این ستون فقرات آرام <a href="/fde">شیوهٔ ساخت من</a> است.</p>`,
    verdictEn: `<p>Paragraph Notes will not win a feature checklist against the big workspaces — that is not its game. It wins the decade question: will your notes still be yours in ten years. Plain files outlast every company. If you write for a living this deserves a permanent home on your Mac.</p>`,
    verdictFa: `<p>Paragraph Notes در چک‌لیست قابلیت‌ها بر کارگاه‌های بزرگ نمی‌برد — بازی آن این نیست. او سؤال ده‌ساله را می‌برد: آیا یادداشت‌هایتان ده سال دیگر هنوز مال خودتان خواهد بود. فایل ساده از هر شرکتی ماندگارتر است. اگر برای معیشت می‌نویسید جای دائمی در مک شما را دارد.</p>`,
    tagsEn: ['local-first', 'notes'],
    tagsFa: ['local-first', 'یادداشت'],
  },
  {
    slug: 'linear-method',
    day: '2026-09-28',
    category: 'startup',
    titleEn: 'The Linear method: why saying no to half the roadmap builds the better startup',
    titleFa: 'روش لینیر — چرا نه گفتن به نصف نقشهٔ راه استارتاپ بهتری می‌سازد',
    summaryEn:
      'Linear grew a devoted user base by refusing the startup default of shipping everything: a slower cadence of opinionated releases and an interface that stays fast. What a small team can copy from that discipline without copying the product.',
    summaryFa:
      'لینیر با رد کردن عادت پیش‌فرض استارتاپ‌ها یعنی ساختن همه‌چیز کاربرانی وفادار پیدا کرد: ریتم آرام‌تر انتشار با نظر مشخص و رابطی که همیشه سریع می‌ماند. آنچه یک تیم کوچک می‌تواند از این نظم یاد بگیرد بدون کپی کردن محصول.',
    bodyEn: `<p>Every startup tutorial repeats the same instruction: ship fast and ship often. Linear quietly runs the opposite experiment — a release cadence that looks slow from the outside while the product feels faster than almost anything else in its category. The two ideas are not actually in conflict. Linear ships fast internally and publishes slowly and deliberately.</p>
<h2>The three decisions worth studying</h2>
<ul>
<li><strong>Opinion over options.</strong> The settings surface is small because most decisions were made once and made well.</li>
<li><strong>Speed as a feature.</strong> Every screen responds under a blink — performance budgets treated as product requirements.</li>
<li><strong>A small public surface.</strong> The team writes about how they work and lets the method do the marketing.</li>
</ul>
<h2>What a smaller team can actually take</h2>
<p>You cannot copy a design culture in a weekend. What transfers is the filter: before adding a feature ask what the product says no to. A roadmap that tries to please everyone ships a mediocre version of everything. My own rule for client products is the same — the second version of a feature is where the product starts to rot. This is exactly how I scope work on the <a href="/services">product services</a> side.</p>
<h2>The trade-off is real</h2>
<p>Saying no costs growth in the short term. Some segments never convert because the product refuses their workflow. The bet is that depth wins retention and retention compounds into word of mouth. For teams with runway the math works. For teams chasing their first revenue a stricter filter can starve the machine — know which situation you are in before borrowing the method.</p>`,
    bodyFa: `<p>همهٔ آموزش‌های استارتاپی یک دستور تکراری دارند: سریع بساز و زیاد منتشر کن. لینیر به‌آرامی آزمایش مخالف را اجرا می‌کند — ریتم انتشارش از بیرون کند به نظر می‌رسد در حالی که محصولش از تقریبا هر رقیب هم‌دسته سریع‌تر حس می‌شود. این دو اصل در تضاد نیستند. لینیر درون تیم سریع می‌سازد و بیرون را عمدا آهسته نگه می‌دارد.</p>
<h2>سه تصمیمی که ارزش مطالعه دارد</h2>
<ul>
<li><strong>نظر مشخص به‌جای گزینه‌های بی‌شمار.</strong> صفحهٔ تنظیمات کوچک است چون بیشتر تصمیم‌ها یک بار و درست گرفته شده‌اند.</li>
<li><strong>سرعت به‌عنوان قابلیت.</strong> هر صفحه زیر یک پلک‌زدن پاسخ می‌دهد — بودجهٔ عملکرد مثل الزام محصول رعایت می‌شود.</li>
<li><strong>سطح عمومی کوچک.</strong> تیم دربارهٔ شیوهٔ کارش می‌نویسد و همین روش کار بازاریابی را انجام می‌دهد.</li>
</ul>
<h2>یک تیم کوچک‌تر چه چیزی واقعا می‌تواند بردارد</h2>
<p>فرهنگ طراحی را نمی‌توان در یک آخر هفته کپی کرد. آنچه جابه‌جا می‌شود فیلتر است: پیش از افزودن هر قابلیت بپرس محصول به چه چیزی نه می‌گوید. نقشهٔ راهی که بخواهد همه را خوشحال کند نسخهٔ متوسط همه‌چیز را تحویل می‌دهد. قانون من در محصولات سفارشی همین است — قابلیت در نسخهٔ دومش شروع به پوسیدن می‌کند. همین منطق را در <a href="/services">خدمات ساخت محصول</a> به کار می‌برم.</p>
<h2>هزینهٔ این انتخاب واقعی است</h2>
<p>نه گفتن در کوتاه‌مدت رشد را کم می‌کند. بعضی گروه‌ها هرگز تبدیل نمی‌شوند چون محصول از گردش کارشان سر باز می‌زند. شرط این روش این است که عمق نگه‌داشت کاربر را می‌برد و نگه‌داشت به تبادل شفاهی تبدیل می‌شود. برای تیم‌هایی با زمان کافی این معادله جواب می‌دهد. برای تیم‌هایی که دنبال اولین درآمدشان هستند فیلتر سخت می‌تواند موتور را گرسنه نگه دارد — پیش از قرض گرفتن این روش بدانید در کدام وضعیت هستید.</p>`,
    verdictEn: `<p>Linear is the best current argument that taste is a growth strategy. The product does not chase every market and that refusal is exactly why the users it does have talk about it constantly. My verdict for founders: steal the filter — not the interface. Decide what your product will never do and write it down where the whole team can see. The roadmap that survives is the one with sentences removed from it.</p>`,
    verdictFa: `<p>لینیر بهترین استدلال کنونی است برای اینکه سلیقه یک راهبرد رشد است. محصول به‌دنبال هر بازار نمی‌رود و دقیقا همین سر باز زدن دلیل اصلی این است که کاربرانش مدام درباره‌اش حرف می‌زنند. حکم من برای بنیان‌گذاران: فیلتر را بدزدید نه رابط کاربری را. تصمیم بگیرید محصول شما هرگز چه چیزی نخواهد بود و آن را جایی بنویسید که کل تیم ببیند. نقشهٔ راهی که دوام می‌آورد نقشه‌ای است که از آن جمله حذف شده باشد.</p>`,
    tagsEn: ['startups', 'product strategy'],
    tagsFa: ['استارتاپ', 'راهبرد محصول'],
  },
  {
    slug: 'calm-company-basecamp',
    day: '2026-09-29',
    category: 'startup',
    titleEn: 'Basecamp keeps proving calm companies outlast blitzscaled ones',
    titleFa: 'Basecamp — ثابت می‌کند شرکت‌های آرام از شرکت‌های تندرشد ماندگارترند',
    summaryEn:
      'While most software companies race headcount and burn, Basecamp has run the same playbook for two decades: a handful of products, profitable every year, no growth theater. Why the calm model is newly relevant for founders in 2026.',
    summaryFa:
      'در حالی که بیشتر شرکت‌های نرم‌افزاری مسابقهٔ استخدام و سوخت‌رسانی را دنبال می‌کنند Basecamp دو ده است با همان دستور کار پیش می‌رود: چند محصول معدود و سوددهی در هر سال و بدون نمایش رشد. چرا مدل آرام برای بنیان‌گذاران در سال ۲۰۲۶ تازه اهمیت گرفته است.',
    bodyEn: `<p>The dominant startup story of the last fifteen years says grow or die: raise big and hire fast and figure out revenue later. Basecamp never subscribed. The company stayed small on purpose and profitable on purpose and kept its product surface almost unchanged while entire categories around it boomed and collapsed.</p>
<h2>What the calm company actually optimizes</h2>
<ul>
<li><strong>Profit over headcount.</strong> Every new hire must remove more work than they add.</li>
<li><strong>Few products kept excellent.</strong> The lineup stays short — the maintenance burden stays survivable.</li>
<li><strong>No growth theater.</strong> Metrics that do not touch the bank account are not celebrated.</li>
</ul>
<h2>Why this reads differently in 2026</h2>
<p>Every year the cost story of running software shifts. Talent is expensive and customer acquisition is expensive and investors have stopped rewarding pure growth. In that climate the calm playbook stops looking conservative and starts looking like arbitrage: a two-person team with a profitable product can survive decades that kill venture-funded competitors. I see the same pattern in miniature among the <a href="/work">small products I build</a> — a narrow profitable tool outlives three flashy experiments.</p>
<h2>The honest limitations</h2>
<p>Calm is not free. Markets that demand rapid scale pass such companies by and some categories genuinely need blitzscale to exist at all. A calm company also caps its own upside — nobody buys a private island on Basecamp margins. The model is a values decision as much as a strategy one.</p>`,
    bodyFa: `<p>روایت غالب استارتاپ در پانزده سال گذشته چنین می‌گوید: رشد کن یا بمیر — بزرگ جذب سرمایه کن و سریع استخدام کن و درآمد را بعدا سرجوش بیاور. Basecamp هرگز این روایت را نپذیرفت. شرکت عمدا کوچک ماند و عمدا سودده بود و سطح محصولش تقریبا ثابت ماند در حالی که دسته‌های کامل اطرافش اوج گرفتند و فروپاشیدند.</p>
<h2>شرکت آرام در واقع چه چیزی را بهینه می‌کند</h2>
<ul>
<li><strong>سود به‌جای شمار نیرو.</strong> هر استخدام تازه باید بیشتر از کاری که اضافه می‌کند کار حذف کند.</li>
<li><strong>محصولات معدود اما عالی.</strong> فهرست محصولات کوتاه می‌ماند — بار نگه‌داری قابل تحمل می‌ماند.</li>
<li><strong>بدون نمایش رشد.</strong> سنجه‌ای که به حساب بانکی نرسد جشن گرفته نمی‌شود.</li>
</ul>
<h2>چرا این متن در سال ۲۰۲۶ جور دیگری خوانده می‌شود</h2>
<p>هر سال داستان هزینهٔ نرم‌افزار جابه‌جا می‌شود. استعداد گران است و جذب مشتری گران است و سرمایه‌گذاران دیگر رشد خالص را پاداش نمی‌دهند. در این فضا دستور کار آرام محافظه‌کارانه به نظر نمی‌رسد و شبی آربیتراژ می‌شود: تیمی دونفره با محصولی سودده دهه‌هایی زنده می‌ماند که رقیب‌های سرمایه‌پذیر را می‌کشد. من همین الگو را در مقیاس کوچک در <a href="/work">محصولاتی که می‌سازم</a> می‌بینم — یک ابزار باریک و سودده از سه آزمایش پرزرق‌وبرق ماندگارتر است.</p>
<h2>محدودیت‌های صادقانه</h2>
<p>آرامش رایگان نیست. بازارهایی که رشد سریع می‌خواهند از کنار چنین شرکت‌هایی رد می‌شوند و بعضی دسته‌ها واقعا برای زاده شدن به رشد تند نیاز دارند. شرکت آرام سقف سود خودش را هم می‌زند — با حاشیهٔ سود Basecamp کسی جزیرهٔ خصوصی نمی‌خرد. این مدل هم‌اندازهٔ یک راهبرد یک تصمیم ارزشی است.</p>`,
    verdictEn: `<p>Two decades of profitability without a growth machine is the strongest possible evidence for the calm model and almost nobody copies it — because it is boring and boring does not trend. My take for founders building in 2026: decide early whether you are building a rocket or a house. Rockets need fuel and a launch window. Houses need a foundation and a roof that does not leak. Both are valid. Pretending your house is a rocket is what kills companies.</p>`,
    verdictFa: `<p>دو ده سوددهی بدون ماشین رشد قوی‌ترین شاهد ممکن برای مدل آرام است و تقریبا هیچ‌کس آن را کپی نمی‌کند — چون کسل‌کننده است و کسل‌کننده‌ها ترند نمی‌شوند. نظر من برای بنیان‌گذارانی که در ۲۰۲۶ می‌سازند: زود تصمیم بگیرید که موشک می‌سازید یا خانه. موشک سوخت می‌خواهد و پنجرهٔ پرتاب. خانه پی می‌خواهد و سقفی که ترک بردارد ندارد. هر دو درست‌اند. ادعای موشک بودن برای خانه‌ای که موشک نیست همان چیزی است که شرکت‌ها را می‌کشد.</p>`,
    tagsEn: ['startups', 'bootstrapping'],
    tagsFa: ['استارتاپ', 'بووت‌استرپ'],
  },
];

let done = false;

/**
 * Schema bootstrap for the daily-articles rename (2026-09-27).
 *
 * The old `DailyProduct` link-dump table (one-line Product Hunt cards) was
 * retired by owner decision — the site publishes ORIGINAL bilingual
 * articles now, never outbound product links. On the first postgres boot
 * after this deploy we drop that legacy table (it only ever held feed
 * rows our own pipeline created) and create the new `DailyArticle` table
 * idempotently. SQLite environments (sandbox/cPanel) already get the new
 * table from `prisma db push`, so the DDL is skipped there.
 */
async function bootstrapDailyTable(): Promise<boolean> {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('file:')) return false; // sqlite — schema lives in prisma db push
  let changed = false;
  try {
    await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "DailyProduct"`);
    changed = true;
  } catch (err) {
    console.warn('[seed] legacy DailyProduct drop skipped:', err instanceof Error ? err.message : err);
  }
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DailyArticle" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "day" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'product',
        "titleEn" TEXT NOT NULL,
        "titleFa" TEXT NOT NULL,
        "summaryEn" TEXT NOT NULL,
        "summaryFa" TEXT NOT NULL,
        "bodyEn" TEXT NOT NULL,
        "bodyFa" TEXT NOT NULL,
        "verdictEn" TEXT NOT NULL,
        "verdictFa" TEXT NOT NULL,
        "tagsEn" TEXT,
        "tagsFa" TEXT,
        "published" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DailyArticle_pkey" PRIMARY KEY ("id")
      )`);
    await db.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "DailyArticle_slug_key" ON "DailyArticle"("slug")`
    );
    await db.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "DailyArticle_day_idx" ON "DailyArticle"("day")`
    );
    // staggered publishing (2026-09-28): the scheduled go-live column. NULL on
    // legacy rows = already live — same semantics as before this migration.
    await db.$executeRawUnsafe(
      `ALTER TABLE "DailyArticle" ADD COLUMN IF NOT EXISTS "publishAt" TIMESTAMP(3)`
    );
    // daily categories (2026-09-29): product | ai | startup — the three lanes
    // surfaced in the blog daily-box and the /daily index tabs.
    await db.$executeRawUnsafe(
      `ALTER TABLE "DailyArticle" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'product'`
    );
    changed = true;
  } catch (err) {
    console.warn('[seed] daily table bootstrap skipped:', err instanceof Error ? err.message : err);
    return changed;
  }
  return changed;
}

export async function importContentSeed(): Promise<void> {
  if (done) return;
  done = true;
  try {
    let dailyChanged = await bootstrapDailyTable();

    for (const row of SEED_PROJECTS) {
      const existing = await db.project.findUnique({ where: { slug: row.slug } });
      if (!existing) {
        await db.project.create({ data: { ...row } });
        console.log(`[seed] project "${row.slug}" created`);
        continue;
      }
      // cache-busting repair: the row was seeded by an OLDER version of this
      // file and still holds the exact previously-seeded cover URL, while the
      // bytes under that URL have changed — repair it so visitors see the
      // current asset. Any other (admin-authored) value is left untouched.
      const prevCovers = PREV_SEED_COVERS[row.slug];
      if (
        prevCovers &&
        existing.cover !== null &&
        row.cover !== null &&
        prevCovers.includes(existing.cover) &&
        !prevCovers.includes(row.cover)
      ) {
        await db.project.update({ where: { slug: row.slug }, data: { cover: row.cover } });
        console.log(`[seed] project "${row.slug}" cover repaired → ${row.cover}`);
      }
    }

    for (const row of SEED_ARTICLES) {
      const existing = await db.dailyArticle.findUnique({ where: { slug: row.slug } });
      if (existing) continue;
      await db.dailyArticle.create({
        data: {
          ...row,
          tagsEn: JSON.stringify(row.tagsEn),
          tagsFa: JSON.stringify(row.tagsFa),
        },
      });
      console.log(`[seed] daily article "${row.slug}" created (${row.day})`);
      dailyChanged = true;
    }

    // ONE-TIME legacy category repair (2026-09-29): rows created before the
    // category column existed all carry the DEFAULT 'product' while three of
    // the seeded articles are AI analyses. The repair flips ONLY rows still
    // sitting at the default and then never runs again (SiteSetting flag) —
    // a deliberate admin choice made later is never overwritten.
    const repairFlag = await db.siteSetting.findUnique({ where: { key: 'dailyCategoryRepairDone' } });
    if (!repairFlag) {
      for (const row of SEED_ARTICLES) {
        await db.dailyArticle.updateMany({
          where: { slug: row.slug, category: 'product' },
          data: { category: row.category },
        });
      }
      await db.siteSetting.upsert({
        where: { key: 'dailyCategoryRepairDone' },
        create: { key: 'dailyCategoryRepairDone', value: '1' },
        update: { value: '1' },
      });
      console.log('[seed] daily category repair pass done');
    }

    // the static /daily pages are prerendered at BUILD time — when this boot
    // actually changed the schema or seeded the first rows, fire the deploy
    // hook once so the next build bakes the articles in (self-healing first
    // deploy; one-shot because the seed pass no-ops afterwards).
    if (dailyChanged && process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
      console.log('[seed] deploy hook fired for the daily articles');
    }
  } catch (err) {
    console.warn('[seed] import skipped:', err instanceof Error ? err.message : err);
  }
}
