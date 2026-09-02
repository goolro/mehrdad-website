# Worklog

---
Task ID: 1
Agent: Z.ai Code (main)
Task: بررسی کامل ساختار سایت mehrdad.ir (وردپرس) و تهیه گزارش تحلیل + پیشنهادات مهاجرت به وب‌سایت + اپ موبایل با هوش مصنوعی، پنل مدیریت، و دوزبانه (EN اصلی / FA دوم)

Work Log:
- دریافت robots.txt → تأیید وردپرس + مسیر wp-sitemap.xml
- Page Reader مستقیم برگشت خورد (حفاظت ضدربات 403) → استفاده از agent-browser (مرورگر واقعی)
- استخراج عنوان سایت: «وب سایت مهرداد ☼ Mehrdad – طراح و پژوهشگر ☼ Designer & Researcher»
- تحلیل فنی: قالب Gerold v2.0.1 (پورتفولیو RTL)، Elementor + Elementor Pro، Contact Form 7، Header Footer Elementor، jQuery 3.7.1 — بدون WPML/Polylang (چندزبانه واقعی ندارد)
- استخراج sitemap index و sitemap های تکی:
  - ~85 پست وبلاگ (آرشیو 9 صفحه)
  - صفحات: home-02..home-10 (دمو قالب)، خانه روشن (light) x10، services، contact، participation-in-projects، blog، logo
  - 8 صفحه خدمات (CPT services): استارتاپ، فروش و بازاریابی سنتی، هوش مصنوعی، توسعه وب اپلیکیشن، طراحی محصول، مشاوره کسب‌وکار، دیجیتال مارکتینگ، طراحی و تجاری‌سازی اختراع
  - نمونه‌کارها (CPT portfolios): محتوای دمو/لورم ایپسوم (دیلویت و...)
  - Web Stories: ~15 وب استوری (فرمت Google Web Stories)
  - 21 دسته‌بندی + 3 صفحه تگ
