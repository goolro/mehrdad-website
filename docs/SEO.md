# SEO — mehrdad.ir

Last updated: 2026-09-01

## Implemented

| Item | Status |
|---|---|
| Semantic HTML (`header/nav/main/section/article/footer`, single H1/page) | ✅ |
| Persian RTL (`lang="fa" dir="rtl"`) | ✅ |
| Title template + per-page `title`/`description` | ✅ |
| Canonical URLs | ✅ every page via `alternates.canonical` |
| Open Graph + Twitter cards | ✅ layout defaults + article overrides |
| JSON-LD Person + WebSite | ✅ in root layout (`@graph`) |
| JSON-LD Article | ✅ on every article page (datePublished = restored date) |
| `sitemap.xml` | ✅ static routes + projects + all articles |
| `robots.txt` | ✅ allows all, disallows `/api/`, points to sitemap |
| RSS | ✅ `/feed.xml` (latest 30), legacy feeds 301 → it |
| Legacy URL preservation | ✅ 301 map in `src/proxy.ts` + `src/lib/redirects.ts` |
| Internal linking | ✅ related posts, project↔article cross-links, category filters |
| Image `loading="lazy"` + alt preserved from source | ✅ |
| Persian-safe slugs | ✅ original percent-encoded slugs resolve 1:1 |

## Deliberate SEO decisions

1. **Junk taxonomy retired.** The legacy site exposed 4,872 tag archives
   (sentence-tags, near-empty). All `/tag/*` URLs 301 → `/writing`. Thin
   category archives were consolidated (34 → 17).
2. **True dates restored.** Articles show evidence-based original dates
   (2020–2025) instead of the corrupted 2024–2025 stamp — this fixes the
   freshness signal *and* avoids false "new content" patterns.
3. **No fake content.** No AI filler articles; SEO rests on the genuine
   archive and future real work.
4. **One clean URL per article.** `/writing/<original-slug>`; legacy root
   URL 301s to it; no duplicate content paths.
5. **Media moved under our control.** `/wp-content/uploads/*` 301s to
   `/media/*` so images never depend on the legacy platform.

## Backlog (tracked in ROADMAP.md)

- curated tags (max ~50) + tag pages when they add value
- Breadcrumb JSON-LD on nested pages
- hreflang when the English version exists (structure is i18n-ready)
- image alt-text completion campaign (legacy coverage ~52%)
- OG images generation for articles
