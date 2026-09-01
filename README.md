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

## Current status (2026-09-01)

- ✅ **Core site live in development**: home, work, writing (83 migrated
  articles + 17 comments), lab, about, contact, admin panel
- ✅ **Migration complete**: evidence-based publication dates (Wayback
  Machine CDX probes + upload-path/comment signals), legacy links
  internalized (316 occurrences now route inside the app), media mirrored
  locally (`public/uploads/wp/`, `public/media/`)
- ✅ **PWA**: manifest, service worker, install prompt, app shortcuts
- ✅ **Theme engine shipped**: shared design-token system, 5 themes
  (Default ☼, Autumn 🍂, Winter ❄️, Digital ⚡, Nowruz 🌱) with animated
  backgrounds × independent persisted Light/Dark toggle
  ([docs/THEME_ENGINE.md](docs/THEME_ENGINE.md))
- 🔜 **TWA (Android)**: config prepared (`twa-manifest.json`,
  `MOBILE_APP.md`); signed build awaits the owner's keystore
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
| Data | Prisma ORM + SQLite (`db/custom.db`) |
| Rendering | React Server Components, dynamic reads, API routes for forms/comments |
| Language | English (default) + Persian `fa` (full RTL) — persisted preference |
| PWA | `manifest.json` + service worker + install prompt + shortcuts |
| SEO | Metadata API, JSON-LD (Person / WebSite / Article), `sitemap.xml`, `robots.txt`, `/feed.xml`, 301 redirect layer for all legacy WordPress URLs |

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Site structure

The app is a single-route SPA with hash routing (mobile-app feel, PWA
navigation, no full page reloads):

- `/#home` — positioning, approach, selected work, latest writing, contact CTA
- `/#work` + `/#work/<slug>` — real projects with honest status
  (Idea / Research / Concept / Designing / Building / Testing / Beta / Live /
  Paused / Archived)
- `/#blog` + `/#blog/<slug>` — articles (83 migrated + new), category
  filters, search, pagination, moderated threaded comments
- `/#lab` — experiments without a business model yet
- `/#about` — personal narrative (not a CV)
- `/#contact` — one contact funnel (AI/product solution / project /
  collaborate / partnership / connecting / other)
- `/#admin` — authenticated admin panel (articles, projects, comments
  moderation, contact leads, site settings incl. theme, AI content tools)

API (all under `/api`): `posts`, `posts/[slug]`, `posts/[slug]/comments`,
`site` (aggregated nav/categories/settings), `chat` (AI assistant,
grounded in site content), `contact`, `admin/*` (auth + content + AI
tools; every admin call checks the `x-admin-key` header against the
env-only `ADMIN_PASSWORD`).

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
| [MOBILE_APP.md](MOBILE_APP.md) | PWA (shipped) + TWA/Android packaging plan |

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
- browser-locale language suggestion banner (EN default stays)
- English translations for remaining Persian-only archive posts
- curated tags from real content (replacing the legacy tag dump)