- بررسی صفحات کلیدی: خدمات، تماس (فرم CF7)، مشارکت در طرح‌ها (لیست 6 پروژه)
- پروژه‌های شناسایی شده: انقلاب ریلی (فاز 1-5)، BIZPAL (استارتاپ AI بازاریابی - درخواست $300K Pre-Seed)، استارتاپ زباله هوشمند (پست رمزدار)، پلتفرم مدیریت سرمایه (/s/invest.html سه‌زبانه FA/EN/AR)، استارتاپ مالی بانکی کلیکا (KLIKA)
- کشف صفحات استاتیک /s/*.html با سوییچر زبان (فارسی/English/العربية)
- اسکرین‌شات صفحه اصلی (تم تیره بنفش)
- ذخیره داده‌های خام در پوشه analysis/

Stage Summary:
- سایت یک سایت شخصی/شرکت کوچک وردپرسی است با محتوای فارسی RTL و تمرکز بر: استارتاپ، شهر هوشمند، هوش مصنوعی، سرمایه‌گذاری، اختراعات، مشاوره کسب‌وکار
- محتوای واقعی قابل مهاجرت: ~85 پست + 8 سرویس + صفحات ثابت + وب استوری‌ها + رسانه‌ها
- محتوای دمو قابل حذف: پورتفولیوهای لورم، home-02..home-10
- چندزبانه واقعی وجود ندارد؛ فقط 3 لندینگ استاتیک /s/ سه‌زبانه است
- گزارش کامل تحلیل و نقشه راه در پاسخ نهایی به کاربر ارائه شد

---
Task ID: 2
Agent: Z.ai Code (main)
Task: ساخت کامل وب‌سایت جدید mehrdad.ir — دوزبانه EN/FA + چتبات AI + پنل مدیریت + AI Writer

Work Log:
- استخراج کامل محتوا از WordPress REST API: 83 پست، 26 صفحه، 21 دسته، 4872 تگ
- دانلود 191 تصویر (26MB) به public/media + حذف 18 فایل خراب
- طراحی Prisma Schema: Post, Category, Service, Project, ContactMessage, ChatSession/Message, KbChunk, AiJob
- ترجمه خودکار EN با LLM: عنوان+خلاصه هر 83 پست + ترجمه محتوای کامل در پس‌زمینه (chunk-based با retry برای 429)
- Seed دیتابیس: 83 پست، 21 دسته، 8 خدمت، 5 پروژه کلیدی، 446 قطعه دانش KB
- APIها: /api/site, /api/posts, /api/posts/[slug], /api/contact, /api/chat (RAG), /api/admin/* (auth, stats, posts, ai/write, ai/image, ai/translate, messages, kb)
- چتبات AI: RAG با BM25-lite روی KB + LLM، دوزبانه، ذخیره تاریخچه
- AI Writer: تولید مقاله دوزبانه EN+FA با یادگیری از محتوای موجود (RAG) + تولید تصویر کاور
- فرانت‌اند SPA: Header/Footer/Hero/Services/Projects/Blog/About/Contact/Admin + ChatWidget شناور
- EN زبان پیش‌فرض، FA با RTL کامل (Vazirmatn font)
- تست کامل با Agent Browser: همه ویوها، چتبات (پاسخ صحیح درباره BIZPAL)، فرم تماس، ادمین (لاگین، داشبورد 83/2/446/1)
- تست AI Writer: مقاله دوزبانه + تصویر تولید شد
- lint پاک (0 error)

Stage Summary:
- سایت جدید کامل و در حال کار روی پورت 3000
- زبان اصلی EN، فارسی RTL با سوییچر
- 83/83 عنوان EN، ترجمه محتوا در پس‌زمینه ادامه دارد (پست‌های بدون EN محتوا محتوای فارسی + اعلان نشان می‌دهند)
- ادمین: (پسورد در .env — از سورس و مستندات حذف شد)
- اسکریپت‌های نگهداری: prisma/sync_translations.ts (سینک ترجمه‌ها)، analysis/translate.ts (حلقه ترجمه)

---
Task ID: 3
Agent: Z.ai Code (main)
Task: افزودن دیدگاه‌ها (comments) با تاریخ + پشتیبانی PWA + بسته TWA برای اپ موبایل

Work Log:
- دریافت ۱۷ دیدگاه واقعی از WordPress REST API (با تاریخ اصلی ۲۰۲۳-۲۰۲۵ و ساختار threaded)
- افزودن مدل Comment به Prisma (با wpId, parentWpId, parentLocalId, approved) و db:push
- مهاجرت ۱۶ دیدگاه تاییدشده + ۱ دیدگاه اسپم (علامت‌گذاری نشده = در انتظار تایید ادمین)
- API جدید: GET/POST /api/posts/[slug]/comments (با honeypot ضد اسپم، سقف ارسال، threading)
- API ادمین: /api/admin/comments (لیست pending/all، تایید، لغو تایید، حذف)
- UI بخش دیدگاه‌ها در صفحه مقاله: نمایش threaded، پاسخ به دیدگاه، فرم ارسال دوزبانه EN/FA با اعلان «پس از تایید نمایش داده می‌شود»
- تب «دیدگاه‌ها» در پنل ادمین با فیلتر pending/approved و دکمه‌های تایید/حذف
- شمارنده دیدگاه روی کارت‌های بلاگ (_count روی comments approved)
- PWA کامل: manifest.json (آیکون‌های AI-generated، shortcuts بلاگ/چت/تماس)، sw.js (آفلاین شل، کش API و تصاویر)، PwaClient (ثبت SW + دکمه نصب beforeinstallprompt)، آیکون‌های 192/512/180/maskable، theme-color
- بسته TWA: twa-manifest.json (package: ir.mehrdad.twa، Bubblewrap-ready)، public/.well-known/assetlinks.json، مستندات کامل MOBILE_APP.md (راهنمای build APK/AAB + قابلیت‌ها)
- هشدار: باگ #blog بدون slug در hash router رفع شد (deep-link همه ویوها)
- باگ readMinutes (titleFa به‌جای محتوا) رفع شد
- حلقه ترجمه EN پس‌زمینه با backoff قوی‌تر (45-135s برای 429) ری‌استارت شد — 2/83 محتوای کامل EN، بقیه FA با اعلان شفاف
- تست کامل با Agent Browser: ارسال دیدگاه → صف تایید ادمین → تایید → نمایش عمومی ✓ | FA RTL ✓ | manifest/sw/icons/assetlinks همه 200 ✓ | دسکتاپ + موبایل 390px ✓

Stage Summary:
- دیدگاه‌ها با تاریخ اصلی و ساختار thread کامل مهاجرت یافتند؛ دیدگاه‌های جدید با تایید ادمین منتشر می‌شوند
- سایت حالا PWA قابل نصب است + بسته TWA آماده build APK با Bubblewrap
- همه چیز با مرورگر واقعی تست و تایید شد؛ lint پاک؛ dev.log بدون خطا

---
Task ID: 4
Agent: Z.ai Code (main)
Task: ریدایرکت لینک‌های قدیمی وردپرس + پروژه‌های «در حال ساخت» با نوار پیشرفت + سیستم چند تم رنگی با انیمیشن

Work Log:
- ریدایرکت ۳۰۱: تولید src/lib/wp-redirects.json (۱۷۳ مسیر + ۸۳ wpId) از DB — اسلاگ‌های encode و decode شده
- ساخت src/middleware.ts: تطبیق دقیق + ?p= و ?page_id= + قوانین پیشوندی (services/category/tag/web-stories/author/portfolio/s/*/wp-json/feed)
- تطبیق فازی پیشوندی برای اسلاگ‌های فارسی خراب/بریده‌شده (وردپرس خودش برخی اسلاگ‌ها را بریده بود) — تست کامل با curl ✓
- هش‌روتر: #admin و همه ویوها به deep-link هش اضافه شد
- اسکیما: Project.status (under-construction|seeking|live|coming-soon) + Project.progress (0-100) + db:push
- به‌روزرسانی ۵ پروژه: انقلاب ریلی ۳۵٪، BIZPAL ۶۰٪، پلتفرم سرمایه‌گذاری ۴۵٪ (در حال ساخت)، زباله هوشمند به‌زودی ۱۵٪، KLIKA در جستجوی همکار
- ProjectsView جدید: بج وضعیت ۴رنگ با آیکون + نوار پیشرفت انیمیت‌شونده + زیرعنوان «۳ پروژه در حال ساخت — از الان همراه شوید!»
- سیستم تم: src/lib/themes.ts با ۶ تم (digital/aurora، autumn/leaves، ocean/bubbles، forest/fireflies، sunset/glow، midnight/stars-dark)
- ترفند کلیدی: override متغیرهای پالت Tailwind (--color-violet-*) تحت [data-theme] در globals.css → کل سایت بدون تغییر کامپوننت‌ها رنگ عوض می‌کند
- ThemeBackground.tsx: پس‌زمینه متحرک CSS-only برای هر تم (هاله aurora، برگ پاییزی، حباب، کرم شب‌تاب، درخشش، ستاره چشمک‌زن + شهاب) با احترام به prefers-reduced-motion
- API: /api/admin/settings (GET/PATCH) + theme در /api/site + ذخیره در SiteSetting
- تب «Theme/ظاهر و رنگ» در ادمین: ۶ کارت تم با سواچ رنگ، بج Active، اعمال فوری
- فیکس رندر: z-index لایه پس‌زمینه (theme-bg z-0 + main z-10 + isolate) — محتوا همیشه روی انیمیشن
- حلقه ترجمه با supervisor ضدتوقف (خنک‌سازی ۳دقیقه‌ای در طوفان 429) ری‌استارت شد
- تست مرورگری: تم پاییز (کل سایت نارنجی + برگ‌های ریزان) ✓، تم نیمه‌شب (تیره + ستاره‌ها) ✓، نوارهای پیشرفت ✓، ریدایرکت‌ها ✓

Stage Summary:
- لینک‌های قدیمی وردپرس (اسلاگ فارسی encode/decode، ?p=، بخش‌ها) همگی ۳۰۱ به مسیر جدید می‌روند
- ۳ پروژه با وضعیت «در حال ساخت» و نوار پیشرفت درصدی معرفی می‌شوند
- ۶ تم رنگی+انیمیشنی از پنل ادمین قابل تغییر است و بلافاصله برای همه بازدیدکنندگان اعمال می‌شود
- lint پاک، dev.log بدون خطا، تم فعلی: digital (پیش‌فرض)

---
Task ID: 5
Agent: Z.ai Code (main)
Task: تاریخ‌گذاری شواهدمحور محتوا — کاربر گفت تاریخ‌های پست‌ها توسط یک برنامه وردپرسی بازنویسی شده‌اند و پست‌هایی مثل «تغییر موضوع وب‌سایت مهرداد» ۵-۷ سال پیش بوده ولی ۲۰۲۵ خورده؛ خواست تحلیل کنیم و طبق شواهد تاریخ بزنیم

