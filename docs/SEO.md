# SEO — mehrdad.ir

Last updated: 2026-09-05 (real-routes migration, D-022/D-023)

## Implemented (verified in this repo)

| Item | Status |
|---|---|
| Real, indexable URLs for every section (hash routing retired) | ✅ `/`, `/services`, `/fde` (+`/lab`), `/work`, `/work/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/contact` |
| Server-rendered article/project HTML | ✅ `curl /blog/<slug>` returns the full article with **no JS execution** (acceptance test, 2026-09-05) |
| Semantic HTML (`header/nav/main/section/article/footer`, single H1/page) | ✅ |
| Persian RTL (`lang="fa" dir="rtl"`) | ✅ (client-side language preference; server HTML is EN) |
| Per-page `title`/`description` via Metadata API | ✅ home, blog, post, work, project, services, fde, about, contact, admin (`noindex`) |
| Canonical URLs (`alternates.canonical` + `metadataBase`) | ✅ every route |
| Open Graph (+ article type / publishedTime / cover image) | ✅ |
| `sitemap.xml` | ✅ **dynamic & DB-driven** (static routes + all published posts + projects); falls back to static routes if DB is cold |
| `robots.txt` | ✅ allows all, references `https://mehrdad.ir/sitemap.xml` |
| RSS | ✅ `/feed.xml` (latest 20 published posts) |
| Legacy URL preservation | ✅ 301 map in `src/proxy.ts` — old WP slugs (incl. percent-encoded Persian), `?p=`/`?page_id=`, section prefixes → **real paths** (`/#blog/<slug>` targets migrated to `/blog/<slug>`) |
| Old hash bookmarks (`/#blog/<slug>`, `/#projects`, …) | ✅ upgraded client-side on arrival to the real route |
| Internal linking | ✅ related posts, project↔article cross-links, category filters |
| Image `loading="lazy"` + descriptive bilingual alt (118/118 unique images) | ✅ |
| Persian-safe slugs | ✅ original percent-encoded slugs resolve 1:1 (`src/lib/slug-lookup.ts`) |

## Deliberate SEO decisions

1. **Dynamic SSR everywhere (D-023).** Every response carries a fresh
   CSP nonce, so Next renders on demand. Measured cost: page render
   ~5–40 ms local; production adds one Turso query (Mumbai) per page.
   In exchange: strict `script-src 'nonce-…' 'strict-dynamic'` with no
   `unsafe-inline`, and content that never goes stale in a cache.
2. **Junk taxonomy retired.** The legacy site exposed 4,872 tag archives
   (sentence-tags, near-empty). All `/tag/*` URLs 301 → `/blog`.
3. **True dates restored.** Articles show evidence-based original dates
   (2020–2025) instead of the corrupted 2024–2025 stamps.
4. **No fake content.** SEO rests on the genuine archive and real work.
5. **One clean URL per article.** `/blog/<original-slug>`; legacy root
   URL 301s to it; no duplicate content paths.
6. **Internal codenames out of metadata.** Project codenames (e.g.
   BIZPAL) were removed from `keywords` — the meta describes the brand,
   not internal placeholders (review P0).

## Core Web Vitals / Lighthouse

Lighthouse cannot run headless inside the build sandbox; the owner
should run it once the site is live on mehrdad.ir
(Chrome DevTools → Lighthouse, mobile preset) and paste the scores here.
Structural expectations from the 2026-09-05 verification:

- **First paint is content-complete**: hero, services, projects and
  featured articles ship in the initial HTML (previously a client fetch
  after hydration) — LCP should improve substantially.
- HTML document size: ~35 KB (article) / ~65 KB (home, unminified dev
  build; smaller in production).
- No render-blocking third-party origins (CSP blocks them outright);
  fonts self-hosted via `next/font`; images `loading="lazy"`.
- The remaining LCP driver will be the Turso RTT (~100–200 ms from
  Iran) on cold renders — acceptable for a shared host.

## Owner next steps (after the cPanel cutover)

1. Search Console → add `mehrdad.ir` (DNS TXT verification).
2. Submit `https://mehrdad.ir/sitemap.xml`.
3. URL Inspection on 2–3 legacy WP URLs → confirm the 301 → new route →
   "Page is indexable".
4. Run Lighthouse (mobile) and record the scores above.
