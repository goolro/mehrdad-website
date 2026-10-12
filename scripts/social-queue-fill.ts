/**
 * Fill the PRODUCTION Social Studio queue with LinkedIn drafts — the
 * owner asked to activate LinkedIn (2026-10-11). This mirrors
 * /api/admin/social/autopilot exactly, but runs from the sandbox:
 *
 *   production newest published posts → exclude kill-switch slugs →
 *   skip posts that already have a LinkedIn draft → generate with the
 *   site's OWN generation core (src/lib/social-studio.ts: same voice,
 *   same LinkedIn format rules — hook first, 600-1300 chars, soft CTA,
 *   3-5 hashtags) → save as SocialDraft rows via the Supabase
 *   Management API SQL endpoint (same channel as the migrate/seed tools).
 *
 * Language plan: the Koko investor posts target international investors →
 * 'both' (FA + EN drafts). Everything else defaults to FA (autopilot's
 * default), since the daily network is Persian.
 *
 * IDEMPOTENT: re-runs skip (platform, sourceSlug, lang) pairs that already
 * exist; drafts are created with posted=false — publishing stays a
 * human decision in the admin studio.
 *
 * Usage:
 *   SUPABASE_TOKEN=<pat> bun scripts/social-queue-fill.ts [count=5]
 *
 * Facts policy (OWNER_RULES law #9): generated content paraphrases the
 * published posts only — no invented traction.
 */
import { PrismaClient } from '@prisma/client';
import { generateSocialPosts } from '../src/lib/social-studio';

const REF = process.env.SUPABASE_REF || 'gcaksemjwkhqkyhaseui';
const TOKEN = process.env.SUPABASE_TOKEN;
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`;
const COUNT = Math.min(Math.max(Number(process.argv[2]) || 5, 1), 8);
const PLATFORM = 'linkedin';

// keep in sync with src/lib/queries.ts UNPUBLISHED_POST_SLUGS — hidden
// posts 404 by design, so their drafts would send LinkedIn traffic nowhere.
// Production stores WP-migration slugs PERCENT-ENCODED, so matching must
// compare the DECODED form (lesson from the first run: the raw Persian
// string never matched and a hidden post slipped through).
const KILL_SWITCH_RAW = new Set([
  'iran-ousted-from-trade-corridors',
  'مسله-هاستینگ-دو-فروشگاه',
  'logo',
]);

function isKillSwitch(slug: string): boolean {
  if (KILL_SWITCH_RAW.has(slug)) return true;
  try {
    return KILL_SWITCH_RAW.has(decodeURIComponent(slug));
  } catch {
    return false;
  }
}

if (!TOKEN) {
  console.error('SUPABASE_TOKEN env var is required');
  process.exit(1);
}

async function runSql(query: string): Promise<any[]> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL failed (${res.status}): ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

let tagCounter = 0;
function dq(s: string): string {
  const tag = `_sq${tagCounter++}_`;
  return `$${tag}$${s.replaceAll('$' + tag, '')}$${tag}$`;
}

function newId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// ── 1. ensure the production table exists (app's own lazy DDL) ──────────────
await runSql(`
  CREATE TABLE IF NOT EXISTS "SocialDraft" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "topic" TEXT,
    "sourceSlug" TEXT,
    "content" TEXT NOT NULL,
    "posted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialDraft_pkey" PRIMARY KEY ("id")
  )
