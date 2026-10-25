import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureSocialDraftTable } from '@/lib/social-drafts';
import { INSTAGRAM_CAMPAIGN, campaignReelForTopic } from '@/lib/instagram-campaign';

export const dynamic = 'force-dynamic';

/**
 * D-059 — load the 14-day Instagram campaign (@startup_mt) into the Social
 * Studio as unposted instagram drafts. One button for the owner; idempotent
 * by the campaign topic markers (ig-campaign-day-*) — re-clicking tops up
 * only what is missing (deleted drafts come back; edited/published ones are
 * never touched).
 *
 * Input : {} (no body needed)
 * Output: { ok: true, created, skipped, total }
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await ensureSocialDraftTable();
    const existing = await db.socialDraft.findMany({
      where: { platform: 'instagram', topic: { startsWith: 'ig-campaign-day-' } },
      select: { topic: true },
    });
    const have = new Set(existing.map((e) => e.topic));
    let created = 0;
    for (const post of INSTAGRAM_CAMPAIGN) {
      if (have.has(post.topic)) continue;
      await db.socialDraft.create({
        data: {
          platform: 'instagram',
          lang: 'fa',
          topic: post.topic,
          sourceSlug: null,
          content: post.content,
          imageUrl: post.image,
          videoUrl: campaignReelForTopic(post.topic),
        },
      });
      created++;
    }
    // D-062: repair drafts seeded before the reels existed — attach the
    // produced reel video to every unposted campaign draft that lacks one
    // (posted drafts are never touched; the button stays the one-click fix).
    for (const post of INSTAGRAM_CAMPAIGN) {
      const reel = campaignReelForTopic(post.topic);
      if (!reel) continue;
      await db.socialDraft.updateMany({
        where: { platform: 'instagram', topic: post.topic, posted: false, videoUrl: null },
        data: { videoUrl: reel },
      });
    }
    const total = INSTAGRAM_CAMPAIGN.length;
    return NextResponse.json({ ok: true, created, skipped: total - created, total });
  } catch (e) {
    console.error('instagram campaign load error:', e);
    return NextResponse.json({ error: 'Failed to load campaign' }, { status: 500 });
  }
}
