#!/usr/bin/env python3
"""Consolidate all extracted content into a single migration-ready JSON"""
import json, re, html as htmlmod

with open('/home/z/my-project/analysis/wp_content.json') as f:
    data = json.load(f)
with open('/home/z/my-project/analysis/featured_media.json') as f:
    fmedia = json.load(f)
with open('/home/z/my-project/analysis/image_map.json') as f:
    img_map = json.load(f)

def map_img(url):
    if not url: return None
    return img_map.get(url)

# --- categories (only those used by posts) ---
used_cat_ids = set()
for p in data['posts']: used_cat_ids.update(p.get('categories', []))
cats = {}
for c in data['categories']:
    if c['id'] in used_cat_ids:
        cats[c['id']] = {
            'wp_id': c['id'], 'slug': c['slug'],
            'name_fa': htmlmod.unescape(c['name']), 'count': c['count']
        }

CAT_OVERRIDE = {
    'story': ('Story', 'داستان'), 'news': ('News', 'اخبار'),
    'active': ('Activity', 'فعالیت'), 'business': ('Business', 'کسب‌وکار'),
    'techno': ('Technology', 'تکنولوژی'), 'lifestyle': ('Lifestyle', 'سبک زندگی'),
    'health': ('Health', 'سلامت'),
}
for c in cats.values():
    slug = c['slug']
    un = __import__('urllib.parse', fromlist=['unquote']).unquote(slug)
    if slug in CAT_OVERRIDE:
        c['name_en'], c['name_fa'] = CAT_OVERRIDE[slug]
    else:
        # transliterate known fa->en
        FA2EN = {
            'آموزش': 'Learning', 'اختراع': 'Invention', 'استارتاپ-Startup': 'Startup',
            'پرسش و پاسخ': 'Q&A', 'روزانه': 'Daily', 'روزمره نویسی': 'Journal',
            'سرمایه گذاری': 'Investment', 'شهر هوشمند': 'Smart City', 'طراحی': 'Design',
            'کسب و کار': 'Business', 'گردشگری': 'Tourism', 'هوش مصنوعی': 'Artificial Intelligence',
            'هوشمند سازی': 'Smartification', 'سرگرمی': 'Entertainment',
        }
        c['name_en'] = FA2EN.get(un, un)

# --- posts ---
def clean_html(h):
    # rewrite image urls to local
    def repl(m):
        local = map_img(m.group(1))
        return f'src="{local}"' if local else ''
    h = re.sub(r'<img[^>]+src="([^"]+)"[^>]*>', repl, h)
    h = re.sub(r'<img[^>]+>', '', h)  # drop imgs without local mapping
    h = re.sub(r'\s(class|style)="[^"]*"', '', h)
    h = re.sub(r'</?(span|figure|figcaption|section|article|div)[^>]*>', '', h)
    return h.strip()

posts_out = []
for p in data['posts']:
    fm = p.get('featured_media', 0)
    cover = fmedia.get(str(fm), {}).get('url') if fm else None
    cover_local = map_img(cover) if cover else None
    pcat = [str(c) for c in p.get('categories', []) if str(c) in {str(k) for k in cats}]
    posts_out.append({
        'wp_id': p['id'], 'slug': p['slug'],
        'title_fa': htmlmod.unescape(p['title']['rendered']).strip(),
        'excerpt_fa': htmlmod.unescape(re.sub(r'<[^>]+>', ' ', p['excerpt']['rendered'])).strip()[:500],
        'content_fa_html': clean_html(p['content']['rendered']),
        'date': p['date'], 'modified': p['modified'],
        'cover': cover_local, 'categories': pcat,
    })

# sort newest first
posts_out.sort(key=lambda x: x['date'], reverse=True)

