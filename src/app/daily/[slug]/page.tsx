import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { DailyArticleDetail } from '@/components/site/ArticleDetail';
import { importContentSeed } from '@/lib/seed-import';
import { JsonLd } from '@/components/site/JsonLd';
import { sanitizePostHtml } from '@/lib/sanitize';

// Fully static: rendered once per BUILD (same contract as /work/[slug]).
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel. Unknown slugs between deploys still render on demand
// (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

function tagsOf(v: string | null): string[] {
  try {
    const arr = JSON.parse(v || '[]');
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string' && t.trim()) : [];
  } catch {
    return [];
  }
}

/** table-missing (first deploy window) degrades to null; a real DB outage throws */
async function safeFindArticle(slug: string) {
  try {
    return await db.dailyArticle.findUnique({ where: { slug } });
  } catch (err) {
    const missing = err instanceof Error && /does not exist/i.test(err.message);
    if (missing) return null;
    throw err; // real outage → keep the previous deployment (eb906e3 policy)
  }
}

// prerender all article pages at build; [] → render on demand at runtime.
// The seed import runs here too (idempotent) so seeded articles are always
// present before the pages read the DB, whichever route prerenders first.
export async function generateStaticParams() {
  await importContentSeed();
  try {
    const rows = await db.dailyArticle.findMany({
      where: { published: true },
      select: { slug: true },
      take: 200,
    });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await safeFindArticle(slug);
  if (!a || !a.published) return { title: 'Article not found | Mehrdad' };
  const tagsEn = tagsOf(a.tagsEn);
  return {
    title: `${a.titleEn} | Mehrdad — Daily Product Analysis`,
    description: a.summaryEn,
    keywords: tagsEn,
    alternates: {
      canonical: `/daily/${a.slug}`,
      languages: {
        en: `/daily/${a.slug}`,
        fa: `/daily/${a.slug}?lang=fa`,
        'x-default': `/daily/${a.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title: a.titleEn,
      description: a.summaryEn,
      url: `/daily/${a.slug}`,
      publishedTime: `${a.day}T00:00:00+03:30`,
      tags: tagsEn,
    },
  };
}

export default async function DailyArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = await safeFindArticle(slug);
  if (!a || !a.published) notFound();

  // newest published others — same-day items naturally float up
  let relatedRows: { slug: string; day: string; titleEn: string; titleFa: string }[] = [];
  try {
    relatedRows = await db.dailyArticle.findMany({
      where: { published: true, slug: { not: a.slug } },
      orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
      select: { slug: true, day: true, titleEn: true, titleFa: true },
      take: 3,
    });
  } catch {
    relatedRows = []; // related is a nice-to-have — never fail the page for it
  }

  const tagsEn = tagsOf(a.tagsEn);
  const tagsFa = tagsOf(a.tagsFa);

  // defense in depth: bodies were sanitized on save — sanitize again on read
  const article = {
    slug: a.slug,
    day: a.day,
    titleEn: a.titleEn,
    titleFa: a.titleFa,
    summaryEn: a.summaryEn,
    summaryFa: a.summaryFa,
    bodyEn: sanitizePostHtml(a.bodyEn),
    bodyFa: sanitizePostHtml(a.bodyFa),
    verdictEn: sanitizePostHtml(a.verdictEn),
    verdictFa: sanitizePostHtml(a.verdictFa),
    tagsEn,
    tagsFa,
  };

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.titleEn,
          alternativeHeadline: a.titleFa,
          description: a.summaryEn,
          datePublished: a.day,
          dateModified: a.updatedAt.toISOString(),
          inLanguage: ['en', 'fa'],
          keywords: tagsEn.join(', '),
          author: { '@type': 'Person', name: 'Mehrdad', url: `${BASE}/about` },
          publisher: { '@type': 'Person', name: 'Mehrdad', url: BASE },
          mainEntityOfPage: `${BASE}/daily/${a.slug}`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
            { '@type': 'ListItem', position: 2, name: 'Daily', item: `${BASE}/daily` },
            { '@type': 'ListItem', position: 3, name: a.titleEn, item: `${BASE}/daily/${a.slug}` },
          ],
        }}
      />
      <DailyArticleDetail article={article} related={relatedRows} />
    </>
  );
}
