# mehrdad.ir

**I design businesses and products with care, and build them fast with AI.**
**کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI سریع می‌سازمش.**

Live website: **https://mehrdad.ir**
Repository: **https://github.com/goolro/mehrdad-website**

---

## What this project is

The complete rebuild of mehrdad.ir — the personal site of **Mehrdad**, an
independent product builder who researches, designs and builds real
businesses and products.

The site is:

- the **public identity** (positioning + approach)
- the **proof layer** (real projects with honest status)
- the **knowledge layer** (writing from real work, including the fully
  migrated historical archive with *original* publication dates restored)
- the **contact funnel** (one clear path to start a conversation)

## Deployment (cPanel, no SSH)

- Verified production path: build off-host → upload artifact → cPanel
  Node.js App (Node 20, Passenger) → `node server.js`. Bun not required.
- Runbook: [docs/CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md) ·
  Overview: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Artifact builder: `bash scripts/build-production.sh` (database excluded —
  production SQLite lives in `data/production.db`, survives every deploy).

## Current status (2026-09-05)

- ✅ **Real routes + server-rendered content**: home, `/services`, `/fde`,
  `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/contact`,
  `/admin` — every page returns real content in the initial HTML
  (`curl /blog/<slug>` shows the full article with no JS). Legacy
  `#…` deep links and WordPress URLs still resolve via 301s + a
  client-side hash upgrade
- ✅ **Writing archive live**: 83 migrated articles + 17 comments with
  evidence-based publication dates
- ✅ **Migration complete**: legacy links internalized (316 occurrences
  route inside the app), media mirrored locally (`public/uploads/wp/`,
  `public/media/`)
- ✅ **SEO plumbing**: dynamic `sitemap.xml` (DB-driven), `robots.txt`
  sitemap reference, `/feed.xml` RSS, per-page canonical/OG metadata
- ✅ **PWA**: manifest, service worker, install prompt, app shortcuts
- ✅ **Theme engine shipped**: shared design-token system, 5 themes
  (Default ☼, Autumn 🍂, Winter ❄️, Digital ⚡, Nowruz 🌱) with animated
  backgrounds × independent persisted Light/Dark toggle — first-paint
  flash eliminated by a pre-paint boot script
  ([docs/THEME_ENGINE.md](docs/THEME_ENGINE.md))
- ✅ **Approved brand positioning everywhere**: the slogan is the homepage
  H1 (EN+FA), metadata/OG/manifests, footer motto, About identity and the
  AI persona; BUILD/HELP/SHARE trio + ecosystem chain rendered on the
  homepage; project cards show each project's real status
  ([docs/BRAND_STRATEGY.md](docs/BRAND_STRATEGY.md))
- ✅ **Security posture**: HMAC-signed session cookies with revocation,
  CSRF origin anchoring, strict nonce CSP (no `unsafe-inline` scripts in
  production), rate limits, XSS sanitizer layers, optional TOTP 2FA
  (`ADMIN_TOTP_SECRET`), 132 automated pentest checks across two rounds
  ([docs/SECURITY.md](docs/SECURITY.md))
- ✅ **CI + repo hygiene**: GitHub Actions runs lint → typecheck →
  production build on every push/PR; Dependabot + secret scanning + push
  protection enabled
- ✅ **Bilingual archive**: all 82 published posts carry full English
  content; fa-locale visitors get a one-time Persian suggestion banner
  (EN default stays, D-019)
- ✅ **Curated topic tags (D-020)**: fixed 32-tag bilingual taxonomy with
  constrained per-post assignment — filterable "Topics" row in the blog
- 🔜 **TWA (Android)**: everything prepared — Bubblewrap config
  (`twa-manifest.json`), `scripts/generate-assetlinks.ts`, full runbook
  ([docs/MOBILE_TWA.md](docs/MOBILE_TWA.md)); signed build + Play listing
  await the owner's keystore
- 🔜 **cPanel deploy**: artifact v5 must be rebuilt from this commit —
  routing/CSP changed substantially
  ([docs/CPANEL_DEPLOYMENT.md](docs/CPANEL_DEPLOYMENT.md))
- 🌐 **Language**: English default, full Persian (RTL) secondary — every
  UI string translated

## Philosophy

**Research → Design → Build → Learn → Share → Build again.**

Every product starts from a real question, gets designed with care, and is
built fast with AI. Results, decisions and failures are documented openly.

## Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons |
| Font | Vazirmatn (Persian-first typography) |
| Data | Prisma ORM — SQLite (dev) / Turso cloud (`@prisma/adapter-libsql`) in production |
| Rendering | Server components + dynamic SSR on every route (per-request CSP nonce), API routes for forms/comments/chat |
| Language | English (default) + Persian `fa` (full RTL) — persisted preference |
| PWA | `manifest.json` + service worker + install prompt + shortcuts |
| SEO | Metadata API (per-route canonical/OG), JSON-LD (Person / WebSite / Article), dynamic `sitemap.xml`, `robots.txt`, `/feed.xml` RSS, 301 redirect layer for all legacy WordPress URLs |

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Site structure

Every section is a real, server-rendered, indexable URL (hash routing
was retired in D-022; old `/#…` bookmarks are upgraded automatically):

- `/` — positioning, approach, selected work, latest writing, contact CTA
- `/work` + `/work/<slug>` — real projects with honest status
  (Under construction / Seeking collaborators / Launched / Coming soon)
- `/blog` + `/blog/<slug>` — articles (83 migrated + new), category
  filters, search, pagination, moderated threaded comments
- `/services` — service grid; `/fde` (alias `/lab`) — Forward Deployed
  Engineering, the core service
