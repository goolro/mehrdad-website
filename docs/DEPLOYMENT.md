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

## Vercel mirror + Supabase Postgres (2026-09-05) — DEPLOYED ✅

A second, fully-managed deployment target alongside cPanel. Both targets
serve the same content; cPanel stays primary unless the owner decides
otherwise. **Production URL: https://mehrdad-website.vercel.app
(first prod deploy 2026-09-05; homepage, /blog/[slug], /work/[slug],
/api/site, /api/posts, sitemap, feed all verified against Supabase data
— 82 published posts, 21 categories, 32 tags, 17 comments).**

### Three build fixes found during the first Vercel deploy

1. `prisma/schema.postgres.prisma`: `rhel-openssl-3.2` binary target is
   unknown to Prisma 6.19.3 (Vercel build image = OpenSSL 3.0) →
   `binaryTargets = ["native", "rhel-openssl-3.0.x"]`.
2. `tsconfig.json`: `scripts/` added to `exclude` — the migration scripts
   import `bun:sqlite`, which the Vercel TypeScript check cannot resolve.
3. `next.config.ts`: `output` is now
   `process.env.VERCEL ? undefined : "standalone"` — Vercel's builder
   fails with `ENOENT .next/next-server.js.nft.json` when standalone
   output is enabled (standalone stays for the cPanel artifact flow).

### Custom domain: NONE (owner decision, 2026-09-05)

The owner decided Vercel has **no involvement with the `mehrdad.ir`
domain** — the domain stays on the Iran host, untouched. The canonical
Vercel URL is therefore `https://mehrdad-website.vercel.app` (SITE_ORIGIN
matches it; sitemap/feed/metadataBase/admin origin-check are all
consistent). No DNS records were added or required.

Git auto-deploy (`vercel git connect`) needs a one-time **Login
Connection** between the owner's GitHub and Vercel accounts (dashboard
action only — not possible via token). Until then, deployments run from
this repo via CLI: `vercel deploy --prod`.

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
  `postgres` role only** on the free plan — the runtime `DATABASE_URL`
  therefore uses the `postgres` role via the transaction pooler.

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

### AI-SEO layer (2026-09-05)

Implemented so search engines AND generative engines (ChatGPT, Claude,
Perplexity, Google AI) can discover, understand and cite the site:

- `src/app/robots.ts` (dynamic) — explicitly allows the major AI crawlers
  (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai,
  PerplexityBot, Google-Extended, Applebot(+Extended), meta-externalagent,
  Amazonbot, CCBot); sitemap URL follows `SITE_ORIGIN`. Static
  `public/robots.txt` removed (route conflict + stale sitemap host).
- `/llms.txt` (dynamic route, text/plain) — LLM-discovery manifest built
  from the live DB: pages, services, projects, ALL published posts with
  excerpts + citation hints. Graceful static fallback if DB is down.
- JSON-LD via `src/components/site/JsonLd.tsx` (nonce-aware → passes the
  strict CSP): WebSite+Person `@graph` on home, BlogPosting+BreadcrumbList
  on posts, CreativeWork on projects.
- Layout metadata: twitter summary card, default og:image, robots
  `max-image-preview:large` / `max-snippet:-1`.

Already in place before this layer: per-page metadata + canonicals,
dynamic sitemap + RSS feed, full SSR (no JS required to read content),
PWA manifest.
