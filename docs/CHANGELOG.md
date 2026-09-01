# CHANGELOG

All notable changes to mehrdad.ir. Format: Keep-a-Changelog-ish, newest first.

## [Unreleased]

### Added
- **Forward Deployed Engineering service (owner directive)**: the brand's
  new core service, built as a full experience — not a plain card:
  - `#fde` dedicated bilingual page (`FdeView.tsx`): hero with the
    "You don't need to know what to build — you need to know what problem
    to solve" message, What-is-FDE, three-roles composition
    (Product Builder / Forward Deployed Engineer / AI-Native Engineering)
    with the `Real-World Problem → Working Solution` visual anchor,
    interactive 8-stage process timeline (Discover→…→Iterate, click/hover/
    keyboard), 6 "who is it for" cards, 6 transformation deliverables,
    special AI section (`AI is not the replacement. It is the force
    multiplier.` + Human/AI loop diagram), traditional-vs-FDE comparison
    flows, a real scenario case flow, and a big closing CTA. Subtle
    IntersectionObserver reveals (reduced-motion safe), RTL/LTR aware,
    token-based dark/light.
  - Highlighted Core-Service card in Services (gradient border, ★ badge,
    tags `Product/Engineering/AI/Problem Solving`, `Explore this service`
    CTA → `#fde`); record added to the DB (`analysis/add_fde_service.ts`,
    idempotent, placed first).
  - **Page-context-aware AI assistant (§13)**: while on `#fde` the chat
    widget shows 6 suggested questions (bilingual) and sends
    `context:'fde'`; `/api/chat` appends a grounded FDE briefing to the
    system prompt (EN/FA) so "this service" questions answer about the
    page.
  - Per-language SEO metadata (§16): title + description switch with the
    UI language and restore on leave.
  - Chat resilience: short 429/5xx retry with a graceful bilingual
    "service busy" reply instead of a raw error (LLM throttling storm
    observed during testing).
- **Brand positioning everywhere (Tasks 11, per BRAND_STRATEGY)**: the
  approved slogan — «کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI
  سریع می‌سازمش» / "I design businesses and products with care, and build
  them fast with AI." — is now the homepage H1 (both languages), the
  metadata/OG/manifest titles ("Mehrdad — Product Builder"), the footer
  motto, the About identity, AND the AI persona (chat system prompts EN/FA
  + KB seed, rebuilt: 439 chunks). The banned «Designer & Researcher»
  positioning was removed from all 7 locations.
- **BUILD / HELP / SHARE trio + ecosystem chain**: new home section
  rendering the three connected activities and the
  Research → Design → Build → Learn → Share → Build again loop
  (RTL-aware, token-colored).
- **Language suggestion banner (D-019)**: `fa*`-browser visitors get a
  one-time bilingual offer to view the site in Persian — fixed bottom
  pill, zero layout shift; explicit choice/dismissal persists forever;
  EN default untouched. E2E: 9/9 with a real fa-IR Playwright context.
- **Curated topic tags (D-020)**: fixed 32-tag bilingual taxonomy
  (`analysis/curated_tags.json`), Tag/PostTag schema, `?tag=` posts
  filter, tag cloud in `/api/site`, "Topics" chip row in the blog,
  `#tags` on cards and article pages; constrained per-post assignment
  pipeline (`analysis/assign_tags.ts`, resumable, 429-backoff).
- **Archive EN translation loop (D-021) — complete**: resumable batch
  (`analysis/translate_archive.ts` + `translate_remaining2.ts`) —
  HTML-aware chunking, 429 exponential backoff, per-post progress; every
  published post (82) now has full English content in the DB and the AI
  knowledge base; the content-filtered rail-corridor post was finished
  with a manual chunk rescue (`repair_rail_translation.ts`); the only
  Persian-only item is the draft smart-waste post (owner decision
  pending, ROADMAP P1).
- **E2E infrastructure**: `playwright-core` devDependency + real-locale
  browser tests (`analysis/test_lang_banner.ts`).

