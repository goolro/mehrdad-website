# DEVELOPMENT SETUP — mehrdad.ir

## Prerequisites

- Bun ≥ 1.1 (or Node ≥ 20 + npm)
- No external database server needed (SQLite file)

## Local setup

```bash
git clone https://github.com/goolro/mehrdad-website.git
cd mehrdad-website
bun install

# environment
echo "DATABASE_URL=file:$(pwd)/db/custom.db" > .env   # absolute path

# schema
bun run db:push

# (optional) hydrate content + media from the legacy WordPress site
bunx tsx scripts/migrate.ts        # fetches WP REST → seeds SQLite → mirrors media
bunx tsx scripts/gen-redirects.ts  # regenerates src/lib/redirects.ts

bun run dev   # http://localhost:3000
```

> Note: `db/custom.db` in the repository already contains the migrated
> content snapshot, so steps 4–6 are optional for local development.

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | dev server on :3000 |
| `bun run lint` | ESLint |
| `bun run db:push` | sync Prisma schema → SQLite |
| `bunx tsx scripts/migrate.ts` | full content migration (idempotent) |
| `bunx tsx scripts/gen-redirects.ts` | regenerate legacy redirect map |

## Project layout

```
src/
  app/                    # routes (RSC pages + API handlers)
    page.tsx              # home
    writing/[slug]/       # articles (legacy URL compatible)
    work/[slug]/          # project pages
    lab/ about/ contact/
    api/comments/         # GET tree / POST → moderation
    api/contact/          # POST → SQLite
    feed.xml/ sitemap.ts robots.ts
  components/             # header, footer, cards, comments, contact form
  lib/
    db.ts                 # Prisma client
    site.ts               # site config + status labels
    sanitize.ts           # WP HTML sanitizer + URL rewriter
    date-reconstruction.ts# evidence-chain date engine
    format-date.ts        # Jalali formatting with precision
    redirects.ts          # AUTO-GENERATED legacy redirect map
  proxy.ts                # Next 16 proxy (legacy 301s)
prisma/schema.prisma      # content model
scripts/                  # migrate.ts, gen-redirects.ts
public/media/             # mirrored legacy uploads (videos git-ignored)
db/custom.db              # SQLite content store
docs/                     # project documentation
```

## Quality gates before pushing

```bash
bun run lint
# exercise: /, /writing, one legacy Persian article URL, /work/<slug>,
# /lab, /about, /contact (form), comment submit, /sitemap.xml, /robots.txt,
# /feed.xml, one legacy 301 (/services, /category/x, /wp-content/…)
```

## Conventions

- Persian copy: natural tone, first person singular, justified text.
- Never set `publishedAt` from `migratedAt`/insert time (see
  CONTENT_MIGRATION.md).
- New pages must define `metadata` (title/description/canonical).
- shadcn/ui components only; RTL-aware spacing (`mr/ms`, logical properties).
