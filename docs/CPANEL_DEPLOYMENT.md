# CPANEL_DEPLOYMENT — mehrdad.ir on cPanel + Node.js Application

Runbook for deploying the Next.js production build to the current cPanel
host **without SSH** (build off-host → upload artifact → Passenger run).

Last verified: 2026-09-02 — `npm install` + `npm run build` + plain
`node .next/standalone/server.js` all pass end-to-end (homepage, Prisma/
SQLite reads, posts API, PWA files, media, admin auth fail-closed,
WP 301 redirects, 404s, no `X-Powered-By`).

---

## 1. Prerequisites

- cPanel with the **Node.js → Create Application** feature
  (CloudLinux Node selector / Passenger).
- **Node.js 20.20.2** (Next.js 16 requires `>= 20.9.0`; 22 LTS also fine —
  see `engines` in `package.json`).
- cPanel File Manager (or FTP) for uploads — no SSH required.
- Disk: ~450 MB free in the app root (artifact ~219 MB unpacked + DB +
  headroom). RAM: 512 MB minimum for the app process; 1 GB comfortable.
- Build machine (this sandbox or any dev machine) with Node ≥ 20.9 and
  internet access to npm registry + Google Fonts (fonts are fetched at
  build time by `next/font`).

## 2. Build process (off-host)

One command on the build machine:

```bash
bash scripts/build-production.sh
```

This runs: `npm ci` (lockfile-aware) → `prisma generate` → `next build`
→ assembles `.next/standalone` → sanity checks (server.js, static, public,
**Prisma query engine present**) → packs `dist/mehrdad-deploy-<stamp>.tar.gz`
+ `SHA256SUMS`.

The artifact **never contains the database** — production data must never
be overwritten by a deploy (see §7). It also **never contains `.env`,
`.env.*` or `.z-ai-config`**: Next's standalone step copies build-machine
env files into `.next/standalone`, so the pack step excludes them and a
hard guard fails the build if any env/db/secret file slips through
(extracting over the app root would otherwise clobber server config).
All production config travels via **cPanel env vars (§3)** — process env
always wins over any stray file (verified: a planted bad `.env` cannot
hijack `DATABASE_URL`).

## 3. cPanel configuration

| Setting | Value |
|---|---|
| Node.js version | `20.20.2` |
| Application mode | `Production` |
| Application root | `mehrdad-app` (any name under the account; used below) |
| Application URL | domain `mehrdad.ir` mapped to the app root (root URL) |
| Application startup file | `server.js` (inside the extracted artifact) |

### Environment variables (cPanel UI, they persist across restarts)

```
TURSO_DATABASE_URL=libsql://mehrdad-goolro.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=<db-jwt-from-turso>       # rotate periodically
ADMIN_PASSWORD=<long-random-secret>        # openssl rand -base64 32
ADMIN_TOTP_SECRET=<base32-secret>          # OPTIONAL 2FA — bun scripts/generate-totp-secret.ts
SITE_ORIGIN=https://mehrdad.ir             # RECOMMENDED: hard CSRF allow-list
                                           # + Host-poisoning-proof 301
                                           # redirects (pentest round 2)
NODE_ENV=production                        # REQUIRED: the admin session
                                           # cookie is only Secure in
                                           # production mode
HOSTNAME=0.0.0.0
```

> **Turso mode is the production database (since artifact v4)**: with
> `TURSO_DATABASE_URL` set, `src/lib/db.ts` uses the libsql driver adapter
> (no native query-engine process, no DB file on the host — minimal LVE
> footprint). Data was migrated from local SQLite via
> `scripts/migrate-to-turso.ts`.
>
> `DATABASE_URL` is no longer required; if `TURSO_*` is missing the app
> falls back to the local SQLite file mode (development / emergency
> restore), which needs `DATABASE_URL` as before.

> **`HOSTNAME=0.0.0.0` is important**: the standalone server binds to
> `process.env.HOSTNAME || '0.0.0.0'`. Some cPanel servers export
> `HOSTNAME=<server-hostname>`, which makes the app unreachable (503).
> Set it explicitly.

