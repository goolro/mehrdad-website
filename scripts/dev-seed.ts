/**
 * DEV-ONLY seed for the sandbox/local SQLite database.
 *
 * Production content lives on Turso (migrated there by
 * scripts/migrate-to-turso.ts). This local file only needs enough
 * realistic bilingual data to exercise every route during verification.
 * Idempotent: safe to re-run (upserts by slug).
 *
 *   bun scripts/dev-seed.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // ── site settings ──
  await db.siteSetting.upsert({
    where: { key: 'theme' },
    update: {},
    create: { key: 'theme', value: 'default' },
  });

  // ── services (FDE first, core) ──
  const fde = await db.service.upsert({
    where: { slug: 'forward-deployed-engineering' },
    update: {},
    create: {
      slug: 'forward-deployed-engineering',
      titleEn: 'Forward Deployed Engineering',
      titleFa: 'مهندسی در خط مقدم حل مسئله',
      descEn: 'Solving real business and product problems on the front line — from problem discovery to a deployed, improving solution.',
      descFa: 'حل مسائل واقعی کسب‌وکار و محصول در خط مقدم — از کشف مسئله تا راه‌حل مستقر و در حال بهبود.',
      icon: 'Compass',
      order: 0,
    },
  });
  await db.service.upsert({
    where: { slug: 'product-design' },
    update: {},
    create: {
      slug: 'product-design',
      titleEn: 'Product Design',
      titleFa: 'طراحی محصول',
      descEn: 'Research-driven product design for software and hardware — from concept to market-ready.',
      descFa: 'طراحی محصول پژوهشمحور برای نرم‌افزار و سخت‌افزار — از ایده تا آماده بازار.',
      icon: 'PenTool',
      order: 1,
    },
  });
  await db.service.upsert({
    where: { slug: 'ai-solutions' },
    update: {},
    create: {
      slug: 'ai-solutions',
      titleEn: 'AI Solutions',
      titleFa: 'راهکارهای هوش مصنوعی',
      descEn: 'Practical AI that pays for itself: automation, assistants and decision support.',
      descFa: 'هوش مصنوعی عملی و مقرون‌به‌صرفه: اتوماسیون، دستیارها و پشتیبانی تصمیم.',
      icon: 'BrainCircuit',
      order: 2,
    },
  });
  await db.service.upsert({
    where: { slug: 'startup-consulting' },
    update: {},
    create: {
      slug: 'startup-consulting',
      titleEn: 'Startup Consulting',
      titleFa: 'مشاوره استارتاپ',
      descEn: 'From idea validation to go-to-market — hands-on help from someone who builds.',
      descFa: 'از اعتبارسنجی ایده تا ورود به بازار — کمک عملی از کسی که خودش می‌سازد.',
      icon: 'Lightbulb',
      order: 3,
    },
  });

  // ── projects (honest statuses) ──
  await db.project.upsert({
    where: { slug: 'bizpal' },
    update: {},
    create: {
      slug: 'bizpal',
      titleEn: 'BIZPAL',
      titleFa: 'بیزپل',
      summaryEn: 'Data-driven sales, marketing and advertising startup — an AI copilot for small businesses.',
      summaryFa: 'استارتاپ داده‌محور فروش، بازاریابی و تبلیغات — دستیار هوش مصنوعی کسب‌وکارهای کوچک.',
      status: 'under-construction',
      progress: 60,
      statusEn: 'Building',
      statusFa: 'در حال ساخت',
      order: 0,
    },
  });
  await db.project.upsert({
    where: { slug: 'smart-city' },
    update: {},
    create: {
      slug: 'smart-city',
      titleEn: 'Smart City Ecosystem',
      titleFa: 'اکوسیستم شهر هوشمند',
      summaryEn: 'Multi-layer smart city ecosystem research and design: mobility, energy, citizens.',
      summaryFa: 'پژوهش و طراحی اکوسیستم چندلایه شهر هوشمند: حمل‌ونقل، انرژی، شهروندان.',
      status: 'under-construction',
      progress: 35,
      statusEn: 'Designing',
      statusFa: 'در حال طراحی',
      order: 1,
    },
  });
  await db.project.upsert({
    where: { slug: 'iran-rail-corridor' },
    update: {},
    create: {
      slug: 'iran-rail-corridor',
      titleEn: 'Iran Rail Corridor',
      titleFa: 'کریدور ریلی ایران',
      summaryEn: 'Phased research plan for an Iranian rail corridor — logistics, economics, technology.',
      summaryFa: 'طرح پژوهشی مرحله‌ای برای کریدور ریلی ایران — لجستیک، اقتصاد، فناوری.',
      status: 'seeking',
      progress: 20,
      statusEn: 'Research',
      statusFa: 'پژوهش',
      order: 2,
    },
  });
  await db.project.upsert({
    where: { slug: 'klika' },
    update: {},
    create: {
      slug: 'klika',
      titleEn: 'KLIKA (Fintech)',
      titleFa: 'کلیکا (فین‌تک)',
      summaryEn: 'Banking fintech startup concept — digital financial services for the unbanked.',
      summaryFa: 'مفهوم استارتاپ فین‌تک بانکی — خدمات مالی دیجیتال برای بدون-بانک‌ها.',
      status: 'seeking',
      progress: 10,
      statusEn: 'Seeking collaborators',
      statusFa: 'در جستجوی همکار',
      order: 3,
    },
  });
  await db.project.upsert({
    where: { slug: 'club-mehrdad' },
    update: {},
    create: {
      slug: 'club-mehrdad',
      titleEn: 'Club Mehrdad (Clubhouse)',
      titleFa: 'کلاب مهرداد (کلاب‌هاوس)',
      summaryEn: '2021 weekly audio rooms about startups and technology — archived, lessons documented.',
      summaryFa: 'اتاق‌های صوتی هفتگی ۲۰۲۱ درباره استارتاپ و تکنولوژی — بایگانی‌شده، درس‌ها مستند.',
      status: 'live',
      progress: 100,
      statusEn: 'Archived',
      statusFa: 'بایگانی',
      order: 4,
    },
  });

  // ── categories ──
  const techno = await db.category.upsert({
    where: { slug: 'techno' },
    update: {},
    create: { slug: 'techno', nameEn: 'Technology', nameFa: 'تکنولوژی' },
  });
  const startup = await db.category.upsert({
    where: { slug: 'startup-startup' },
    update: {},
    create: { slug: 'startup-startup', nameEn: 'Startup', nameFa: 'استارتاپ' },
  });
  const invest = await db.category.upsert({
    where: { slug: 'investment' },
    update: {},
    create: { slug: 'investment', nameEn: 'Investment', nameFa: 'سرمایه‌گذاری' },
  });

  // ── tags (curated, bilingual) ──
  const tagAI = await db.tag.upsert({
    where: { slug: 'ai' },
    update: {},
    create: { slug: 'ai', nameEn: 'AI', nameFa: 'هوش مصنوعی' },
  });
  const tagCity = await db.tag.upsert({
    where: { slug: 'smart-city' },
    update: {},
    create: { slug: 'smart-city', nameEn: 'Smart City', nameFa: 'شهر هوشمند' },
  });
  const tagRail = await db.tag.upsert({
    where: { slug: 'rail' },
    update: {},
    create: { slug: 'rail', nameEn: 'Rail', nameFa: 'ریل' },
  });
  const tagFin = await db.tag.upsert({
    where: { slug: 'fintech' },
    update: {},
    create: { slug: 'fintech', nameEn: 'FinTech', nameFa: 'فین‌تک' },
  });

  // ── posts ──
  const posts: {
    slug: string; titleEn: string; titleFa: string;
    excerptEn: string; excerptFa: string;
    contentEn: string; contentFa: string;
    date: Date; catIds: string[]; tagIds: string[]; featured?: boolean;
  }[] = [
    {
      slug: 'iran-ousted-from-trade-corridors',
      titleEn: 'Iran Ousted from Trade Corridors?',
      titleFa: 'ایران از کریدورهای تجاری حذف شده؟',
      excerptEn: 'A data-first look at where Iranian transit actually stands — and what a rail corridor would change.',
      excerptFa: 'نگاهی داده‌محور به جایگاه واقعی ترانزیت ایران — و اینکه کریدور ریلی چه چیزی را عوض می‌کند.',
      contentEn: `<p>Trade corridors are decided by <strong>geography, cost and politics</strong> — in that order, until politics intervenes.</p><h2>The numbers</h2><p>Transit volumes through Iran have been shifting for a decade. The question is not whether Iran is "ousted", but which corridor economics win.</p><h2>What a rail corridor changes</h2><p>A functioning corridor changes the cost curve: shorter distance, fewer transshipments, predictable customs.</p><p>This is a working research note; numbers and sources are updated as the <a href="/work/iran-rail-corridor">rail corridor project</a> advances.</p>`,
      contentFa: `<p>کریدورهای تجاری با <strong>جغرافیا، هزینه و سیاست</strong> تعیین می‌شوند — به همین ترتیب، تا وقتی سیاست دخالت نکند.</p><h2>اعداد</h2><p>حجم ترانزیت از ایران یک دهه است که در حال جابه‌جایی است. سؤال این نیست که ایران «حذف شده» یا نه؛ سؤال این است که اقتصادِ کدام کریدور برنده می‌شود.</p><h2>کریدور ریلی چه چیزی عوض می‌کند؟</h2><p>کریدور فعال منحنی هزینه را عوض می‌کند: مسافت کمتر، ترانشیپمنت کمتر، گمرک قابل‌پیش‌بینی.</p><p>این یک یادداشت پژوهشی در حال کار است؛ اعداد و منابع با پیشرفت <a href="/work/iran-rail-corridor">پروژه کریدور ریلی</a> به‌روز می‌شوند.</p>`,
      date: new Date('2023-05-14T10:30:00Z'),
      catIds: [invest.id],
      tagIds: [tagRail.id],
      featured: true,
    },
    {
      slug: 'mini-smart-city',
      titleEn: 'Mini Smart City: Designing the First Prototype',
      titleFa: 'مینی اسمارت سیتی: طراحی اولین پیش‌نمونه',
      excerptEn: 'What a tabletop smart city teaches about sensors, data and citizens that no slide deck can.',
      excerptFa: 'شهر هوشمند روی میزی چه چیزهایی درباره سنسور، داده و شهروند یاد می‌دهد که هیچ اسلایدی یاد نمی‌دهد.',
      contentEn: `<p>A smart city is a system of promises: sense everything, decide faster, serve citizens better. A <strong>mini prototype</strong> tests those promises cheaply.</p><h2>The stack</h2><p>MQTT sensors → a tiny rule engine → a live dashboard. That is all a first iteration needs.</p><h2>What citizens see</h2><p>Nothing — unless the data becomes a service. That is where most projects stop and where the real design starts.</p>`,
      contentFa: `<p>شهر هوشمند مجموعه‌ای از وعده‌هاست: همه‌چیز را حس کن، سریع‌تر تصمیم بگیر، به شهروند بهتر خدمت کن. <strong>پیش‌نمونه کوچک</strong> این وعده‌ها را ارزان می‌آزماید.</p><h2>پشته فنی</h2><p>سنسورهای MQTT → یک موتور قانون کوچک → داشبورد زنده. برای تکرار اول همین کافی است.</p><h2>شهروند چه می‌بیند؟</h2><p>هیچ — مگر آنکه داده به خدمت تبدیل شود. آنجا است که بیشتر پروژه‌ها متوقف می‌شوند و طراحی واقعی آغاز می‌شود.</p>`,
      date: new Date('2023-11-02T08:00:00Z'),
      catIds: [techno.id],
      tagIds: [tagCity.id, tagAI.id],
      featured: true,
    },
    {
      slug: 'bizpal-digital-sales-marketing-and-advertising-startup',
      titleEn: 'BIZPAL: A Digital Sales, Marketing & Advertising Startup',
      titleFa: 'بیزپل: استارتاپ دیجیتال فروش، بازاریابی و تبلیغات',
      excerptEn: 'Why small businesses do not need more tools — they need one copilot that executes.',
      excerptFa: 'چرا کسب‌وکارهای کوچک به ابزار بیشتر نیاز ندارند — به یک کوپایلیت اجراگر نیاز دارند.',
      contentEn: `<p>Small businesses drown in marketing dashboards. BIZPAL bets the opposite way: <strong>one AI copilot</strong> that plans, executes and reports.</p><h2>The wedge</h2><p>Start with local ads execution — the highest-pain, lowest-competition slice.</p><h2>Where it stands</h2><p>The build is ongoing; see the <a href="/work/bizpal">project page</a> for honest status.</p>`,
      contentFa: `<p>کسب‌وکارهای کوچک در داشبوردهای بازاریابی غرق می‌شوند. بیزپل برعکس شرط می‌بندد: <strong>یک دستیار هوش مصنوعی</strong> که برنامه می‌ریزد، اجرا می‌کند و گزارش می‌دهد.</p><h2>نقطه ورود</h2><p>از اجرای تبلیغات محلی شروع می‌کنیم — پرتنش‌ترین و کم‌رقابت‌ترین بخش.</p><h2>کجای کاریم؟</h2><p>ساخت در جریان است؛ وضعیت صادقانه را در <a href="/work/bizpal">صفحه پروژه</a> ببینید.</p>`,
      date: new Date('2025-03-20T14:00:00Z'),
      catIds: [startup.id],
      tagIds: [tagAI.id, tagFin.id],
      featured: true,
    },
    {
      slug: 'neo-bank-software-financial-startup',
      titleEn: 'Neo-Banks: Lessons from Digital-First Banking Software',
      titleFa: 'نئو بانک‌ها: درس‌هایی از نرم‌افزار بانکداری دیجیتال',
      excerptEn: 'What neo-bank architectures teach any fintech builder about trust and iteration speed.',
      excerptFa: 'معماری نئو بانک‌ها چه به هر سازنده فین‌تک درباره اعتماد و سرعت تکرار یاد می‌دهد.',
      contentEn: `<p>Neo-banks won on <strong>iteration speed</strong>, not features. Core banking stayed boring; everything around it shipped weekly.</p><h2>Trust is a feature</h2><p>Every screen must answer: why should I keep my money here?</p>`,
      contentFa: `<p>نئو بانک‌ها با <strong>سرعت تکرار</strong> بردند، نه با فیچر. هسته بانکی ساده ماند؛ دورتادورش هفتگی ریلز می‌شد.</p><h2>اعتماد یک فیچر است</h2><p>هر صفحه باید پاسخ دهد: چرا پولم را اینجا نگه دارم؟</p>`,
      date: new Date('2022-08-09T09:15:00Z'),
      catIds: [invest.id],
      tagIds: [tagFin.id],
    },
    {
      slug: 'smart-city-and-artificial-intelligence',
      titleEn: 'Smart Cities and AI: Where the Money Actually Flows',
      titleFa: 'شهر هوشمند و هوش مصنوعی: پول واقعاً کجا جریان دارد؟',
      excerptEn: 'Beyond the buzzword: the four budget lines where municipalities actually spend on AI.',
      excerptFa: 'فراتر از شعار: چهار ردیف بودجه‌ای که شهرداری‌ها واقعاً روی هوش مصنوعی خرج می‌کنند.',
      contentEn: `<p>Strip away the vendor slides and municipal AI budgets cluster into four lines: <strong>traffic, safety, utilities and service desks</strong>.</p><h2>Start where data already exists</h2><p>The fastest win is always the dataset the city already collects and never uses.</p>`,
      contentFa: `<p>اسلایدهای وندورها را کنار بگذارید؛ بودجه AI شهری در چهار خط جمع می‌شود: <strong>ترافیک، ایمنی، تأسیسات و میز خدمت</strong>.</p><h2>از جایی شروع کنید که داده از قبل هست</h2><p>سریع‌ترین برد همیشه همان داده‌ای است که شهر جمع می‌کند و هرگز استفاده نمی‌کند.</p>`,
      date: new Date('2024-01-18T11:45:00Z'),
      catIds: [techno.id],
      tagIds: [tagCity.id],
    },
    {
      slug: 'welcome-to-marketing-mastermind-your-gateway-to-the-future-of-marketing-startup-2',
      titleEn: 'Welcome to Marketing Mastermind',
      titleFa: 'به مستر مایند بازاریابی خوش آمدید',
      excerptEn: 'A series on marketing thinking for technical founders — first principles over hacks.',
      excerptFa: 'سری روی تفکر بازاریابی برای بنیان‌گذاران فنی — اصول اول به‌جای ترفند.',
      contentEn: `<p>Marketing for technical founders is not a dark art — it is <strong>distribution engineering</strong>.</p><h2>The series</h2><p>Positioning, channel-market fit, and measuring what matters — in that order.</p>`,
      contentFa: `<p>بازاریابی برای بنیان‌گذاران فنی جادوی سیاه نیست — <strong>مهندسی توزیع</strong> است.</p><h2>این سری</h2><p>پوزیشنینگ، تناسب کانال-بازار، و سنجش آنچه مهم است — به همین ترتیب.</p>`,
      date: new Date('2021-06-30T16:20:00Z'),
      catIds: [startup.id],
      tagIds: [],
    },
    {
      slug: 'iran-railway-technology-startup',
      titleEn: 'Iran Railway Technology Startup: A Research Agenda',
      titleFa: 'استارتاپ فناوری ریلی ایران: دستور کار پژوهشی',
      excerptEn: 'Where technology startups can plug into a national rail program without waiting for tenders.',
      excerptFa: 'استارتاپ‌های فناوری کجا می‌توانند به برنامه ریلی ملی وصل شوند، بدون منتظر مناقصه ماندن.',
      contentEn: `<p>National rail programs buy trains and tracks — the <strong>software layer</strong> is left empty. That is the startup surface.</p><h2>Three wedges</h2><p>Predictive maintenance, yard scheduling, and freight visibility.</p>`,
      contentFa: `<p>برنامه‌های ریلی ملی لوکوموتیو و ریل می‌خرند — <strong>لایه نرم‌افزاری</strong> خالی می‌ماند. آنجا سطح کار استارتاپ است.</p><h2>سه نقطه ورود</h2><p>نگهداری پیش‌بینانه، زمان‌بندی حیاط، و دیده‌بانی بار.</p>`,
      date: new Date('2022-02-21T13:10:00Z'),
      catIds: [techno.id],
      tagIds: [tagRail.id],
    },
    {
      slug: 'عکاس-های-موز-ای-از-لباس-های-محلی',
      titleEn: 'Local Dress Photography: Archive Notes',
      titleFa: 'عکاسی از لباس‌های محلی: یادداشت‌های آرشیو',
      excerptEn: 'A cultural archive side-project and what it taught about metadata.',
      excerptFa: 'پروژه جانبی آرشیو فرهنگی و آنچه درباره فراداده یاد داد.',
      contentEn: `<p>An archive lives or dies by its <strong>metadata</strong>. Photos without provenance become wallpaper within a decade.</p>`,
      contentFa: `<p>آرشیو با <strong>فراداده‌اش</strong> زنده می‌ماند یا می‌میرد. عکس بدون خاستگاه، ظرف یک دهه به دیوارکوب تبدیل می‌شود.</p>`,
      date: new Date('2020-12-28T10:00:00Z'),
      catIds: [techno.id],
      tagIds: [],
    },
  ];

  for (const p of posts) {
    const existing = await db.post.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await db.post.create({
      data: {
        slug: p.slug,
        titleEn: p.titleEn,
        titleFa: p.titleFa,
        excerptEn: p.excerptEn,
        excerptFa: p.excerptFa,
        contentEn: p.contentEn,
        contentFa: p.contentFa,
        published: true,
        featured: p.featured || false,
        date: p.date,
        categories: { connect: p.catIds.map((id) => ({ id })) },
        tags: { create: p.tagIds.map((tagId) => ({ tagId })) },
      },
    });
  }

  const counts = {
    posts: await db.post.count(),
    projects: await db.project.count(),
    services: await db.service.count(),
    categories: await db.category.count(),
    tags: await db.tag.count(),
  };
  console.log('dev-seed done:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
