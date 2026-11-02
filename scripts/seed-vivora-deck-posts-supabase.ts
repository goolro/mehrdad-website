/**
 * Seed the 19 Vivora investor-deck blog posts into the PRODUCTION Supabase
 * Postgres database (project ref gcaksemjwkhqkyhaseui) — same channel and
 * same safety contract as scripts/seed-investor-posts-supabase.ts.
 *
 * Runs entirely over HTTPS via the Supabase Management API
 * (POST /v1/projects/{ref}/database/query). No direct PG connection, no DB
 * password: a Management API personal access token is enough.
 *
 * Usage (env only — no secrets in code):
 *   SUPABASE_TOKEN=<pat> bun scripts/seed-vivora-deck-posts-supabase.ts
 *   SUPABASE_REF overrides the project ref (default: production project).
 *
 * IDEMPOTENT, mirroring scripts/seed-vivora-deck-posts.ts: content fields
 * (titles / excerpts / content / cover / category link) are refreshed on
 * re-run, but `date`, `published`, `featured` are NEVER touched —
 * owner-managed state cannot be clobbered by a re-seed.
 *
 * Dates: INSERT only — slide 01 newest, one minute apart, so the feed reads
 * 01 → 19 top-down.
 *
 * Facts policy (OWNER_RULES law #9 / D-029): all content comes from the
 * exported SLIDES/buildPosts in seed-vivora-deck-posts.ts — every statement
 * traces to its own slide. No invented numbers.
 */
import { buildPosts } from './seed-vivora-deck-posts.ts';

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
  const tag = `_vseed${tagCounter++}_`;
  const safe = s.replaceAll('$' + tag, ''); // paranoia: never allow tag inside value
  return `$${tag}$${safe}$${tag}$`;
}

// Post.id is TEXT with client-side cuid() — raw SQL must supply one.
function newId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// ── Category resolution ──────────────────────────────────────────────────────
// Production stores the investment category slug in its WP-migration
// percent-encoded form; the raw Persian form and nameEn are fallbacks.
const INVESTMENT_SLUG =
  '%d8%b3%d8%b1%d9%85%d8%a7%db%8c%d9%87-%da%af%d8%b0%d8%a7%d8%b1%db%8c'; // سرمایه-گذاری
const INVESTMENT_NAME_EN = 'سرمایه-گذاری';

async function resolveInvestmentCategoryId(): Promise<{ id: string; slug: string } | null> {
  const rows = await runSql(
    `SELECT "id", "slug", "nameEn" FROM "Category"
     WHERE "slug" IN (${dq('سرمایه-گذاری')}, ${dq(INVESTMENT_SLUG)})
        OR "nameEn" = ${dq(INVESTMENT_NAME_EN)}
     LIMIT 3;`
  );
  if (rows.length === 0) {
    console.warn(
      'WARNING: investment category not found in production — posts will be seeded UNCATEGORISED (no category invented blindly).'
    );
    return null;
  }
  if (rows.length > 1) {
    throw new Error(`Ambiguous investment category matches: ${rows.map((r) => r.slug).join(', ')}`);
  }
  return rows[0];
}

// ── Upsert one post ──────────────────────────────────────────────────────────
async function upsertPost(
  p: ReturnType<typeof buildPosts>[number],
  categoryId: string | null
): Promise<void> {
  const existing = await runSql(
    `SELECT "id", "date" FROM "Post" WHERE "slug" = ${dq(p.slug)} LIMIT 1;`
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
    console.log(`updated: ${p.slug} (existing row + its date kept)`);
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
         '${p.date.toISOString()}', now(), TRUE, FALSE, 'ai', now(), now()
       );`
    );
    console.log(`inserted: ${p.slug} (id ${postId}, date ${p.date.toISOString()})`);
  }

  if (categoryId) {
    await runSql(
      `INSERT INTO "_CategoryToPost" ("A", "B")
       VALUES (${dq(categoryId)}, '${postId}')
       ON CONFLICT DO NOTHING;`
    );
  }
}

// ── Verification ─────────────────────────────────────────────────────────────
async function verify(categoryId: string | null): Promise<void> {
  const POSTS = buildPosts();
  console.log('── Verification (production DB) ──');
  const rows = await runSql(
    `SELECT "slug", "published", "featured", "source", "date",
            length("contentEn") AS en_len, length("contentFa") AS fa_len
     FROM "Post" WHERE "slug" LIKE 'vivora-deck-%' ORDER BY "slug";`
  );
  for (const r of rows) {
    console.log(
      `✓ ${r.slug}  published=${r.published} featured=${r.featured} source=${r.source} ` +
        `date=${r.date} content(en/fa)=${r.en_len}/${r.fa_len} chars`
    );
  }
  if (rows.length !== POSTS.length) {
    throw new Error(`expected ${POSTS.length} vivora-deck rows, found ${rows.length}`);
  }
  const links = await runSql(
    `SELECT j."A", j."B" FROM "_CategoryToPost" j
     JOIN "Post" p ON p."id" = j."B"
     WHERE p."slug" LIKE 'vivora-deck-%';`
  );
  if (categoryId) {
    for (const l of links) {
      if (l.A !== categoryId) throw new Error(`bad category link for post ${l.B}`);
    }
    console.log(`✓ ${links.length}/${POSTS.length} category links → ${INVESTMENT_NAME_EN}`);
  } else {
    if (links.length > 0) throw new Error('unexpected category links though category was unresolved');
    console.log('✓ posts intentionally uncategorised (category missing in production)');
  }
  const total = await runSql(`SELECT COUNT(*) AS n FROM "Post";`);
  console.log(`✓ production Post table now holds ${total[0].n} rows`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const category = await resolveInvestmentCategoryId();
if (category) console.log(`✓ investment category resolved: ${category.slug} (${category.id})`);

for (const p of buildPosts()) {
  await upsertPost(p, category ? category.id : null);
}

await verify(category ? category.id : null);
console.log('🎉 production seed complete — rebuild/redeploy will surface the posts (blog is force-static)');
