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
be overwritten by a deploy (see §7).

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
DATABASE_URL=file:/home/CPANELUSER/mehrdad-app/data/production.db
ADMIN_PASSWORD=<long-random-secret>        # openssl rand -base64 32
NODE_ENV=production
HOSTNAME=0.0.0.0
```

> **`HOSTNAME=0.0.0.0` is important**: the standalone server binds to
> `process.env.HOSTNAME || '0.0.0.0'`. Some cPanel servers export
> `HOSTNAME=<server-hostname>`, which makes the app unreachable (503).
> Set it explicitly.

`PORT` is injected by Passenger — do not set it manually.

## 4. First deployment (upload)

1. cPanel File Manager → create `~/mehrdad-app`.
2. Upload `mehrdad-deploy-<stamp>.tar.gz` → extract into `~/mehrdad-app`
   so that `~/mehrdad-app/server.js` exists.
3. Create the persistent data dir **once**:
   `~/mehrdad-app/data/` and seed it (see §7).
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

## 6. SQLite configuration (production)

- Provider: SQLite via Prisma — **no database server needed**.
- `DATABASE_URL` must be an **absolute** `file:` path (relative paths are
  resolved against `schema.prisma` location at generate-time and break
  between build/runtime — absolute paths avoid all ambiguity).
- The DB lives at `~/mehrdad-app/data/production.db`:
  - **outside** any `.next` folder (rebuilds wipe `.next`),
  - inside the app account (writable by the Passenger user),
  - **not** web-served (never under `public_html`).
- Seed on first deploy: upload the current `db/custom.db` from the repo
  as `data/production.db` (it is the migrated content snapshot).
- Schema changes later (rare, e.g. new feature): `prisma db push` cannot
  run without SSH → do it as: download `production.db` → run
  `DATABASE_URL=file:<downloaded> npx prisma db push` locally → upload
  back → Restart. Keep the pre-change download as the backup.
- Single-node assumption is fine for a personal site; Postgres migration
  is possible later (schema is portable) — **owner decision, not done**.

## 7. Update (new release) & why the DB survives

1. Build a new artifact → upload → extract into `~/mehrdad-app`
   (overwrite). `data/` and `.z-ai-config` are **not part of the
   artifact**, so they are untouched.
2. Restart the application from cPanel.
3. Run the §5 verification.

The artifact excludes the DB by construction (`scripts/build-production.sh`
packs `.next/standalone` only; `data/` lives next to it, not inside).

## 8. Backup

- Nightly/weekly cPanel backup or cron-less File Manager copy of:
  - `~/mehrdad-app/data/production.db` (2.6 MB — tiny)
  - `~/mehrdad-app/public/media/` + `public/uploads/` (~100 MB, static)
- `.env`-equivalent values (admin password, AI key) — store in a password
  manager, never in the repo.

## 9. Rollback

- **App**: keep the previous `mehrdad-deploy-*.tar.gz`; extract it back +
  Restart (2 minutes, no DB touched).
- **DB**: restore the last `production.db` backup copy + Restart.
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
| API 500, `Query engine not found` | artifact built on different OS / engine missing | rebuild with `scripts/build-production.sh` (checks engine) or copy `node_modules/.prisma/client/libquery_engine-linux-*.so.node` into `~/mehrdad-app/node_modules/.prisma/client/` |
| API 500, `Configuration file not found` (chat only) | `.z-ai-config` missing | create per §4.4 (site still works) |
| Admin always 401 | `ADMIN_PASSWORD` env unset/mismatch | set in cPanel env vars, Restart |
| Old URL gives 404 instead of 301 | URL missing from map | add to `src/lib/wp-redirects.json`, redeploy |
| Styles/images broken | static not copied into standalone | rebuild via the script (it verifies) |
| DB changes lost after deploy | DB was placed inside artifact path | move DB to `data/production.db`, update `DATABASE_URL` |
