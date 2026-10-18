# Content Archive Plan — mehrdad.ir (phase 0 deliverable, 2026-10-18)

Source of truth: production DB dump `upload/db-backup-2026-10-18.json`
(105 posts, 104 published, 22 from 2026, the rest WordPress-import era).

## Why this matters

The "Mehrdad — Product Builder" brand is diluted by legacy WordPress-era
content that still ranks in search (verified live on 2026-10-18: queries
surface "تلگرام v2ray", "ربات Ava", "سرمایه گذار zuber" tag pages and old
post titles). A potential client or investor doing due diligence lands on
these before they land on the 2026 investor work. This plan classifies every
legacy post into KEEP / REWRITE / ARCHIVE — no deletion in phase 0, only
status changes and (optionally) canonical rewrites.

## Classification rules

- **KEEP** — supports the Product Builder / FDE / investor positioning.
- **REWRITE** — right topic, wrong execution: update content, refresh meta,
  re-canonicalize; these are indexed assets worth resurrecting.
- **ARCHIVE** — off-brand or dead-topic: set `published: false` (keep the
  row; the 301s already route old URLs to /blog and /work).

## KEEP — anchors (do not touch)

| Group | Examples |
|---|---|
| Investor series 2026 | Koko investor overview + 19-section pitch deck, angel-investor-for-mvp-portfolio |
| Product / build-in-public | Quiz of Koko, super-app progress posts, driving-license app |
| Daily analyses 2026 | LinkedIn / product analyses (21 DailyArticle rows are separate, fine) |
| Evergreen startup craft | "How to Attract Investors for a Startup?", pitch-deck explainers, "The Story of Attracting Investors" |
| Personal brand | "History and Meaning of the Name Mehrdad" (identity search traffic) |

## REWRITE — indexed assets worth resurrecting (10 highest-value)

1. Smart City Design Project (2024-10-18) — fits smart-city expertise, rewrite to 2026 state
2. Designing Modern Urban Transportation Systems in Smart Cities (2024-10-18)
3. What is IoT? (2024-10-26) — rewrite as "IoT in 2026, from a builder's view"
4. Initial Pitch Deck for Banking Financial Software / Neo Bank (2024-11-01)
5. Investment Opportunities: Banking Financial Software series (2024-11→12, dedupe the repeats)
6. Startup: Transportation, an Investment Field (2024-11-08)
7. Earning in Dollars (2024-11-01) — reframe into the FDE/services-USD story
8. The Story of Attracting Investors for a Startup, Part 1 (2024-09-20)
9. Smart Home: A Smart Experience (2024-10-11)
10. Google's Issue with Iranian Developer Accounts (2024-09-27) — timeless for the audience; add 2026 addendum

## ARCHIVE — off-brand (set published:false, batch 1)

| Theme | Reason |
|---|---|
| Clubhouse posts (Clubdeck download, room reports 2021–2024 era) | Dead platform topic; reads as abandoned blog |
| "Challenges of Designing a Website to Buy Instagram Followers" | Actively harms the honest-brand positioning |
| "بلوک نقل قول" (quote-block test post) | WP import debris |
| Robot design posts IF thin (Robot Design, What Steps… Smart Robot) | Weak content under a topic we no longer claim — keep only if rewritten |
| Song download / entertainment posts (Jazr o Mad guitar) | Off-brand for Product Builder; archive or move to a personal subfolder later |

## Execution notes (for the admin panel, no code needed)

- `published: false` keeps rows and lets redirects hold; Google drops them
  from the index within weeks.
- After the archive batch: request re-indexing of the 10 REWRITE posts in
  Search Console; keep sitemap.xml regenerated (build-time) so archived URLs
  drop out of the sitemap automatically.
- Do this in one batch, not drip-fed — a clean cut reads as "repositioning",
  a drip reads as "abandonment".

## Category/Tag hygiene (from live search, 2026-10-18)

Legacy `/tag/*` and `/portfolios-cat/*` URLs already 301 to /blog and /work
(verified). Keep those redirects permanent. The search titles will decay as
the archived posts go noindex-via-unpublished. Recheck in 30 days via
`site:mehrdad.ir` — remaining stragglers go on the same list.
