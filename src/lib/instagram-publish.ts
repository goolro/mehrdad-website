import { db } from '@/lib/db';
import { campaignReelForTopic } from '@/lib/instagram-campaign';

// D-059 (owner order 2026-10-25: «دو هفته پست بزاری … از طریق composio»):
// publish Instagram drafts through Composio's Instagram toolkit — the
// official Meta content-publishing flow, abstracted by Composio:
//   1. INSTAGRAM_CREATE_MEDIA_CONTAINER { image_url | video_url, caption } → container id
//   2. INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH { container_id }              → media id
//
// D-062 (impact standard): drafts that carry a reel video publish as
// media_type=REELS. The video URL comes from SocialDraft.videoUrl or — for
// drafts seeded before the reels existed — is backfilled from the campaign
// reel map by topic (and persisted once). Meta renders video containers
// asynchronously, so the publish step retries while the container is still
// processing; photo containers publish on the first attempt.
//
// Env-gated fail-closed, exactly like the LinkedIn publisher: without
// COMPOSIO_API_KEY + COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID the callers
// get a 503 with the exact setup steps — copy-to-clipboard stays the
// zero-config path.

export const COMPOSIO_API = 'https://backend.composio.dev/api/v3';

export const INSTAGRAM_SETUP_STEPS = [
  'Create a project at app.composio.dev and copy the API key (Settings → API Keys).',
  'In Composio, connect your Instagram account (Toolkits → Instagram) — it must be an Instagram Business/Creator account linked to a Facebook Page (a Meta requirement for publishing).',
  'Copy the connected-account id of that Instagram connection from the Composio dashboard (Connected Accounts).',
  'Add COMPOSIO_API_KEY and COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID to the deployment environment variables, then redeploy.',
];

export function instagramPublishConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY && process.env.COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID);
}

interface ComposioExecuteOk {
  ok: true;
  data: Record<string, unknown>;
}
interface ComposioExecuteFail {
  ok: false;
  status: number;
  error: string;
}

async function composioExecute(slug: string, args: Record<string, unknown>): Promise<ComposioExecuteOk | ComposioExecuteFail> {
  const key = process.env.COMPOSIO_API_KEY || '';
  const connectedId = process.env.COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID || '';
  try {
    const res = await fetch(`${COMPOSIO_API}/tools/execute/${slug}`, {
      method: 'POST',
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectedAccountId: connectedId, arguments: args }),
      signal: AbortSignal.timeout(60_000),
    });
    const bodyText = await res.text().catch(() => '');
    if (!res.ok) {
      return { ok: false, status: res.status, error: `Composio ${slug} → HTTP ${res.status}: ${bodyText.slice(0, 300)}` };
    }
    const json = JSON.parse(bodyText || '{}') as { successful?: boolean; data?: Record<string, unknown>; error?: string };
    if (json.successful === false) {
      return { ok: false, status: 502, error: `Composio ${slug} failed: ${json.error || 'unknown error'}` };
    }
    return { ok: true, data: json.data ?? {} };
  } catch (e) {
    return { ok: false, status: 502, error: `Composio ${slug} threw: ${e instanceof Error ? e.message : 'unknown'}` };
  }
}

// Composio action responses nest the toolkit payload under different keys
// depending on the action — dig one level deep for an id-shaped string.
function pickId(data: Record<string, unknown>): string {
  for (const key of ['containerId', 'container_id', 'id', 'mediaId', 'media_id']) {
    const v = data[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  for (const v of Object.values(data)) {
    if (v && typeof v === 'object') {
      const nested = pickId(v as Record<string, unknown>);
      if (nested) return nested;
    }
  }
  return '';
}

export interface InstagramPublishOutcome {
  ok: boolean;
  mediaId?: string;
  video?: boolean;
  error?: string;
}

// Meta needs time to render REELS containers — these phrases in the publish
// error mean "try again in a few seconds"; anything else is a hard failure.
const PENDING_CONTAINER_HINTS = ['not available', 'in_progress', 'processing', 'pending', 'not ready'];

function isPendingContainerError(error: string): boolean {
  const e = error.toLowerCase();
  return PENDING_CONTAINER_HINTS.some((h) => e.includes(h));
}

/** Publish a created container; retries while Meta is still rendering the video. */
async function publishContainer(
  containerId: string,
  attempts: number,
): Promise<{ ok: boolean; mediaId?: string; error?: string }> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const publish = await composioExecute('INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH', {
      container_id: containerId,
      ig_user_id: undefined,
    });
    if (publish.ok) return { ok: true, mediaId: pickId(publish.data) || containerId };
    if (attempt === attempts || !isPendingContainerError(publish.error)) {
      return { ok: false, error: publish.error };
    }
    await new Promise((resolve) => setTimeout(resolve, 8000));
  }
  return { ok: false, error: 'Instagram publish retries exhausted' };
}

/** The reel for a draft: explicit column first, then the campaign topic map (D-062 backfill). */
function reelForDraft(draft: { topic?: string | null; videoUrl?: string | null }): string | null {
  return draft.videoUrl || (draft.topic ? campaignReelForTopic(draft.topic) : null);
}

