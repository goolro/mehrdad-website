import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureSocialDraftTable } from '@/lib/social-drafts';
import { generateSocialPosts, PLATFORM_SPECS } from '@/lib/social-studio';
import { isUnpublishedPostSlug } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Social Media Studio — Auto-pilot.
 *
 * Scans the latest published blog posts and fills the missing drafts for the
 * OWNER-SELECTED networks and languages (wizard: language → networks → run):
 *   latest posts → skip every (post, platform, lang) combo that already has
 *   a draft → generate (real brand voice, shared core) → save as draft.
 *
 * Idempotent: re-running never duplicates — only gaps get filled, down to
 * the individual (platform, lang) combo per post.
 * Per-combo generation with a soft time budget; partial success is returned
 * honestly (created / skipped / failed).
 *
 * Input : { count?: number (default 3, max 6),
 *           lang?: 'fa'|'en'|'both' (default 'fa'),
 *           platforms?: string[] (subset of PLATFORM_SPECS keys, default ['linkedin']) }
 * Output: { ok, created: [...{ slug, title, platform, lang }], skipped: [...], failed: [...] }
 */

const TIME_BUDGET_MS = 200_000; // stay well inside the function timeout

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const started = Date.now();
  try {
    await ensureSocialDraftTable();

    const b = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(b.count) || 3, 1), 6);
    const lang = b.lang === 'en' || b.lang === 'both' ? b.lang : 'fa';
    const langs = lang === 'both' ? (['fa', 'en'] as const) : ([lang] as const);

    // Wizard networks: validate against the shared platform specs, dedupe.
    // Back-compat: no platforms field (or an empty one) → LinkedIn, the
    // original behavior.
    const requested = Array.isArray(b.platforms) ? b.platforms : [];
    const valid = [...new Set(requested.filter((p: unknown) => typeof p === 'string' && p in PLATFORM_SPECS))] as string[];
    const selected = (valid.length ? valid : ['linkedin']).slice(0, Object.keys(PLATFORM_SPECS).length);

    // candidate posts: newest published first. Posts hidden at app level
    // (UNPUBLISHED_POST_SLUGS — published=true in the DB but 404 on the
    // site) must never get drafts: a draft pointing at a 404 wastes the
    // owner's review time and sends social traffic nowhere. Matching is
    // decode-aware (production stores percent-encoded WP slugs).
    const rawCandidates = await db.post.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 30,
      select: { slug: true, titleEn: true, titleFa: true },
    });
    const hidden = rawCandidates.filter((p) => isUnpublishedPostSlug(p.slug));
    const candidates = rawCandidates.filter((p) => !isUnpublishedPostSlug(p.slug));

    // existing drafts keyed by slug|platform|lang — a combo is covered when
    // ANY draft exists for it (any state counts as covered)
    const existing = await db.socialDraft.findMany({
      select: { sourceSlug: true, platform: true, lang: true },
    });
    const covered = new Set(existing.map((d) => `${d.sourceSlug}|${d.platform}|${d.lang}`));

    const combosFor = (slug: string) =>
      selected.flatMap((platform) => langs.map((l) => ({ slug, platform, lang: l })));

    const targets = candidates
      .filter((p) => combosFor(p.slug).some((c) => !covered.has(`${c.slug}|${c.platform}|${c.lang}`)))
      .slice(0, count);

    const created: { slug: string; title: string; platform: string; lang: string }[] = [];
    const skipped: { slug: string; reason: string }[] = [
      ...candidates
        .filter((p) => combosFor(p.slug).every((c) => covered.has(`${c.slug}|${c.platform}|${c.lang}`)))
        .slice(0, 10)
        .map((p) => ({ slug: p.slug, reason: 'already has drafts for the selected networks/languages' })),
      ...hidden.map((p) => ({
        slug: p.slug,
        reason: 'hidden on the site (no public URL) — excluded from social',
      })),
    ];
    const failed: { slug: string; error: string }[] = [];

    for (const post of targets) {
      const title = (post.titleFa || post.titleEn || post.slug).trim();
      for (const combo of combosFor(post.slug)) {
        if (covered.has(`${combo.slug}|${combo.platform}|${combo.lang}`)) continue;
        if (Date.now() - started > TIME_BUDGET_MS) {
          skipped.push({
            slug: post.slug,
            reason: `time budget reached — run again later (${combo.platform}/${combo.lang} left)`,
          });
          continue;
        }
        try {
          const results = await generateSocialPosts({
            source: 'post',
            slug: post.slug,
            platforms: [combo.platform],
            lang: combo.lang,
          });
          for (const r of results) {
            await db.socialDraft.create({
              data: {
                platform: combo.platform,
                lang: r.lang,
                sourceSlug: post.slug,
                content: r.content.slice(0, r.limit),
              },
            });
            created.push({ slug: post.slug, title, platform: combo.platform, lang: r.lang });
          }
        } catch (e) {
          console.error(`social autopilot: ${post.slug} ${combo.platform}/${combo.lang} failed:`, e);
          failed.push({
            slug: `${post.slug} (${combo.platform}/${combo.lang})`,
            error: e instanceof Error ? e.message : 'generation failed',
          });
        }
      }
    }

    return NextResponse.json({ ok: true, created, skipped, failed });
  } catch (e) {
    console.error('social autopilot error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Autopilot failed' }, { status: 500 });
  }
}
