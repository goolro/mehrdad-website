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
