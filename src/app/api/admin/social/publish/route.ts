import { NextRequest, NextResponse, after } from 'next/server';
import { checkAdmin, scrubError } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureSocialDraftTable } from '@/lib/social-drafts';
import { trackServerEvent } from '@/lib/server-analytics';
import { instagramPublishConfigured, publishInstagramDraft, INSTAGRAM_SETUP_STEPS } from '@/lib/instagram-publish';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Social Media Studio — publish a saved draft.
 *
 * Two platform paths, both env-gated fail-closed (503 + exact setup steps
 * instead of a vague failure — the copy-to-clipboard path stays the
 * zero-config flow):
 *
 * - linkedin: LINKEDIN_ACCESS_TOKEN (w_member_social) + LINKEDIN_AUTHOR_URN
 *   → POST /rest/posts
 * - instagram (D-059): COMPOSIO_API_KEY + COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID
 *   → Composio INSTAGRAM_CREATE_MEDIA_CONTAINER → INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH
 *
 * Input : { id: string } (SocialDraft id)
 * Output: { ok: true, linkedInPostId? | mediaId? } | { error, setup? }
 */

const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202411';

const LINKEDIN_SETUP_STEPS = [
  'Create an app at developer.linkedin.com (Products: "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect").',
  'Generate a 3-legged access token for your member account with the w_member_social scope (valid ~60 days — plan rotation).',
  'Find your member URN: GET https://api.linkedin.com/v2/userinfo → "sub" → urn:li:person:<sub>.',
  'Add LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN to the Vercel environment variables, then redeploy.',
];

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  try {
    await ensureSocialDraftTable();
    const { id } = (await req.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const draft = await db.socialDraft.findUnique({ where: { id } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    if (draft.platform !== 'linkedin' && draft.platform !== 'instagram') {
      return NextResponse.json(
        { error: 'Only LinkedIn and Instagram drafts can be published here (x/telegram stay copy-only)' },
        { status: 400 },
      );
    }
    if (draft.posted) return NextResponse.json({ error: 'Draft already published' }, { status: 409 });

    if (draft.platform === 'instagram') {
      if (!instagramPublishConfigured()) {
        return NextResponse.json(
          { error: 'Instagram publishing via Composio is not configured yet', setup: INSTAGRAM_SETUP_STEPS },
          { status: 503 },
        );
      }
      const outcome = await publishInstagramDraft(draft);
      if (!outcome.ok) {
        console.error('instagram publish failed:', outcome.error);
        return NextResponse.json({ error: outcome.error || 'Instagram publish failed' }, { status: 502 });
      }
      await db.socialDraft.update({ where: { id }, data: { posted: true } });
      after(() =>
        trackServerEvent('instagram_post_published', 'admin', {
          draftId: id,
          lang: draft.lang,
          topic: draft.topic,
          sourceSlug: draft.sourceSlug,
          mediaId: outcome.mediaId || null,
        }),
      );
      return NextResponse.json({ ok: true, mediaId: outcome.mediaId || null });
    }

    // ── linkedin ──
    const token = process.env.LINKEDIN_ACCESS_TOKEN || '';
    const authorUrn = process.env.LINKEDIN_AUTHOR_URN || '';
    if (!token || !authorUrn) {
      return NextResponse.json(
        { error: 'LinkedIn publishing is not configured yet', setup: LINKEDIN_SETUP_STEPS },
        { status: 503 },
      );
    }

    const res = await fetch(`${LINKEDIN_API}/rest/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: draft.content.slice(0, 3000),
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`linkedin publish failed (${res.status}):`, body.slice(0, 500));
      return NextResponse.json(
        { error: `LinkedIn API error ${res.status}`, detail: body.slice(0, 300) },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    await db.socialDraft.update({ where: { id }, data: { posted: true } });

    // PostHog: distribution loop end-to-end (article → draft → published)
    after(() =>
      trackServerEvent('linkedin_post_published', 'admin', {
        draftId: id,
        lang: draft.lang,
        topic: draft.topic,
        sourceSlug: draft.sourceSlug,
        linkedInPostId: data.id || null,
      }),
    );

    return NextResponse.json({ ok: true, linkedInPostId: data.id || null });
  } catch (e) {
    console.error('social publish error:', e);
    return NextResponse.json({ error: scrubError(e, 'Publish failed') }, { status: 500 });
  }
}
