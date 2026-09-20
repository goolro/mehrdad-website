import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureSocialDraftTable } from '@/lib/social-drafts';
import { generateSocialPosts } from '@/lib/social-studio';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Social Media Studio — Auto-pilot.
 *
 * Scans the latest published blog posts and fills the missing LinkedIn
 * drafts automatically, so the review queue is never empty:
 *   latest posts → skip ones that already have a LinkedIn draft →
 *   generate (real brand voice, shared core) → save as draft.
 *
 * Idempotent: re-running never duplicates — only gaps get filled.
 * Sequential generation with a soft time budget; partial success is
 * returned honestly (created / skipped / failed).
 *
 * Input : { count?: number (default 3, max 6), lang?: 'fa'|'en'|'both' }
 * Output: { ok, created: [...], skipped: [...], failed: [...] }
 */

const PLATFORM = 'linkedin';
const TIME_BUDGET_MS = 200_000; // stay well inside the function timeout

export async function POST(req:NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const started = Date.now();
  try {
    await ensureSocialDraftTable();

    const b = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(Number(b.count) || 3, 1), 6);
    const lang = b.lang === 'en' || b.lang === 'both' ? b.lang : 'fa';

    // candidate posts: newest published first
    const candidates = await db.post.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 30,
      select: { slug: true, titleEn: true, titleFa: true },
    });

    // existing LinkedIn drafts by source slug (any state counts as covered)
    const existing = await db.socialDraft.findMany({
      where: { platform: PLATFORM },
      select: { sourceSlug: true },
    });
    const covered = new Set(existing.map((d) => d.sourceSlug).filter(Boolean) as string[]);

    const targets = candidates.filter((p) => !covered.has(p.slug)).slice(0, count);

    const created: { slug: string; title: string; lang: string }[] = [];
    const skipped: { slug: string; reason: string }[] = candidates
      .filter((p) => covered.has(p.slug))
      .slice(0, 10)
      .map((p) => ({ slug: p.slug, reason: 'already has a LinkedIn draft' }));
    const failed: { slug: string; error: string }[] = [];

    for (const post of targets) {
      if (Date.now() - started > TIME_BUDGET_MS && created.length > 0) {
        skipped.push({ slug: post.slug, reason: 'time budget reached — run again later' });
        continue;
      }
      const title = (post.titleFa || post.titleEn || post.slug).trim();
      try {
        const results = await generateSocialPosts({
          source: 'post',
          slug: post.slug,
          platforms: [PLATFORM],
          lang,
        });
        for (const r of results) {
          await db.socialDraft.create({
            data: {
              platform: PLATFORM,
              lang: r.lang,
              sourceSlug: post.slug,
              content: r.content.slice(0, r.limit),
            },
          });
          created.push({ slug: post.slug, title, lang: r.lang });
        }
      } catch (e) {
        console.error(`social autopilot: ${post.slug} failed:`, e);
        failed.push({ slug: post.slug, error: e instanceof Error ? e.message : 'generation failed' });
      }
    }

    return NextResponse.json({ ok: true, created, skipped, failed });
  } catch (e) {
    console.error('social autopilot error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Autopilot failed' }, { status: 500 });
  }
}
