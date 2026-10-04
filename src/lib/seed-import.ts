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
import { ensureProjectKindColumn } from '@/lib/project-kind';

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

// Blog post seed (owner request 2026-09-30): the angel-investor pitch for
// the MVP-stage AI portfolio. INSERT-IF-MISSING like everything else — an
// existing row (edited later via the admin editor) is NEVER overwritten.
// Persian body follows the no-comma (ویرگول) house rule.
const SEED_POSTS: Array<{
  slug: string;
  titleEn: string;
  titleFa: string;
  excerptEn: string;
  excerptFa: string;
  contentEn: string;
  contentFa: string;
  cover: string;
}> = [
  {
    slug: 'angel-investor-for-mvp-portfolio',
    titleEn: 'Looking for an Angel Investor — Taking Four AI Products from MVP to Real Traction',
    titleFa: 'در جست‌وجوی سرمایه‌گذار فرشته — بردن چهار محصول هوش مصنوعی از MVP به تراکشن واقعی',
    excerptEn:
      'A clear and documented ask: I have already built MVPs — ready to demo and test today. I am looking for an angel partner — not a big VC fund — to fund the next 6–12 months of infrastructure and AI/API costs while we validate traction. Initial support target: $1,000–$2,000 per month, in exchange for a defined equity share.',
    excerptFa:
      'یک درخواست شفاف و مستند: MVPها را ساخته‌ام و همین امروز آمادهٔ ارائه و تست هستند. به دنبال یک شریک فرشته هستم نه یک صندوق بزرگ — برای پوشش ۶ تا ۱۲ ماه آیندهٔ زیرساخت و AI API در حالی که تراکشن واقعی را اثبات می‌کنیم. هدف اولیهٔ حمایت: ماهانه $1000 تا $2000 در ازای سهم مشخصی از شرکت.',
    contentEn: [
      '<p><strong>I have already built MVPs and I\u2019m looking for an angel partner to fund the next 6–12 months of infrastructure, AI/API costs and product development while we validate traction.</strong> I am Mehrdad — a product builder. I design businesses and products with care and build them fast with AI. Several product tracks are in motion on this site, with each build\u2019s progress public and live. This page is the clear, documented version of that ask.</p>',
      '<h2>Where we stand</h2>',
      '<p>My startups are past the idea phase. The MVP is built. The product can be presented and tested — you can see a live demo today. I drive the idea, the team and the development myself: the investor does not need to hire a team or manage day-to-day operations. What is missing is a financial wing for the early growth stage.</p>',
      '<h2>What kind of investor I am looking for — and what kind I am not</h2>',
      '<p>I am looking for an <strong>Angel Investor</strong> — a Micro Angel, Solo GP or Founder Angel — not necessarily a big VC fund. The reason is simple: the minimum ticket at most VC funds is usually $100K to $250K, while the real need of this stage is several times smaller. Someone who can commit $1,000–$2,000 per month for 6–12 months is a far better fit for this journey than a large fund — both in entry size and in spirit of partnership.</p>',
      '<h2>The exact numbers</h2>',
      '<ul><li>Initial support target — monthly: <strong>$1,000–$2,000</strong></li><li>Time frame: <strong>6–12 months of runway</strong></li><li>Total: <strong>$6K–$24K</strong></li></ul>',
      '<p>The current goal is to take the products from MVP to real traction — not to raise millions from day one.</p>',
      '<h2>Where the money goes</h2>',
      '<p>No part of this budget goes to show. It covers the real costs, stated plainly:</p>',
      '<ul><li><strong>Server</strong> — running the products</li><li><strong>Hosting</strong> — deployment and delivery</li><li><strong>AI API</strong> — model tokens and AI services</li><li><strong>Database</strong> — managed data and backups</li><li><strong>App infrastructure</strong> — pipelines, monitoring and domains</li><li><strong>Software tools</strong> — the SaaS the products depend on</li><li><strong>Maintenance</strong> — bug fixing and support</li><li><strong>Product development</strong> — shipping features every month</li></ul>',
      '<h2>Portfolio of AI Products</h2>',
      '<p>The projects are presented to investors exactly as they are — a Portfolio of AI Products. This mix is especially attractive for an investor interested in <strong>Consumer AI + Mobile + Social + Gaming</strong>:</p>',
      '<ul><li><strong>AI Health &amp; Wellness Super App</strong><br/>Health &amp; wellness</li><li><strong>AI Assistant</strong><br/>Personal smart tools</li><li><strong>AI Social / Friendship &amp; Marriage</strong><br/>Social networking<br/>Friendship &amp; matchmaking<br/>An AI companion for interaction and connection</li><li><strong>AI Quiz / Q&amp;A Game</strong><br/>A question-and-answer game<br/>AI-generated questions<br/>Interaction &amp; entertainment</li></ul>',
      '<p>Where things stand today: the AI Assistant is live and testable on mehrdad.ir — the AI Quiz game is playable at quizofkoko.com — Health &amp; Wellness is in active build with public progress on the site (strictly a wellness tool, not a medical device) — AI Social is in formation and the first candidate to start with investor support.</p>',
      '<h2>Why a portfolio and not a single product</h2>',
      '<p>Concentrating on one product at this stage concentrates risk. A balanced basket of four complementary tracks — health, tools, social and gaming — multiplies the chances of reaching traction while sharing the same common infrastructure. An angel gets access to a basket with one entry, not a single bet.</p>',
      '<h2>Two cooperation models</h2>',
      '<p><strong>Model A — Angel Investment:</strong> the investor provides, for example, $12,000 over 12 months and receives a defined equity share of the company. The percentage is set in negotiation based on an agreed valuation.</p>',
      '<p><strong>Model B — Angel Sponsorship:</strong> the investor pays the real costs directly — server, AI API, hosting, software and maintenance — and in exchange receives a defined share of the company or product. This model suits those who prefer direct, trackable payments.</p>',
      '<p>In both models the investor\u2019s share is transparent and written down, and the details are reviewed in a first online or in-person session.</p>',
      '<h2>Full transparency — build progress is public</h2>',
      '<p>On mehrdad.ir the status of every product (live, building, idea) and its build progress is displayed publicly. An investor can see real weekly progress without closed reports. This transparency is deliberate — trust is the most important asset in this kind of partnership.</p>',
      '<h2>Next step</h2>',
      '<p>If this reading matches your view of angel investing, reach out via the <a href="/contact">contact page</a> or connect on <a href="https://www.instagram.com/startup_mt/" target="_blank" rel="noopener noreferrer">Instagram</a>. The first step is a short session: live demos, the numbers, and the cooperation model — all in the open.</p>',
    ].join('\n'),
    contentFa: [
      '<p><strong>MVPها را ساخته‌ام و اکنون به دنبال یک شریک فرشته هستم تا هزینه‌های ۶ تا ۱۲ ماه آیندهٔ زیرساخت و AI API و توسعهٔ محصول را پوشش دهد در حالی که تراکشن واقعی را اثبات می‌کنیم.</strong> من مهدرد هستم — سازندهٔ محصول. کسب‌وکار و محصول را با دقت طراحی می‌کنم و با هوش مصنوعی سریع می‌سازم. چند مسیر محصولی روی همین سایت در جریان است و پیشرفت ساخت هر کدام عمومی و زنده است. این صفحه نسخهٔ شفاف و مستند همان درخواست است.</p>',
      '<h2>اینجا کجای مسیر ایستاده‌ایم</h2>',
      '<p>استارتاپ‌های من از فاز ایده عبور کرده‌اند. MVP ساخته شده است. محصول قابلیت ارائه و تست دارد و همین امروز می‌توانید دموی آن را ببینید. ایده و تیم و توسعه را خودم جلو می‌برم — یعنی سرمایه‌گذار لازم نیست تیمی استخدام کند یا مدیریت روزمره‌ای بر عهده بگیرد. تنها چیزی که کم است یک بال مالی برای مرحلهٔ رشد اولیه است.</p>',
      '<h2>چه نوع سرمایه‌گذاری می‌خواهم — و چه نوعی نه</h2>',
      '<p>دنبال یک <strong>Angel Investor</strong> هستم — از جنس Micro Angel و Solo GP و Founder Angel — نه لزوماً یک صندوق بزرگ. دلیلش ساده است: حداقل تیکت سرمایه‌گذاری اکثر صندوق‌ها معمولاً $100K تا $250K است در حالی که نیاز واقعی این مرحله چند برابر کوچک‌تر است. کسی که بتواند ماهانه $1000 تا $2000 را برای شش تا دوازده ماه اختصاص دهد برای این مسیر بسیار مناسب‌تر از یک صندوق بزرگ است — هم از نظر اندازهٔ ورودی و هم از نظر روحیهٔ همراهی.</p>',
      '<h2>عدد دقیق درخواست</h2>',
      '<ul><li>هدف اولیهٔ حمایت — ماهانه: <strong>$1000 تا $2000</strong></li><li>بازهٔ زمانی: <strong>۶ تا ۱۲ ماه runway</strong></li><li>مجموع: <strong>$6K تا $24K</strong></li></ul>',
      '<p>هدف فعلی این است که محصولات از MVP به تراکشن واقعی برسند — نه اینکه شرکت از روز اول با میلیون‌ها دلار تأمین مالی شود.</p>',
      '<h2>پول دقیقاً کجا می‌رود</h2>',
      '<p>هیچ بخشی از این بودجه صرف هزینه‌های نمایشی نمی‌شود. پوشش هزینه‌های واقعی و شفاف است:</p>',
      '<ul><li><strong>سرور</strong> — اجرای محصولات</li><li><strong>هاستینگ</strong> — انتشار و ارائه</li><li><strong>AI API</strong> — توکن مدل‌ها و سرویس‌های هوش مصنوعی</li><li><strong>دیتابیس</strong> — دادهٔ مدیریت‌شده و پشتیبان‌گیری</li><li><strong>زیرساخت اپلیکیشن</strong> — پایپ‌لاین و مانیتورینگ و دامنه‌ها</li><li><strong>ابزارهای نرم‌افزاری</strong> — سرویس‌هایی که محصولات به آن‌ها وابسته‌اند</li><li><strong>نگهداری</strong> — رفع اشکال و پشتیبانی</li><li><strong>توسعهٔ محصول</strong> — افزودن قابلیت در هر ماه</li></ul>',
      '<h2>Portfolio of AI Products</h2>',
      '<p>معرفی پروژه‌ها به سرمایه‌گذار دقیقاً به همین شکل است — یک Portfolio of AI Products. این ترکیب برای سرمایه‌گذاری که به <strong>Consumer AI + Mobile + Social + Gaming</strong> علاقه دارد جذاب‌تر است:</p>',
      '<ul><li><strong>AI Health &amp; Wellness Super App</strong><br/>سلامت و تندرستی</li><li><strong>AI Assistant</strong><br/>ابزارهای هوشمند شخصی</li><li><strong>AI Social / Friendship &amp; Marriage</strong><br/>ارتباطات اجتماعی<br/>دوستی و آشنایی<br/>دستیار AI برای تعامل و ارتباط</li><li><strong>AI Quiz / Q&amp;A Game</strong><br/>بازی سؤال و جواب<br/>AI-generated questions<br/>تعامل و سرگرمی</li></ul>',
      '<p>وضعیت امروز: دستیار هوشمند همین امروز روی mehrdad.ir فعال و قابل تست است — بازی سؤال و جواب در quizofkoko.com قابل بازی است — سلامت و تندرستی در حال ساخت با پیشرفت عمومی روی سایت (صرفاً ابزار تندرستی نه دستگاه پزشکی) — شبکهٔ اجتماعی دوستی و آشنایی در فاز شکل‌گیری و گزینهٔ نخست برای شروع با پشتیبانی سرمایه‌گذار.</p>',
      '<h2>چرا پورتفولیو و نه یک محصول تنها</h2>',
      '<p>تمرکز روی یک محصول در این مرحله یعنی تمرکز ریسک روی یک نقطه. یک سبد متوازن از چهار مسیر مکمل — سلامت و ابزار و شبکهٔ اجتماعی و بازی — شانس رسیدن به تراکشن را چند برابر می‌کند و همه از یک زیرساخت مشترک سرویس می‌گیرند. سرمایه‌گذار فرشته با یک ورودی به یک سبد دسترسی پیدا می‌کند نه یک شرط‌بندی واحد.</p>',
      '<h2>دو مدل همکاری</h2>',
      '<p><strong>مدل A — Angel Investment:</strong> سرمایه‌گذار مثلاً $12000 برای ۱۲ ماه تأمین می‌کند و در ازای آن درصد مشخصی از شرکت را دریافت می‌کند. درصد در مذاکره و بر اساس ارزیابی توافقی تعیین می‌شود.</p>',
      '<p><strong>مدل B — Angel Sponsorship:</strong> سرمایه‌گذار هزینه‌های واقعی را مستقیم پرداخت می‌کند — سرور و AI API و هاستینگ و نرم‌افزار و نگهداری — و در ازای آن سهم مشخصی از شرکت یا محصول می‌گیرد. این مدل برای کسی مناسب‌تر است که ترجیح می‌دهد پرداختش مستقیم و قابل ردیابی باشد.</p>',
      '<p>در هر دو مدل سهم سرمایه‌گذار شفاف و مکتوب است و جزئیات در اولین جلسهٔ حضوری یا آنلاین مرور می‌شود.</p>',
      '<h2>شفافیت کامل — پیشرفت ساخت عمومی است</h2>',
      '<p>روی mehrdad.ir وضعیت هر محصول (زنده و در حال ساخت و ایده) و درصد پیشرفت ساخت به‌صورت عمومی نمایش داده می‌شود. یعنی سرمایه‌گذار بدون نیاز به گزارش‌های بسته می‌تواند پیشرفت واقعی را هر هفته ببیند. این شفافیت عمدی است — در این مدل همکاری اعتماد مهم‌ترین دارایی است.</p>',
      '<h2>گام بعدی</h2>',
      '<p>اگر این خوانش با نگاه شما به سرمایه‌گذاری فرشته هم‌خوان است از <a href="/contact">صفحهٔ تماس</a> پیام بدهید یا در <a href="https://www.instagram.com/startup_mt/" target="_blank" rel="noopener noreferrer">اینستاگرام</a> در ارتباط باشید. گام اول یک جلسهٔ کوتاه است: دموهای زنده را می‌بینید و اعداد و مدل همکاری را شفاف مرور می‌کنیم.</p>',
    ].join('\n'),
    cover: '/media/angel-mvp-cover.png',
  },
];

