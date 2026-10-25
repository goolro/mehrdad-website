import { db } from '@/lib/db';

// D-059 (owner order 2026-10-25: «دو هفته پست بزاری … از طریق composio»):
// publish Instagram drafts through Composio's Instagram toolkit — the
// official Meta content-publishing flow, abstracted by Composio:
//   1. INSTAGRAM_CREATE_MEDIA_CONTAINER { image_url, caption } → container id
//   2. INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH { container_id }     → media id
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
  error?: string;
}

/** Publish one draft (must have content + imageUrl). Returns ok + media id. */
export async function publishInstagramDraft(draft: {
  content: string;
  imageUrl: string | null;
  lang: string;
}): Promise<InstagramPublishOutcome> {
  if (!draft.imageUrl) {
    return { ok: false, error: 'draft has no image — Instagram needs an image to publish' };
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mehrdad.ir';
  const imageUrl = draft.imageUrl.startsWith('http') ? draft.imageUrl : `${base}${draft.imageUrl}`;

  // 1) media container with the caption
  const container = await composioExecute('INSTAGRAM_CREATE_MEDIA_CONTAINER', {
    image_url: imageUrl,
    caption: draft.content.slice(0, 2200),
  });
  if (!container.ok) return { ok: false, error: container.error };
  const containerId = pickId(container.data);
  if (!containerId) {
    return { ok: false, error: `Composio did not return a container id: ${JSON.stringify(container.data).slice(0, 300)}` };
  }

  // 2) publish the container
  const publish = await composioExecute('INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH', {
    container_id: containerId,
    ig_user_id: undefined,
  });
  if (!publish.ok) return { ok: false, error: publish.error };
  const mediaId = pickId(publish.data);
  return { ok: true, mediaId: mediaId || containerId };
}

// ─────────── daily auto-publish (cron piggyback) ───────────

const LAST_AUTO_KEY = 'ig:lastAutoPublish';

/**
 * Publishes at most ONE campaign/queued Instagram draft per calendar day —
 * the two-week cadence the owner asked for. Called from the morning cron
 * (piggyback, like the lead nurture); a SiteSetting day-guard keeps the
 * cron's repeated chain calls from burning the queue in one morning.
 * Not configured → silent no-op.
 */
export async function autoPublishInstagramToday(now = new Date()): Promise<{ published: boolean; detail?: string }> {
  if (!instagramPublishConfigured()) return { published: false };
  await ensureInstagramDraftsReady();
  const today = now.toISOString().slice(0, 10);
  const last = await db.siteSetting.findUnique({ where: { key: LAST_AUTO_KEY } }).catch(() => null);
  if (last?.value === today) return { published: false, detail: 'already ran today' };

  const draft = await db.socialDraft.findFirst({
    where: { platform: 'instagram', posted: false, imageUrl: { not: null } },
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
  return { published: true, detail: `mediaId=${outcome.mediaId}` };
}

async function ensureInstagramDraftsReady(): Promise<void> {
  // imageUrl column may be missing on the remote table (D-059 shim)
  await db
    .$executeRawUnsafe(`ALTER TABLE "SocialDraft" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`)
    .catch(async () => {
      await db.$executeRawUnsafe(`ALTER TABLE "SocialDraft" ADD COLUMN "imageUrl" TEXT`).catch(() => {});
    });
}
