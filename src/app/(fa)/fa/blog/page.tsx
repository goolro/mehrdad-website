import type { Metadata } from 'next';
import { BlogView } from '@/components/site/BlogView';
import { JsonLd } from '@/components/site/JsonLd';
import { listPosts, hiddenPostSlugsForPrisma } from '@/lib/queries';
import { db } from '@/lib/db';

// Persian twin of src/app/(site)/blog/page.tsx (audit section 2, fix #1 —
// the fa tree): identical data contract so the first page of article cards
// (Persian titles where they exist) is in the initial HTML, Persian
// metadata, Blog schema anchored to /fa/blog. Article DETAIL pages have no
// Persian twins yet — cards still open the EN article pages.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'بلاگ و بینش‌ها | مهرداد — سازنده مستقل محصول' },
  description:
    'مقالاتی درباره استارتاپ، شهر هوشمند، هوش مصنوعی، سرمایه‌گذاری و اختراعات — از کار واقعی، با درس‌های صادقانه.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/blog',
    languages: { en: '/blog', fa: '/fa/blog', 'x-default': '/blog' },
  },
  openGraph: {
    title: 'بلاگ و بینش‌ها — مهرداد',
    description:
      'مقالاتی درباره استارتاپ، شهر هوشمند، هوش مصنوعی، سرمایه‌گذاری و اختراعات — از کار واقعی، با درس‌های صادقانه.',
    url: '/fa/blog',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بلاگ و بینش‌ها — مهرداد',
    description:
      'مقالاتی درباره استارتاپ، شهر هوشمند، هوش مصنوعی، سرمایه‌گذاری و اختراعات — از کار واقعی، با درس‌های صادقانه.',
  },
};

export default async function FaBlogPage() {
  // identical queries to the EN blog index — one source of truth for what
  // appears on the listing in both languages
  const [firstPage, categories, tags, archive] = await Promise.all([
    listPosts({ page: 1, perPage: 12 }),
    db.category.findMany({
      where: { posts: { some: { published: true } } },
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { posts: { where: { published: true } } } } },
    }),
    db.tag.findMany({
      where: { posts: { some: { post: { published: true } } } },
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
    }),
    db.post.findMany({
      where: { published: true, slug: { notIn: hiddenPostSlugsForPrisma() } },
      select: { slug: true, titleEn: true, titleFa: true, date: true },
      orderBy: { date: 'desc' },
    }),
  ]);

  // Blog schema mirroring the EN one, anchored to /fa/blog; the listed posts
  // are the real (EN) article URLs — headline uses the EN title to match the
  // URL language (titleFa is shown in the visible cards via the dictionary).
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${base}/fa/blog#blog-fa`,
    url: `${base}/fa/blog`,
    name: 'بلاگ و بینش‌ها — مهرداد',
    description:
      'مقالاتی درباره استارتاپ، شهر هوشمند، هوش مصنوعی، سرمایه‌گذاری و اختراعات — از کار واقعی، با درس‌های صادقانه.',
    inLanguage: ['fa', 'en'],
    publisher: { '@id': `${base}/#person` },
    blogPost: archive.slice(0, 30).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.titleEn || p.titleFa || p.slug,
      url: `${base}/blog/${p.slug}`,
      datePublished: typeof p.date === 'string' ? p.date : new Date(p.date).toISOString(),
      inLanguage: p.titleEn ? 'en' : 'fa',
      author: { '@id': `${base}/#person` },
    })),
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <BlogView
        initial={{
          posts: firstPage.posts,
          totalPages: firstPage.totalPages,
          cats: categories.map((c) => ({
            id: c.id, slug: c.slug, nameEn: c.nameEn, nameFa: c.nameFa, count: c._count.posts,
          })),
          tags: tags.map((tg) => ({
            id: tg.id, slug: tg.slug, nameEn: tg.nameEn, nameFa: tg.nameFa, count: tg._count.posts,
          })),
          archive: archive.map((p) => ({
            slug: p.slug, titleEn: p.titleEn, titleFa: p.titleFa, date: p.date,
          })),
        }}
      />
    </>
  );
}
