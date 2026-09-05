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

---
Task ID: 15
Agent: Z.ai Code (main)
Task: گزارش مالک — روی صفحه Services در حالت انگلیسی جمله فارسی «مهندسی در خط مقدم حل مسئله» نمایش داده می‌شد؛ ترجمه انگلیسی جایگزین شود

Work Log:
- Inspect: ریشه‌یابی — خط زیرعنوان کارت FDE در ServicesView.tsx عمداً عنوانِ «زبان دیگر» را نشان می‌داد: `pick(lang, s.titleFa, s.titleEn)` → در حالت EN مقدار titleFa دیتابیس (جمله فارسی) رندر می‌شد
- Fix: فیلد دوزبانه `fde.cardTagline` به src/components/site/i18n.ts اضافه شد (EN: «Engineering on the front line of problem-solving» — ترجمه واقعی نام فارسی؛ FA: «Forward Deployed Engineering» — رفتار قبلی حفظ شد) و زیرعنوان کارت به `t.fde.cardTagline` تغییر کرد
- Test: bun run lint — پاک، بدون خطا
- Browser Verify (agent-browser): EN — کارت FDE اکنون: «Forward Deployed Engineering» + «Engineering on the front line of problem-solving»، صفر جمله فارسی ✓ | FA — «مهندسی در خط مقدم حل مسئله» + «Forward Deployed Engineering» بدون رگرسیون ✓ | کنسول و خطاهای صفحه: صفر ✓ | dev.log: بدون خطا
- Documentation: docs/CHANGELOG.md [Unreleased]→Fixed + همین worklog
- Git: commit `545571d` ساخته شد؛ **push ناموفق** — sandbox بازچرخیده و هیچ اعتبارنامه‌ای (token/SSH/credential-helper) ندارد؛ دو commit آماده push: `080bc5a` (Phase-2 alt-text) + `545571d` (این فیکس) — در انتظار توکن مالک

Stage Summary:
- در هر دو زبان هر دو خط کارت FDE اکنون به زبان درست‌اند؛ الگوی «زیرعنوان = نام رسمی به زبان دیگر» حفظ شد اما منبعش i18n است نه titleFa دیتابیس

---
Task ID: 15-b (addendum)
Agent: Z.ai Code (main)
Task: دریافت توکن GitHub از مالک → تکمیل pushهای معوق + رفع یک commit تصادفی

Work Log:
- توکن از مالک دریافت شد (فقط inline و یک‌بارمصرف استفاده شد؛ در هیچ فایل/config/remote ذخیره نشد)
- push اول: e6c3344..ec9cb42 — اما بررسی نشان داد یک commit تصادفی خودکار (پیام UUID، فایل upload/pasted_image_1788349704898.png — آرتیفکت paste چت) روی سر گروه ساخته و همراهش publish شده بود
- اصلاح: reset محلی به 7f945cd (فایل تصویر روی دیسک ماند و فقط untracked شد) + افزودن /upload/ به .gitignore (ریشه مشکل — قبلاً پوشیده نبود) + commit 4997bd9 + force-push با lease صریح ec9cb42→4997bd9
- Verify نهایی: remote/main == local == 4997bd9

Stage Summary:
- هر دو کار معوق منتشر شد: 080bc5a (Phase-2 alt-text 118/118) + 7f945cd (فیکس i18n کارت FDE) + 4997bd9 (gitignore)
- commit تصادفی تصویر چت از تاریخچه public حذف شد؛ از این پس /upload/ هرگز commit نمی‌شود
- توکن به مالک توصیه شد بعد از این مرحله revoke/rotate کند چون در چت plaintext بود

---
Task ID: 16
Agent: Z.ai Code (main)
Task: مأموریت مالک — آماده‌سازی نهایی پروژه برای استقرار روی cPanel (بدون SSH، حفظ SQLite) — Audit → Fix → Build → Prod-start → Docs → Push

Work Log:
- Audit کامل: next 16 الزام Node>=20.9 (cPanel 20.20.2 ✓) | start با bun بود | db/custom.db در git tracked (محتوای مهاجرت‌شده، عمدی GitHub-First) | DATABASE_URL محلی absolute → روی cPanel با env override می‌شود | next-auth/next-intl نصب اما بلااستفاده (dead deps، در standalone نمی‌آیند) | auth سفارشی fail-closed با x-admin-key | middleware 301 لایه کامل WP (173 مسیر + 83 wpId) | AI SDK از .z-ai-config (gitignored) می‌خواند → مسیر اتصال AI روی هاست واقعی موجود است | writeهای runtime فقط در public/media/generated | SW فقط production
- اصلاحات مجاز غیرمعماری: package.json — start → `node .next/standalone/server.js` (بدون bun/tee)، build → `prisma generate && next build && cp ...`، engines node>=20.9 | .env.example جامع (DATABASE_URL absolute، ADMIN_PASSWORD، NODE_ENV، HOSTNAME=0.0.0.0 — هشدار Passenger، بخش .z-ai-config) | db.ts — لاگ query فقط dev، در prod error/warn | next.config — poweredByHeader:false
- Production build (کپی ایزوله /tmp/prodbuild، npm خالص، Node 24): npm install → package-lock.json تولید شد (به repo بازگردانده شد) → npm run build ✓ → standalone کامل: server.js + static + public (media/uploads/icons/manifest/sw/robots) + Prisma engine (.so.node) — 219MB
- Production start با node خالص (پورت 3100، env مجزا، data/production.db شبیه‌سازی cPanel): homepage 200 | /api/site (Prisma/SQLite) 200 با داده فارسی | /api/posts 200 (82 پست) | manifest/sw/robots 200 | media 200 | admin auth: 401 غلط/200 درست | 301 وردپرس: /iran-ousted-… → /#blog/… ✓ | X-Powered-By حذف ✓ | 404 ✓ | چت AI پاسخ داد (کانفیگ در سطح سیستم sandbox موجود بود؛ روی cPanel همان ساختار فایل) — همه سبز
- مستندات: docs/CPANEL_DEPLOYMENT.md جدید (۱۲ بخش: prerequisites/config/env/SQLite/start/logs/backup/update/rollback/مهاجرت m.mehrdad.ir/SEO cutover/troubleshooting) | docs/DEPLOYMENT.md بازنویسی (قبلی به proxy.ts و مسیرهای ناموجود ارجاع می‌داد) | README + CHANGELOG + ROADMAP + SECURITY همگام
- scripts/build-production.sh: artifact DB-free با sanity-check (engine prisma) + SHA256

Stage Summary:
- نتیجه Audit: پروژه READY برای cPanel (Node 20 + Passenger) بدون SSH؛ SQLite با استراتژی data/production.db (خارج از artifact) هم حفظ داده دارد هم آپدیت امن
- عدم انجام (نیازمند تصمیم/اجرا مالک): ساخت Node.js App در cPanel، docroot cutover، انتقال WP به m.mehrdad.ir، PostgreSQL (توصیه: فعلاً نه)، rate-limit chat/admin (پیشنهاد ثبت شد)
- ریسک‌های ثبت‌شده: HOSTNAME hijack در cPanel (mitigated با env)، SPA تک-URL (sitemap/canonical per-article = فاز آینده)، brute-force بدون rate-limit