`PORT` is injected by Passenger — do not set it manually.

## 4. First deployment (upload)

1. cPanel File Manager → create `~/mehrdad-app`.
2. Upload `mehrdad-deploy-<stamp>.tar.gz` → extract into `~/mehrdad-app`
   so that `~/mehrdad-app/server.js` exists.
3. Set the §3 environment variables (Turso DB + admin password).
   No `data/production.db` is needed anymore (DB lives in Turso).
4. (Optional, for AI chat) create `~/mehrdad-app/.z-ai-config`, `chmod 600`:
   ```json
   { "baseUrl": "https://<llm-endpoint>", "apiKey": "<your-key>" }
   ```
   The SDK also accepts `~/.z-ai-config` or `/etc/.z-ai-config`. Without
   the file the site runs fine; chat/admin-AI answer with a graceful
   error instead of crashing (verified fail-safe path in code).
5. cPanel → Node.js → **Run NPM Install** once if prompted (standalone is
   self-contained; usually not needed), then **Restart**.

## 5. Startup / Restart / Logs

- **Start/Restart**: cPanel → Setup Node.js App → Restart. Passenger
  runs the startup file (`server.js`) with `PORT` injected.
- **Logs**: cPanel Node.js App page shows stderr/stdout files
  (typically `~/logs/...-stderr.log`). Next writes startup banner +
  runtime errors there. Prisma query logging is **off** in production
  (`src/lib/db.ts` logs only `error`/`warn`).
- **Verify** after every restart:
  - `https://mehrdad.ir/` → 200
  - `https://mehrdad.ir/api/site` → JSON with services
  - `https://mehrdad.ir/robots.txt` → 200

## 6. Database (production) — Turso cloud

