# ARCHITECTURE — mehrdad.ir

Last updated: 2026-09-01

## System overview

```
┌─────────────────────────────────────────────────────┐
│ Next.js 16 (App Router, Node runtime)               │
│                                                     │
│  Routes (RSC)                API (route handlers)   │
│  ├─ /                        ├─ /api/comments       │
│  ├─ /work, /work/[slug]      │    GET approved tree │
│  ├─ /writing, /[slug]        │    POST → moderation │
│  ├─ /lab                     ├─ /api/contact        │
│  ├─ /about, /contact         │    POST → SQLite     │
│  ├─ /sitemap.xml /robots.txt └─ /feed.xml (RSS)     │
│  └─ proxy.ts (legacy 301s)                          │
│                                                     │
│  Data: Prisma Client → SQLite (db/custom.db)        │
│  Media: public/media/ (mirrored WP uploads)         │
└─────────────────────────────────────────────────────┘
```

## Content model (prisma/schema.prisma)

### Date integrity (the core rule)

| Field | Meaning | Never used as |
|---|---|---|
| `Post.publishedAt` | authoritative original publication date (evidence-based) | — |
| `Post.updatedAt` | real content update at source | publishedAt |
| `Post.migratedAt` | import timestamp | publishedAt |
| `Post.publishedPrecision` | `day` \| `month` \| `year` \| `unknown` | — |
| `Post.dateEvidence` | `wp-date` \| `comment-bound` \| `upload-path` \| `self-reference` \| `approximate` | — |

The UI renders less-than-day precision honestly (month name/year + a
«تاریخ تقریبی» badge) — see `src/lib/format-date.ts`.

### Models

- **Post** — `wpId` (source provenance), immutable `slug` (original WP slug,
  percent-encoded Persian preserved), `bodyHtml` (sanitized), `kind`
  (`article` | `note`), `status` (`draft` | `published`), `readingMinutes`,
  `featuredImage`, `sourceUrl`.
- **Comment** — `wpId`, `authorName`, `body` (plain text, rendered safely),
  `submittedAt` (ORIGINAL date), `approved` (moderation state), `parentId`
  (threading). New comments: `approved=false`.
- **Project** — Work/Lab entries: `kind` (product/startup/client/experiment/
  game), `status` (concept→archived), story fields (problem/research/idea/
  design/build/learned), `tech`, `links`, `metrics`, `isLab`, `sortOrder`.
- **Category / Tag / PostCategory / PostTag / ProjectPost** — taxonomy +
  joins. Tags intentionally near-empty until curated (audit §12).
- **Redirect** — planned DB-backed redirects (currently static map in
  `src/lib/redirects.ts` consumed by `src/proxy.ts`; model kept for future
  admin-managed redirects).
- **ContactMessage** — contact funnel storage.

## URL scheme & legacy preservation

| Old (WordPress) | New | Mechanism |
|---|---|---|
| `https://mehrdad.ir/<post-slug>/` | `/writing/<post-slug>` | 301 via `src/proxy.ts` + `src/lib/redirects.ts` |
| same slug, new links | `/writing/<slug>` resolves directly | multi-form slug lookup (encoded/decoded, lowercase-normalized) |
| `/services/` | `/#services` | 301 |
| `/contact/` | `/contact` | 301 |
| `/participation-in-projects/` | `/work` | 301 |
| `/category/*`, `/tag/*` | `/writing` | 301 (taxonomy consolidated) |
| `/wp-content/uploads/YYYY/MM/*` | `/media/YYYY/MM/*` | 301 + mirrored files |
| `/feed/`, `/comments/feed/`, `/web-stories/feed/` | `/feed.xml` | 301 |

Slug normalization detail: WordPress stores percent-encoded Persian slugs
with **lowercase** hex escapes; `encodeURIComponent` emits uppercase. The
article resolver (`getPost`) tries raw, decoded, uppercase-encoded and
lowercase-encoded forms.

## HTML sanitization pipeline

`src/lib/sanitize.ts`:

1. strip `script/style/form/iframe/comments` and Elementor wrapper tags
2. allowlist semantic tags only
3. strip all attributes except safe `href` / `img src+alt` / `td colspan`
4. rewrite `mehrdad.ir/wp-content/uploads/*` → `/media/*`, internal links →
   local routes
5. excerpt + reading-time derived server-side

## Migration pipeline

`scripts/migrate.ts` (idempotent, source: WP REST API):

1. fetch posts + comments (+2,4 MB bodies)
2. sanitize bodies
3. **date reconstruction** (`src/lib/date-reconstruction.ts`):
   corruption window 2024-09→2025-05 detected → evidence chain
   (comment-bound → upload-path → in-text Jalali self-references →
   wp-date → approximate); outputs decision + explanation per post
4. mirror embedded media to `public/media/` (same YYYY/MM paths)
5. import comments (original dates, threading, spam-shaped → unapproved)
6. seed Projects (Work/Lab) from evidenced real activity
7. emit `docs/MIGRATION_REPORT.md` + `docs/REDIRECTS.md`
8. `scripts/gen-redirects.ts` regenerates the static redirect map

## Design system

- RTL-first (`<html lang="fa" dir="rtl">`), Vazirmatn via `next/font`
- warm neutral palette + primary accent (no blue/indigo), oklch tokens
- shadcn/ui components only (Card/Badge/Button/Sheet/Input/Textarea/Select/…)
- sticky footer contract: `body { min-h-screen flex flex-col }` +
  `footer { mt-auto }` — footer touches viewport bottom on short pages and
  is pushed naturally on long pages
- status badges encode honest project state (`src/components/status-badge.tsx`)