---
Task ID: 17
Agent: Z.ai Code (main)
Task: مأموریت مالک — از commit `5ace5fe` با `scripts/build-production.sh` فایل deployment واقعی ساخته شود

Work Log:
- Pre-flight: HEAD دقیقاً 5ace5fe با working tree تمیز؛ Node 24.19.0 / npm 11.17.0 (≥20.9 ✓)؛ package-lock.json موجود → مسیر npm ci؛ دیسک 4.8G آزاد
- گیت‌ایگنور چک: `/dist/` نبود → قبل از هر build اضافه شد (درس `/upload/` — آرتیفکت ۱۳۸MB باینری هرگز نباید مسیر commit داشته باشد)
- Build ایزوله: کلون تمیز از 5ace5fe در /tmp/deploy-build-5ace5fe (+ کپی .env فقط برای build — gitignored) تا dev server زندهٔ پروژه دست‌نخورده بماند
- نکته اجرا: nohup پس‌زمینه توسط sandbox کشته می‌شد → اجرای foreground با timeout 600s موفق شد
- Build v1 موفق (138M) اما Audit محتوای tar یک باگ واقعی گرفت: `./.env` داخل آرتیفکت بود — Next standalone فایل‌های .env* ماشین build را داخل .next/standalone کپی می‌کند و tar اسکریپت برخلاف ادعای کامنتش هیچ exclude‌ای نداشت → خطر: استخراج روی cPanel فایل env اپراتور را بازنویسی می‌کرد
- فیکس ریشه‌ای اسکریپت: exclude `./.env*` و `./.z-ai-config` در tar + گارد سخت post-pack که اگر هر فایل env/db/secret داخل آرتیفکت باشد build را FATAL می‌کند (نه هشدار)
- Rebuild v2 با اسکریپت فیکس‌شده: `dist/mehrdad-deploy-20260902-201355.tar.gz` (138M) + SHA256SUMS؛ ممیزی ۱۹۸۶ فایل: صفر .env/.db/.z-ai-config؛ server.js + 32 فایل static + public کامل (robots/sw/manifest.json/media) + Prisma engine (libquery_engine-debian-openssl-3.0.x.so.node) — همه سبز
- E2E آرتیفکت (شبیه‌سازی دقیق cPanel اول): استخراج در دایرکتوری تازه → data/production.db از db/custom.db → env به سبک cPanel UI → node server.js: / 200 | /api/site 200 با داده واقعی فارسی (Prisma/SQLite از آرتیفکت استخراج‌شده) | /api/posts 200 (۱۲ پست، عنوان فارسی) | robots/sw/manifest 200 | admin POST: غلط 401 / درست 200 (fail-closed) | WP 301: /iran-ousted-from-trade-corridors → /#blog/… | X-Powered-By حذف | 404 ✓ | لاگ سرور تمیز
- تست دفاعی: .env خراب عمداً در app root کاشته شد → env فرایند (cPanel) پیروز ماند، /api/site همچنان 200 → سناریوی «.env جامانده» بی‌خطر است
- تحویل: آرتیفکت + SHA256SUMS به dist/ پروژه کپی شد (sha256 -c OK در مقصد)؛ dev server: 200 بی‌تأثیر
- مستندات: CPANEL_DEPLOYMENT.md §2 (آرتیفکت هرگز .env/.z-ai-config ندارد + گارد + برتری env فرایند) و §7 به‌روز؛ CHANGELOG ورودی Task 17

Stage Summary:
- اولین فایل deployment واقعی و قابل آپلود از commit منتشرشده 5ace5fe تولید و end-to-end اثبات شد: dist/mehrdad-deploy-20260902-201355.tar.gz (138M) + SHA256SUMS
- یک باگ امنیتی/عملیاتی مهم در همان build اول پیدا و ریشه‌ای بسته شد: نشت .env ماشین build به آرتیفکت — اکنون هم exclude است هم گارد FATAL
- آرتیفکت DB-free است (طبق طراحی §7) → روی cPanel اولین استقرار: seed دستی data/production.db + env در UI + Restart

---
Task ID: 17-b (addendum)
Agent: Z.ai Code (main)
Task: بازیابی پس از reset شدن sandbox + بازسازی artifact deployment

Work Log:
- بین دو پیام مالک، sandbox بازنشسته شد: repo محلی به de09248 (قبل از Task 16!) برگشته و فایل‌های untracked (dist/، public/download/، بیلدهای /tmp) پاک شده بودند
- Recovery: git fetch + reset --hard origin/main → local == remote == 5d2670c؛ .env سالم ماند — GitHub-First دقیقاً همان کاری را کرد که برایش ساخته شده: هیچ کاری از دست نرفت
- Artifact با اسکریپت فیکس‌شده از 5d2670c بازسازی شد (تکرارپذیری اثبات شد): mehrdad-deploy-20260904-163314.tar.gz (138M) | 1986 فایل | صفر env/db/secret | Prisma engine موجود
- E2E دوباره از استخراج تازه + data/production.db + env به سبک cPanel: / ، /api/site، /api/posts، robots، sw → 200 | admin POST 200 | WP 301 — همه سبز
- تحویل: dist/ + public/download/ (شامل custom.db برای seed اولین استقرار) — هر دو gitignored، سرو HTTP 200
- SHA256 جدید: 3c2aa8bb4c177d483dd5365188485ec4766585435aa1de5802f5b2ae2466a0a5 (نسخهٔ قبلی d978639a… اگر مالک دانلود کرده بود معتبر می‌ماند)
- کلید عمومی ed25519 برای مسیر B (دیپلوید مستقیم از sandbox با paramiko) ساخته شد؛ کلید خصوصی فقط داخل sandbox

Stage Summary:
- مقاومت زیرساخت اثبات شد: sandbox ریست شد، ولی چون هر commit فوراً push می‌شد، بازیابی = یک reset --hard به origin/main
- artifact بازسازی‌شده از همان commit یکسان، بار دیگر همهٔ ممیزی‌ها و E2E را پاس کرد — build تکرارپذیر در عمل

---
Task ID: 17-c (addendum)
Agent: Z.ai Code (main)
Task: مسیر SSH برای دیپلوید مستقیم — تشخیص: SSH روی سرور میزبان‌فا غیرفعال؛ آماده‌سازی دو مسیر جایگزین

