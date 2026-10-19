/**
 * Publora bridge — push mehrdad.ir blog posts to social networks via the
 * Publora API (owner order 2026-10-18: «از طریق این سایت می‌خواهیم به شبکه‌های
 * اجتماعی وصل بشیم» — app.publora.com, API key provided inline).
 *
 * Publora contract (docs.publora.com):
 *   - REST auth header:  x-publora-key: sk_...
 *   - GET  /api/v1/platform-connections  → connected channels + token health
 *   - POST /api/v1/create-post           → { content, platforms[], scheduledTime?
 *                                          publishNow?, mediaUrls?, firstComments? }
 *   - No scheduledTime → DRAFT (safe default; owner schedules from the dashboard)
 *   - Connecting social channels is a MANUAL dashboard OAuth step the API cannot do.
 *
 * Content source: the site's own public API /api/posts[/:slug] — production
 * truth, zero tokens. Copy is built ONLY from the post's own title/excerpt/
 * category (facts policy, OWNER_RULES #9): no invented numbers, no new claims.
 *
 * Standing editorial rule: Persian copy NEVER contains the Persian comma «،»
 * (D-043 standing rule) — incoming DB text is normalised «،»→«؛» and an assert
 * enforces zero remaining.
 *
 * Secrets policy (same as every script in this repo): PUBLORA_KEY env only —
 * inline on the command line, NEVER stored in any file.
 *
 * Usage:
 *   PUBLORA_KEY=sk_... bun scripts/publora-push.ts list
 *   PUBLORA_KEY=sk_... bun scripts/publora-push.ts show --slug vivora-deck-01-cover [--lang fa|en|both]
 *   PUBLORA_KEY=sk_... bun scripts/publora-push.ts push --slug vivora-deck-01-cover \
 *       [--lang fa|en|both] [--tags "ویوورا,استارتاپ"] [--platforms linkedin,instagram] \
 *       [--schedule 2026-10-20T09:00:00Z] [--now] [--dry]
 *
 *   - default (no --schedule/--now): creates a DRAFT in Publora
 *   - OWNER ORDER 2026-10-18 «فقط برای لینکدین استفاده کنیم»: without
 *     --platforms the script targets LINKEDIN ONLY — Instagram (connected but
 *     unused) is never touched unless explicitly requested via --platforms
 *   - --platforms takes platform PREFIXES (resolved via list) or full
 *     connection IDs; omitted → LinkedIn connections
 *   - --dry builds and prints the exact payload without sending
 */
const SITE = 'https://mehrdad.ir';
const API = 'https://api.publora.com/api/v1';
const KEY = process.env.PUBLORA_KEY;
// OWNER ORDER 2026-10-18: «فقط برای لینکدین استفاده کنیم» — LinkedIn is the
// only default target. Other platforms require an explicit --platforms flag.
const DEFAULT_PLATFORM = 'linkedin';

if (!KEY) {
  console.error('PUBLORA_KEY env var is required (Publora dashboard API key)');
  process.exit(1);
}

