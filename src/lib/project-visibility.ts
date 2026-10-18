/**
 * Display kill-switch for individual projects — REVERSIBLE by design.
 *
 * Owner request 2026-10-05: «ترافیک تمپو — نمایش این محصول غیر فعال بشه»
 * clarified as «غیر فعال کن یعنی ممکنه بعدا باز فعال بشه — فقط نمایش داده نشه»:
 * the product must disappear from the public site WITHOUT deleting anything,
 * because it may be re-enabled later.
 *
 * Slugs listed here are hidden from EVERY public surface:
 *   - /work and /lab lists + homepage featured/momentum (getProjects filter)
 *   - /work/<slug> detail page + its opengraph-image (getProjectBySlug → null → 404)
 *   - /play/<slug> static game routes (page-level notFound)
 *   - sitemap.xml, IndexNow/Google ping sweep, llms.txt (SEO stays consistent)
 *   - /api/site public JSON and the AI-assistant knowledge base (kb.ts)
 *
 * Deliberately CODE-level, not a DB flag: re-enabling = remove the slug from
 * this set and deploy; the Turso row, media, profile, and kind label are all
 * left untouched. The admin panel (/api/admin/projects) is NOT filtered, so
 * the owner still sees and manages the row meanwhile.
 */
export const HIDDEN_PROJECT_SLUGS: ReadonlySet<string> = new Set(['traffic-tempo']);

export function isProjectHidden(slug: string): boolean {
  return HIDDEN_PROJECT_SLUGS.has(slug);
}

/** in-memory row filter for already-fetched project lists */
export function visibleProjects<T extends { slug: string }>(rows: T[]): T[] {
  return rows.filter((r) => !HIDDEN_PROJECT_SLUGS.has(r.slug));
}
