/**
 * D-052 (growth-agent P1, 2026-10-24): create the "Lead" table on the
 * production Supabase Postgres — the exact DDL Prisma would generate from
 * `model Lead` in prisma/schema.postgres.prisma (verified 1:1 against the
 * existing "ContactMessage" table conventions: TEXT ids, TIMESTAMP(3)
 * defaults, quoted PascalCase identifiers).
 *
 * Runs over the Management-API SQL endpoint (POST /v1/projects/{ref}/
 * database/query) — the same channel as migrate-sqlite-to-supabase.ts and
 * seed-investor-posts-supabase.ts, because no direct PG connection exists
 * in CI.
 *
 * Idempotent: re-running is a no-op (to_regclass guard + IF NOT EXISTS).
 *
 *   SUPABASE_TOKEN=<pat> bun scripts/create-lead-table-supabase.ts
 *   SUPABASE_REF overrides the project ref (default: production project).
 */

const REF = process.env.SUPABASE_REF || 'gcaksemjwkhqkyhaseui'
const TOKEN = process.env.SUPABASE_TOKEN
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`

if (!TOKEN) {
  console.error('SUPABASE_TOKEN env var is required')
  process.exit(1)
}

async function runSql(query: string): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`SQL failed (${res.status}): ${text.slice(0, 500)}`)
  }
  return text ? JSON.parse(text) : null
}

const DDL = `
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'article_cta',
    "lang" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Lead_email_idx" ON "Lead"("email");
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
`

async function main() {
  const exists = await runSql(
    `SELECT to_regclass('"public"."Lead"') AS reg;`
  )
  const already = exists?.[0]?.reg
  if (already) {
    console.log(`"Lead" already exists (${already}) — verifying shape…`)
  } else {
    await runSql(DDL)
    console.log('"Lead" table + 2 indexes created ✓')
  }

  // verify the live shape matches the Prisma model
  const cols = await runSql(
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema='public' AND table_name='Lead'
      ORDER BY ordinal_position;`
  )
  for (const c of cols) {
    console.log(
      `  ${c.column_name.padEnd(12)} ${c.data_type.padEnd(16)} null=${c.is_nullable}${c.column_default ? `  default=${c.column_default}` : ''}`
    )
  }
  const idx = await runSql(
    `SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='Lead' ORDER BY indexname;`
  )
  console.log('indexes:', idx.map((r: any) => r.indexname).join(', '))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