- `/about` — personal narrative (not a CV)
- `/contact` — one contact funnel (AI/product solution / project /
  collaborate / partnership / connecting / other)
- `/admin` — authenticated admin panel (articles, projects, comments
  moderation, contact leads, site settings incl. theme, AI content tools;
  optional TOTP second factor)
- `/sitemap.xml`, `/robots.txt`, `/feed.xml` — SEO plumbing

API (all under `/api`): `posts`, `posts/[slug]`, `posts/[slug]/comments`,
`site` (aggregated nav/categories/settings), `chat` (AI assistant,
grounded in site content), `contact`, `admin/*` (auth + content + AI
tools; every admin call verifies the HMAC-signed session cookie against
the env-only `ADMIN_PASSWORD`, with an optional TOTP second factor).

## Current projects

| Project | Status | What it is |
|---|---|---|
| شهر هوشمند (Smart City) | Designing | multi-layer smart city ecosystem research & design |
| کریدور ریلی ایران | Research | phased plan for an Iranian rail corridor |
| BIZPAL | Building | data-driven sales/marketing/advertising startup |
| کلاب مهرداد (Clubhouse) | Archived | 2021 weekly audio rooms (Lab) |

## Development

```bash
bun install
cp .env.example .env     # then set DATABASE_URL + ADMIN_PASSWORD
bun run db:push          # create/update SQLite schema (db/custom.db)
bun run dev              # http://localhost:3000
bun run lint             # ESLint
```

Environment (`.env`, gitignored — see `.env.example` for names only):

- `DATABASE_URL=file:../db/custom.db` (relative to `prisma/schema.prisma`)
- `ADMIN_PASSWORD` — admin panel password; **no default exists**. If unset,
  every admin request is rejected (fail closed). `src/lib/admin.ts` reads it.

The historical migration pipeline lives in `analysis/` (92 scripts + JSON
evidence, e.g. `wp_content.json`, `rewrite_links.ts`, `assign_dates.ts`).
These document exactly how `db/custom.db` was produced from the legacy
WordPress export and are kept for reproducibility and audit.

Media is mirrored to `public/media/` and `public/uploads/wp/` (original
WordPress upload paths preserved, e.g. `/uploads/wp/2021/11/…`), including
the large `*.mp4` files and PDFs referenced inside articles — the site is
self-sufficient and does not hotlink the old WordPress host. See
[DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md).

## Documentation

| Doc | Contents |
|---|---|
| [docs/AUDIT.md](docs/AUDIT.md) | Phase-0 audit: what existed, what was broken, full content/date forensics |
| [docs/MIGRATION_REPORT.md](docs/MIGRATION_REPORT.md) | per-post date decisions + evidence, counts, failures |
| [docs/REDIRECTS.md](docs/REDIRECTS.md) | old URL → new URL → status map |
| [docs/CONTENT_MIGRATION.md](docs/CONTENT_MIGRATION.md) | migration rules (dates, slugs, comments, media) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | system & content model |
| [docs/CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) | what gets published and why |
| [docs/BRAND_STRATEGY.md](docs/BRAND_STRATEGY.md) | positioning, voice, anti-patterns |
| [docs/PRODUCT_STRATEGY.md](docs/PRODUCT_STRATEGY.md) | brand model + product direction |
| [docs/SEO.md](docs/SEO.md) | technical SEO decisions |
| [docs/DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md) | local setup |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | deployment runbook |
| [docs/ROADMAP.md](docs/ROADMAP.md) | phased roadmap + open decisions |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | release history |
| [docs/DECISIONS.md](docs/DECISIONS.md) | decision log with rationale |
| [docs/SECURITY.md](docs/SECURITY.md) | secret policy, admin auth model, incident log |
| [docs/THEME_ENGINE.md](docs/THEME_ENGINE.md) | design-token system, 5 themes, Light/Dark, how to add a theme |
| [MOBILE_APP.md](MOBILE_APP.md) | PWA (shipped) + TWA overview |
| [docs/MOBILE_TWA.md](docs/MOBILE_TWA.md) | Android TWA runbook: keystore, build, assetlinks, Play checklist |

## Content migration (headline rules)

1. **Original publication date is authoritative.** Historical dates were
   reconstructed from an evidence chain (comment dates → media upload paths →
   in-text references) because the legacy WordPress dates were corrupted by
   re-publication. Every decision is listed with its evidence in
   [docs/MIGRATION_REPORT.md](docs/MIGRATION_REPORT.md).
2. `publishedAt`, `updatedAt` and `migratedAt` are separate fields — the
   migration date is never used as the publication date.
3. Imprecise dates are rendered honestly («تاریخ تقریبی» + month/year
   precision) instead of faking day precision.
4. Legacy URLs are preserved: original WP slugs (including percent-encoded
   Persian slugs) resolve via the in-app slug candidates layer
   (`src/lib/slug-lookup.ts`), and the legacy redirect map is kept in
   `analysis/` (`gen_redirects.ts`, `docs/REDIRECTS.md`).
5. All 17 historical comments migrated with original dates and thread
   structure; spam-shaped records stay unapproved. New comments enter a
   moderation queue.

## SEO

Semantic HTML, single H1 per page, canonical URLs, Open Graph + Twitter
cards, JSON-LD structured data, `sitemap.xml`, `robots.txt`, RSS at
`/feed.xml`. The 4,872 legacy junk tag archives are intentionally retired via
redirect. Details: [docs/SEO.md](docs/SEO.md).

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md). Highlights:

- TWA/Android packaging (config ready; awaits owner keystore)
- owner decisions: publish/draft for the empty smart-waste financials
  post (7995), web-stories import, game project entries
- alt-text completion for mirrored images (legacy coverage ~52%)
- Writing → LinkedIn repurposing templates
