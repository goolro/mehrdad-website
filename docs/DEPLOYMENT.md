# DEPLOYMENT — mehrdad.ir

Last updated: 2026-09-02

**Primary target: current cPanel host with Node.js Application (Passenger),
no-SSH artifact deployment.** Full runbook: **`docs/CPANEL_DEPLOYMENT.md`**
(prerequisites, cPanel settings, env vars, SQLite strategy, update/rollback,
old-site migration to `m.mehrdad.ir`, troubleshooting).

## Verified facts (production test, 2026-09-02)

- `npm install` + `npm run build` succeed from a clean tree
  (`package-lock.json` committed; `prisma generate` runs inside `build`).
- Plain **Node ≥ 20.9** runs the server — **Bun is NOT required**
  (`npm start` → `node .next/standalone/server.js`).
- `.next/standalone` is complete: `server.js`, `.next/static`, `public/`
  (media, uploads, icons, manifest, sw.js, robots.txt) and the **Prisma
  query engine** (`libquery_engine-*.so.node`) are all present.
- Runtime checks passed on the standalone server: homepage, `/api/site`
  (Prisma/SQLite read), `/api/posts`, PWA files, media assets, admin auth
  fail-closed (401 wrong / 200 correct), WP 301 redirect, 404 page,
  `X-Powered-By` absent.
- Artifact builder: `bash scripts/build-production.sh` →
  `dist/mehrdad-deploy-<stamp>.tar.gz` + SHA256SUMS, **database excluded**
  by design so production data survives every deploy.

## Target topology

- **mehrdad.ir** — this Next.js app (Node 20 Passenger, SQLite on disk at
  `<app-root>/data/production.db`, persistent across deploys).
- Legacy WordPress: moved intact to **m.mehrdad.ir** on the same host
  (full backup first; nothing deleted; rollback = docroot swap).
- `src/middleware.ts` 301s every legacy URL pattern (173 paths + 83 wpIds)
  → no DNS change needed when both live on the same cPanel server.

## Deploy checklist (summary — details in CPANEL_DEPLOYMENT.md)

1. Build off-host: `bash scripts/build-production.sh`.
2. Upload + extract artifact into `~/mehrdad-app` (startup file `server.js`).
3. cPanel Node.js App: Node **20.20.2**, mode Production,
   env: `DATABASE_URL` (absolute path to `data/production.db`),
   `ADMIN_PASSWORD`, `NODE_ENV=production`, `HOSTNAME=0.0.0.0`.
4. Seed `data/production.db` once from `db/custom.db` (repo snapshot).
5. Restart → run the verification list (CPANEL_DEPLOYMENT.md §5).

## Backups

- `data/production.db` (~3 MB) + `public/media/` + `public/uploads/`
  (~100 MB static) — copy via cPanel backup/File Manager.
- Secrets (`ADMIN_PASSWORD`, `.z-ai-config`) — password manager only.

## Known environment notes

- SQLite single-node is fine for a personal site; Postgres swap later is
  a schema-portable **owner decision** (not performed).
- Fonts are fetched at build time (`next/font/google`) — build machines
  need internet; the host never does.
- `middleware` convention: Next 16 calls it proxy internally; the code
  lives in `src/middleware.ts` (build output shows "Proxy (Middleware)").

## Vercel mirror + Supabase Postgres (2026-09-05)

A second, fully-managed deployment target alongside cPanel. Both targets
serve the same content; cPanel stays primary unless the owner decides
otherwise.

### Topology

- **Hosting**: Vercel project `mehrdad-website` (CLI deploy from this repo;
  `vercel.json` overrides the build to
  `prisma generate --schema prisma/schema.postgres.prisma && next build`).
- **Database**: Supabase Postgres, project ref `gcaksemjwkhqkyhaseui`
  (ap-northeast-1). Schema mirror: `prisma/schema.postgres.prisma` — an
  exact copy of the `prisma/schema.prisma` models with
  `provider = "postgresql"`. **Keep the two schemas in sync** after any
  model change (copy the model block; header differs).
- **App DB role**: `mehrdad_app` (least-privilege, created via the
  Management API). Note: the Supavisor **shared pooler accepts the
  `postgres` role only** on the free plan — `mehrdad_app` is usable for
  direct/paid-pooler connections.

### Data pipeline (no direct PG connection needed)

`scripts/migrate-sqlite-to-supabase.ts` copies ALL rows over HTTPS via the
Supabase Management API SQL endpoint (free-tier direct endpoint is
IPv6-only; sandbox/CI hosts are usually IPv4):

```bash
SUPABASE_REF=<ref> SUPABASE_TOKEN=<pat> SQLITE_DB=db/custom.db \
  bun scripts/migrate-sqlite-to-supabase.ts            # truncate + copy + verify
bun scripts/migrate-sqlite-to-supabase.ts --verify-only # counts only
```

Content source of record: the local `db/custom.db` (gitignored). If it is
ever empty again, rebuild it first with `bun analysis/import_content.ts`
(replays `analysis/migration_data.json` + `translations.json` +
`wp_comments.json` per docs/CONTENT_MIGRATION.md) then
`bun analysis/seed_tags.ts --apply`.

### Runtime connection (Vercel env only)

`DATABASE_URL` = Supavisor **transaction pooler** (serverless-safe, IPv4):

```
postgresql://postgres.<ref>:<db-password>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=10
```

`src/lib/db.ts` needs **no change**: with no `TURSO_*` vars set it uses the
generated postgres client + `DATABASE_URL`. Prisma's `pgbouncer=true`
disables prepared statements (required behind transaction-mode PgBouncer).

Other Vercel env vars: `ADMIN_PASSWORD` (its own value — sessions are
HMAC-signed per deployment), `SITE_ORIGIN=https://mehrdad-website.vercel.app`
(update if a custom domain is attached), `NEXT_TELEMETRY_DISABLED=1`.

### Deploy

```bash
vercel link --project mehrdad-website
vercel deploy --prod
```

Attaching the real domain later: add `mehrdad.ir` in the Vercel project →
point DNS (`cname.vercel-dns.com`) at the registrar → update `SITE_ORIGIN`.
