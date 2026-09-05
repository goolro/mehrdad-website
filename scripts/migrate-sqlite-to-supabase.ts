/**
 * SQLite → Supabase (Postgres) data migration.
 *
 * Runs entirely over HTTPS via the Supabase Management API
 * (POST /v1/projects/{ref}/database/query) — no direct PG connection is
 * needed, so it works from environments without IPv6 (the Supabase direct
 * endpoint is IPv6-only on the free plan).
 *
 * Usage (env only — no secrets in code):
 *   SUPABASE_REF=gcaksemjwkhqkyhaseui \
 *   SUPABASE_TOKEN=<pat> \
 *   SQLITE_DB=db/custom.db \
 *   bun scripts/migrate-sqlite-to-supabase.ts [--verify-only]
 *
 * Safety: idempotent — each run TRUNCATEs the target tables first.
 * Content values are dollar-quoted with per-value unique tags, so any
 * characters in post/comment bodies are safe.
 */

import { Database } from 'bun:sqlite'

const REF = process.env.SUPABASE_REF
const TOKEN = process.env.SUPABASE_TOKEN
const SQLITE_DB = process.env.SQLITE_DB || 'db/custom.db'
const API = `https://api.supabase.com/v1/projects/${REF}/database/query`

if (!REF || !TOKEN) {
  console.error('SUPABASE_REF and SUPABASE_TOKEN env vars are required')
  process.exit(1)
}

// ── Supabase SQL-over-HTTPS helper ───────────────────────────────────────────
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
    throw new Error(`SQL failed (${res.status}): ${text.slice(0, 500)}\n-- query head: ${query.slice(0, 200)}`)
  }
  return JSON.parse(text)
}

// ── SQLite reader ────────────────────────────────────────────────────────────
const sqlite = new Database(SQLITE_DB, { readonly: true })

function readTable(table: string): Record<string, any>[] {
  return sqlite.query(`SELECT * FROM "${table}"`).all() as Record<string, any>[]
}

// ── Value encoding ───────────────────────────────────────────────────────────
// Boolean columns (Prisma stores these as 0/1 INTEGER in SQLite)
const BOOL_COLS = new Set(['published', 'featured', 'approved', 'read'])
// DateTime columns pass through as text — Postgres parses Prisma's SQLite
// format ("YYYY-MM-DD HH:MM:SS.mmm +00:00") natively into timestamp(3).
const DATE_COLS = new Set(['date', 'modified', 'createdAt', 'updatedAt'])

let tagCounter = 0
function enc(v: any, col: string): string {
  if (v === null || v === undefined) return 'NULL'
  if (BOOL_COLS.has(col)) {
    const b = v === true || v === 1 ? 'TRUE' : v === false || v === 0 ? 'FALSE' : null
    if (b === null) throw new Error(`bad boolean value for ${col}: ${JSON.stringify(v)}`)
    return b
  }
  if (DATE_COLS.has(col)) {
    // bun:sqlite returns Prisma DateTime as INTEGER epoch-millis
    if (typeof v === 'number' || typeof v === 'bigint') return `'${new Date(Number(v)).toISOString()}'`
    // plain string (already ISO-ish) → dollar-quote as-is
  }
  if (typeof v === 'number') return String(v)
  let s = String(v)
  // unique dollar-quote tag per value → collision-proof
  const tag = `_mig${tagCounter++}_`
  s = s.replaceAll('$' + tag, '') // paranoia: never allow tag inside value
  return `$${tag}$${s}$${tag}$`
}

function insertStatements(table: string, rows: Record<string, any>[], cols: string[]): string[] {
  if (rows.length === 0) return []
  const colList = cols.map((c) => `"${c}"`).join(', ')
  const chunks: string[] = []
  const BATCH = 20
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const values = batch
      .map((r) => `(${cols.map((c) => enc(r[c], c)).join(', ')})`)
      .join(',\n')
    chunks.push(
      `INSERT INTO "${table}" (${colList}) VALUES\n${values}\nON CONFLICT DO NOTHING;`
    )
  }
  return chunks
}

// ── Table plan (FK-safe order) ───────────────────────────────────────────────
const PLAN: { table: string; cols?: string[] }[] = [
  { table: 'Category' },
  { table: 'Tag' },
  { table: 'Post' },
  { table: '_CategoryToPost' }, // implicit m2m join table (columns A, B)
  { table: 'PostTag' },
  { table: 'Comment' },
  { table: 'Service' },
  { table: 'Project' },
  { table: 'SiteSetting' },
  { table: 'ContactMessage' },
  { table: 'ChatSession' },
  { table: 'ChatMessage' },
  { table: 'KbChunk' },
  { table: 'AdminUser' },
  { table: 'AiJob' },
]

async function verifyOnly() {
  console.log('── Verify mode ──')
  for (const { table } of PLAN) {
    const local = (sqlite.query(`SELECT COUNT(*) AS n FROM "${table}"`).get() as any).n
    const remote = await runSql(`SELECT COUNT(*) AS n FROM "${table}";`)
    const r = remote[0]?.n ?? '?'
    const ok = local === r ? '✓' : '✗ MISMATCH'
    console.log(`${ok}  ${table.padEnd(16)} sqlite=${local}  supabase=${r}`)
  }
}

async function migrate() {
  // 0. sanity: tables exist in Postgres?
  const existing = await runSql(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`
  )
  const names = new Set(existing.map((r: any) => r.table_name))
  for (const { table } of PLAN) {
    if (!names.has(table)) throw new Error(`Table "${table}" missing in Postgres — run the DDL first`)
  }
  console.log(`✓ all ${PLAN.length} tables exist in Supabase public schema`)

  // 1. truncate in FK-safe reverse order (idempotent re-runs)
  const rev = PLAN.map((p) => `"${p.table}"`).reverse().join(', ')
  await runSql(`TRUNCATE TABLE ${rev} CASCADE;`)
  console.log('✓ target tables truncated')

  // 2. copy
  for (const { table } of PLAN) {
    const rows = readTable(table)
    const cols = rows[0]
      ? Object.keys(rows[0])
      : (sqlite.query(`PRAGMA table_info("${table}")`).all() as any[]).map((c) => c.name)
    const stmts = insertStatements(table, rows, cols)
    let done = 0
    for (const s of stmts) {
      await runSql(s)
      done++
    }
    console.log(`✓ ${table.padEnd(16)} ${rows.length} rows in ${done} batch(es)`)
  }

  // 3. verify
  console.log('── Verification ──')
  let failures = 0
  for (const { table } of PLAN) {
    const local = (sqlite.query(`SELECT COUNT(*) AS n FROM "${table}"`).get() as any).n
    const remote = await runSql(`SELECT COUNT(*) AS n FROM "${table}";`)
    const r = remote[0]?.n ?? '?'
    const ok = local === r
    if (!ok) failures++
    console.log(`${ok ? '✓' : '✗'}  ${table.padEnd(16)} sqlite=${local}  supabase=${r}`)
  }
  if (failures > 0) throw new Error(`${failures} table(s) mismatched`)
  console.log('🎉 migration verified: all row counts match')
}

const isVerifyOnly = process.argv.includes('--verify-only')
if (isVerifyOnly) await verifyOnly()
else await migrate()
