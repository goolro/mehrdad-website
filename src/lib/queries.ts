import { db } from '@/lib/db';
import { HIDDEN_POST_SLUGS, isHiddenPostSlug } from '@/lib/hidden-post-slugs';
import { ensureProjectKindColumn } from '@/lib/project-kind';
import { isProjectHidden, visibleProjects } from '@/lib/project-visibility';
import { slugCandidates } from '@/lib/slug-lookup';
import { sanitizePostHtml, sanitizeExcerpt } from '@/lib/sanitize';

/**
 * Server-side data layer shared by the API routes and the server-rendered
 * pages (real-routes SEO migration). Keeping one implementation guarantees
 * the API responses and the first-paint HTML never drift apart.
 */

/**
 * Content kill-switch (owner decision, 2026-01): these posts are hidden from
 * EVERY public surface — blog list, article page (404), sitemap, RSS feed,
 * llms.txt — while the underlying DB rows are KEPT (nothing is deleted).
 *   - iran-ousted-from-trade-corridors: geopolitical commentary, not
 *     product/build content — must not represent "what Mehrdad builds"
 *   - the two legacy WP posts render broken (raw src="/media/…" markup in
 *     the body) — unpublished until someone rewrites them properly.
 * To republish a rewritten post: remove its slug from
 * src/lib/hidden-post-slugs.ts (the SINGLE source of truth, also consumed
 * by src/proxy.ts so the posts' old WP URLs land on /blog instead of a 404
 * target) — or flip `published` on the row — and rebuild.
 */
const UNPUBLISHED_POST_SLUGS: readonly string[] = HIDDEN_POST_SLUGS;

/** Startup-pitch posts (BIZPAL / rail-corridor series): real history, so they
 * stay in the blog archive — but they are never surfaced in the homepage
 * Featured Articles preview (same fabricated-metric problem the homepage
 * cards had; owner decision 2026-01). */
export const NOT_IN_FEATURED_POST_SLUGS: string[] = [
  'bizpal-digital-sales-marketing-and-advertising-startup',
  'the-second-phases-of-the-iranian-revolutionary',
  'iran-railway-technology-startup',
];

// every comparable form (raw / decoded / percent-encoded both cases) of the
// hidden slugs — DB rows store the original WP form, route params arrive
// decoded, so matching must cover all shapes (same logic as slugCandidates)
const UNPUBLISHED_POST_SLUG_SET: ReadonlySet<string> = new Set(
  UNPUBLISHED_POST_SLUGS.flatMap((s) => slugCandidates(s))
);

export function isUnpublishedPostSlug(slug: string): boolean {
  return isHiddenPostSlug(slug);
}

/** All hidden (kill-switch) slugs in their Prisma-comparable forms — for
 * `slug: { notIn: … }` filters. The /blog page's crawlable archive query
 * must exclude these too, or dead 404 links leak into the archive list
 * (spotted 2026-10-01: 'iran-ousted-from-trade-corridors' + 'logo'). */
export const hiddenPostSlugsForPrisma = (): string[] => [...UNPUBLISHED_POST_SLUG_SET];

export type ListPostsParams = {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  /** extra slugs to hide from THIS list only (e.g. startup-pitch posts on
   * the homepage preview) — the global kill-switch always applies too */
  excludeSlugs?: string[];
};

export async function listPosts(params: ListPostsParams) {
  const page = Math.max(1, Math.trunc(params.page || 1) || 1);
  const perPage = Math.min(48, Math.max(1, Math.trunc(params.perPage || 12) || 12));
  const category = params.category || '';
  const tag = params.tag || '';
  const search = (params.search || '').trim();

  const where: Record<string, unknown> = { published: true };
  if (params.featured) where.featured = true;
  const slugNotIn = [...UNPUBLISHED_POST_SLUG_SET, ...(params.excludeSlugs || [])];
  if (slugNotIn.length > 0) where.slug = { notIn: slugNotIn };
  if (category) {
    where.categories = { some: { slug: category } };
  }
  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }
  if (search) {
    where.OR = [
      { titleEn: { contains: search } },
      { titleFa: { contains: search } },
      { excerptEn: { contains: search } },
      { excerptFa: { contains: search } },
    ];
  }

  const [total, posts] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleFa: true,
        excerptEn: true,
        excerptFa: true,
        cover: true,
        date: true,
        contentEn: true,
        featured: true,
        _count: { select: { comments: { where: { approved: true } } } },
        categories: { select: { id: true, slug: true, nameEn: true, nameFa: true } },
        tags: { select: { tag: { select: { id: true, slug: true, nameEn: true, nameFa: true } } } },
      },
    }),
  ]);

  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    posts: posts.map(({ contentEn, ...p }) => ({
      ...p,
      // audit §5 (D5, owner-approved 2026-11-02): the full article HTML used
      // to ride along in every LISTING payload (blog RSC flight, /api/posts,
      // /feed.xml, /llms.txt) although no listing consumer renders it —
      // cards show excerpts; the article page re-fetches via getPostDetail,
      // which runs sanitizePostHtml there. contentEn is still SELECTED so
      // the two derived fields below stay accurate, then dropped from the
      // serialized output (undefined keys never reach JSON.stringify).
      // excerptEn/Fa are display strings rendered as React text nodes
      // (BlogView XSS fix) — strip orphaned attr fragments from WP imports.
      excerptEn: sanitizeExcerpt(p.excerptEn),
      excerptFa: sanitizeExcerpt(p.excerptFa),
      hasEn: Boolean(contentEn),
      commentCount: p._count.comments,
      tags: p.tags.map((pt) => pt.tag),
      readMinutes: Math.max(
        1,
        Math.ceil(((contentEn || p.excerptFa || p.excerptEn || '').length / 4) / 220)
      ),
    })),
  };
}

