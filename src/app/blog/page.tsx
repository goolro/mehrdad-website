import type { Metadata } from 'next';
import { BlogView } from '@/components/site/BlogView';
import { listPosts } from '@/lib/queries';
import { db } from '@/lib/db';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Blog & Insights | Mehrdad — Product Builder',
  description: 'Articles on startups, smart cities, AI, investment and inventions — from real work, with honest lessons.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  // server-rendered first page + filter data → real content in the
  // initial HTML (crawlers and no-JS visitors see the article cards)
  const [firstPage, categories, tags] = await Promise.all([
    listPosts({ page: 1, perPage: 12 }).catch(() => ({ posts: [], totalPages: 0 })),
    db.category
      .findMany({
        where: { posts: { some: {} } },
        orderBy: { nameEn: 'asc' },
        include: { _count: { select: { posts: true } } },
      })
      .catch(() => []),
    db.tag
      .findMany({
        where: { posts: { some: { post: { published: true } } } },
        orderBy: { nameEn: 'asc' },
        include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
      })
      .catch(() => []),
  ]);

  return (
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
      }}
    />
  );
}
