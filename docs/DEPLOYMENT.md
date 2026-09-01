# DEPLOYMENT — mehrdad.ir

Last updated: 2026-09-01

## Target topology

- **mehrdad.ir** — this Next.js app (Node runtime, SQLite on disk).
- Legacy WordPress stays reachable at the old host **only until DNS/cutover**;
  `src/proxy.ts` already 301s every legacy URL pattern, so the cutover is a
  DNS flip.

## Deploy checklist

1. **Provision**: Node ≥ 20 (or Bun), persistent disk for `db/` and
   `public/media/`.
2. **Env**: `DATABASE_URL=file:<abs-path>/db/custom.db`.
3. **Install & build**:
   ```bash
   bun install
   bun run db:push        # ensure schema
   bun run lint
   ```
4. **Content**:
   - Repo ships `db/custom.db` (migrated snapshot). For a fresh pull of the
     legacy content: `bunx tsx scripts/migrate.ts` (idempotent; re-downloads
     missing media including git-ignored `*.mp4` videos).
5. **Start**:
   ```bash
   bun run build
   bun run start          # standalone server
   ```
   (Or run behind a process manager; set `PORT` as needed.)
6. **Post-deploy verification** (all must pass):
   - `GET /` → 200, hero renders
   - `GET /sitemap.xml`, `/robots.txt`, `/feed.xml` → 200
   - `GET /<legacy-english-slug>` → 301 → `/writing/<slug>`
   - `GET /<legacy-persian-encoded-slug>` → 301 → `/writing/<slug>`
   - `GET /services`, `/category/anything`, `/wp-content/uploads/2021/11/x` → 301
   - one article page: honest date badge, comments load
   - contact form submits (row appears in `ContactMessage`)

## DNS cutover

- Point `mehrdad.ir` (+ `www`) at the new host.
- Keep the legacy WordPress export (DB + `wp-content/uploads`) archived —
  the migration can be re-run from it only while it is online; the REST API
  is the current source.
- After cutover, watch 404s: any legacy URL pattern that misses the redirect
  map → add to `scripts/gen-redirects.ts` rules and redeploy.

## Backups

- SQLite: nightly file copy (`db/custom.db`) — content is small (< 5 MB).
- `public/media/`: include in backup scope (git excludes `*.mp4` videos).

## Known environment notes

- SQLite in production assumes a single-node deployment (fine for a
  personal site). If scaling later: swap Prisma datasource to Postgres —
  schema is portable.
- `middleware` convention renamed to **proxy** in Next.js 16 — legacy
  redirects live in `src/proxy.ts`.
