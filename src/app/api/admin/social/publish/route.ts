import { NextRequest, NextResponse, after } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureSocialDraftTable } from '@/lib/social-drafts';
import { trackServerEvent } from '@/lib/server-analytics';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Social Media Studio — publish a saved draft to LinkedIn.
 *
 * Requires two environment variables on the deployment (Vercel):
 *   LINKEDIN_ACCESS_TOKEN — member token with w_member_social scope
 *   LINKEDIN_AUTHOR_URN   — the member URN, e.g. urn:li:person:AbCdEf
 * If they are missing, respond 503 with exact setup steps instead of a
 * vague failure — the copy-to-clipboard path stays the zero-config flow.
 *
 * Input : { id: string } (SocialDraft id, platform must be 'linkedin')
 * Output: { ok: true, linkedInPostId } | { error, setup? }
 */

const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202411';

const SETUP_STEPS = [
  'Create an app at developer.linkedin.com (Products: "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect").',
  'Generate a 3-legged access token for your member account with the w_member_social scope (valid ~60 days — plan rotation).',
  'Find your member URN: GET https://api.linkedin.com/v2/userinfo → "sub" → urn:li:person:<sub>.',
  'Add LINKEDIN_ACCESS_TOKEN and LINKEDIN_AUTHOR_URN to the Vercel environment variables, then redeploy.',
];

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const token = process.env.LINKEDIN_ACCESS_TOKEN || '';
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN || '';

  if (!token || !authorUrn) {
    return NextResponse.json(
      { error: 'LinkedIn publishing is not configured yet', setup: SETUP_STEPS },
      { status: 503 },
    );
  }

  try {
    await ensureSocialDraftTable();
    const { id } = (await req.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const draft = await db.socialDraft.findUnique({ where: { id } });
    if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    if (draft.platform !== 'linkedin') {
      return NextResponse.json({ error: 'Only LinkedIn drafts can be published here' }, { status: 400 });
    }
    if (draft.posted) return NextResponse.json({ error: 'Draft already published' }, { status: 409 });

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
      })
    );

    return NextResponse.json({ ok: true, linkedInPostId: data.id || null });
  } catch (e) {
    console.error('social publish error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Publish failed' }, { status: 500 });
  }
}