// ── CLI ──────────────────────────────────────────────────────────────────────
type Lang = 'fa' | 'en' | 'both';
const args = process.argv.slice(2);
const cmd = args[0];
function flag(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
const has = (name: string) => args.includes(`--${name}`);
const lang = ((flag('lang') as Lang) || 'both') as Lang;
const slug = flag('slug');
const schedule = flag('schedule');
const publishNow = has('now');
const dry = has('dry');
const tagsFlag = flag('tags');
const platformsFlag = flag('platforms');

if ((cmd === 'show' || cmd === 'push') && !slug) {
  console.error(`--slug is required for "${cmd}"`);
  process.exit(1);
}
if (schedule && publishNow) {
  console.error('--schedule and --now are mutually exclusive (PUBLISH_NOW_CONFLICT)');
  process.exit(1);
}
if (schedule) {
  const d = new Date(schedule);
  if (Number.isNaN(d.getTime())) throw new Error(`--schedule is not a valid date: ${schedule}`);
  if (d.getTime() < Date.now() + 5 * 60_000) {
    // Publora: <5min past → clamped+warned; ≥5min past → 400 after 2026-08-25
    throw new Error(`--schedule must be in the future (UTC now +5min margin): ${d.toISOString()}`);
  }
}

// ── Site data (public API — production truth) ────────────────────────────────
type SitePost = {
  slug: string;
  titleEn: string | null;
  titleFa: string | null;
  excerptEn: string | null;
  excerptFa: string | null;
  cover: string | null;
  categories: { slug: string; nameEn: string; nameFa: string }[];
};

async function fetchPost(s: string): Promise<SitePost> {
  const res = await fetch(`${SITE}/api/posts/${encodeURIComponent(s)}`);
  if (!res.ok) throw new Error(`site API ${res.status} for slug ${s}`);
  const j = (await res.json()) as { post: SitePost };
  return j.post;
}

// ── Standing editorial rule: zero «،» in Persian copy ────────────────────────
function noFaComma(s: string): string {
  return s.replaceAll('،', '؛');
}
function assertClean(label: string, s: string): string {
  const out = noFaComma(s);
  if (out.includes('،')) throw new Error(`assert failed: «،» survived in ${label}`);
  return out.trim();
}

// ── Copy builder — facts only from the post itself ───────────────────────────
function hashtags(post: SitePost, extra?: string): string {
  const fromCats = post.categories
    .flatMap((c) => [c.nameFa, c.nameEn])
    .map((n) => '#' + n.replace(/[\s-]+/g, '_').replace(/[^\p{L}\p{N}_#]/gu, ''));
  const fromFlag = (extra || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : '#' + t.replace(/\s+/g, '_')));
  return [...new Set([...fromFlag, ...fromCats])].join(' ');
}

function buildCopy(post: SitePost, l: Lang, tags?: string): { lang: string; content: string }[] {
  const link = `${SITE}/blog/${post.slug}`;
  const out: { lang: string; content: string }[] = [];
  if (l !== 'en') {
    const title = assertClean('titleFa', post.titleFa || post.titleEn || '');
    const body = assertClean('excerptFa', post.excerptFa || '');
    const h = hashtags(post, tags);
    out.push({
      lang: 'fa',
      content: [title, '', body, '', `متن کامل: ${link}`, '', h].join('\n'),
    });
  }
  if (l !== 'fa') {
    const title = (post.titleEn || post.titleFa || '').trim();
    const body = (post.excerptEn || '').trim();
    const h = hashtags(post, tags);
    out.push({
      lang: 'en',
      content: [title, '', body, '', `Full post: ${link}`, '', h].join('\n'),
    });
  }
  return out;
}

// ── Publora API ──────────────────────────────────────────────────────────────
type Connection = {
  platformId: string;
  username: string;
  displayName: string;
  tokenStatus: string;
  connectionStatus: string;
  lastError: string | null;
};

async function listConnections(): Promise<Connection[]> {
  const res = await fetch(`${API}/platform-connections`, { headers: { 'x-publora-key': KEY } });
  const text = await res.text();
  if (!res.ok) throw new Error(`platform-connections ${res.status}: ${text.slice(0, 300)}`);
  return (JSON.parse(text) as { connections: Connection[] }).connections;
}

function resolvePlatforms(all: Connection[], flagVal?: string): string[] {
  const active = all.filter((c) => c.connectionStatus === 'active' && c.tokenStatus === 'valid');
  if (!flagVal) {
    return resolvePlatforms(all, DEFAULT_PLATFORM); // owner order: LinkedIn-only default
  }
  const prefixes = flagVal.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return prefixes.map((p) => {
    const hit = active.find((c) => c.platformId === p || c.platformId.startsWith(`${p}-`));
    if (!hit)
      throw new Error(`no active connection for "${p}" — run "list" and check the dashboard`);
    return hit.platformId;
  });
}

async function createPost(payload: Record<string, unknown>): Promise<{ postGroupId: string }> {
  const res = await fetch(`${API}/create-post`, {
    method: 'POST',
    headers: {
      'x-publora-key': KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': `mehrdad-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`create-post ${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text) as { postGroupId: string };
}

function absolutMedia(cover: string | null): string[] | undefined {
  if (!cover) return undefined;
  if (!/^https:\/\//.test(cover) && !cover.startsWith('/')) return undefined; // not a usable URL
  const url = cover.startsWith('/') ? SITE + cover : cover;
  return url.startsWith('https://') ? [url] : undefined;
}

// ── Commands ─────────────────────────────────────────────────────────────────
if (cmd === 'list') {
  const conns = await listConnections();
  if (conns.length === 0) {
    console.log('connected channels: NONE');
    console.log('→ dashboard → Channels → Add Channel → OAuth (manual step, API cannot do it)');
    console.log('  free Starter plan: 3 accounts / 15 posts per month / X (Twitter) needs Pro');
  }
  for (const c of conns) {
    console.log(
      `${c.platformId.padEnd(30)} ${c.connectionStatus} token=${c.tokenStatus} ` +
        `${c.displayName || c.username}${c.lastError ? ` lastError=${c.lastError}` : ''}`
    );
  }
  process.exit(0);
}

if (cmd === 'show' || cmd === 'push') {
  const post = await fetchPost(slug as string);
  const copies = buildCopy(post, lang, tagsFlag);
  const conns = await listConnections();
  let platforms: string[];
  try {
    platforms = resolvePlatforms(conns, platformsFlag);
  } catch (e) {
    if (cmd === 'show' && !platformsFlag) {
      platforms = ['<connect-channels-first>'];
      console.log(`(preview mode: ${String((e as Error).message)})`);
      console.log();
    } else throw e;
  }
  const media = absolutMedia(post.cover);
  const mode = publishNow ? 'publish-now' : schedule ? 'scheduled' : 'draft';
  console.log(`targets: ${platforms.join(' · ')} (default = ${DEFAULT_PLATFORM} per owner order 2026-10-18)`);
  console.log(`mode: ${mode}${media ? ` · media: ${media.join(', ')}` : ''}`);
  console.log();

  for (const c of copies) {
    console.log(`── ${c.lang} copy (${c.content.length} chars) ──`);
    console.log(c.content);
    console.log();
    // one Publora post PER language — never a merged fa+en blob (the owner's
    // own practice is separate fa/en posts; each takes one post allowance)
    const payload: Record<string, unknown> = { content: c.content, platforms };
    if (media) payload.mediaUrls = media;
    if (schedule) payload.scheduledTime = new Date(schedule).toISOString();
    if (publishNow) payload.publishNow = true;
    if (cmd === 'push' && !dry) {
      const r = await createPost(payload);
      console.log(`✓ [${c.lang}] ${mode} created — postGroupId: ${r.postGroupId}`);
    }
  }

  if (cmd === 'show' || dry) {
    console.log(dry ? '── dry run: nothing sent ──' : '── show: nothing sent ──');
    process.exit(0);
  }
  console.log(`  mode: ${mode} · track in the dashboard or via the "Get Post" API`);
  process.exit(0);
}

console.error(`unknown command "${cmd}" — use: list | show | push`);
process.exit(1);
