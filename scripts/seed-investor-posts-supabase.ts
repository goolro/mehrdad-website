/**
 * Seed the two Quiz of Koko investor blog posts into the PRODUCTION
 * Supabase Postgres database (project ref gcaksemjwkhqkyhaseui).
 *
 * Runs entirely over HTTPS via the Supabase Management API
 * (POST /v1/projects/{ref}/database/query) — the same channel as
 * scripts/migrate-sqlite-to-supabase.ts. No direct PG connection, no DB
 * password: a Management API personal access token is enough.
 *
 * Usage (env only — no secrets in code):
 *   SUPABASE_TOKEN=<pat> bun scripts/seed-investor-posts-supabase.ts
 *   SUPABASE_REF overrides the project ref (default: production project).
 *
 * IDEMPOTENT, mirroring scripts/seed-investor-posts.ts: content fields
 * (titles / excerpts / content / category link) are refreshed on re-run,
 * but `date`, `published`, `featured` are NEVER touched — owner-managed
 * state cannot be clobbered by a re-seed.
 *
 * SQL layer notes:
 * - Post.id is a client-side cuid() with NO database default, so raw SQL
 *   inserts must supply an id (cuid-style, uniqueness is what matters).
 * - The investment category slug is stored in its WP-migration
 *   percent-encoded form; lookup covers the raw Persian slug and nameEn as
 *   fallbacks, so the script survives either representation.
 * - Content is dollar-quoted with a per-value unique tag (same paranoia as
 *   the migrate script), so any characters in post bodies are safe.
 *
 * Facts policy (OWNER_RULES law #9 / D-029): all content comes from the
 * exported POSTS in seed-investor-posts.ts — every figure traces to the two
 * published funnel pages. No invented traction.
 */
import { POSTS } from './seed-investor-posts.ts';