# --- services (from scraped pages) ---
services_out = [
    {'slug': 'startup', 'title_fa': 'استارتاپ', 'order': 1,
     'desc_fa': 'اگر استارتاپ دارید، دنبال استارتاپ حرفه‌ای هستید، می‌خواهید وارد تیم استارتاپی شوید یا حتی سرمایه‌گذار هستید، با ما در تماس باشید. از ایده تا اجرا و جذب سرمایه همراه شما هستیم.',
     'icon': 'Rocket'},
    {'slug': 'artificial-intelligence', 'title_fa': 'هوش مصنوعی', 'order': 2,
     'desc_fa': 'طراحی هوش مصنوعی اختصاصی برای کسب‌وکار شما؛ چتبات، اتوماسیون، تحلیل داده و دستیارهای هوشمند. برای دریافت مشاوره تماس بگیرید.',
     'icon': 'BrainCircuit'},
    {'slug': 'web-app-development', 'title_fa': 'توسعه وب + اپلیکیشن', 'order': 3,
     'desc_fa': 'توسعه وب و اپلیکیشن با آخرین تکنولوژی‌ها؛ کسب‌وکار خود را دوباره اختراع کنید. پیشگام در دنیای طراحی، اینترنت اشیا و ردیابی بلادرنگ، بلاک‌چین برای افزایش شفافیت، اتوماسیون انبار و رباتیک.',
     'icon': 'Code2'},
    {'slug': 'product-design', 'title_fa': 'طراحی محصول', 'order': 4,
     'desc_fa': 'طراحی محصولات صنعتی و طراحی UI/UX؛ از دریافت درخواست و بررسی تا اعلام پیشنهاد، قرارداد، انجام فرایند، تحویل و پشتیبانی.',
     'icon': 'PenTool'},
    {'slug': 'business-consulting', 'title_fa': 'مشاوره کسب‌وکار', 'order': 5,
     'desc_fa': 'مشاوره کسب‌وکارهای صنعتی، سنتی و دیجیتال؛ ثبت درخواست، بررسی و شروع مشاوره به‌صورت حضوری یا غیرحضوری.',
     'icon': 'Briefcase'},
    {'slug': 'digital-marketing', 'title_fa': 'دیجیتال مارکتینگ', 'order': 6,
     'desc_fa': 'طراحی و اجرای کمپین‌های دیجیتال مارکتینگ با داده و هوش مصنوعی؛ رشد قابل اندازه‌گیری برای برند شما.',
     'icon': 'Megaphone'},
    {'slug': 'traditional-sales-marketing', 'title_fa': 'فروش و بازاریابی سنتی', 'order': 7,
     'desc_fa': 'تجربه گسترده در فروش و بازاریابی بازار سنتی؛ توسعه شبکه فروش، مذاکره و مدیریت کانال‌های توزیع.',
     'icon': 'Store'},
    {'slug': 'invention-design-commercialization', 'title_fa': 'طراحی و تجاری‌سازی اختراع', 'order': 8,
     'desc_fa': 'اگر نیاز دارید روی اختراعات شما کار کنیم و طراحی آن‌ها را تکمیل و تجاری‌سازی کنیم، با ما در تماس باشید. همچنین می‌توانید روی اختراعات صنعتی‌شده یا در حال ساخت مجموعه ما سرمایه‌گذاری کنید.',
     'icon': 'Lightbulb'},
]