`);
console.log('✓ SocialDraft table present in production');

// ── 2. pick targets: production newest published, minus hidden/drafted ──────
const prodPosts = await runSql(
  `SELECT "slug", "titleEn", "titleFa" FROM "Post"
   WHERE "published" = TRUE ORDER BY "date" DESC LIMIT 30;`
);
const existing = await runSql(
  `SELECT "sourceSlug", "lang" FROM "SocialDraft" WHERE "platform" = 'linkedin';`
);
const covered = new Set(existing.map((d) => `${d.sourceSlug}|${d.lang}`));

// posts the sandbox can generate from — the local dev DB is a scratch
// space that parallel processes rebuild, so each target post is SYNCED
// from production into the local DB right before generation
const local = new PrismaClient();
const localSlugs = new Set(
  (await local.post.findMany({ select: { slug: true } })).map((p) => p.slug)
);

const targets = prodPosts
  .filter((p) => !isKillSwitch(p.slug))
  .filter((p) => !covered.has(`${p.slug}|fa`)) // every post gets at least a FA draft
  .slice(0, COUNT);

console.log(
  `✓ targets: ${targets.map((t) => t.slug).join(', ') || '(none — queue already covered)'}`
);

// ── 3. sync target posts from production → local DB, then generate ─────────
function pgDate(v: any): Date {
  return new Date(typeof v === 'number' ? v : String(v).replace(' ', 'T') + 'Z');
}

async function syncPostToLocal(slug: string): Promise<boolean> {
  if (localSlugs.has(slug)) return true; // already present locally
  const rows = await runSql(
    `SELECT * FROM "Post" WHERE "slug" = ${dq(slug)} LIMIT 1;`
  );
  const row = rows[0];
  if (!row) return false;
  const data = {
    id: row.id,
    slug: row.slug,
    wpId: row.wpId ?? null,
    titleEn: row.titleEn ?? null,
    titleFa: row.titleFa ?? null,
    excerptEn: row.excerptEn ?? null,
    excerptFa: row.excerptFa ?? null,
    contentEn: row.contentEn ?? null,
    contentFa: row.contentFa ?? null,
    cover: row.cover ?? null,
    date: pgDate(row.date),
    modified: pgDate(row.modified),
    published: row.published === true,
    featured: row.featured === true,
    source: row.source ?? 'wordpress',
  };
  await local.post.upsert({ where: { slug }, create: data, update: data });
  localSlugs.add(slug);
  return true;
}

// ── 4. generate with the site's real core + insert into production ────────
let created = 0;
for (const t of targets) {
  // investor-facing posts target an international audience → FA + EN;
  // everything else defaults to FA (the autopilot's default)
  const investorPost =
    t.slug.startsWith('koko-investor') || t.slug === 'angel-investor-for-mvp-portfolio';
  const lang: 'fa' | 'both' = investorPost ? 'both' : 'fa';

  if (!(await syncPostToLocal(t.slug))) {
    console.error(`  ✗ ${t.slug}: post not found in production — skipping`);
    continue;
  }

  console.log(`── generating ${t.slug} (${lang}) …`);
  try {
    const results = await generateSocialPosts({
      source: 'post',
      slug: t.slug,
      platforms: [PLATFORM],
      lang,
    });

    for (const r of results) {
      if (covered.has(`${t.slug}|${r.lang}`)) continue;
      if (r.content.length < 80) {
        console.warn(`  skipped ${r.lang}: suspiciously short (${r.content.length} chars)`);
        continue;
      }
      await runSql(
        `INSERT INTO "SocialDraft" ("id", "platform", "lang", "topic", "sourceSlug", "content", "posted", "createdAt")
         VALUES ('${newId()}', ${dq(PLATFORM)}, ${dq(r.lang)}, NULL, ${dq(t.slug)}, ${dq(r.content)}, FALSE, now());`
      );
      covered.add(`${t.slug}|${r.lang}`);
      created++;
      console.log(`  ✓ saved ${r.lang} draft (${r.content.length} chars) — hook: ${r.hook.slice(0, 60)}`);
    }
  } catch (e) {
    console.error(`  ✗ ${t.slug} failed:`, String(e).slice(0, 200));
  }
}

await local.$disconnect();

// ── 5. verify ────────────────────────────────────────────────────────────────
const all = await runSql(
  `SELECT "lang", "sourceSlug", "posted", length("content") AS len, "createdAt"
   FROM "SocialDraft" WHERE "platform" = 'linkedin' ORDER BY "createdAt" DESC LIMIT 20;`
);
console.log(`── production LinkedIn queue (${all.length} newest shown) ──`);
for (const d of all) {
  console.log(`${d.posted ? 'POSTED  ' : 'pending '} ${d.sourceSlug} [${d.lang}] ${d.len} chars`);
}
console.log(`🎉 done — ${created} new draft(s) created`);
