/**
 * Google Indexing API push (2026-09, indexing-program).
 *
 * The only programmatic channel Google offers for "please (re)crawl this
 * URL now". Officially scoped to JobPosting/BroadcastEvent pages — for a
 * normal article site Google may simply ignore some notifications, so this
 * is an OPPORTUNISTIC accelerator alongside GSC sitemaps, never a promise.
 * It is strictly env-gated: without credentials nothing happens at all.
 *
 * Activation (owner, one-time):
 *  1. GCP Console → create Service Account → enable "Indexing API"
 *  2. Create a JSON key for it
 *  3. GSC → Settings → Users → add the service-account email as OWNER
 *  4. Vercel env: GOOGLE_INDEXING_SA_JSON = <contents of that JSON>
 *     (raw JSON or base64 — both accepted)
 *
 * Implementation notes: RS256 JWT signed with node:crypto — deliberately
 * dependency-free; token cached in-process for its 1-hour lifetime.
 */
import crypto from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const NOTIFY_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const SCOPE = 'https://www.googleapis.com/auth/indexing';

interface SaKey {
  client_email: string;
  private_key: string;
}

let cachedToken: { token: string; exp: number } | null = null;

function saKey(): SaKey | null {
  const raw = process.env.GOOGLE_INDEXING_SA_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as SaKey;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function googleIndexingEnabled(): boolean {
  return saKey() !== null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

async function accessToken(sa: SaKey): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  let signature: string;
  try {
    signature = signer.sign(sa.private_key, 'base64url');
  } catch {
    return null; // malformed key → disable silently
  }
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claim}.${signature}`,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    cachedToken = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
    return data.access_token;
  } catch {
    return null;
  }
}

/** Submit one URL_UPDATED notification. Returns Google's response or null. */
async function publishUrl(
  sa: SaKey,
  url: string,
): Promise<{ ok: boolean; status: number; body?: string }> {
  const token = await accessToken(sa);
  if (!token) return { ok: false, status: 0 };
  try {
    const res = await fetch(NOTIFY_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
      signal: AbortSignal.timeout(8_000),
    });
    const body = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, body: body.slice(0, 300) };
  } catch {
    return { ok: false, status: 0 };
  }
}

/**
 * Batch notify (daily cron). Sequential on purpose — ~100 URLs at <100ms
 * each stays well inside any timeout, and Google quotas are per-minute.
 */
export async function notifyGoogleBatch(
  urls: string[],
): Promise<{ enabled: boolean; submitted: number; ok: number; failed: number }> {
  const sa = saKey();
  if (!sa) return { enabled: false, submitted: 0, ok: 0, failed: 0 };
  let ok = 0;
  let failed = 0;
  for (const url of urls.slice(0, 150)) {
    const r = await publishUrl(sa, url);
    if (r.ok || r.status === 429 || r.status === 403) {
      // 429 = daily quota reached → stop burning time on the rest
      if (r.status === 429) break;
      if (r.ok) ok++;
      else failed++;
    } else {
      failed++;
    }
  }
  return { enabled: true, submitted: ok + failed, ok, failed };
}