const REF = process.env.SUPABASE_REF || 'gcaksemjwkhqkyhaseui';
const TOKEN = process.env.SUPABASE_TOKEN;
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`;

if (!TOKEN) {
  console.error('SUPABASE_TOKEN env var is required (Supabase Management API PAT)');
  process.exit(1);
}

// ── Supabase SQL-over-HTTPS helper ───────────────────────────────────────────
async function runSql(query: string): Promise<any[]> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `SQL failed (${res.status}): ${text.slice(0, 500)}\n-- query head: ${query.slice(0, 200)}`
    );
  }
  return JSON.parse(text);
}

// ── Value encoding ───────────────────────────────────────────────────────────
let tagCounter = 0;
function dq(s: string): string {
  const tag = `_seed${tagCounter++}_`;
  const safe = s.replaceAll('$' + tag, ''); // paranoia: never allow tag inside value
  return `$${tag}$${safe}$${tag}$`;
}

// Post.id is TEXT with client-side cuid() — raw SQL must supply one.
function newId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// ── Category resolution ──────────────────────────────────────────────────────
// Production stores the slug percent-encoded (WP-migration legacy);
// the raw Persian form and nameEn are equivalent fallbacks.
const INVESTMENT_SLUG =
  '%d8%b3%d8%b1%d9%85%d8%a7%db%8c%d9%87-%da%af%d8%b0%d8%a7%d8%b1%db%8c'; // سرمایه-گذاری
const INVESTMENT_NAME_EN = 'سرمایه-گذاری';

async function resolveInvestmentCategoryId(): Promise<{ id: string; slug: string }> {
  const rows = await runSql(
    `SELECT "id", "slug", "nameEn" FROM "Category"
     WHERE "slug" IN (${dq('سرمایه-گذاری')}, ${dq(INVESTMENT_SLUG)})
        OR "nameEn" = ${dq(INVESTMENT_NAME_EN)}
     LIMIT 3;`
  );
  if (rows.length === 0) {
    throw new Error('Investment category not found in production — refusing to create one blindly');
  }
  if (rows.length > 1) {
    throw new Error(`Ambiguous investment category matches: ${rows.map((r) => r.slug).join(', ')}`);
  }
  return rows[0];
}

// ── Upsert one post ──────────────────────────────────────────────────────────
async function upsertPost(p: (typeof POSTS)[number], categoryId: string): Promise<void> {
  const existing = await runSql(
    `SELECT "id" FROM "Post" WHERE "slug" = ${dq(p.slug)} LIMIT 1;`
  );

  let postId: string;
  if (existing.length > 0) {
    postId = existing[0].id;
    // refresh CONTENT only — date/published/featured stay owner-managed
    await runSql(
      `UPDATE "Post" SET
         "cover"     = ${dq(p.cover)},
         "titleEn"   = ${dq(p.titleEn)},
         "titleFa"   = ${dq(p.titleFa)},
         "excerptEn" = ${dq(p.excerptEn)},
         "excerptFa" = ${dq(p.excerptFa)},
         "contentEn" = ${dq(p.contentEn)},
         "contentFa" = ${dq(p.contentFa)},
         "updatedAt" = now()
       WHERE "id" = '${postId}';`
    );
    console.log(`updated: ${p.slug} (existing row kept, owner-managed fields untouched)`);
  } else {
    postId = newId();
    await runSql(
      `INSERT INTO "Post"
         ("id", "slug", "cover", "titleEn", "titleFa", "excerptEn", "excerptFa",
          "contentEn", "contentFa", "date", "modified", "published",
          "featured", "source", "createdAt", "updatedAt")
       VALUES (
         '${postId}', ${dq(p.slug)}, ${dq(p.cover)}, ${dq(p.titleEn)}, ${dq(p.titleFa)},
         ${dq(p.excerptEn)}, ${dq(p.excerptFa)},
         ${dq(p.contentEn)}, ${dq(p.contentFa)},
         now(), now(), TRUE, FALSE, 'ai', now(), now()
       );`
    );
    console.log(`inserted: ${p.slug} (id ${postId}, published, source=ai)`);
  }

  // ensure the category link (join table has composite PK (A,B) — DO NOTHING
  // makes re-runs safe; A = Category.id, B = Post.id, verified against live data)
  await runSql(
    `INSERT INTO "_CategoryToPost" ("A", "B")
     VALUES (${dq(categoryId)}, '${postId}')
     ON CONFLICT DO NOTHING;`
  );
}

// ── Verification ─────────────────────────────────────────────────────────────
async function verify(categoryId: string): Promise<void> {
  console.log('── Verification (production DB) ──');
  const rows = await runSql(
    `SELECT "slug", "published", "featured", "source", "date",
            length("contentEn") AS en_len, length("contentFa") AS fa_len
     FROM "Post" WHERE "slug" LIKE 'koko-investor-%' ORDER BY "slug";`
  );
  for (const r of rows) {
    console.log(
      `✓ ${r.slug}  published=${r.published} featured=${r.featured} source=${r.source} ` +
        `date=${r.date} content(en/fa)=${r.en_len}/${r.fa_len} chars`
    );
  }
  if (rows.length !== POSTS.length) {
    throw new Error(`expected ${POSTS.length} koko rows, found ${rows.length}`);
  }
  const links = await runSql(
    `SELECT j."A", j."B" FROM "_CategoryToPost" j
     JOIN "Post" p ON p."id" = j."B"
     WHERE p."slug" LIKE 'koko-investor-%';`
  );
  for (const l of links) {
    if (l.A !== categoryId) throw new Error(`bad category link for post ${l.B}`);
  }
  console.log(`✓ ${links.length}/${POSTS.length} category links → ${INVESTMENT_NAME_EN}`);
  const total = await runSql(`SELECT COUNT(*) AS n FROM "Post";`);
  console.log(`✓ production Post table now holds ${total[0].n} rows`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const category = await resolveInvestmentCategoryId();
console.log(`✓ investment category resolved: ${category.slug} (${category.id})`);

for (const p of POSTS) {
  await upsertPost(p, category.id);
}

await verify(category.id);
console.log('🎉 production seed complete — rebuild/redeploy will surface the posts (blog is force-static)');