### Fixed
- **PWA service worker registered in production only** (`PwaClient`);
  cache version bumped to `mehrdad-v2`. In dev, rebuild-changing chunk
  hashes + a cached shell SW caused full-load hydration crashes
  (reproduced via persistent-profile browser; clean contexts were fine).
- **Navigation hash sync + article deep links**: clicking any post card now
  switches to the article AND writes `#blog/<slug>` to the URL (previously
  the URL stayed stale, so articles could not be shared/bookmarked, and
  featured-post cards on the homepage did nothing at all — `openPost` never
  set the view). Nav links, "Back to blog" and "View all" also sync the
  hash; Persian slugs stay percent-encoded and resolve via slugCandidates.
  Verified: home → featured article, direct `#blog/<fa-slug>` load,
  EN/FA (RTL) article render, zero console errors.
- **Dark-mode / RTL first-paint flash** (Theme Engine known limitation):
  inline synchronous boot script in `layout.tsx` applies the persisted
  `.dark` class, `fa→rtl` direction and the last-known theme cache
  before first paint; `page.tsx` caches the DB theme for returning
  visitors. Verified across reloads, zero console errors.
- **Post 7995 published with an empty body** (smart-waste financials):
  reverted to `draft` awaiting the owner's publish decision (ROADMAP P1).

### Changed
- **Hero copy** replaced with the approved positioning; sub-line now
  speaks honest status + documented lessons (no generic "AI solutions").
- **AI persona** (chat EN/FA system prompts + knowledge-base seed)
  rewritten to the brand model: independent product builder,
  BUILD/HELP/SHARE, 83+ articles.

## [1.1.0] — 2026-09-01 — Theme engine · PWA · TWA prep · security baseline

### Added
- **Theme Engine (D-014)**: one shared design-token system powering exactly
  five themes — Default ☼ (brand violet), Autumn 🍂, Winter ❄️ (icy sky,
  new snowfall background), Digital ⚡ (neon cyan/lime, new falling-glyph
  background), Nowruz 🌱 (emerald/gold, new spring-petal background).
  Themes are palette + background only — a shared CSS-variable layer
  (`--color-violet-*` / `--color-fuchsia-*`) re-colors every component,
  including article prose (links/blockquotes/tables now token-driven).
  New docs: `docs/THEME_ENGINE.md` (incl. add-a-theme recipe).
- **Light/Dark mode, independent of theme**: persisted user preference
  (`localStorage` via the app store), header Sun/Moon toggle with
  `aria-pressed` + localized labels; all five themes work in both modes.
- **PWA completion**: manifest, service worker (offline shell + API/image
  cache), AI-generated icons (192/512/180 + maskable), in-browser install
  prompt, app shortcuts (Blog / AI Chat / Contact), iOS standalone meta.
- **TWA preparation**: `twa-manifest.json` (package `ir.mehrdad.twa`,
  notifications enabled) + `MOBILE_APP.md` (PWA status + Android/TWA
  overview) + full runbook `docs/MOBILE_TWA.md` (keystore ownership,
  Bubblewrap build, Play checklist, troubleshooting).
- **`scripts/generate-assetlinks.ts`** — validates SHA-256 fingerprints,
  reads the package id from `twa-manifest.json` (single source of truth)
  and writes `public/.well-known/assetlinks.json`; no more hand-editing
  the JSON.
- **Signing-key guard**: `*.keystore`, `*.jks`, `*.apk`, `*.aab` and
  Bubblewrap state dirs are gitignored — the Android signing key can
  never be committed.
- `docs/SECURITY.md` — secret policy, admin auth model, incident log.
- `.env.example` — variable names only, no values.

### Changed
- **Theme roster retired → mapped (was: Default, Ocean, Forest, Sunset,
  Midnight)**: Ocean→Winter, Forest→Nowruz, Sunset→Autumn,
  Midnight→Digital, old violet "Digital"→Default. Stored DB value
  migrated once with an idempotent marker
  (`analysis/migrate_theme_setting.ts`); `getTheme()` also resolves
  legacy ids at read time so stale values can never render unstyled.
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
