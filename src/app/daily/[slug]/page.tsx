import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { DailyArticleDetail } from '@/components/site/ArticleDetail';
import { importContentSeed } from '@/lib/seed-import';
import { JsonLd } from '@/components/site/JsonLd';
import { sanitizePostHtml } from '@/lib/sanitize';
import { dailyVisibleWhere, isArticleLive } from '@/lib/daily';

// ISR (staggered publishing): the page re-renders every 15 minutes, so an
// article scheduled with publishAt becomes reachable right after its slot
// without a redeploy. Until then it 404s (isArticleLive gate below).
// Unknown slugs still render on demand (dynamicParams) and get cached.
export const revalidate = 900;

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
      where: dailyVisibleWhere(), // scheduled-future slugs render on demand AFTER their slot
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
  if (!a || !isArticleLive(a)) return { title: { absolute: 'Article not found | Mehrdad' } };
  const tagsEn = tagsOf(a.tagsEn);
  return {
    title: { absolute: `${a.titleEn} | Mehrdad — Daily Analysis` },
    description: a.summaryEn,
    keywords: tagsEn,
    alternates: {
      types: { "application/rss+xml": "/feed.xml" },
      canonical: `/daily/${a.slug}`,
      languages: {
        en: `/daily/${a.slug}`,
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
  if (!a || !isArticleLive(a)) notFound(); // scheduled-future → 404 until the slot

  // INTERNAL LINKING: related picks topically-similar articles first (shared
  // tags + the same daily lane) so crawler-visible links connect same-topic
  // pages — not just the three newest rows. Ties and no-overlap fall back to
  // newest-first.
  let relatedRows: { slug: string; day: string; titleEn: string; titleFa: string }[] = [];
  try {
    const myTags = new Set(tagsOf(a.tagsEn));
    const pool = await db.dailyArticle.findMany({
      where: { ...dailyVisibleWhere(), slug: { not: a.slug } },
      orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
      select: { slug: true, day: true, titleEn: true, titleFa: true, tagsEn: true, category: true },
      take: 25,
    });
    relatedRows = pool
      .map((r) => {
        const shared = tagsOf(r.tagsEn).filter((t) => myTags.has(t)).length;
        const sameLane = r.category === a.category ? 1 : 0; // same daily lane ranks higher
        return { ...r, score: shared * 2 + sameLane };
      })
      .sort((x, y) => y.score - x.score || y.day.localeCompare(x.day))
      .slice(0, 3)
      .map(({ slug: s, day, titleEn, titleFa }) => ({ slug: s, day, titleEn, titleFa }));
  } catch {
    relatedRows = []; // related is a nice-to-have — never fail the page for it
  }

  const tagsEn = tagsOf(a.tagsEn);
  const tagsFa = tagsOf(a.tagsFa);
  const sectionLabels: Record<string, string> = { product: 'Products', ai: 'AI', startup: 'Startups' };

  // defense in depth: bodies were sanitized on save — sanitize again on read
  const article = {
    slug: a.slug,
    day: a.day,
    category: a.category,
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
          articleSection: sectionLabels[a.category] || 'Products',
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
