/**
 * Content kill-switch slug list — SINGLE SOURCE OF TRUTH.
 *
 * These WP-era posts are hidden from EVERY public surface (blog list,
 * article page 404, sitemap, RSS, llms.txt) while the underlying DB rows
 * are KEPT (nothing is deleted). Owner decision 2026-01, see
 * docs/DECISIONS.md — historically documented in src/lib/queries.ts.
 *   - iran-ousted-from-trade-corridors: geopolitical commentary, not
 *     product/build content — must not represent "what Mehrdad builds"
 *   - مسله-هاستینگ-دو-فروشگاه + logo: the two legacy WP posts render
 *     broken (raw src="/media/…" markup) — unpublished until rewritten.
 *
 * This module is deliberately PURE (no db import) so BOTH runtimes can
 * use it:
 *   - src/lib/queries.ts (server/Prisma runtime) — hides rows + 404s pages
 *   - src/proxy.ts (Next 16 proxy/edge runtime) — sends the posts' OLD
 *     WordPress URLs to /blog instead of a 404 target (GSC «Not found»
 *     cleanup, 2026-10-25 owner order: «وضعیت نمره منفی داره باید ارتقا
 *     بدهیم»), preserving the crawl equity of every legacy backlink.
 *
 * To republish a rewritten post: remove its slug here and rebuild.
 */
import { slugCandidates } from '@/lib/slug-lookup';

export const HIDDEN_POST_SLUGS: readonly string[] = [
  'iran-ousted-from-trade-corridors',
  'مسله-هاستینگ-دو-فروشگاه',
  'logo',
];

/** True when the slug matches a kill-switched post in ANY of its comparable
 * forms (raw / decoded / percent-encoded both cases — same matching logic
 * the DB layer uses via slugCandidates). */
export function isHiddenPostSlug(raw: string): boolean {
  const candidates = slugCandidates(raw);
  return candidates.some((c) => HIDDEN_POST_SLUG_SET.has(c));
}

const HIDDEN_POST_SLUG_SET: ReadonlySet<string> = new Set(
  HIDDEN_POST_SLUGS.flatMap((s) => slugCandidates(s))
);