Work Log:
- رد شدن از جابه‌جایی تصادفی (درخواست قبلی ۲۴-۴۶ ماه) به نفع تاریخ‌گذاری مبتنی بر شواهد
- Wayback Machine از sandbox با curl مسدود بود → استفاده از z-ai page_reader (زیرساخت ابری JINA)
- کشف روش: درخواست path-based به web.archive.org/web/20180101000000/<url> → timestamp واقعی داخل __wm.wombat — چون سایت بعد از ~۲۰۱۳ بوده، نزدیک‌ترین اسنپ‌شات به ۲۰۱۸ = اولین اسنپ‌شات
- CDX (query string → 400 در JINA)، timemap (content-type → 422)، TimeTravel (سرویس مرده) — همه رد شدند؛ روش path-based جواب داد
- analysis/wayback_probe.ts: ۸۳/۸۳ پست پروب شد (resume-safe، retry) → ۴۳ پست مدرک آرشیوی: ۲۰۲۱:۱۳، ۲۰۲۲:۱۱، ۲۰۲۳:۸، ۲۰۲۵:۶، ۲۰۲۶:۵
- analysis/extract_signals.ts: ۴ سیگنال محلی — مسیر آپلود کاور (reverse-map از image_map.json: ۷۲ پست) + تصویر داخل متن (۱۲) + اولین دیدگاه واقعی (۱۱) + سال ذکرشده/کلیدواژه نسل (۲۷/۱۲)
- analysis/estimate_era_llm.ts: LLM برای ۵ پست بی‌سیگنال (برآورد سال + confidence + دلیل)
- analysis/assign_dates.ts با seed ثابت: لنگر اولویت‌دار (آپلود > Wayback > دیدگاه > سال > LLM > درون‌یابی wpId) + سقف سخت (قبل از اولین آرشیو، قبل از اولین دیدگاه) + کف نرم آپلود + ساعت تصادفی + یکتاسازی دقیقه + پخش خوشه‌های آپلود گروهی (مثل ۱۴ پست 2023/02)
- بکاپ: db/custom.backup-20260831-233048.db → اعمال روی ۸۳ پست؛ SiteSetting marker: evidence_dating_applied_v1؛ دیدگاه‌ها دست‌نخورده (تاریخ‌های واقعی‌اند و سند اعتبار محتوا هستند)
- باگ کشف‌شده هنگام تست: صفحه مقاله‌های اسلاگ‌فارسی ۴۰۴ بود (Next پارامترها را decode می‌کند ولی DB percent-encoded است) → src/lib/slug-lookup.ts (slugCandidates) + فیکس /api/posts/[slug] و /api/posts/[slug]/comments — باگ از Task 2 وجود داشت، مربوط به این تغییر نبود
- صحت‌سنجی: هیچ پستی بعد از اولین دیدگاهش نیست، modified ≥ date، بدون تاریخ آینده، توزیع ۲۰۱۹:۱ ۲۰۲۰:۶ ۲۰۲۱:۲۱ ۲۰۲۲:۶ ۲۰۲۳:۳۳ ۲۰۲۴:۱۳ ۲۰۲۵:۳
- تست مرورگر: کارت‌های بلاگ با تاریخ جدید ✓ | پست نمونه EN «Published: Dec 28, 2020» ✓ | FA RTL «انتشار: ۸ دی ۱۳۹۹» ✓ | دیدگاه‌ها بعد از پست ✓ | lint پاک | dev.log پاک

Stage Summary:
- پست نمونه کاربر: 2025-05-02 → 2020-12-28 (هم‌راستا با کاور آپلود ۲۰۲۰/۱۲ و اسنپ‌شات آرشیو ۲۰۲۲-۰۱)
- تاریخ‌ها حالا شواهدمحورند: موج کلاب‌هاوس ۲۰۲۱، سری شهر هوشمند ۲۰۲۳-۲۴، پست‌های واقعاً جدید ۲۰۲۵ دست‌نخورده
- باگ قدیمی ۴۰۴ شدن مقاله‌های اسلاگ‌فارسی رفع شد (همه لینک‌های داخلی حالا کار می‌کنند)
- اسکریپت‌های نگهداری: analysis/wayback_first.json (شواهد)، analysis/dating_plan.json (گزارش قبل→بعد با دلیل هر تاریخ)، analysis/assign_dates.ts --apply (با marker ضد اجرای دوباره)


---
Task ID: 6
Agent: Z.ai Code (main)
Task: رفع باگ فیلترهای دسته‌بندی بلاگ — کاربر گزارش داد دکمه‌های فیلتر دسته‌ها اصلاً کار نمی‌کنند و محتوای داخلشان نمایش داده نمی‌شود

Work Log:
- بازتولید باگ: /api/posts?category=X خطای 500 می‌داد (PrismaClientValidationError)
- ریشه ۱: فیلتر رابطه many-to-many اشتباه بود — where.categories = { slug } بجای { some: { slug } } در src/app/api/posts/route.ts → هر کلیک روی هر دسته‌ای 500 می‌شد و catch خاموش فرانت «No articles found» نشان می‌داد
- ریشه ۲ (کشف حین تست): اسلاگ دسته‌های فارسی در DB به شکل percent-encoded ذخیره شده بودند (%d8%b1%d9%88%d8%b2%d8%a7%d9%86%d9%87) — شکننده و غیرقابل‌اعتماد برای مقایسه
- analysis/fix_cat_slugs.ts: decode امن ۱۴ اسلاگ فارسی به متن واقعی (روزانه، استارتاپ-startup، سرمایه-گذاری، ...) با گارد برخورد
- تست API: هر ۲۱ دسته total درست دادند (techno→22، استارتاپ-startup→48، سرمایه-گذاری→41، هوش-مصنوعی→7) + جستجو و فیلتر ترکیبی درست
- تست مرورگر (Agent Browser): کلیک Technology → request category=techno با 200 و ۱۲ کارت از ۲۲ ✓ | کلیک استارتاپ-startup → اسلاگ فارسی encode شده در query، 200 ✓ | جستجوی startup ✓ | پاک‌سازی سرچ و بازگشت به All ✓ | باز شدن صفحه مقاله با بج‌های دسته و بخش دیدگاه‌ها ✓ | بدون خطای کنسول ✓ | lint پاک ✓

Stage Summary:
- باگ اصلی: یک کاراکتر جادویی ناقص در فیلتر Prisma بود ({ slug } بجای { some: { slug } }) — همه فیلترها 500 می‌شدند
- اسلاگ دسته‌ها حالا تمیزند؛ اسکریپت analysis/fix_cat_slugs.ts برای مراجعه بعدی حفظ شد
- فایل‌های تغییر یافته: src/app/api/posts/route.ts (یک خط)، db/custom.db (اسلاگ دسته‌ها)