Work Log:
- مالک کلید عمومی sandbox را در cPanel (id_rsa2) Import و Authorize کرد و اطلاعات اتصال را فرستاد (رمز cPanel هم در چت رفت — به مالک تذکر rotate داده شد؛ برای اتصال استفاده نشد)
- Probe شبکه: خروجی SSH ساندباکس سالم (github.com:22 باز) | سرور در دسترس (2082/2083/2086 باز) | اما پورت 22 روی سرور REFUSED و 8 پورت کاندید دیگر timeout → نتیجه: sshd روی این سرور خاموش است (سیاست هاستینگ، نه کلید)
- وب‌جست‌وجو: الگوی رایج هاست‌های ایرانی = SSH باید از سمت هاست فعال شود؛ در cPanelهای مدرن اگر SSH فعال باشد ابزار Terminal هم ظاهر می‌شود → تست Terminal = تشخیص قطعی
- مسیر جایگزین بدون-SSH آماده شد: GitHub Release `deploy-20260904` (tag روی 5d2670c) با سه asset: artifact 138MB (upload در 15s) + SHA256SUMS + custom.db — همه HTTP 201 و لینک‌ها 200 تأیید شد؛ artifact هیچ secret/DB نداشتن را در ساخت هم‌چنان تضمین می‌کند
- `scripts/cpanel-bootstrap.sh` ساخته شد (یک‌خطی برای Terminal: wget از Release → sha256 -c → extract در ~/mehrdad-app → seed فقط-بار-اول → restart.txt → راهنمای گام‌های UI)؛ bash -n سالم
- مالک هنوز جواب دو سؤال را نگفته: Terminal در cPanel هست؟ و تیکت فعال‌سازی SSH به میزبان‌فا زده؟

Stage Summary:
- SSH مسیر مستقیم را بست، اما زیرساخت جایگزین کامل شد: اگر Terminal موجود باشد = یک دستور paste برای مالک؛ اگر نباشد = مسیر File Manager (آپلود 138MB + Extract داخلی خود File Manager) که هیچ SSH‌ای نمی‌خواهد
- Release عمومی فقط build بدون secret است (repo هم public است) — مالک هر وقت بخواهد می‌تواند حذفش کند

---
Task ID: 17-d (addendum)
Agent: Z.ai Code (main)
Task: هاست Terminal ندارد و مالک HTML-کردن سایت را پرسید → مسیر سوم ساخته شد: cPanel Git™ Version Control

Work Log:
- پاسخ به مالک: Static HTML یعنی حذف چت AI، پنل مدیریت، کامنت، فرم تماس و ۳۰۰+ ریدایرکت — رد شد؛ سئو هم بهتر نمی‌شود (SSR هم‌اکنون HTML کامل می‌دهد)
- اختراع مسیر بدون-SSH/بدون-Terminal/بدون-آپلود-از-PC: آرتیفکت 138MB با split -b 69m به دو قطعه (72.3 + 72.0MB، زیر سقف 100MB گیت‌هاب) شکسته شد؛ بازچینی با cat و sha256 تطبیق کامل با 3c2aa8bb…
- ریپوی جدید عمومی goolro/mehrdad-cpanel-deploy ساخته و push شد (db04331): دو قطعه + custom.db + deploy.sh (بازچینی→checksum→extract در ~/mehrdad-app→seed فقط-بار-اول→restart.txt) + .cpanel.yml (post-deploy hook) + README فارسی با جدول کامل Node.js App
- سیاست‌ها حفظ شد: هیچ secret/DB در artifact؛ seed فقط-بار-اول؛ وردپرس دست نمی‌خورد
- منتظر جواب مالک: آیا cPanel او «Git™ Version Control» دارد؟ (اگر نه → مسیر File Manager)

Stage Summary:
- سه مسیر بدون-SSH حالا آماده است: ①Git Version Control (دو کلیک، برتر) ②File Manager دستی (همیشه کار می‌کند) ③تیکت SSH به هاست (برای آینده)
- GitHub ذخیرهٔ فایل‌های 69MB را فقط warning داد نه خطا — بدون نیاز به LFS

---
Task ID: 18
Agent: Z.ai Code (main)
Task: عیب‌یابی خطای DB در پروداکشن (Failed to load posts / site data) و رفع ناسازگاری موتور Prisma

Work Log:
- مالک cron-تشخیصی را اجرا کرد؛ diag.txt قطعی آورد: «Prisma Client was generated for debian-openssl-3.0.x, but the actual deployment required debian-openssl-1.0.x» (هاست cPanel به debian-openssl-1.0.x resolve می‌شود؛ /etc/os-release هم ندارد)
- رفع: prisma/schema.prisma → binaryTargets = ["native", "debian-openssl-1.0.x"]؛ prisma generate هر دو موتور را ساخت (1.0.x: 21MB + 3.0.x: 17MB)
- bug خودی: cp -r public آرتیفکت قدیمی 138MB داخل public/download را به standalone آورد → آرتیفکت 296MB شد؛ حذف شد و build-production.sh اکنون --exclude='./public/download' + گارد hygiene گسترش‌یافته دارد
- rebuild کامل: next build موفق؛ آرتیفکت نهایی mehrdad-deploy-20260904-183256.tar.gz = 157MB، گارد سبز، ENGINE_1.0_OK
- قطعه‌بندی: split -d -b 90m → artifact.part.00 (90MB) + artifact.part.01 (67MB)؛ SHA256 = bdb678cfbedd3369857b380bbb36b1891ce5ec6fcd09baac724e419d4699af89؛ بازچینی تست شد (OK)
- deploy.sh نسخه ۲ نوشته شد: cat artifact.part.* (گlob-محور، مستقل از تعداد قطعه) + استمپ جدید + شمارش موتورها در لاگ
- یافتهٔ دیگر از تست مالک: /admin واقعی #admin است (SPA hash-routing) — 404 آن انتظارشده بود؛ ریدایرکت WP به #blog/… درست کار می‌کرد
- AI chat نیازمند .z-ai-config روی سرور است (فایل در artifact نیست) — گام بعدی پس از سبز شدن DB

Stage Summary:
- ریپوی اصلی: commit schema+build script → push به goolro/mehrdad-website
- ریپوی دیپلوی: قطعات جدید + SHA256SUMS.repo + deploy.sh v2 → push به goolro/mehrdad-cpanel-deploy
- عملیات مالک: فقط Update from Remote → Deploy HEAD Commit → تست /api/posts (دیتابیس production دست‌نخورده می‌ماند)

---
Task ID: 19
Agent: main (Z.ai Code)
Task: تغییر سئویی فوتر — لینک کردن «mehrdad.ir» در خط کپی‌رایت به صفحه اصلی

Work Log:
- جستجو و پیدا کردن فوتر در src/components/site/Footer.tsx (خط کپی‌رایت © year mehrdad.ir)
- مشاورهٔ سئو به مالک: فقط «mehrdad.ir» لینک شود؛ «Powered by» به mehrdad.ir لینک نشود (انکرتکست نامرتبط + تقسیم ارزش لینک یکسان)
- ویرایش Footer.tsx: «mehrdad.ir» به <a href="/"> با aria-label و hover تبدیل شد؛ «Powered by AI ✦» متن ساده ماند
- bun run lint: پاس بدون خطا
- چک زندهٔ پروداکشن: / → 200 سبز؛ /api/site هنوز timeout (سقف پروسه CloudLinux در حال آزاد شدن)

Stage Summary:
- تغییر فوتر در کد محلی انجام شد ولی هنوز در آرتیفکت/گیت نیست — باید در دیپلوی بعدی (ترجیحاً همراه فعال‌سازی چت AI در یک دیپلوی واحد) منتشر شود

