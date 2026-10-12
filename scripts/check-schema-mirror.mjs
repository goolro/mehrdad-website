#!/usr/bin/env node
/**
 * Schema-mirror drift guard — guards against the exact outage class of
 * 2026-10-08 (studio models) and 2026-10-12 (DailyProduct).
 *
 * WHY THIS EXISTS:
 * The Vercel build generates the Prisma client from
 * prisma/schema.postgres.prisma (Postgres/Supabase mirror), while local dev,
 * cPanel and CI use prisma/schema.prisma (SQLite). When a model is added to
 * the SQLite schema but the mirror is not synced, CI stays green (it builds
 * from the SQLite schema) while every Vercel deploy fails with
 * `tsc: Property '<model>' does not exist on type 'PrismaClient'` —
 * production freezes on the last good deploy until someone notices.
 *
 * This check fails fast in CI (before the build) whenever the two schemas
 * declare different sets of models or enums.
 *
 * Scope: model/enum PRESENCE. Field-level drift is caught by the regular
 * typecheck against the SQLite client and by the Vercel build itself.
 *
 * Run: node scripts/check-schema-mirror.mjs   (exit 0 = in sync, 1 = drift)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const SQLITE = path.join(root, '..', 'prisma', 'schema.prisma');
const POSTGRES = path.join(root, '..', 'prisma', 'schema.postgres.prisma');

/** Extract top-level `model X` / `enum X` names from a Prisma schema. */
function declarations(file) {
  const text = readFileSync(file, 'utf8');
  const models = [...text.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]);
  const enums = [...text.matchAll(/^enum\s+(\w+)/gm)].map((m) => m[1]);
  return { models: new Set(models), enums: new Set(enums) };
}

const a = declarations(SQLITE);
const b = declarations(POSTGRES);

const problems = [];
for (const m of a.models) if (!b.models.has(m)) problems.push(`model "${m}" exists in schema.prisma but is MISSING from schema.postgres.prisma`);
for (const m of b.models) if (!a.models.has(m)) problems.push(`model "${m}" exists in schema.postgres.prisma but is MISSING from schema.prisma`);
for (const e of a.enums) if (!b.enums.has(e)) problems.push(`enum "${e}" exists in schema.prisma but is MISSING from schema.postgres.prisma`);
for (const e of b.enums) if (!a.enums.has(e)) problems.push(`enum "${e}" exists in schema.postgres.prisma but is MISSING from schema.prisma`);

if (problems.length === 0) {
  console.log(`schema mirror in sync ✓ (${a.models.size} models, ${a.enums.size} enums)`);
  process.exit(0);
}

console.error('SCHEMA MIRROR DRIFT DETECTED — the Vercel build WILL fail:\n');
for (const p of problems) console.error(`  - ${p}`);
console.error('\nFix: copy the missing declarations from prisma/schema.prisma into');
console.error('prisma/schema.postgres.prisma (keep both files identical except for the');
console.error('generator/datasource blocks), then commit both together.');
process.exit(1);
