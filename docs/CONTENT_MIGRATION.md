# CONTENT MIGRATION — rules & evidence

This document records **how content was migrated** and the rules that any
future migration/re-run must follow.

## Source

- Legacy platform: WordPress at `https://mehrdad.ir` (Elementor).
- Extracted via the public REST API (`/wp-json/wp/v2/*`).
- Inventory at migration time: **83 posts** (82 real + 1 theme stub),
  **17 comments**, **441 media** (136 used by posts), 34 categories,
  4,872 tags, 10 web-stories.

## What is migrated

| Content | Decision |
|---|---|
| 82 real posts | full body HTML (sanitized), title, original slug, categories (mapped), images (mirrored) |
| post 86 «blockquote» | skipped (theme test stub) |
| post 7995 (password-protected) | imported as `draft` — not public until owner decision |
| 17 comments | original date + threading + author name; 2 spam-shaped kept `unapproved` |
| 34 categories | mapped to 17 clean categories (duplicates merged, e.g. کسب‌وکار ×2 → `business`) |
| 4,872 tags | **not migrated** (polluted by sentence-tags) — curated list pending |
| Elementor draft pages (home-02…home-10, خانه روشن ×10) | not migrated (design drafts, not content) |
| web-stories (10 micro-notes) | pending owner decision; model supports `kind=note` |

## Date reconstruction (the critical fix)

The legacy site overwrote historical publication dates (a re-publication
wave stamped 2024-09 → 2025-05 onto content that was demonstrably older).
The new system reconstructs dates from an evidence chain and marks the
precision of every date.

### Evidence priority

1. **comment-bound** — comments survived with their real dates (earliest
   comment on a post is a publish-date lower bound).
2. **upload-path** — embedded images live under `/wp-content/uploads/YYYY/MM/`
   (WordPress records the real upload time).
3. **self-reference** — in-text Persian (Jalali) dates, e.g. «چهارشنبه ۱۲ آبان
   ۱۴۰۰» → 2021-11-03.
4. **wp-date** — trusted only if outside the corruption window
   (2024-09-01 → 2025-06-30) and not internally contradicted.
5. **approximate** — no evidence → WP date kept, precision `unknown`,
   surfaced as «تاریخ تقریبی» in the UI.

Restored timeline after migration:

| Year (Gregorian) | Posts |
|---|---|
| 2020 | 1 |
| 2021 | 6 |
| 2022 | 7 |
| 2023 | 33 |
| 2024 | 13 |
| 2025 | 22 |

### Hard rules (non-negotiable)

- `publishedAt` **never** equals `migratedAt` or the DB insert time.
- No random back-dating. If evidence is missing, the date is flagged
  approximate — honesty over aesthetics.
- The full per-post decision table (with explanations) lives in
  [MIGRATION_REPORT.md](MIGRATION_REPORT.md).

## Slugs & redirects

- Original slugs preserved byte-for-byte (including percent-encoded Persian).
- Old root-level URLs 301 → `/writing/<slug>` (`src/proxy.ts`).
- Full map: [REDIRECTS.md](REDIRECTS.md).

## Comments policy

- Historical: all migrated, `approved` as at source, except spam-shaped
  records (comment 47, 21) which stay `unapproved` for manual review.
- New comments: moderation queue (`approved=false`), honeypot field, 60s/IP
  rate limit, plain-text rendering only, threaded replies supported.

## Media

- Used images mirrored to `public/media/` preserving `YYYY/MM` paths.
- Legacy `/wp-content/uploads/*` URLs 301 → `/media/*`.
- Videos (`*.mp4`) excluded from git (size) — re-run the migration script on
  a networked machine or copy the folder to hydrate.
- Alt-text: legacy coverage was ~52%; progressive improvement backlog
  (ROADMAP).

## Validation gates (run after every re-migration)

- [x] post count: 82 migrated / 1 skipped (stub) / 1 draft
- [x] comment count: 17/17 with dates + parents intact
- [x] no empty bodies among `published`
- [x] no `publishedAt` inside the corruption window except the 7 verified
      genuinely-2025 posts (clean English slugs era)
- [x] no future dates
- [x] media failures listed (2 at migration time, both from neobank post
      variants — source images were removed from the legacy server)
- [x] redirect map covers every migrated slug
