import type { Metadata } from 'next';
import { BlogView } from '@/components/site/BlogView';
import { JsonLd } from '@/components/site/JsonLd';
import { listPosts, hiddenPostSlugsForPrisma } from '@/lib/queries';
import { db } from '@/lib/db';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Blog & Insights | Mehrdad — Product Builder' },
  description: 'Articles on startups, smart cities, AI, investment and inventions — from real work, with honest lessons.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/blog',
    // hreflang triple (audit §2 #1): the Persian twin /fa/blog exists
    languages: { en: '/blog', fa: '/fa/blog', 'x-default': '/blog' },
  },
};

export default async function BlogPage() {
  // server-rendered first page + filter data → real content in the
  // initial HTML (crawlers and no-JS visitors see the article cards)
  // fail-loud at build time (see page.tsx) — never bake empty pages
  const [firstPage, categories, tags, archive] = await Promise.all([
    listPosts({ page: 1, perPage: 12 }),
    db.category.findMany({
      // phase-2 SEO fix: PUBLISHED posts only (see /api/site route) — a
      // category holding only drafts must not render as a filter chip.
      where: { posts: { some: { published: true } } },
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { posts: { where: { published: true } } } } },
    }),
    db.tag.findMany({
      where: { posts: { some: { post: { published: true } } } },
      orderBy: { nameEn: 'asc' },
      include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
    }),
    // crawlable full archive: every published post as a real <a> in the
    // initial HTML — JS-only pagination leaves ~85% of posts discoverable
    // through the sitemap alone ("Discovered — currently not indexed")
    // kill-switch posts are excluded here too — their pages 404 by design,
    // so their links must never appear in the archive (owner rule 2026-01,
    // archive leak spotted 2026-10-01)
    db.post.findMany({
      where: { published: true, slug: { notIn: hiddenPostSlugsForPrisma() } },
      select: { slug: true, titleEn: true, titleFa: true, date: true },
      orderBy: { date: 'desc' },
    }),
  ]);

  // Blog schema (phase-2 SEO gap): identifies the index as the site's blog
  // entity so article cards under it inherit a clean parent; publisher
  // references the Person @id declared in the home-page JSON-LD graph.
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${base}/blog#blog`,
    url: `${base}/blog`,
    name: 'Blog & Insights — Mehrdad',
    description:
      'Articles on startups, smart cities, AI, investment and inventions — from real work, with honest lessons.',
    inLanguage: ['en', 'fa'],
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