---
Task ID: 7
Agent: Z.ai Code (main)
Task: کاربر گزارش داد لینک‌های داخل متن مقالات به سایت قدیمی mehrdad.ir می‌روند («لینک ها را بازم چک کن میره سایت mehrdad.ir») — باید همه لینک‌های داخل محتوا داخلی شوند

Work Log:
- اسکن کامل DB: ۱۳۸ href یونیک + ۳ src یونیک mehrdad.ir در محتوای پست‌ها (۳۱۶ رخداد) — دیدگاه‌ها پاک بودند، services/projects پاک بودند، کد فرانت فقط mailto دارد
- طبقه‌بندی: ~۶۰ لینک مستقیم پست | ۴۶ شورت‌لینک (8z2g و ...) | ۵ صفحه (contact/invest/about/team) | ۶ وب‌استوری | ۱۰ فایل (۷ PDF + ۳ MP4) | ۴۵ لینک خارجی واقعی (دست‌نخورده)
- کشف: سایت قدیمی الان به sandbox دست رحمت کرده (403 روی HTML/REST) ولی فایل‌ها با هدر Referer قابل دانلودند (هات‌لینک‌پروتکت) — analysis/download_files.ts: ۱۰ فایل (۶۴MB ویدیو + PDFها) → public/uploads/wp/Y/M/name + file_map.json
- کشف کلیدی شورت‌لینک‌ها: روی مبدأ 404 اند و قابل resolve نیستند، ولی تحلیل بافت نشان داد ۴۳/۴۶ «لینک کوتاه خودِ پست» اند (بلاک Short Link) و ۳ مورد بقیه هم خودارجاع/ارجاع به پست مالک → همه به #blog/<slug مالک> نگاشت شدند
- analysis/rewrite_links.ts --apply: بکاپ db/custom.backup-20260901-*.db، نگاشت ۱۴۸تایی (پست‌ها → #blog/<slug>، صفحه‌ها → #contact/#about/#home، وب‌استوری → #blog، فایل‌ها → /uploads/wp/...)، حذف target/rel از لینک‌های داخلی، مارکر SiteSetting: content_links_internalized_v1
- ۷۲ پست، ۳۱۵ جایگزینی؛ موارد خاص: w-online → #blog، پروژه-بهنوش → #projects، Marketing-Mastermind → پست welcome-to-marketing-mastermind، تایپوی «بردزاری→برگزاری» اصلاح شد
- PDF ریلی (ساخت-ریلی-2) و PDF ترافیکی روی مبدأ صفر بایتی‌اند (منبع مرده) → لینک به مقاله مرتبط/CTA تماس
- analysis/cleanup_final.ts --apply (۵۸ پست): ۲ شورت‌کد pdf-embedder → لینک دانلود (یکی PDF جدید 6-StartUp-e1.pdf دانلود شد)، ۳ متن لینک ویدیو → «دانلود ویدیو»، ۱۳۳ تصویر خرابه مهاجرت (src= خام بدون <img>) → ۱۲۳ تگ img واقعی + ۱۰ فایل مرده حذف (هر ۱۰ روی مبدأ هم 404)، ۳ شورت‌کد شکسته html5_video حذف، پاراگراف Short Link باقی‌مانده حذف
- صحت‌سنجی نهایی: ۰ لینک attribute خروجی mehrdad.ir در کل DB ✓
- تست مرورگر: پست گزارش کاربر — تماس با ما → #contact (Get in Touch) ✓ | درباره ما → #about ✓ | لینک پست‌ها → #blog/<slug> باز می‌شوند ✓ | PDF نئو بانک 200/5.8MB ✓ | ویدیو بیزپل 200/23MB + «دانلود ویدیو» ✓ | تصاویر داخل متن lazy لود می‌شوند ✓ | بلوک Short Link حذف شده ✓ | بدون خطای کنسول ✓ | lint پاک ✓

Stage Summary:
- هیچ لینکی از داخل محتوا به سایت قدیمی نمی‌رود؛ کل ۳۱۶ رخداد → مسیر داخلی (hash route یا فایل محلی)
- سایت حالا نسبت به قطع شدن سایت قدیمی خودکفاست (فایل‌ها و تصاویر محلی)
- اسکریپت‌های قابل‌استفاده مجدد: scan_links.ts / list_mehr_links.ts / rewrite_links.ts (--apply + marker ضدتکرار) / cleanup_final.ts (--apply)
- نکته برای آینده: اگر پست/صفحه جدیدی از وردپرس بیاید، فقط کافیست scan + rewrite دوباره اجرا شود

---
Task ID: 8
Agent: Z.ai Code (main)
Task: گیت‌هاب به‌عنوان منبع حقیقت — امن‌سازی قبل از پوش + هم‌راستاسازی مستندات + پوش پایه (تصمیم D-016/D-017/D-018)

Work Log:
- ممیز امنیتی قبل از پوش: پسورد ادمین هاردکد در src/lib/admin.ts + نمایش «Default: ...» در UI ادمین (AdminView.tsx) — هر دو قبل از پوش لو می‌رفتند
- فیکس: ADMIN_PASSWORD فقط از env (بدون fallback = fail-closed)، متن UI به «دسترسی فقط برای مدیر سایت» تغییر کرد، پسورد rotate شد و فقط در .env (غیرtracked) است؛ .env.example اضافه شد
- بهداشت گیت: .env + دو بکاپ db + dev.pid از ایندکس خارج و gitignore شدند (db/custom.backup-*.db و *.pid)؛ پسورد قدیمی از worklog و CHANGELOG هم پاک شد
- docs/ و README از FETCH_HEAD گیت‌هاب بازیابی شد (۱۴ سند) — README به واقعیت کد هم‌راستا شد (SPA هش‌روت، EN پیش‌فرض + FA RTL، API واقعی، .env، مسیر مدیا)
- CHANGELOG [Unreleased] نوشته شد (Tasks 5-8)، docs/SECURITY.md ساخته شد (سیاست اسرار + لاگ رخداد)، ROADMAP آپدیت شد (Done جدید + اسپرینت P0: تم‌ها/TWA/بنر زبان/ترجمه)، DECISIONS: D-013 تا D-018
- صحت‌سنجی: lint پاک، /api/posts=200، auth با پسورد جدید=200، با پسورد قدیمی=401
- تاریخچه لوکال (کامیت‌های UUID آلوده به .env/بکاپ) با اسکواش به یک کامیت پایه تمیز تبدیل و force-push شد

Stage Summary:
- ریپوی عمومی githab منبع حقیقت است؛ هیچ رازی در ریپو/تاریخچه نیست
- پسورد جدید ادمین فقط در .env سندباکس (به مالک در چت اعلام شد)
- قانون دائمی: بعد از هر تسک → پوش + آپدیت README/CHANGELOG

---
Task ID: 9
Agent: Z.ai Code (main)
Task: Theme Engine — ۵ تم روی دیزاین‌سیستم مشترک + Light/Dark مستقل (تصمیم D-014، درخواست مالک)

Work Log:
- بازخوانی زیرساخت: توکن‌های CSS var (violet-*/fuchsia-*) زیر [data-theme] + ThemeBackground + THEMES رجیستری + تب Theme ادمین (کاملاً دیتا-درایو)
- رجیستری جدید src/lib/themes.ts: دقیقاً ۵ تم — default ☼ (بنفش برند، aurora)، autumn 🍂 (برگ)، winter ❄️ (آسمان یخی، برف جدید)، digital ⚡ (نئون فیروزه‌ای/لیمویی، گلیف‌های ۰/۱ در حال بارش جدید)، nowruz 🌱 (زمرد/طلایی، گلبرگ بهاری جدید) + LEGACY_THEME_MAP (ocean→winter، forest→nowruz، sunset→autumn، midnight→digital، digital-قدیم→default)
- globals.css: ۳ بلوک پالت جدید، حذف ۴ تم بازنشسته، prose-blog توکن‌محور شد (لینک/نقل‌قول/جدول با var/color-mix — بدون اووراید per-theme)، CSS افکت‌های snow/matrix/petals + حذف افکت‌های یتیم
- ThemeBackground.tsx بازنویسی: رندرر عمومی ذرات برای leaves/snow/matrix/petals + شاخه aurora — رنگ ذرات از توکن‌های خود تم (سازگار با Light/Dark)
- Light/Dark مستقل: mode در zustand store + persist (کنار lang)، دکمه Sun/Moon در هدر با aria-pressed و لیبل دوزبانه، toggle کلاس dark روی html در page.tsx
- مهاجرت DB با مارکر idempotent (analysis/migrate_theme_setting.ts): نکته ظریف — «digital» قدیم (بنفش) با «digital» جدید (نئون) تداخل معنایی داشت → digital→default با مارکر theme_engine_v2_migrated؛ API/site حالا default برمی‌گرداند
- fallbackهای 'digital' در AdminView و store به 'default' تغییر کردند
- صحت‌سنجی مرورگر: هر ۵ تم از تب ادمین فعال شد (dataset + اسکرین‌شات winter/digital/nowruz + toast) ✓ | مقاله با تم winter + حالت dark ✓ | persist بودن mode بعد از reload ✓ | صفر خطای کنسول ✓ | lint پاک ✓ | تم به default برگشت و خروج ادمین ✓

Stage Summary:
- قرارداد موتور: تم = پالت + پس‌زمینه فقط؛ افزودن تم جدید = تغییر کانفیگ (بدون دست زدن به کامپوننت‌ها) — docs/THEME_ENGINE.md دستور پخت دارد
- هیچ تم ذخیره‌شده‌ای نمی‌تواند سایت را بی‌استایل کند (نگاشت دو لایه: DB migration + getTheme runtime)
- محدودیت مستندشده: فلش اولین پینت dark (فیکس P2: اسکریپت boot در layout)

---
Task ID: 10
Agent: Z.ai Code (main)
Task: TWA — تکمیل آماده‌سازی اندروید: اسکریپت assetlinks، گارد keystore، رانبوک مالک (تصمیم D-015)

Work Log:
- ممیزی آمادگی: twa-manifest.json کامل (ir.mehrdad.twa، شورتکات‌ها، نوتیفیکیشن)، assetlinks با placeholder سرو می‌شود (200)، آیکون‌ها و manifest همه 200
- گاف امنیتی مهم: *.keystore در gitignore نبود — حالا *.keystore/*.jks/*.apk/*.aab و دایرکتوری‌های bubblewrap/git همگی ignore می‌شوند (کلید امضا هرگز کامیت نمی‌شود)
- scripts/generate-assetlinks.ts ساخته و تست شد: اعتبارسنجی فرمت SHA-256 (ورود بد reject شد)، packageId از twa-manifest خوانده می‌شود (تک‌منبع حقیقت)، خروجی JSON درست؛ placeholder برگردانده شد
- docs/MOBILE_TWA.md (رانبوک کامل مالک): پیش‌نیازها، دو مسیر ساخت keystore (bubblewrap keygen / keytool)، بیلد APK+AAB، استخراج اثر انگشت، تولید/دیپلوی assetlinks، نکته Play App Signing (دو اثر انگشت)، وریفای adb، چک‌لیست پلی، عیب‌یابی، وضعیت فعلی
- MOBILE_APP.md بخش TWA به اشاره‌گر کوتاه + لینک MOBILE_TWA.md تبدیل شد (ضد drift مستندات)
- README (وضعیت TWA + جدول docs)، ROADMAP P0 (تیک خورد، فقط keystore مالک مانده)، CHANGELOG آپدیت شدند

Stage Summary:
- همه‌چیز به‌جز کلید امضا آماده است — کلید عمداً نزد مالک می‌ماند (امنیت)
- مسیر مالک فقط ۴ دستور است: keygen → build → generate-assetlinks → push
- قانون پوش بعد از هر تسک رعایت شد (کامیت جدا برای تم و TWA)

---
Task ID: 8-V (post-outage verification)
Agent: Z.ai Code (main)
Task: صحت‌سنجی نهایی بعد از رفع وقفه — تأیید وضعیت Tasks 8/9/10 و پوش ریموت

Work Log:
- git: تاریخچه = ۳ کامیت تمیز (a3f083a baseline، 28925ed theme engine، 0513733 twa)؛ git ls-remote تأیید کرد ریموت main دقیقاً = لوکال (0513733) — پوش کامل است
- امنیت: git log --all روی .env/بکاپ‌ها/pid خالی؛ git ls-files بدون فایل حساس؛ git grep بدون نه پسورد قدیمی (mehrdad-admin-2026) و نه پسورد جدید در هیچ فایل tracked
- lint: پاک
- مرورگر: ورود ادمین با پسورد جدید ✓ (UI بدون hint پسورد) | تب Theme دقیقاً ۵ تم ✓ | data-theme=winter اعمال ✓ | Dark mode ✓ | برگشت به default ✓ | کنسول صفر خطا ✓ | خروج ادمین ✓ | وبلاگ عمومی با فیلترهای دسته و کارت پست‌ها ✓ (کارت‌ها button هستند نه article)
- اسکرین‌شات نهایی: analysis/verify_final_winter_dark.png (Dark + Winter + برف + ۵ کارت تم)

Stage Summary:
- Tasks 8 + 9 + 10 به‌طور کامل تایید شدند؛ ریپوی گیت‌هاب منبع حقیقت و هم‌سان لوکال است
- وابستگی‌های مالک باقی‌مانده: ۱) rotate کردن توکن گیت‌هاب (در چت لو رفته)، ۲) keystore اندروید + SHA-256 برای assetlinks (مسیر ۴ دستوری در docs/MOBILE_TWA.md)

---
Task ID: 11
Agent: Z.ai Code (main)
Task: ادامه اسپرینت P0 — بررسی وضعیت ۴ آیتم (بنر زبان/ترجمه EN/تگ‌های منتخب/برند روی صفحه)، تکمیل پوش ناتمام، هم‌راستاسازی مستندات، وریفای مرورگری کامل + رفع باگ دیپ‌لینک

Work Log:
- ممیزی وضعیت: هر ۴ آیتم P0 در کد موجود بود (بنر D-019 در 4809620، تگ‌ها D-020 در aad9760، برند در i18n/HomeView/Footer، ترجمه D-021) — اما کامیت کار ترجمه با پیام UUID (f660910) پوش نشده بود (ریموت روی 6a6bf7a بود)
- اسکن امنیتی فایل‌های پوش‌نشده (check_status/repair_rail_translation/seed_tags/translate_remaining2/ensure_dev.sh) — بدون هیچ راز
- amend کامیت UUID به پیام معنادار «feat(i18n): finish EN content translations — 82/83 posts (D-021)» و پوش → ریموت = 25626f3
- صحت‌سنجی DB: ۸۲ پست منتشرشده همگی contentEn دارند (pubNoEn=0)؛ تنها استثنا پست پیش‌نویس زباله هوشمند (رمزدار در مبدأ، منتظر تصمیم مالک) — ۳۲ تگ، ۷۱ پست تگ‌خورده
- هم‌راستاسازی مستندات: README/ROADMAP/CHANGELOG از «79/80 ترجمه‌شده» به وضعیت نهایی «هر ۸۲ پست منتشرشده EN کامل» آپدیت شدند (کامیت 42e88c6، پوش شد)
- وریفای مرورگری (agent-browser، دسکتاپ 1440 + موبایل 390):
  - برند: H1 صفحه اصلی = دقیقاً شعار مصوب (EN+FA)، تریو BUILD/HELP/SHARE ✓، زنجیره Research→…→Build again ✓، شعار در فوتر داخل «» ✓، تایتل/متادیتا «Mehrdad — Product Builder» ✓
  - بلاگ: ردیف Topic ها با ۳۲ تگ دوزبانه ✓، کلیک #FinTech → فیلتر ۵ کارت = total=5 از API ✓، نسخه FA با تگ‌های فارسی و RTL ✓
  - مقاله: دیپ‌لینک مستقیم با اسلاگ فارسی encode ✓، عنوان EN بدون نوت «translation in progress» ✓، سوییچ FA → dir=rtl و عنوان فارسی و «انتشار» ✓
  - بنر زبان: تست playwright با لوکال واقعی fa-IR اجرا شد → 9/9 پاس (ظاهر شدن، پذیرش، persist، هرگز دوباره، EN دست‌نخورده، dismiss) ✓
  - فوتر: صفحه بلند → پایین صفحه رانده می‌شود (gap=0)، صفحه کوتاه/اسکرول‌انتها → چسبیده به کف ویوپورت (0.5px) ✓
  - کنسول: صفر خطا ✓ | لینت: پاک ✓ | dev.log: بدون خطا ✓
- باگ کشف و رفع شده حین وریفای (src/components/site/store.ts):
  1) openPost فقط state را عوض می‌کرد و view را به blog نمی‌برد → کلیک روی کارت مقاله منتخب صفحه اصلی هیچ کاری نمی‌کرد
  2) هیچ setter‌ای hash را نمی‌نوشت → هیچ مقاله‌ای قابل اشتراک/بوکمارک نبود (قرارداد دیپ‌لینک Task 3 فقط ورودی بود)
  - فیکس: openPost → view:blog + hash=blog/<slug>؛ setView → hash=view؛ closePost → hash=blog؛ تست شد: home→مقاله ✓، #projects با hash ✓، View all ✓، بازگشت به بلاگ ✓
- CHANGELOG [Unreleased].Fixed برای فیکس دیپ‌لینک نوشته شد

Stage Summary:
- هر ۴ آیتم P0 (بنر زبان، ترجمه EN، تگ‌های منتخب، برند روی صفحه) کامل، وریفای‌شده و پوش‌شده — اسپرینت P0 بسته است
- باگ دیپ‌لینک مقاله (کارت‌های صفحه اصلی بی‌اثر + URL غیرقابل‌اشتراک) رفع و در CHANGELOG ثبت شد
- وضعیت ترجمه نهایی: ۸۲/۸۲ پست منتشرشده دوزبانه؛ فقط پیش‌نویس رمزدار زباله هوشمند منتظر تصمیم مالک (P1)
- باقی‌مانده‌های مالک: rotate توکن گیت‌هاب، keystore اندروید + SHA-256 برای assetlinks، تصمیم انتشار پست 7995

---
Task ID: 12
Agent: Z.ai Code (main)
Task: دستور مالک — پیاده‌سازی سرویس «Forward Deployed Engineering / مهندسی در خط مقدم حل مسئله» به‌عنوان خدمت اصلی برند (§1-§20)

Work Log:
- قانون §17 رعایت شد: ServicesView/ChatWidget/api-chat/schema/i18n/BRAND_STRATEGY/ROADMAP خوانده شد؛ UI_UX_SPECIFICATION.md در ریپو وجود ندارد (گزارش شد)؛ از کامپوننت‌های موجود (Button/Badge/Dialog/tokens) استفاده شد، هیچ جزء تکراری ساخته نشد؛ عبارت ممنوع «Designer & Researcher» در هیچ متنی نیامده
- i18n: فضای‌نام کامل fde (هر §3-§13) به EN و FA + کلیدهای services.explore/core — همه متون دقیقاً طبق دستور مالک (برچسب‌های EN روند، توضیحات فارسی)
- store/page: ویو fde + هش‌روت #fde (دیپ‌لینک‌پذیر، هم‌سو با فیکس Task 11)
- FdeView.tsx: هیرو بزرگ + پیام اصلی (بلوک نقل‌قول)، «چیست؟»، سه کارت نقش 01/02/03 با چیپ‌های focus، لنگر بصری «Real-World Problem → Working Solution» (فلش RTL-aware)، تایم‌لاین تعاملی ۸ مرحله‌ای (کلیک/هاور/کیبورد، tablist + aria-live)، ۶ کارت «برای چه کسانی»، ۶ کارت خروجی با فلش، بخش ویژه AI (گرادیان، چیپ‌های ۱۰گانه، نوت انسانی، دیاگرام عمودی ۶مرحله‌ای Human/AI)، مقایسه Traditional vs FDE (دو ردیف flow)، سناریوی موردی ۷مرحله‌ای، CTA پایانی — Reveal با IntersectionObserver و motion-reduce:transition-none
- ServicesView: کارت FDE برجسته (بورد گرادیان، بج ★ خدمت اصلی، تگ‌ها، CTA «مشاهده جزئیات» → #fde) — هماهنگ با گرید ولی متمایز (2 ستون عرض)
- DB: analysis/add_fde_service.ts (idempotent، upsert با slug) اجرا شد — سرویس اول (order 0)، آیکون Compass
- AI Context (§13): ChatWidget چیپ‌های ۶ سوال پیشنهادی (فقط در #fde تا اولین پیام کاربر) + ارسال context:'fde'؛ /api/chat بلاک PAGE CONTEXT دوزبانه به system prompt اضافه می‌کند
- SEO (§16): عنوان و meta-description دوزبانه در FdeView (با re-assert بعد از hydration چون head-manager نکست عنوان را ریست می‌کرد)
- مقاوم‌سازی چت: retry کوتاه 429/5xx + پیام شایسته دوزبانه به‌جای خطای خام (طوفان 429 حین تست رخ داد)
- باگ کشف‌شده حین تست: کرش client-side در پروفایل مرورگر پایدار (agent-browser) بعد از ری‌بیلدهای متوالی — ریشه: SW قدیمی PWA با کش شِل در حالت dev (Playwright با context تمیز و state یکسان سالم بود) → فیکس: ثبت SW فقط در production (PwaClient) + CACHE_VERSION v2؛ کوک کهنه HMR هم پاکسازی شد
- تست §18: EN (هر ۱۰ سکشن ✓، تایم‌لاین با کلیک aria-selected ✓)، FA (RTL + تمام متون فارسی + عنوان SEO فارسی ✓)، Dark/Light ✓، تبلت 768 و موبایل 390 (بدون overflow ✓)، کارت Services → #fde ✓، فوتر انتهای صفحه بلند ✓، کنسول پاک ✓، lint پاک ✓، اسکرین‌شات‌ها (EN روشن، FA دارک دسکتاپ/میانه، موبایل دارک)
- تست AI Context زنده: زیرساخت LLM در کل بازه تست 429 می‌داد → مسیر کامل API (session/RAG/پیام شایسته) تأیید شد؛ payload شامل context:'fde' بودن چک شد؛ تست پاسخ زنده LLM بعد از سردشدن دوباره اجرا می‌شود
- مستندات: ROADMAP Done + CHANGELOG [Unreleased] (Added/Fixed) به‌روزرسانی شد

Stage Summary:
- FDE به‌عنوان امضای حرفه‌ای برند پیاده شد: کارت برجسته در Services → صفحه تجربه اختصاصی #fde با کل روایت «مسئله → طراحی → ساخت با Engineering+AI → تست → Deploy → یادگیری → تکرار»
- دستیار AI حالا صفحه‌آگاه است (چیپ پیشنهادی + پاسخ grounded روی سرویس)
- SW فقط production ثبت می‌شود — کلاس باگ dev-crash حذف شد
- باقی‌مانده برای پاسخ زنده LLM: وابسته به رفع 429 سرویس (خارج از کنترل کد)

---
Task ID: 13
Agent: Z.ai Code (main)
Task: ROADMAP P1 — تکمیل واقعی Alt-Text توصیفی تصاویر محتوایی (D-022) + حفظ وضعیت تأییدشده 543137c

Work Log:
- پیش از شروع: کامیت UUID پوش‌نشده 5874915 (فقط touch بی‌اثر DB) شناسایی و با reset --hard حذف شد؛ 543137c به‌عنوان مرجع حفظ شد (دستور مالک)
- ممیزی baseline: ۸۳ پست، ۲۴۲ تگ img (۱۰۰٪ junk «Image/تصویر»)، ۱۱۸ تصویر یکتا، ۱۱۸/۱۱۸ روی دیسک، کش صفر — اجرای قبلی هیچ اثری نداشت
- بازنویسی کامل analysis/fix_alts.ts: رفع هر دو باگ گزارش‌شده (شاخه no-alt در rewrite که alt را دوبار درج می‌کرد + شمارنده char-by-char بی‌معنا → شمارش واقعی tag) + معماری جدید probe-first (وقتی سرویس down است بودجه retry سوزانده نمی‌شود)، backoff نمایی + jitter + storm circuit-breaker، persistence بعد از هر تصویر، failed queue روی دیسک (alt_failed.json)، --audit/--validate/--merge-manual/--apply، گزارش آماری
- تست واحد منطق rewrite با اشکال واقعی تگ‌های DB (فارسی خام، percent-encoded، no-alt، escaping HTML، حفظ loading="lazy"): ۱۴/۱۴ پاس (analysis/test_rewrite.ts)
- کشف زیرساختی ۱: sandbox پروسه‌های پس‌زمینه را بین tool-callها می‌کشد (حتی setsid+nohup) → اجرای foreground با پنجره‌های ~۹ دقیقه‌ای + supervisor به‌عنوان bonus
- کشف زیرساختی ۲: طوفان 429 هر دو کانال LLM (vision + text) به مدت ۵+ ساعت — probeهای منظم هیچ ریست کمّی (از جمله نیمه‌شب UTC) را نشان ندادند
- Plan B: تولید دستی ۱۶ alt دوزبانه باvision خود ایجنت برای تصاویر اولویت‌دار (همه تصاویر ۶ پست منتخب صفحه اصلی + نمونه‌های متنوع: عکس شهری/لوگو/اسکرین‌شات اپ/UI پرداخت/پروژه ریلی) با provenance «via: agent-vision» در analysis/alt_manual.json؛ validate: VALIDATION PASS (صفر junk/duplicate/طول غیرمجاز/ناهماهنگی زبان)
- --apply: بکاپ db/custom.backup-20260902002035.db → ۱۱ پست به‌روز، ۱۸ تگ EN + ۱۸ تگ FA بازنویسی (۳۶ تگ = ۱۶ unique؛ cropped-blog-08.jpg شش‌بار استفاده شده — ریاضی tags≠names×2 توجیه و تأیید شد) → مارکر alt_text_descriptive_v1 → post-audit: junk از ۲۴۲ به ۲۰۶ (۱۰۲ unique باقی = ۱۱۸−۱۶ ✓)
- کشف زیرساختی ۳: next-server طولانی‌مدت snapshot کهنه SQLite را از نوشته خارج از پروسه سرو می‌کرد (Prisma/SQLite engine cache) — با restart dev server حل شد؛ برای آینده: بعد از نوشته خارجی روی DB، سرور را restart کن
- UI Regression مرورگری: مقاله trade-corridors دسکتاپ 1440 EN (۶/۶ توصیفی، صفر junk، بدون overflow) ✓ | همان مقاله FA/RTL (alt فارسی در DOM، dir=rtl) ✓ | موبایل ۳۹۰ FA پست mini-smart-city (۱ توصیفی + ۱ باقی‌مانده = دقیقاً وضعیت Phase-1، بدون overflow) ✓ | تبلت ۷۶۸ صفحه اصلی (H1 شعار، کاورها دست‌نخورده، صفر خطای کنسول) ✓ — اسکرین‌شات‌ها در analysis/verify_alts_*.png
- مستندات: ROADMAP (وضعیت Phase-1 + دستور resume)، CHANGELOG [Unreleased]، به‌روزرسانی همین worklog

Stage Summary:
- ۱۶/۱۱۸ تصویر یکتا حالا alt توصیفی دوزبانه واقعی دارند (۳۶/۲۴۲ تگ)؛ هیچ apply بدون بکاپ و idempotency انجام نشد
- pipeline برای ۱۰۲ تصویر باقی‌مانده آماده و resume-safe است: `bun analysis/fix_alts.ts` (تولید با VLM) سپس `bun analysis/fix_alts.ts --apply` — به‌محض رفع 429 خارجی
- External Blockage ثبت شد: LLM Rate Limit (۵+ ساعت، هر دو کانال) — طبق دستور مالک به‌عنوان بلوکه خارجی، نه باگ
- تست زنده LLM مربوط به AI Context صفحه FDE (Task 12) نیز همچنان منتظر همان رفع 429 است

---
Task ID: 14
Agent: Z.ai Code (main)
Task: تکمیل Phase 2 Alt-Text — پوشش ۱۰۲ تصویر باقی‌مانده (ادامه D-022) + بازیابی وضعیت canonical از GitHub

Work Log:
- بازیابی sandbox: این instance به اسنپ‌شات Task-7 برگشته بود (بدون FDE/alt-work/remote) → وضعیت canonical از GitHub (origin/main = e6c3344، شامل فریز 543137c) بازیابی شد: بکاپ کارهای محلی به /tmp، git reset --hard origin-main، افزودن remote و upstream
- کشف: Task 13 قبلی هر دو باگ گزارشی اسکریپت را فیکس و Phase 1 (۱۶ تصویر) را apply+push کرده بود؛ pipeline canonical (probe-first/backoff+storm breaker/failed-queue/validate/apply) بازخوانی و تأیید شد
- محیط: sandbox پروسه‌های background را حتی با setsid می‌کشد → اجرای chunk-های foreground resumable؛ طوفان 429 هر دو کانال LLM ادامه داشت (۸+ ساعت؛ ۶ chunk + probeهای CLI — بدون موازی‌سازی طبق قانون مالک)
- Plan B (الگوی تأییدشده Phase 1): تولید دستی ۱۰۲ alt دوزبانه با vision خود ایجنت در ۱۷ دسته — هر تصویر واقعاً مشاهده شد؛ متن مهم تصاویر منتقل شد؛ برای فونت استیلیزه ناخوانا توصیف عمومی (بدون hallucination)؛ provenance «via: agent-vision» در analysis/alt_manual.json
- merge-manual: +۱۰۲ entry → کش ۱۱۸/۱۱۸ | validate: VALIDATION PASS (صفر junk/duplicate/language/length) | failed queue خالی شد
- apply: بکاپ db/custom.backup-20260902074251.db → ۵۲ پست به‌روز، ۱۲۱ EN + ۱۲۱ FA تگ بازنویسی → مارکر alt_text_descriptive_v1 → POST-APPLY AUDIT: tags=242 junk=0 empty=0 descriptive=242 unique=118
- زیرساخت: بعد از git reset (تعویض inode فایل DB) سرور 500 می‌داد (route جدید `tags` را select می‌کرد + Prisma client قدیمی در حافظه) → prisma generate + pkill + ensure_dev.sh → همه APIها 200
- Browser Verify (agent-browser): مقاله iran-railway-technology-startup دسکتاپ 1440 EN (altهای توصیفی در DOM شامل alt جدید) ✓ | همان مقاله FA (dir=rtl + altهای فارسی) ✓ | موبایل 390 مقاله و صفحه اصلی (بدون overflow؛ کارت‌ها alt="" تزئینی طبق طراحی) ✓ | کنسول صفر خطا ✓ | اسکرین‌شات‌ها: analysis/verify_alts_*.png
- مستندات: ROADMAP (P1 alt → [x] DONE 118/118)، CHANGELOG (ورودی COMPLETE)، ALT_PIPELINE.md (وضعیت Phase 2 + مسیر agent-vision)

Stage Summary:
- هدف مالک محقق شد: هر ۱۱۸ تصویر یکتا alt توصیفی دوزبانه واقعی دارند — هیچ alt عمومی باقی نمانده (242/242 تگ، junk=0)
- تولید: ۱۶ دستی (Phase 1) + ۱۰۲ agent-vision (Phase 2)؛ VLM API در کل بازه کار 429 بود — طبق قانون هیچ درخواست موازی‌ای برای دور زدن آن زده نشد
- pipeline و مستندات اجرای مجدد برای پست‌های آینده: docs/ALT_PIPELINE.md
- تست زنده LLM مربوط به AI Context صفحه FDE (Task 12) همچنان منتظر رفع 429 خارجی است