- **Primary**: Turso (libsql, SQLite-compatible) at
  `libsql://mehrdad-goolro.aws-ap-south-1.turso.io` (Mumbai region —
  closest to Iran among the account's available locations).
- Free starter plan: 5 GB storage, generous read/write quotas — plenty for
  a personal site. DB file no longer exists on the host.
- Config: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (cPanel env vars).
- `src/lib/db.ts` is dual-mode: Turso when `TURSO_DATABASE_URL` is set,
  otherwise local SQLite via `DATABASE_URL` (development / emergency).
- Backup: Turso platform backups + local snapshot
  `backups/custom.db.pre-turso-<stamp>` in the repo machine; the content
  snapshot also lives in `db/custom.db`.
- Re-sync content from local → Turso at any time (idempotent, wipes
  remote rows first):
  `TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… bun run scripts/migrate-to-turso.ts --yes`
- Schema changes later: edit `prisma/schema.prisma` → `prisma migrate
  diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
  → run the DDL on Turso (turso CLI `db shell` or a small script) →
  redeploy. No host-side tooling needed.

## 7. Update (new release) & why the DB survives

1. Build a new artifact → upload → extract into `~/mehrdad-app`
   (overwrite). `data/`, `.env` and `.z-ai-config` are **not part of the
   artifact**, so they are untouched (the build script enforces this).
2. Restart the application from cPanel.
3. Run the §5 verification.

The artifact excludes the DB by construction (`scripts/build-production.sh`
packs `.next/standalone` only; `data/` lives next to it, not inside).

## 8. Backup

- Turso platform: automatic platform backups + optional point-in-time on
  paid tiers; free tier — re-run `scripts/migrate-to-turso.ts` from a
  local snapshot to rebuild the cloud DB at any time.
- Local snapshot of record: `backups/custom.db.pre-turso-<stamp>` (and
  `db/custom.db`), plus `~/mehrdad-app/public/media/` + `public/uploads/`
  (~100 MB, static) via cPanel backup.
- `.env`-equivalent values (admin password, Turso token, AI key) — store
  in a password manager, never in the repo.

## 9. Rollback

- **App**: keep the previous `mehrdad-deploy-*.tar.gz`; extract it back +
  Restart (2 minutes, no DB touched — DB is remote Turso).
- **DB**: DB is in Turso (independent of the host). For content rollback:
  restore a local snapshot and re-run `scripts/migrate-to-turso.ts --yes`.
- **Domain/docroot**: keep the old site archived under `m.mehrdad.ir`
  (§10); switching `mehrdad.ir` docroot back to it is a cPanel UI change.

## 10. Old-site migration → m.mehrdad.ir (safe path)

No DNS changes required (same server). Order matters:

1. **Full cPanel backup** (Home → Backup → Download Full Account Backup).
2. cPanel → Domains/Subdomains → create `m.mehrdad.ir` with its own
   docroot (e.g. `public_html_m`).
3. **Move** (not copy-then-delete) the current WordPress files from the
   `mehrdad.ir` docroot into the `m.mehrdad.ir` docroot; export/dump the
   WP database and import it under a preserved name. **Delete nothing.**
4. Set the `mehrdad.ir` docroot to `~/mehrdad-app` (cPanel → Domains →
   document root) — or, safer, create the Node.js App on a **staging
   subdomain first** (e.g. `new.mehrdad.ir`), verify, then flip the main
   docroot.
5. SSL: run AutoSSL for the new subdomain (Let's Encrypt) before testing.

## 11. SEO / domain cutover checklist

Already shipped in the app (verified in production test):

- `src/middleware.ts` 301s **173 old WP paths + 83 `?p=`/`?page_id=` ids**
  → new views (`/#blog/<slug>`, `/#services`, …), including encoded
  Persian slugs and truncated-slug fuzzy fallback.
- `robots.txt` allows all major crawlers; `X-Powered-By` removed;
  PWA files and media excluded from redirect matcher.

Post-cutover (owner/host side):

- Force HTTPS + non-www canonical in cPanel (Force HTTPS Redirect).
- Search Console: submit `mehrdad.ir`, request reindex of top pages;
  watch 404s — any legacy miss goes into `src/lib/wp-redirects.json`
  (then redeploy).
- Known architectural limitation (documented, not a deploy blocker):
  the site is a single-URL SPA with hash views — per-article canonical
  URLs/sitemap entries are a future server-routing phase (ROADMAP).

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| 503 / app unreachable | `HOSTNAME` env hijacked by host | set `HOSTNAME=0.0.0.0`, Restart |
| 503 after deploy | wrong startup file path | must be `~/mehrdad-app/server.js` (artifact root) |
| API 500, `Query engine not found` | only in local-file fallback mode; artifact built on different OS / engine missing | rebuild with `scripts/build-production.sh` (checks engine) or copy `node_modules/.prisma/client/libquery_engine-linux-*.so.node` into `~/mehrdad-app/node_modules/.prisma/client/` |
| API 500 on boot, `Cannot find module '@prisma/adapter-libsql'` or libsql native binding error | artifact missing the external libsql packages | rebuild with current `next.config.ts` (`serverExternalPackages`) — v4+ already fixed |
| API 500, `TURSO_DATABASE_URL is set but TURSO_AUTH_TOKEN is missing` | partial Turso env | set both vars in cPanel env UI, Restart |
| API 500, `Configuration file not found` (chat only) | `.z-ai-config` missing | create per §4.4 (site still works) |
| Admin always 401 | session expired (12h) or `ADMIN_PASSWORD` env unset/mismatch | re-login; if it persists, set `ADMIN_PASSWORD` in cPanel env vars, Restart (changing it also invalidates all sessions — by design) |
| Admin login works but "insecure cookie" warnings | `NODE_ENV` is not `production` → session cookie without `Secure` flag | set Application mode `Production` / env `NODE_ENV=production`, Restart |
| Old URL gives 404 instead of 301 | URL missing from map | add to `src/lib/wp-redirects.json`, redeploy |
| Styles/images broken | static not copied into standalone | rebuild via the script (it verifies) |
| DB writes lost / DB empty | `TURSO_*` env vars missing → fell back to nonexistent local file | set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`, Restart |