export async function importContentSeed(): Promise<void> {
  if (done) return;
  done = true;
  try {
    // the Prisma client selects "kind" on every project query — make sure
    // the column exists BEFORE the first project read (same lazy-DDL as
    // queries.ts; no-op once present)
    await ensureProjectKindColumn();
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

    // ONE-TIME rename repair (owner request 2026-09-30): «ابزار مالی شخصی
    // (نام موقت)» was always a placeholder — the product IS a business
    // management tool for small-to-medium (and somewhat larger) businesses:
    // fresh ventures, shops, chain stores — anyone running a business. It
    // doubles as the owner's fundraising startup, so the funding-ask line is
    // seeded too (only when still null — an admin-set ask always wins).
    // Fires ONLY while the row still holds the exact temporary seeded title;
    // any admin edit of the Persian title disables this repair forever.
    const pft = await db.project.findUnique({ where: { slug: 'personal-finance-tool' } });
    if (pft && pft.titleFa === 'ابزار مالی شخصی (نام موقت)') {
      await db.project.update({
        where: { slug: 'personal-finance-tool' },
        data: {
          titleEn: 'Business Management Tool',
          titleFa: 'ابزار مدیریت کسب‌وکار',
          summaryEn:
            'Business management software for small to medium businesses — and even somewhat larger ones. From freshly launched ventures to shops and chain stores; anyone running a business can use it.',
          summaryFa:
            'نرم‌افزار مدیریت کسب‌وکار برای کسب‌وکارهای کوچک تا متوسط و حتی بزرگ‌تر — از کسب‌وکارهای تازه‌تأسیس تا فروشگاه‌ها و فروشگاه‌های زنجیره‌ای؛ هر کسی که کسب‌وکاری دارد می‌تواند از آن استفاده کند.',
          fundingAsk:
            pft.fundingAsk == null
              ? 'Open to angel & pre-seed investors'
              : pft.fundingAsk,
        },
      });
      console.log('[seed] project "personal-finance-tool" renamed → Business Management Tool (owner request 2026-09-30)');
    }

    // ONE-TIME language-purity repair (owner rule 2026-10-01: the ENGLISH
    // environment must carry no Persian text): fundingAsk is a SINGLE shared
    // field rendered verbatim in both languages — the previously-seeded
    // default mixed a Persian sentence into the EN projects page. Fires ONLY
    // while the row still holds the exact previously-seeded bilingual line;
    // an admin-edited value is never touched. (If the owner later wants a
    // dedicated Persian line for FA mode, that needs a fundingAskFa column —
    // his call.)
    const pftAsk = await db.project.findUnique({
      where: { slug: 'personal-finance-tool' },
      select: { fundingAsk: true },
    });
    if (
      pftAsk &&
      pftAsk.fundingAsk ===
        'استارتاپی در مسیر شکل‌گیری — برای جذب سرمایهٔ اولیه باز است · Open to angel & pre-seed investors'
    ) {
      await db.project.update({
        where: { slug: 'personal-finance-tool' },
        data: { fundingAsk: 'Open to angel & pre-seed investors' },
      });
      console.log('[seed] project "personal-finance-tool" fundingAsk → English-only (EN-purity rule)');
      dailyChanged = true;
    }

    // ONE-TIME rename repair (owner request 2026-09-30, second round): the
    // car super-app went through «سوپراپ خودرو (نام موقت)» and the
    // short-lived brand «دنده» (Dande) — the owner settled on the plain
    // «مدیریت خودرو» / "Car Management". Fires ONLY while the row still
    // holds one of those exact intermediate titles (the Dande state is
    // additionally pinned to its exact English title — that pair could only
    // have been written by the previous repair); any owner edit disables
    // this repair forever. Summaries go back to the clean no-brand versions.
    const csa = await db.project.findUnique({ where: { slug: 'car-super-app' } });
    if (csa) {
      const isTempName =
        csa.titleFa === 'سوپراپ خودرو (نام موقت)' || csa.titleFa === 'ابزار مدیریت خودرو (نام موقت)';
      const isDandeBrand = csa.titleFa === 'دنده' && csa.titleEn === 'Dande — Car Super-App';
      if (isTempName || isDandeBrand) {
        await db.project.update({
          where: { slug: 'car-super-app' },
          data: {
            titleEn: 'Car Management',
            titleFa: 'مدیریت خودرو',
            summaryEn:
              'A connected-car companion, software first: the app is in early building. The hardware device is a labeled future concept — not part of the current product.',
            summaryFa:
              'همراه خودرو با تمرکز بر نرم‌افزار: اپلیکیشن در مراحل اولیهٔ ساخت است. سخت‌افزار صرفاً یک ایدهٔ برچسب‌خورده برای آینده است و بخشی از محصول فعلی نیست.',
          },
        });
        console.log('[seed] project "car-super-app" renamed → Car Management (owner request 2026-09-30)');
      }
    }

    // ONE-TIME rename repair (owner request 2026-09-30, third round): the
    // health project drops its placeholder naming «ابزار سلامت شخصی
    // (نام موقت)» and settles on «اپلیکیشن سلامتی و تندرستی» / "Health &
    // Wellness App". Fires ONLY while the row still holds the exact
    // previously-seeded Persian title; any admin edit disables this repair
    // forever. Summaries re-align to the app framing while the medical
    // disclaimer (not a medical device + data-handling note) is preserved.
    const ha = await db.project.findUnique({ where: { slug: 'health-app' } });
    if (ha && ha.titleFa === 'ابزار سلامت شخصی (نام موقت)') {
      await db.project.update({
        where: { slug: 'health-app' },
        data: {
          titleEn: 'Health & Wellness App',
          titleFa: 'اپلیکیشن سلامتی و تندرستی',
          summaryEn:
            'A health & wellness application — everyday logs, tracking and trends. Strictly a wellness app: not a medical device and not a substitute for professional care; a data-handling note will be published before any personal data is collected.',
          summaryFa:
            'اپلیکیشن سلامتی و تندرستی — ثبت و پیگیری روزمرهٔ سلامت و روند آن. صرفاً یک اپ تندرستی است؛ دستگاه پزشکی نیست و جایگزین متخصص نیست. یادداشت نحوهٔ مدیریت داده‌ها پیش از جمع‌آوری هر داده شخصی منتشر خواهد شد.',
        },
      });
      console.log('[seed] project "health-app" renamed → Health & Wellness App (owner request 2026-09-30)');
    }

    // ONE-TIME progress repair (owner request 2026-10-04: «درصد پیشرفت را
    // 74 درصد بزن — برای فاز اول مشخص کن فاز اول 74 درصد پیشرفته»): the
    // health-app row moves from the old placeholder 25% to the owner's
    // Phase-1 figure 74%. Fires ONLY while progress still holds the exact
    // previously-seeded 25 — any admin/owner edit pins their number forever.
    const hapProgress = await db.project.findUnique({
      where: { slug: 'health-app' },
      select: { progress: true },
    });
    if (hapProgress && hapProgress.progress === 25) {
      await db.project.update({
        where: { slug: 'health-app' },
        data: { progress: 74 },
      });
      console.log('[seed] project "health-app" progress 25 → 74 (Phase 1, owner request 2026-10-04)');
    }

    // Blog posts — INSERT-IF-MISSING (admin editor wins on existing rows).
    // Creating a post flips the same content-changed flag the daily seeds
    // use so the Vercel deploy hook fires: the /blog list and /blog/[slug]
    // pages are force-static and only pick up new posts on a rebuild.
    for (const row of SEED_POSTS) {
      const existing = await db.post.findUnique({ where: { slug: row.slug } });
      if (existing) continue;
      await db.post.create({
        data: {
          slug: row.slug,
          titleEn: row.titleEn,
          titleFa: row.titleFa,
          excerptEn: row.excerptEn,
          excerptFa: row.excerptFa,
          contentEn: row.contentEn,
          contentFa: row.contentFa,
          cover: row.cover,
          date: new Date(),
          published: true,
          featured: false,
          source: 'ai',
        },
      });
      console.log(`[seed] blog post "${row.slug}" created`);
      dailyChanged = true;
    }

    // ONE-TIME revision repair (owner request 2026-10-01): the angel-investor
    // post is revised to (1) present the four projects EXACTLY as the owner
    // specified — the bilingual "Portfolio of AI Products" block, (2) open
    // with the achievement-first ask, (3) unify the support target to
    // $1,000–$2,000/month (the old text mixed $500 and $1,000), and
    // (4) fix Persian writing slips (جست‌وجوی و گفت‌وگو با نیم‌فاصله و
    // «نگاه به» و «پشتیبان‌گیری» به‌جای بکاپ). Fires ONLY while the row
    // still holds the exact previously-seeded Persian AND English portfolio
    // sentences AND the old titles; any admin edit of those fields disables
    // this repair forever.
    const seededAngel = SEED_POSTS.find((r) => r.slug === 'angel-investor-for-mvp-portfolio');
    const angelPost = await db.post.findUnique({ where: { slug: 'angel-investor-for-mvp-portfolio' } });
    if (
      seededAngel &&
      angelPost &&
      angelPost.titleEn === 'Looking for an Angel Investor — Taking Four AI Products From MVP to Real Traction' &&
      angelPost.titleFa === 'در جستجوی سرمایه‌گذار فرشته — بردن چهار محصول هوش مصنوعی از MVP به تراکشن واقعی' &&
      typeof angelPost.contentEn === 'string' &&
      typeof angelPost.contentFa === 'string' &&
      angelPost.contentEn.includes('I present myself to investors as a portfolio of AI products') &&
      angelPost.contentFa.includes('معرفی من به‌عنوان سرمایه‌گذار')
    ) {
      await db.post.update({
        where: { slug: angelPost.slug },
        data: {
          titleEn: seededAngel.titleEn,
          titleFa: seededAngel.titleFa,
          excerptEn: seededAngel.excerptEn,
          excerptFa: seededAngel.excerptFa,
          contentEn: seededAngel.contentEn,
          contentFa: seededAngel.contentFa,
        },
      });
      console.log('[seed] blog post "angel-investor-for-mvp-portfolio" revised → Portfolio of AI Products presentation (owner request)');
      dailyChanged = true;
    }

    // ONE-TIME revision repair #2 (owner request 2026-10-01): the ENGLISH
    // version of the "Portfolio of AI Products" list must be English-only —
    // the previous revision accidentally embedded the Persian taglines inside
    // contentEn (the Persian contentFa block stays exactly as dictated).
    // Fires ONLY while the English content still carries the Persian
    // taglines AND the row still holds the current seeded revision of the
    // titles; any other state disables this repair forever.
    if (
      seededAngel &&
      angelPost &&
      angelPost.titleEn === seededAngel.titleEn &&
      angelPost.titleFa === seededAngel.titleFa &&
      typeof angelPost.contentEn === 'string' &&
      angelPost.contentEn.includes('سلامت و تندرستی') &&
      angelPost.contentEn.includes('ابزارهای هوشمند شخصی')
    ) {
      await db.post.update({
        where: { slug: angelPost.slug },
        data: {
          contentEn: seededAngel.contentEn,
        },
      });
      console.log('[seed] blog post "angel-investor-for-mvp-portfolio" revised → English-only portfolio list in contentEn (owner request)');
      dailyChanged = true;
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