export type ListPostsResult = Awaited<ReturnType<typeof listPosts>>;
export type PostListItem = ListPostsResult['posts'][number];

const postDetailInclude = {
  categories: { select: { id: true, slug: true, nameEn: true, nameFa: true } },
  tags: { select: { tag: { select: { id: true, slug: true, nameEn: true, nameFa: true } } } },
} as const;

/**
 * Full post for the article page. Accepts both raw and percent-encoded
 * Persian slugs (Next decodes route params; the DB stores both forms).
 * Returns null when the post does not exist or is not published.
 */
export async function getPostDetail(rawSlug: string) {
  let post: Awaited<ReturnType<typeof findPost>> = null;
  for (const candidate of slugCandidates(rawSlug)) {
    post = await findPost(candidate);
    if (post) break;
  }
  // hidden kill-switch posts 404 exactly like missing/unpublished ones —
  // "a missing post is fine, a visibly broken one is not"
  if (!post || !post.published || isUnpublishedPostSlug(post.slug)) return null;

  const tags = post.tags.map((pt) => pt.tag);
  const catIds = post.categories.map((c) => c.id);
  const related = await db.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
      ...(catIds.length > 0 ? { categories: { some: { id: { in: catIds } } } } : {}),
    },
    orderBy: { date: 'desc' },
    take: 3,
    select: {
      slug: true,
      titleEn: true,
      titleFa: true,
      cover: true,
      date: true,
      excerptEn: true,
      excerptFa: true,
    },
  });

  return {
    // XSS guard on read (same layer as the API)
    post: {
      ...post,
      contentEn: sanitizePostHtml(post.contentEn),
      contentFa: sanitizePostHtml(post.contentFa),
      tags,
    },
    related: related.map((r) => ({
      ...r,
      // same WP-migration attr-fragment scrub as listPosts teasers
      excerptEn: sanitizeExcerpt(r.excerptEn),
      excerptFa: sanitizeExcerpt(r.excerptFa),
    })),
  };
}

const findPost = async (candidate: string) =>
  db.post.findUnique({
    where: { slug: candidate },
    include: postDetailInclude,
  });

export type FullPost = NonNullable<Awaited<ReturnType<typeof getPostDetail>>>['post'];
export type RelatedPost = NonNullable<Awaited<ReturnType<typeof getPostDetail>>>['related'][number];

export async function getProjects(opts?: { section?: 'work' | 'lab'; featured?: boolean }) {
  await ensureProjectKindColumn();
  const where: Record<string, unknown> = {};
  // Work/Lab split (2026-09-07): /work and the homepage never render Lab
  // items and /lab never renders Work items — each section is queried
  // explicitly. Legacy rows predate the `section` column and default to work.
  if (opts?.section) where.section = opts.section;
  if (opts?.featured) where.featured = true;
  // display kill-switch (project-visibility.ts) — hidden slugs vanish from
  // /work, /lab, home and llms.txt while the DB row stays intact
  return visibleProjects(await db.project.findMany({ where, orderBy: { order: 'asc' } }));
}

export type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];

export async function getProjectBySlug(rawSlug: string) {
  // display kill-switch — /work/<slug> + opengraph-image 404 for hidden slugs
  // (reversible: project-visibility.ts); admin routes query db directly and
  // are unaffected
  if (isProjectHidden(rawSlug)) return null;
  await ensureProjectKindColumn();
  const candidates = [rawSlug, rawSlug.toLowerCase()];
  for (const candidate of candidates) {
    const project = await db.project.findUnique({ where: { slug: candidate } });
    if (project) return project;
  }
  return null;
}

export async function getServices() {
  return db.service.findMany({ orderBy: { order: 'asc' } });
}

export type ServiceRow = Awaited<ReturnType<typeof getServices>>[number];

export async function getSiteSettings() {
  const themeRow = await db.siteSetting.findUnique({ where: { key: 'theme' } });
  return { theme: themeRow?.value || 'default' };
}