---
Task ID: 20
Agent: main (Z.ai Code)
Task: راستی‌آزمایی گزارش امنیتی خارجی + فیکس فوری موارد بحرانی

Work Log:
- راستی‌آزمایی ادعاها با کد واقعی: DB commit و push شده (۹ کامیت، ریپو PUBLIC) ✅ | login با رمز خالی fail-open بود ✅ | x-admin-key در هر درخواست ✅ | dangerouslySetInnerHTML بدون sanitizer در BlogView/AdminView ✅ | ignoreBuildErrors ✅ | بدون rate-limit ✅ | بدون security headers ✅
- رد/اصلاح ادعاها: خطاهای lint وجود نداشت (eslint پاس) | Caddyfile XTransformPort فقط سندباکس است و در پروداکشن cPanel نیست | production DB جدا از DB ریپو است (create-once + hygiene guard)
- فیکس src/lib/admin.ts: fail-closed (رمز خالی => 503) + safeEqual با sha256+timingSafeEqual
- فیکس /api/admin/auth: همان منطق + parse امن body
- next.config.ts: هدرهای امنیتی (XFO DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS 6 ماه)
- git rm --cached db/custom.db + gitignore: db/*.db — فایل محلی دست‌نخورده ماند
- commit 44a5aa3 push شد به goolro/mehrdad-website

Stage Summary:
- موارد بحرانیِ کد فیکس و push شد — ولی پروداکشن تا rebuild آرتیفکت تغییر نمی‌کند (باندل با فعال‌سازی چت AI)
- باقی‌مانده در نوبت: پاکسازی تاریخچهٔ Git (نیازمند تأیید force-push)، sanitize-html، rate-limit، session cookie، notice حریم خصوصی چت

---
Task ID: 21
Agent: main (Z.ai Code)
Task: پاکسازی تاریخچهٔ گیت — حذف کامل db/custom.db از ریپوی عمومی (با تأیید مالک)

Work Log:
- اسکن کل تاریخچه: تنها فایل حساس همان db/custom.db بود؛ توکن/.env هرگز کامیت نشده بودند
- بکاپ کامل: /tmp/mehrdad-website-BACKUP.bundle (107MB, pre-rewrite)
- git filter-repo --invert-paths --path db/custom.db → ۳۰ کامیت سالم، ۰ اثر از فایل
- force-push انجام شد ولی گیت‌هاب کامیت‌های یتیم را با SHA مستقیم هنوز سرو می‌کرد (200)
- حذف ریپو با توکن ممکن نبود (403, اسکوپ delete_repo ندارد) → نقشهٔ B:
  ۱. PATCH ریپوی قدیمی → تغییرنام به mehrdad-website-archive + private:true (بلک‌اوت فوری دسترسی عمومی)
  ۲. ساخت ریپوی عمومی تازه با همان نام goolro/mehrdad-website
  ۳. push تاریخچهٔ پاک (main + tag deploy-20260904)
- تأیید نهایی: کلون تازه = ۰ اثر DB، ۳۰ کامیت | SHA قدیمی روی ریپوی عمومی = 422 (ناموجود) | کامیت‌های قدیمی فقط در آرشیو خصوصی
- بهداشت: توکن از .git/config پاک شد؛ upstream مرتب شد

Stage Summary:
- افشای عمومی داده‌ها بسته شد؛ داده فقط در آرشیو خصوصی مالک است (goolro/mehrdad-website-archive)
- مالک هر وقت خواست آرشیو را از UI حذف کند (Settings → Danger Zone) یا نگهش دارد به‌عنوان بکاپ
- یادآوری پایدار: توکن ghp_9omo... در چت لو رفته — پس از پایان پروژه باید حذف شود

---
Task ID: 22
Agent: main (Z.ai Code)
Task: دور دوم سخت‌سازی امنیتی — XSS sanitizer، rate limit، notice حریم خصوصی چت

Work Log:
- نصب sanitize-html + @types
- lib/sanitize.ts: allowlist کامل (بدون script/style/iframe/form/event handlers/javascript:، حفظ dir برای RTL، rel امن روی لینک‌ها، loading=lazy تصاویر) + sanitizePlainText
- sanitize دو-لایه: قبل از ذخیره (admin/posts POST، ai/write، ai/translate) و موقع خواندن (GET /api/posts و /api/posts/[slug])
- lib/rate-limit.ts: پنجرهٔ ثابت درون-حافظه‌ای با کلید per-IP، sweep حافظه، پاسخ 429 + Retry-After
- اعمال: login 5/15دقیقه، chat 10/دقیقه، contact 3/10دقیقه، comments 5/10دقیقه
- ChatWidget: notice مرئی دوزبانه حریم خصوصی + پیام دوستانهٔ 429 (t.chat.tooFast)
- تست محلی: sanitizer اسکریپت/onerror/javascript: را حذف و RTL را حفظ کرد؛ login بدون ADMIN_PASSWORD => 503؛ تلاش ششم login => 429؛ یازدهمین chat => 429؛ چهارمین contact => 429؛ /api/posts سالم (82 پست)
- lint پاس؛ commit + push به goolro/mehrdad-website

Stage Summary:
- همهٔ فیکس‌های «هفتهٔ اول» گزارش کارشناس به‌جز CSP nonce و session cookie انجام شد
- باقی‌مانده برای دیپلوی بعدی: build آرتیفکت v3 (شامل فیکس‌های 19-22 + فوتر) و فعال‌سازی چت AI با .z-ai-config

---
Task ID: 23
Agent: main (Z.ai Code)
Task: آرتیفکت v3 + کشف و بستن افشای دوم (ریپوی دیپلوی) + آماده‌سازی متن تیکت هاست

Work Log:
- کشف: ریپوی عمومی goolro/mehrdad-cpanel-deploy هم custom.db با دیتای واقعی داشت (۱ تماس، ۴ نشست، ۷ پیام چت)
- بستن افشا: تغییرنام به mehrdad-cpanel-deploy-archive + private:true → ساخت ریپوی عمومی تازهٔ هم‌نام → push تاریخچهٔ تمیز تک-کامیتی
- بیلد v3: خطای npm ci (lockfile ناهمگام بعد از bun add) → npm install sync + commit 835d13b → build-production.sh موفق در ۷۷ ثانیه
- آرتیفکت: mehrdad-deploy-20260904-221803.tar.gz (147MB)، هر دو موتور Prisma، hygiene guard صفر
- deploy.sh: اسم هاردکد تاربال به mehrdad-deploy.tar.gz خنثی شد؛ SHA256SUMS.repo جدید (per-part + کامنت full-hash)
- باگ خودم: الگوی *.part.* در gitignore جلوی push قطعات را گرفت → حذف الگو → push دوم موفق → هر ۷ فایل تأیید با API
- وضعیت پروداکشن: homepage 200 (cache)، auth API 401 سالم، DB-دارها هنوز هنگ (صبر روی هاست)

Stage Summary:
- دیپلوی v3 کامل روی goolro/mehrdad-cpanel-deploy آماده است — بعد از رفع محدودیت هاست فقط Update from Remote → Deploy
- متن تیکت فارسی/انگلیسی برای میزبان‌فا تحویل مالک شد (kill پروسه‌های معلق + افزایش nproc≥100 و PMEM≥1GB)
- هر دو ریپوی گیت‌هاب حالا تمیز و امن هستند

---
Task ID: 24
Agent: main (Z.ai Code)
Task: پاسخ به پرسش «آیا همهٔ مشکلات برطرف شد؟» + بستن موارد باقی‌مانده

Work Log:
- راستی‌آزمایی مجدد کل گزارش کارشناسی با کد واقعی و ساخت جدول وضعیت
- ۴ خطای lint کارشناس حالا ظاهر شدند (npm install نسخهٔ جدید eslint-plugin-react-hooks آورد) → هر ۴ فیکس شد: ChatWidget (disable مستند برای ریست تعمدی زبان)، CommentsSection (الگوی render-adjust)، use-mobile و carousel (disable مستند کد وندور shadcn)
- ignoreBuildErrors خاموش شد: خطاهای TS فقط در analysis/skills/examples بودند (خارج از بیلد) → tsconfig exclude → typecheck اپ صفر → بیلد پروداکشن با typecheck فعال پاس (۹۲s)
- باگ runtime واقعی پیدا و فیکس شد: toast بدون useToast در Dashboard (ReferenceError بالقوه)
- لاگ Prisma: query logging حالا فقط با PRISMA_DEBUG=1 (حریم خصوصی)
- حریم خصوصی چت: retention خودکار ۳۰ روزه (lazy، بدون cron) + DELETE /api/chat + دکمهٔ Clear حالا سمت سرور هم پاک می‌کند
- آرتیفکت v3.1 (mehrdad-deploy-20260904-224841) بیلد و به ریپوی دیپلوی push شد

Stage Summary:
- همهٔ موارد بحرانی/بالا/هفتهٔاول گزارش کارشناسی بسته شد (جز CSP nonce و session cookie که عمداً بعداً)
- پروداکشن هنوز روی هاست معلق است — منتظر پاسخ تیکت میزبان‌فا

---
Task ID: turso-test
Agent: Z.ai Code (main)
Task: تست عملی Turso (پلن رایگان) برای طرح B — راستی‌آزمایی اینکه Prisma + Turso برای mehrdad.ir قابل استفاده است

Work Log:
- اعتبارسنجی API token اکانت goolro → معتبر، پلن starter (رایگان)، org سالم و بلاک نشده
- ساخت گروه default در لوکیشن aws-ap-south-1 (بمبئی — نزدیک‌ترین به ایران در لیست AWS این اکانت)
- ساخت دیتابیس «mehrdad» → mehrdad-goolro.aws-ap-south-1.turso.io + تولید DB JWT
- Smoke test خام HTTP (/v2/pipeline): SELECT 1 ✅ / CREATE TABLE ✅ / INSERT ✅ (query ~37-92ms از sandbox)
- نکته کشف‌شده: Prisma 6.19 CLI نه provider «libsql» دارد و نه URL «libsql://» را در db push قبول می‌کند
- مسیر صحیح: `prisma migrate diff --from-empty --to-schema-datamodel --script` → init.sql (15 جدول + 15 ایندکس) → اجرا با @libsql/client executeMultiple ✅
- تست مسیر پروداکشن: @prisma/adapter-libsql + PrismaClient({adapter}) → upsert/create/find/delete/count روی دیتابیس ریموت ✅ (cuid هم کار می‌کند)
- پاکسازی آثار تست (DROP _smoke، حذف دو ردیف SiteSetting آزمایشی) → دیتابیس ریموت تمیز با 15 جدول خالی
- اسکریپت‌های تست در /home/z/turso-mig (test.ts, test-prisma.ts, init.sql) + DB JWT در env همین پوشه

Stage Summary:
- نتیجه: Turso به‌طور کامل با استک پروژه سازگار است — اسکیما بدون هیچ تغییری پوش شد (provider همان sqlite می‌ماند)
- طراحی نهایی مهاجرت: schema دست‌نخورده + src/lib/db.ts دوزبانه (اگر TURSO_DATABASE_URL ست بود → adapter libsql، وگرنه فایل لوکال) + نصب @prisma/adapter-libsql
- داده: مهاجرت کوچک است (خواندن از SQLite لوکال با Prisma و نوشتن به ریموت)؛ دیتابیس ریموت فعلاً خالی آماده است
- ریسک باقی‌مانده: تحریم/ساسپند اکانت (خارج از کنترل ما)، تأخیر واقعی از ایران (باید بعد از دیپلوی اندازه گرفته شود)
- امنیت: API token در چت لو رفته — باید بعد از اتمام تست‌ها rotate شود؛ DB JWT فاقد exp است و فقط برای تست است

---
Task ID: turso-migration
Agent: Z.ai Code (main)
Task: مهاجرت دیتابیس پروژه به Turso (طرح صفر-هزینه: اپ روی میزبان‌فا + DB ابری رایگان) + آرتیفکت v4

Work Log:
- توافق مالک: DB روی Turso رایگان، هاست همان میزبان‌فا cPanel، دامنه همان mehrdad.ir
- نصب @prisma/adapter-libsql — نسخهٔ 7.x خودکار نصب شد → فوراً pin به 6.19.3 (هم‌نسخهٔ client)؛ کشف: client قبلاً 6.19.2 بود و با CLI 6.19.3 قاطی → پین دقیق prisma/client به 6.19.3 + regenerate
- src/lib/db.ts دوزبانه: TURSO_DATABASE_URL ست → PrismaLibSQL adapter؛ وگرنه SQLite لوکال (dev/prerender) — fail-fast اگر توکن نصفه باشد؛ تایپ‌چک و لینت سبز
- بکاپ: backups/custom.db.pre-turso-20260904-235329 (2.7MB) + backups/ به .gitignore
- scripts/migrate-to-turso.ts (idempotent، گارد --yes، حفظ cuid، verify شمارش دوجهته):
  - دو باگ حین توسعه: (۱) include+select روی m-n ضمنی → خواندن raw جدول _CategoryToPost (A/B)؛ (۲) PostTag صریح بدون id → tags:{create:[{tagId}]} نه connect
  - نتیجه: 5 setting / 21 category / 32 tag / 83 post / 17 comment / 9 service / 5 project / 1 contact / 4 session / 7 message / 473 kbChunk ✅ تطابق کامل
- E2E لوکال با env تورسو: / 200، /api/site 200 با دادهٔ واقعی، /api/posts 200 (۱۲ پست، عنوان فارسی درست)
- نکتهٔ سندباکس: پروسهٔ پس‌زمینه بین فراخوانی‌ها کشته می‌شود → تست‌ها در یک فراخوانی واحد (setsid + poll + curl + pkill)
- build v4 اول: آرتیفکت بدون @prisma/adapter-libsql و @libsql/* (NFT باندل کرده بود) → next.config.ts serverExternalPackages → rebuild: adapter(5)+client/core/hrana/isomorphic+native x64-gnu&musl(2)+هر دو موتور(2) ✅
- E2E آرتیفکت v4 (استخراج تمیز + node server.js با env تورسو): / 200 (10ms) | /api/site 200 دادهٔ واقعی (1.8s از سندباکس تا بمبئی) | /api/posts 200 (۱۲ پست، 1.2s) | admin رمز غلط 401 | robots 200 | 404 ✓
- docs/CPANEL_DEPLOYMENT.md: §3 env تورسو، §4 بدون production.db، §6 بازنویسی Turso، §8/§9 بکاپ/rollback، §12 سه سطر troubleshooting جدید
- payload ریپوی دیپلوی آماده: dist/repo-payload/ → artifact.part.00/01 + SHA256SUMS.repo (full: 514245666f070883…) — پوش منتظر توکن تازهٔ گیت‌هاب (push credential در سندباکس موجود نیست)
- commit 8فایلی (db.ts, next.config.ts, migrate script, docs, lockfiles)

Stage Summary:
- معماری جدید پروداکشن: اپ (Next standalone/Passenger) روی میزبان‌فا + DB روی Turso Mumbai رایگان — سبک‌ترین حالت ممکن برای LVE (بدون موتور Prisma، بدون فایل DB روی هاست)
- دیتابیس ابری پر و آماده؛ آرتیفکت v4 ممیزی‌شده و E2E-پس؛ مانده: push به ریپوی دیپلوی با توکن تازه + دیپلوی کاربر + ست env در cPanel + تست از ایران
- یادآوری امنیتی: API token اکانت تورسو در چت لو رفته → بعد از ست شدن env در cPanel باید rotate شود

---
Task ID: hardening-25
Agent: Z.ai Code (main)
Task: رفع باقی‌ماندهٔ مشکلات مهم اعلام‌شده — کوکی سشن ادمین، CSP، .env.example و بستن شکاف‌های امنیتی نرم

Work Log:
- شناسایی موارد باز از جلسات قبل: (۱) سشن ادمین (پسورد خام در هدر x-admin-key روی هر درخواست)، (۲) CSP ناموجود، (۳) .env.example ارجاع‌شده ولی ناموجود، (۴) rotate توکن API تورسو (مسدود — توکن فقط در شل جلسهٔ قبل بود و از سندباکس پاک شده؛ برای کاربر ثبت شد)
- src/lib/admin-session.ts: توکن سشن بی‌حالت HMAC-SHA256 («expiry.signature»، کلید مشتق از ADMIN_PASSWORD) — بدون جدول DB (سازگار با Turso بدون مهاجرت اسکیما)؛ تغییر پسورد = باطل‌شدن فوری همهٔ سشن‌ها
- src/lib/admin.ts: checkAdmin حالا کوکی سشن را verify می‌کند + گارد CSRF (رد ۴۰۳ برای mutation با Origin متفاوت؛ احترام به x-forwarded-host پشت پروکسی cPanel)
- api/admin/auth: POST=لاگین (ست کوچ HttpOnly/SameSite=Strict/Secure در پروداکشن/12h)؛ GET=بازیابی سشن؛ DELETE=خروج
- AdminView: حذف کامل هدر پسورد از ~۲۰ fetch؛ پسورد بعد از لاگین از حافظه پاک؛ سشن بعد از reload برمی‌گردد؛ دکمهٔ Logout واقعاً سمت سرور هم پاک می‌کند
- next.config.ts: CSP سخت (default-src 'self'، اسکریپت/استایل/فریم/فرم خارجی بلاک، object-src none، frame-ancestors none) — unsafe-inline برای اسکریپت لازم است چون صفحات prerendered بدون nonce هستند (nonce کل سایت را dynamic می‌کرد و هاست ضعیف نمی‌کشد)؛ unsafe-eval فقط dev (باگ کشف‌شده در تست: React dev به eval نیاز دارد)
- .env.example ساخته شد (با git add -f چون الگوی .env* در gitignore است؛ گارد بهداشتی آرتیفکت هم آن را exclude می‌کند — سازگار)
- تست curl یازده‌مرحله‌ای: پسورد غلط 401 / لاگین 200 + فلگ‌های کوچی / بازیابی 200 / بدون کوچی 401 / با کوچی 200 / Origin جعلی 403 / همسان 200 / خروج کوچی را منقضی می‌کند / توکن جعلی 401 / هدر CSP حاضر
- E2E مرورگر (agent-browser): لاگین → داشبورد با دادهٔ واقعی (۸۳ پست، ۴۷۴ chunk، پیام‌ها) → reload سشن می‌ماند → تب Posts ۸۳ ردیف → Logout → فرم لاگین → چت عمومی با CSP پاسخ AI داد؛ موبایل/دسکتاپ بدون overflow-X؛ صفر CSP violation پس از فیکس dev-eval
- داکیومنت: SECURITY.md §2 (مدل سشن) و §5 (هاردنینگ+هدرها) بازنویسی، CPANEL_DEPLOYMENT.md (الزام NODE_ENV=production برای کوچی Secure + ۲ سطر troubleshooting جدید)، CHANGELOG
- تایپ‌چک و لینت سبز؛ commit ff57761 (۹ فایل، +298/−94)

Stage Summary:
- هر دو قلم عمداً باقی‌ماندهٔ گزارش کارشناس (CSP nonce/CSP و session cookie) بسته شد — با طراحی بی‌حالت که به هیچ تغییر اسکیمای DB نیاز ندارد و مسیر Turso را مسدود نمی‌کند
- رفتار ادمین بهتر شد: سشن ۱۲ ساعته با بازیابی خودکار، خروج واقعی، CSRF-gارد، و پسورد دیگر روی هر درخواست سفر نمی‌کند
- برای دیپلوی v5 بعدی: build آرتیفکت جدید لازم است (فقط وقتی کاربر خواست دیپلوی کند)؛ به‌جز این، مانده: rotate توکن API تورسو (نیاز به لاگین کاربر در app.turso.tech — پسورد DB اپ جدا و سالم است)، push payload دیپلوی با توکن گیت‌هاب تازه، و تست نهایی از ایران بعد از دیپلوی

---
Task ID: pentest-26
Agent: Z.ai Code (main)
Task: راند جدید تست نفوذ امنیتی + مستندسازی + آماده‌سازی پوش به گیت‌هاب

Work Log:
- شناسایی سطح حمله: بررسی raw SQL (صفر)، رندر کلاینت (چت/کامنت متن ساده React — امن)، sanitize دو-لایه پست‌ها، validation طول ورودی‌ها، روت‌های فایل (ai/image مسیر تولیدشده ثابت — بدون traversal)
- ۴ ضعف در فاز recon پیدا و فیکس شد:
  ۱) clientIp اولین XFF را می‌گرفت → چرخش IP جعلی = دورزدن همهٔ rate limit → حالا آخرین entry (که پروکسی cPanel اضافه می‌کند)
  ۲) Logout توکن stateless را باطل نمی‌کرد → revocation درون-حافظه‌ای اضافه شد (DELETE توکن را revoke می‌کند؛ verify رد می‌کند)
  ۳) پاسخ‌های /api/admin/* بدون Cache-Control → no-store در next.config
  ۴) بدون محدودیت سایز بدنه → 413 گارد (لاگین ۸KB، چت/تماس/کامنت ۳۲KB)
- scripts/pentest-local.sh: هارنس تست نفوذ خودکار ۵۵ چک (auth/session forgery با توکن امضاشده با کلید مهاجم/منقضی/دستکاری‌شده، CSRF/Origin، rate limit، DoS bodies، SQLi در slug، XSS ذخیره‌شونده با پاکسازی خودکار، هدرها، اسکن سکرت در باندل کلاینت، open-redirect) با exit code
- اجرای نهایی: ۵۵/۵۵ PASS — سه «FAIL» میانی همگی باگ خود تست بودند (kb 405، slug ناموجود، الگوی quoted در bash case) نه اپ
- docs/PENTEST_2026-09-05.md: گزارش کامل (روش‌شناسی، یافته‌ها، جدول ۵۵ چک، ۳ لایه دفاع XSS، ریسک‌های باقی‌مانده و trust model)
- SECURITY.md §5 + CHANGELOG به‌روزرسانی؛ lint و typecheck سبز؛ commit 1e2aa00
- تلاش push: بدون credential (انتظار داشتیم) — push مسدود به توکن گیت‌هاب تازه؛ ۳ کامیت محلی (turso migration، hardening، pentest) آمادهٔ پوش

Stage Summary:
- وضعیت امنیتی: ۵۵ چک نفوذ سبز؛ ۴ ضعف واقعی بسته شد (یکی Medium: bypass rate limit با XFF)
- هارنس تست نفوذ دائمی شد — بعد از هر تغییر auth/API باید اجرا شود
- مانده برای کاربر: پوش ۳ کامیت با توکن تازه (یا اجرای دستور push خودش)، بیلد آرتیفکت v5 و دیپلوی

---
Task ID: pentest-round2-27
Agent: Z.ai Code (main)
Task: راند دوم تست نفوذ عمیق‌تر (به درخواست کاربر) + مستندسازی + push به گیت‌هاب (توکن از کاربر دریافت شد)

Work Log:
- طراحی بردارهای جدید فراتر از راند ۱: fuzzing ۱۳ شکلی توکن سشن، shadowing کوکی تکراری، استقلال سشن‌ها، verb tampering و ترفندهای مسیر در همهٔ routeهای ادمین (شامل endpoints هزینه‌دار AI)، ماتریس جعل Origin (پسوند/مسیر/userinfo/null/ترکیب XFH)، parser abuse (form-encoded/multipart/prototype-pollution/JSON تودرتو/چند-کلیدی)، تزریق operator/عددی در query پست‌ها، سیل XFF-rotating روی هر ۴ endpoint نوشتن عمومی، XSS ذخیره‌شوندهٔ encode شده (unicode/SVG/javascript:/data:)، مسیرهای افشای اطلاعات، و مسموم‌سازی Host header
- ۵ یافتهٔ جدید (۴ از بازبینی کد + ۱ زنده حین تست):
  ۱) Medium: originAllowed به X-Forwarded-Host کنترل‌شده توسط کلاینت اعتماد می‌کرد → ترکیب Origin+XFH گارد CSRF را رد می‌کرد → حالا فقط Host لنگر است؛ SITE_ORIGIN اختیاری = allow-list سخت
  ۲) Low-Medium: route لاگین اصلاً چک Origin نداشت (login-CSRF) → originAllowed روی POST /api/admin/auth هم اعمال شد
  ۳) Low-Medium: ریدایرکت‌های 301 از req.nextUrl.origin ساخته می‌شدند → Host جعلی ریدایرکت off-site می‌داد → لنگر به SITE_ORIGIN
  ۴) Low: /api/posts?page=abc → NaN به Prisma skip/take → 500 → فالبک `|| default`
  ۵) Low (زنده حین رگرسیون کشف شد): دو لاگین در یک ثانیه توکن بایت‌به-بایت یکسان می‌ساختند → logout یکی، همهٔ سشن‌های همان ثانیه را می‌کشت → توکن حالا <expiry>.<nonce 96bit>.<sig>
- علاوه بر یافته‌ها: DELETE /api/chat هم rate limit گرفت (10/min)
- scripts/pentest-round2.sh: هارنس ۸۲ چک جدید با پاکسازی خودکار رکوردهای تست
- اجرا با seed یک پست موقت در DB خالی لوکال (تا مسیرهای XSS نوشتن واقعاً اجرا شوند) و حذفش بعد از تست — نتیجه نهایی: راند ۲ = ۸۲/۸۲، رگرسیون راند ۱ = ۵۲/۵۲ (مجموع ۱۳۴/۱۳۴)
- اسناد: docs/PENTEST_2026-09-05-round2.md (روش‌شناسی، جدول یافته‌ها/فیکس‌ها، نتایج کامل)، SECURITY.md §5، CHANGELOG، CPANEL_DEPLOYMENT.md (SITE_ORIGIN به چک‌لیست env اضافه شد)، .env.example (SITE_ORIGIN مستند شد)
- tsc تمیز، lint 0 error؛ آمادهٔ commit و push به github.com/goolro/mehrdad-website با توکن کاربر

Stage Summary:
- وضعیت امنیتی: ۱۳۴ چک نفوذ (دو راند) همگی سبز؛ ۹ ضعف تجمعی بسته شده (راند ۱: ۴، راند ۲: ۵)
- اکشن جدید برای کاربر در cPanel: اضافه‌کردن SITE_ORIGIN=https://mehrdad.ir به env vars (allow-list CSRF سخت + ریدایرکت‌های ضد-مسمومیت)
- یادآوری امنیتی به کاربر: ADMIN_PASSWORD و توکن گیت‌هاب در چت دیده شده‌اند — بعد از push باید rotate شوند

---
Task ID: review-fixes-28
Agent: Z.ai Code (main)
Task: اجرای کامل لیست بازبینی خارجی (TASKS — Security, Architecture & Positioning Fixes) با نظر کارشناسی: P0 تطبیق staging/برندینگ، P1 مسیرهای واقعی + بهداشت وابستگی‌ها + تنظیمات گیت‌هاب، P2 توتوپ 2FA + CSP nonce + CI، سپس وریفای و پوش

Work Log:
- راستی‌آزمایی ادعاهای ریویو: staging == main (b500684)، ادعای «کپی قدیمی روی استیجینگ» رد شد؛ رشته‌های positioning قدیمی فقط در کد بودند (i18n projectsSub/seeking، بلاک آمار HomeView، BIZPAL در keywords، پرسونای AI) — همه اصلاح شد
- P1-3 مسیرهای واقعی: src/lib/queries.ts (لایه داده مشترک API+صفحات)؛ SiteChrome (پوسته مشترک + bridge ناوبری + ارتقای هش‌های قدیمی)؛ store.ts با VIEW_PATH و ناوبری App Router؛ صفحات /blog، /blog/[slug]، /work، /work/[slug]، /services، /fde، /about، /contact، /admin، /lab (308→/fde)، not-found؛ صفحات سرور-فد (HomeView/BlogView/PostDetail/ProjectsView/ServicesView با props) — محتوا در HTML اولیه؛ generateMetadata و canonical برای همه؛ skipHydration برای هیدریشن بدون mismatch
- middleware → src/proxy.ts (کانوکشن Next 16)؛ گارد مسیرهای واقعی (exact + subtree blog/work)؛ تبدیل اهداف /#blog/<slug> به /blog/<slug>؛ فیکس 404 شدن /services/* قدیمی؛ CSP nonce درخواستی (prod: بدون unsafe-inline/unsafe-eval)
- next.config: حذف CSP استاتیک (تجمیع دو CSP می‌شکست)؛ سایر هدرها سر جایشان
- sitemap.ts داینامیک DB-درایو (20 URL در seed) + robots.txt Sitemap line + /feed.xml RSS — README قبلا ادعای اینها را داشت ولی وجود نداشتند
- P1-4: نام پکیج mehrdad-website، پین دقیق z-ai-web-dev-sdk 0.0.18 و otpauth 9.5.2، حذف next-auth و next-intl (بلااستفاده — با grep تأیید)، سینک هر دو lockfile (D-024: هر دو عمداً نگه داشته می‌شوند — dev=bun، بیلد آرتیفکت/CI=npm ci)
- P2-6 TOTP: src/lib/admin-totp.ts با otpauth؛ گیت دومرحله‌ای در POST auth (401 totp_required)؛ فلگ totpRequired در GET؛ فیلد کد در AdminView (autoComplete=one-time-code)؛ scripts/generate-totp-secret.ts؛ E2E واقعی با secret تولیدشده: رمز بدون کد=401، کد غلط=401، کد درست=200+کوکی، stats=200 (D-025)
- P2-8/P1-5: .github/workflows/ci.yml (npm ci→lint→tsc→build با env dummy) + dependabot.yml؛ تنظیمات گیت‌هاب با API فعال شد: secret_scanning ✓ push_protection ✓ dependabot alerts ✓ security updates ✓
- وریفای: lint 0، tsc 0؛ پنتست راند1 = 50/50 و راند2 = 82/82 (انتظارات CSP هارنس به مسیرهای document منتقل شد — CSP روی API عمداً نیست)؛ بیلد پروداکشن ایزوله در /tmp/prodcheck با npm ci و env dummy (شبیه‌سازی CI) موفق — همه مسیرها ƒ Dynamic؛ سرور پروداکشن روی 3100: CSP دقیقاً nonce+strict-dynamic بدون unsafe-inline، مقاله در HTML کامل، auth 401/200، ریدایرکت 301، sitemap/feed/404 همه سبز
- مرورگر E2E (dev 3000): هیرو و کارت‌ها SSR، ناوبری واقعی /blog↔/blog/<slug>↔/work/bizpal، فیلتر دسته و جستجو، کامنت‌سکشن، هش قدیمی /#blog/x → خودکار /blog/x، ادمین لاگین→داشبورد، FA→rtl/fa، موبایل 390px بدون overflow؛ فیکس هیدریشن nonce boot script با suppressHydrationWarning؛ کنسول پس از ۳ ناوبری پیوسته صفر؛ مرورگر روی پروداکشن 3100: هیدریشن و ناوبری زیر CSP سخت سالم
- مستندات: README (status 2026-09-05، ساختار واقعی، معماری)، CHANGELOG، DECISIONS D-022..D-025، SECURITY (§2 session+TOTP، §5 CSP nonce، لاگ رخداد توکن)، SEO.md بازنویسی صادقانه + برنامه Lighthouse/Serach Console مالک، CPANEL_DEPLOYMENT (ADMIN_TOTP_SECRET)
- commit a37480b → push موفق b500684..a37480b به origin/main

Stage Summary:
- هر ۸ بند لیست بازبینی اجرا یا مستند شد؛ معیار پذیرش P1-3 پاس شد (curl بدون JS → HTML کامل مقاله)
- CSP پروداکشن دیگر unsafe-inline اسکریپت ندارد (تأییدشده با بیلد و مرورگر واقعی)؛ استثناهای باقی‌مانده (style-src attr، dev eval) مستند شدند
- IP allowlist به نفع TOTP رد شد (IP داینامیک مالک)؛ TOTP اختیاری و fail-closed است — فعال‌سازی با یک env var
- تنظیمات امنیتی گیت‌هاب همگی فعال؛ CI روی push اجرا می‌شود
- توکن گیت‌هاب همچنان معتبر است و مالک rotate را رد کرده — در لاگ رخداد SECURITY.md ثبت و یادآوری باز ماند
- آرتیفکت v5 باید از این کامیت بازسازی شود (مسیریابی و CSP عوض شده) — منتظر جواب تیکت میزبان‌فا

---
Task ID: review-fixes-28-b (addendum)
Agent: Z.ai Code (main)
Task: رساندن CI به سبز + بستن ۶ هشدار Dependabot

Work Log:
- اولین ران push روی main شکست خورد: NODE_ENV=production در سطح job باعث می‌شد npm ci وابستگی‌های dev را نصب نکند (eslint: not found) → حذف NODE_ENV از job env + npm ci --include=dev
- ران دوم خطای واقعی lint آشکار کرد: سه خطای set-state-in-effect در ChatWidget/carousel/use-mobile — سندباکس (bun) نسخهٔ تودرتوی 7.0.1 پلاگین را لود می‌کرد ولی npm ci در CI نسخهٔ 7.1.1 (hoisted) → ریشه: دو نسخهٔ موازی eslint-plugin-react-hooks → overrides پین 7.1.1 در هر دو اکوسیستم + کامنت‌های disable مستند سه reset عمدی بازگردانی شد
- ۶ هشدار Dependabot (۴ high) بررسی شد: @mdxeditor/editor و react-syntax-highlighter و uuid کاملاً بلااستفاده بودند (dead deps استارتر) → حذف (prismjs و deepmerge-ts و js-yaml پین‌شدهٔ mdxeditor از درخت حذف شدند)؛ sharp 0.34.3→0.35.0 (GHSA-f88m)؛ deepmerge-ts با override به 8.0.2 (prisma generate/db:push تست شد)؛ js-yaml فقط نسخهٔ dev-only 4.3.2 باقی ماند
- نتیجه: open alerts: 0 | CI روی 6d06f27 سه‌بار success | سه PR بسته‌شدهٔ Dependabot خودکار

Stage Summary:
- درخت وابستگی هم سبک‌تر و هم بدون آسیب‌پذیری ثبت‌شده است؛ lint و tsc در سندباکس و CI یک‌رفتار شدند
- درس ثبت‌شده: eslint --fix سندباکس را بدون مقایسه با CI کامیت نکن (rule-activation drift بین نسخه‌های پلاگین)
