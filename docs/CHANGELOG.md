# CHANGELOG

All notable changes to mehrdad.ir. Format: Keep-a-Changelog-ish, newest first.

## [Unreleased]

### Added
- **PWA completion**: manifest, service worker (offline shell + API/image
  cache), AI-generated icons (192/512/180 + maskable), in-browser install
  prompt, app shortcuts (Blog / AI Chat / Contact), iOS standalone meta.
- **TWA preparation**: `twa-manifest.json` (package `ir.mehrdad.twa`,
  notifications enabled) + `MOBILE_APP.md` (PWA status + Android/TWA
  packaging plan). Signed build awaits the owner's keystore.
- `docs/SECURITY.md` — secret policy, admin auth model, incident log.
- `.env.example` — variable names only, no values.

### Changed
- **In-content legacy links internalized (Task 7)**: all 316 `mehrdad.ir`
  occurrences inside post bodies (72 posts) now stay inside the app —
  pages → `#contact` / `#about` / `#home`, posts → `#blog/<slug>`,
  short-links resolved to their owner posts, web-stories → `#blog`;
  `target`/`rel` removed from internal links. Real external links untouched.
- **Media self-sufficiency**: 7 PDFs + 3 MP4s (~64 MB) referenced by
  articles downloaded from the hotlink-protected legacy host into
  `public/uploads/wp/<Y>/<M>/`; broken/dying source files (2 zero-byte
  PDFs, 10 dead images) replaced by related-article links, download links
  or removal; 133 malformed migration images rebuilt as real `<img>` tags.
- **Evidence-based re-dating (Task 5)**: all 83 posts re-dated from
  evidence (Wayback Machine CDX probes — 43 posts anchored, cover upload
  paths, first-comment dates, in-text Jalali references, LLM estimate for
  5 signal-less posts). Final distribution 2019:1 / 2020:6 / 2021:21 /
  2022:6 / 2023:33 / 2024:13 / 2025:3; no post predates its first comment
  or the site's first archive snapshot. Comment dates untouched (they are
  genuine and support credibility). Per-post evidence: `MIGRATION_REPORT.md`.
- **README rewritten to match the actual implementation** (hash-routed SPA,
  EN-default + FA RTL, real API surface, env setup, media locations).

### Fixed
- **Category filters returned 500 / "No articles found" (Task 6)**: the
  posts API filtered the many-to-many `categories` relation with
  `{ slug }` instead of `{ some: { slug } }` — every filter click threw a
  PrismaClientValidationError that the silent frontend catch masked.
- **Persian category slugs were stored percent-encoded** in the DB
  (`%d8%b1%d9%88%d8%b2%d8%a7%d9%86%d9%87`); all 14 decoded in place with a
  collision-guarded migration script (`analysis/fix_cat_slugs.ts`).
- **Persian-slug article pages 404ed** (Next.js decodes route params, DB
  held encoded slugs): `src/lib/slug-lookup.ts` tries encoded + decoded
  candidates — bug existed since the initial migration, now fixed in the
  post and comments APIs.

### Security
- **Admin password removed from source and UI** (caught before any public
  push): `src/lib/admin.ts` now reads `ADMIN_PASSWORD` from the
  environment with **no fallback** (unset ⇒ fail closed); the
  default-password hint in the admin login UI removed; password rotated.
  Details and incident log: `docs/SECURITY.md`.
- **Git hygiene**: `.env`, DB backup snapshots and `dev.pid` untracked and
  gitignored; local working history squashed to a single clean baseline
  commit before pushing (secrets never reached the public remote).

## [1.0.0] — 2026-09-01 — The rebuild

### Added
- **Phase 0 — Audit** (`docs/AUDIT.md`): full forensic audit of the legacy
  WordPress site — 82 posts, 17 comments, 441 media, 34 categories, 4,872
  tags; confirmed the publication-date corruption with evidence.
- **Phase 1 — Foundation**: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
  + Prisma/SQLite. Content model with strict `publishedAt / updatedAt /
  migratedAt` separation and per-post `publishedPrecision` + `dateEvidence`.
- **Phase 2 — Content migration**: 82 articles, 17 comments (original dates
  + threading), 138 mirrored media files, 34→17 categories. Date
  reconstruction from evidence chain (comments → upload paths → in-text
  Jalali references). Reports: `MIGRATION_REPORT.md`, `REDIRECTS.md`.
- **Phase 3 — Core site**: Home, Work (+project pages with honest status),
  Writing (+articles), Lab, About, Contact. Moderated comments with
  threading, honeypot + rate limiting. Contact funnel with intents.
- **Phase 4 — SEO**: metadata system, canonical URLs, OG/Twitter,
  JSON-LD (Person, WebSite, Article), `sitemap.xml`, `robots.txt`,
  `feed.xml` (RSS), legacy 301 redirect layer (`src/proxy.ts`) covering old
  root-level slugs (Persian-encoded included), `/services`, `/category/*`,
  `/tag/*`, `/wp-content/uploads/*` → `/media/*`, legacy feeds.
- **Phase 5 — QA**: browser-verified golden paths on desktop + mobile;
  sticky-footer contract; forms verified end-to-end (DB rows); no console
  errors.
- **Phase 6 — Documentation**: README v2 + ARCHITECTURE, CONTENT_MIGRATION,
  CONTENT_STRATEGY, BRAND_STRATEGY, PRODUCT_STRATEGY, SEO,
  DEVELOPMENT_SETUP, DEPLOYMENT, ROADMAP, DECISIONS, CHANGELOG.

### Fixed
- Historical publication dates restored from evidence (2020→2025 timeline)
  instead of the corrupted 2024-09→2025-05 re-publication stamps.
- Legacy root-level article URLs kept alive via 301s (no broken inbound links).
- `%d8%…` lowercase-hex slug compatibility with `encodeURIComponent` output.
- robots.txt route conflict (static file removed in favor of programmatic).

### Removed / retired
- 4,872 junk tag archives (301 → /writing).
- Elementor draft pages and theme-demo media from the content set.
- «طراح و پژوهشگر / Designer & Researcher» positioning (replaced by approved
  positioning per BRAND_STRATEGY).

## [0.1.0] — earlier
- Initial repository (README only, positioning statement).