/** Publish one draft — reel video when one exists, campaign image otherwise. */
export async function publishInstagramDraft(draft: {
  id?: string;
  topic?: string | null;
  content: string;
  imageUrl: string | null;
  videoUrl?: string | null;
  lang: string;
}): Promise<InstagramPublishOutcome> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehrdad.ir';
  const caption = draft.content.slice(0, 2200);
  const reelPath = reelForDraft(draft);

  if (reelPath) {
    // persist the backfill once — the studio and later runs see the reel too
    if (!draft.videoUrl && draft.id) {
      await db.socialDraft.update({ where: { id: draft.id }, data: { videoUrl: reelPath } }).catch(() => {});
    }
    const videoUrl = reelPath.startsWith('http') ? reelPath : `${base}${reelPath}`;

    // 1) media container as a reel
    const container = await composioExecute('INSTAGRAM_CREATE_MEDIA_CONTAINER', {
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      share_to_feed: true,
    });
    if (!container.ok) return { ok: false, error: container.error, video: true };
    const containerId = pickId(container.data);
    if (!containerId) {
      return {
        ok: false,
        video: true,
        error: `Composio did not return a container id: ${JSON.stringify(container.data).slice(0, 300)}`,
      };
    }

    // 2) publish — video containers render asynchronously (6 × 8s patience)
    const publish = await publishContainer(containerId, 6);
    if (!publish.ok) return { ok: false, error: publish.error, video: true };
    return { ok: true, mediaId: publish.mediaId || containerId, video: true };
  }

  if (!draft.imageUrl) {
    return { ok: false, error: 'draft has no image — Instagram needs a reel video or an image to publish' };
  }
  const imageUrl = draft.imageUrl.startsWith('http') ? draft.imageUrl : `${base}${draft.imageUrl}`;

  // 1) media container with the caption
  const container = await composioExecute('INSTAGRAM_CREATE_MEDIA_CONTAINER', {
    image_url: imageUrl,
    caption,
  });
  if (!container.ok) return { ok: false, error: container.error };
  const containerId = pickId(container.data);
  if (!containerId) {
    return { ok: false, error: `Composio did not return a container id: ${JSON.stringify(container.data).slice(0, 300)}` };
  }

  // 2) publish the container (photos need no processing — single attempt)
  const publish = await publishContainer(containerId, 1);
  if (!publish.ok) return { ok: false, error: publish.error };
  return { ok: true, mediaId: publish.mediaId || containerId };
}

// ─────────── daily auto-publish (cron piggyback) ───────────

const LAST_AUTO_KEY = 'ig:lastAutoPublish';

/**
 * Publishes at most ONE campaign/queued Instagram draft per calendar day —
 * the two-week cadence the owner asked for. Called from the morning cron
 * (piggyback, like the lead nurture); a SiteSetting day-guard keeps the
 * cron's repeated chain calls from burning the queue in one morning.
 * Not configured → silent no-op. D-062: reel-carrying drafts go out as
 * REELS automatically; chronological order is preserved.
 */
export async function autoPublishInstagramToday(now = new Date()): Promise<{ published: boolean; detail?: string }> {
  if (!instagramPublishConfigured()) return { published: false };
  await ensureInstagramDraftsReady();
  const today = now.toISOString().slice(0, 10);
  const last = await db.siteSetting.findUnique({ where: { key: LAST_AUTO_KEY } }).catch(() => null);
  if (last?.value === today) return { published: false, detail: 'already ran today' };

  const draft = await db.socialDraft.findFirst({
    where: {
      platform: 'instagram',
      posted: false,
      OR: [{ imageUrl: { not: null } }, { videoUrl: { not: null } }],
    },
    orderBy: { createdAt: 'asc' },
  });
  if (!draft) return { published: false, detail: 'queue empty' };

  const outcome = await publishInstagramDraft(draft);
  if (!outcome.ok) {
    // do NOT set the day-guard — retry on the next chain/cron call
    console.error('instagram autopublish failed:', outcome.error);
    return { published: false, detail: outcome.error };
  }
  await db.socialDraft.update({ where: { id: draft.id }, data: { posted: true } });
  await db.siteSetting.upsert({
    where: { key: LAST_AUTO_KEY },
    update: { value: today },
    create: { key: LAST_AUTO_KEY, value: today },
  });
  return {
    published: true,
    detail: `${outcome.video ? 'reel' : 'photo'} mediaId=${outcome.mediaId}`,
  };
}

async function ensureInstagramDraftsReady(): Promise<void> {
  // imageUrl / videoUrl columns may be missing on the remote table (D-059 / D-062 shims)
  const addColumn = async (name: string): Promise<void> => {
    await db
      .$executeRawUnsafe(`ALTER TABLE "SocialDraft" ADD COLUMN IF NOT EXISTS "${name}" TEXT`)
      .catch(async () => {
        await db.$executeRawUnsafe(`ALTER TABLE "SocialDraft" ADD COLUMN "${name}" TEXT`).catch(() => {});
      });
  };
  await addColumn('imageUrl');
  await addColumn('videoUrl');
}
