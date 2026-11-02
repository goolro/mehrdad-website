/**
 * Seed the «Koko is now on Telegram» announcement post (D-049) into the
 * PRODUCTION Supabase Postgres database (project ref gcaksemjwkhqkyhaseui) —
 * same channel and same safety contract as
 * scripts/seed-vivora-deck-posts-supabase.ts.
 *
 * Runs entirely over HTTPS via the Supabase Management API
 * (POST /v1/projects/{ref}/database/query). No direct PG connection, no DB
 * password: a Management API personal access token is enough.
 *
 * Usage (env only — no secrets in code):
 *   SUPABASE_TOKEN=<pat> bun scripts/seed-koko-telegram-post-supabase.ts
 *   SUPABASE_REF overrides the project ref (default: production project).
 *
 * IDEMPOTENT, mirroring the vivora seeder: content fields (titles / excerpts
 * / content / cover + tag links) are refreshed on re-run, but `date`,
 * `published` and `featured` are NEVER touched — owner-managed state cannot
 * be clobbered by a re-seed.
 *
 * Facts policy (OWNER_RULES #5 / D-029): all content comes from
 * KOKO_POST/KOKO_POST_TAGS in scripts/koko-telegram-post-data.ts — every
 * statement traces to a verifiable source (see that file's header).
 */
import { KOKO_POST, KOKO_POST_SLUG, KOKO_POST_TAGS } from './koko-telegram-post-data.ts';

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
  const tag = `_kseed${tagCounter++}_`;
  const safe = s.replaceAll('$' + tag, ''); // paranoia: never allow tag inside value
  return `$${tag}$${safe}$${tag}$`;
}

// Post.id is TEXT with client-side cuid() — raw SQL must supply one.
function newId(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

// ── Tag resolution: reuse an existing tag (by slug OR nameEn) or create it ──
async function resolveTagId(t: { slug: string; nameEn: string; nameFa: string }): Promise<string> {
  const found = await runSql(
    `SELECT "id" FROM "Tag" WHERE "slug" = ${dq(t.slug)} OR "nameEn" = ${dq(t.nameEn)} LIMIT 2;`
  );
  if (found.length > 1) {
    throw new Error(`ambiguous tag matches for ${t.slug}: ${found.map((r) => r.id).join(', ')}`);
  }
  if (found.length === 1) return found[0].id;
  const id = newId();
  await runSql(
    `INSERT INTO "Tag" ("id", "slug", "nameEn", "nameFa") VALUES (${dq(id)}, ${dq(t.slug)}, ${dq(t.nameEn)}, ${dq(t.nameFa)});`
  );
  console.log(`tag created: ${t.slug} (${id})`);
  return id;
}

// ── Upsert the post ──────────────────────────────────────────────────────────
async function upsertPost(): Promise<string> {
  const p = KOKO_POST;
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
         now(), now(), TRUE, FALSE, 'ai', now(), now()
       );`
    );
    console.log(`inserted: ${p.slug} (id ${postId}, date = now())`);
  }
  return postId;
}

// ── Verification ─────────────────────────────────────────────────────────────
async function verify(postId: string): Promise<void> {
  console.log('── Verification (production DB) ──');
  const rows = await runSql(
    `SELECT "slug", "published", "featured", "source", "date",
            length("contentEn") AS en_len, length("contentFa") AS fa_len
     FROM "Post" WHERE "slug" = ${dq(KOKO_POST_SLUG)};`
  );
  if (rows.length !== 1) throw new Error(`expected exactly 1 row for ${KOKO_POST_SLUG}, found ${rows.length}`);
  const r = rows[0];
  console.log(
    `✓ ${r.slug}  published=${r.published} featured=${r.featured} source=${r.source} ` +
      `date=${r.date} content(en/fa)=${r.en_len}/${r.fa_len} chars`
  );
  if (!r.published) throw new Error('post is not published');

  const tagLinks = await runSql(
    `SELECT t."slug" FROM "PostTag" pt JOIN "Tag" t ON t."id" = pt."tagId"
     WHERE pt."postId" = '${postId}' ORDER BY t."slug";`
  );
  const linked = tagLinks.map((x) => x.slug).sort();
  const expected = KOKO_POST_TAGS.map((t) => t.slug).sort();
  if (JSON.stringify(linked) !== JSON.stringify(expected)) {
    throw new Error(`tag links mismatch: got [${linked}] expected [${expected}]`);
  }
  console.log(`✓ ${linked.length}/${expected.length} tag links → ${linked.join(', ')}`);

  const total = await runSql(`SELECT COUNT(*) AS n FROM "Post";`);
  console.log(`✓ production Post table now holds ${total[0].n} rows`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const postId = await upsertPost();
for (const t of KOKO_POST_TAGS) {
  const tagId = await resolveTagId(t);
  await runSql(
    `INSERT INTO "PostTag" ("postId", "tagId") VALUES ('${postId}', '${tagId}')
     ON CONFLICT DO NOTHING;`
  );
}
await verify(postId);
console.log('🎉 production seed complete — the article page renders on demand; a rebuild (any push) will surface it in /blog + sitemap + feed');