# --- projects (key initiatives from participation page + related posts) ---
projects_out = [
    {'slug': 'iran-rail-revolution', 'order': 1,
     'title_fa': 'طرح ایجاد انقلاب ریلی — کریدور حمل‌ونقل ریلی پیشرفته ایران',
     'summary_fa': 'ایران با موقعیت ژئوپلیتیک منحصربه‌فرد خود، پتانسیل تبدیل شدن به قطب حمل‌ونقل ریلی خاورمیانه و آسیای مرکزی را دارد. این طرح با رویکرد استارتاپی و گام‌های تدریجی، هدف ایجاد یک اکوسیستم کامل صنایع ریلی را دنبال می‌کند. فازهای دوم تا پنجم، ایران را از قطب ترانزیت اوراسیا به معمار شبکه ریلی منطقه تبدیل می‌کنند: از کریدورهای بین‌المللی و اتصال شهرهای کوچک تا صادرات فناوری ریلی به آفریقا، اروپا و آسیا.',
     'cover': '/media/فایل_تصویر.png'},
    {'slug': 'bizpal', 'order': 2,
     'title_fa': 'استارتاپ BIZPAL — فروش، بازاریابی و تبلیغات دیجیتال هوشمند',
     'summary_fa': 'BIZPAL دستیار تجاری مبتنی بر هوش مصنوعی است که پیش‌بینی فروش، اجرای کمپین‌های تبلیغاتی با بازگشت سرمایه بالا و بازاریابی شخصی‌سازی‌شده خودکار را انجام می‌دهد. مدل SaaS با اشتراک، بازار هدف ۲.۵ میلیون کسب‌وکار کوچک و متوسط، تست MVP موفق با ۳۷٪ رشد فروش و درخواست سرمایه ۳۰۰ هزار دلاری Pre-Seed.',
     'cover': None},
    {'slug': 'smart-waste-management', 'order': 3,
     'title_fa': 'استارتاپ تفکیک و جمع‌آوری نوین زباله در شهر هوشمند',
     'summary_fa': 'راهکار نوین تفکیک از مبدأ و جمع‌آوری هوشمند زباله برای شهرهای هوشمند؛ کاهش هزینه‌های شهرداری، افزایش بازیافت و خلق ارزش از پسماند با فناوری IoT.',
     'cover': None},
    {'slug': 'investment-management-platform', 'order': 4,
     'title_fa': 'پلتفرم مدیریت سرمایه و سرمایه‌گذاری',
     'summary_fa': 'ادغام همه ابزارهای سرمایه‌گذار در یک اکوسیستم واحد: معاملات، هوش مصنوعی، سیگنال، آموزش و سرمایه‌گذاری جمعی. بازار جهانی مدیریت سرمایه ۱.۷ تریلیون دلاری در ۲۰۲۶؛ در فاز طراحی، به دنبال شریک استراتژیک.',
     'cover': None},
    {'slug': 'kilika-fintech', 'order': 5,
     'title_fa': 'استارتاپ مالی بانکی کلیکا (KLIKA)',
     'summary_fa': 'استارتاپ مالی بانکی نسل جدید با رویکرد نئوبانک و خدمات مالی دیجیتال برای کاربران ایرانی.',
     'cover': None},
]

# --- contact/about info ---
site_out = {
    'site_name': 'Mehrdad — Designer & Researcher',
    'tagline_fa': 'طراح و پژوهشگر',
    'tagline_en': 'Designer & Researcher',
    'hero_fa': 'طراحی محصولات نرم‌افزاری و سخت‌افزاری + مشاوره و مجری فروش و بازریابی دیجیتال و بازار سنتی + طراح و مخترع محصولات نوآورانه',
    'hero_en': 'Software & hardware product design + digital and traditional sales & marketing consulting + designer and inventor of innovative products',
    'about_fa': 'در زمینه‌های پژوهشی و طراحی محصولات نوآورانه فعالیت دارم، در زمینه فروش و مارکتینگ و مدیریت نیز تجربه دارم.',
    'about_en': 'I work in research and innovative product design, and I also have experience in sales, marketing and management.',
    'email': 'admin@mehrdad.ir',
}

out = {
    'site': site_out,
    'categories': list(cats.values()),
    'posts': posts_out,
    'services': services_out,
    'projects': projects_out,
}
with open('/home/z/my-project/analysis/migration_data.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print('posts:', len(posts_out), '| cats:', len(cats), '| services:', len(services_out), '| projects:', len(projects_out))
print('posts with cover:', sum(1 for p in posts_out if p['cover']))
print('total fa chars:', sum(len(p['content_fa_html']) for p in posts_out))
