# DECISIONS — decision log

Append-only. Each decision: context → decision → rationale.

---

## D-001 — Stack: Next.js 16 + TypeScript + Tailwind/shadcn + Prisma/SQLite
**Date:** 2026-09-01
**Context:** Empty repo; README left "Stack: [به‌محض انتخاب اینجا اضافه شود]".
**Decision:** Next.js 16 App Router, TypeScript, Tailwind CSS 4 + shadcn/ui,
Prisma + SQLite.
**Rationale:** SSG/RSC for content + API routes for forms/comments in one
deployable; SQLite removes DB ops for a personal site; shadcn/ui gives
accessible RTL-friendly components fast. Schema stays portable to Postgres.

## D-002 — Persian-first, RTL default; English later
**Decision:** `<html lang="fa" dir="rtl">`, Vazirmatn font; i18n-ready
structure but Persian-only at launch.
**Rationale:** The entire archive and audience are Persian. Mechanical
bilingual launch would halve quality (master prompt §34).

## D-003 — Date reconstruction via evidence chain (no blind trust, no fabrication)
**Decision:** `publishedAt` restored from evidence (comment-bound →
upload-path → in-text Jalali references → wp-date → approximate) with
`publishedPrecision` + `dateEvidence` fields persisted per post.
**Rationale:** WP dates were demonstrably corrupted (re-publication wave
2024-09→2025-05; comments/images prove older origins). Random back-dating is
forbidden; unknown stays flagged «تاریخ تقریبی» (§16/§17).

## D-004 — Original slugs preserved byte-for-byte
**Decision:** Keep percent-encoded Persian slugs; resolve under
`/writing/<slug>`; root-level legacy URLs 301 via a generated static map
consumed by `src/proxy.ts`.
**Rationale:** Preserves historical link equity exactly (§19). Avoids
normalization mistakes (lowercase hex escapes) via multi-form lookup.

## D-005 — Retire the 4,872-tag taxonomy (redirect to /writing)
**Decision:** Do not migrate legacy tags; `/tag/*` → 301 `/writing`; curated
tags are a backlog item.
**Rationale:** Sentence-tags and near-empty archives are an SEO negative
(audit §2.3); a curated subset will be built from real content instead.

## D-006 — Comments: moderation + honeypot + rate limit; historical comments preserved with original dates
**Decision:** 17 historical comments imported with original dates/threading;
2 spam-shaped records stay unapproved; new comments enter an approval queue.
**Rationale:** §18 — preserve history, stop spam.

## D-007 — Projects (Work) seeded only from evidenced activity
**Decision:** 4 projects (smart city, rail corridor, BIZPAL, Clubhouse-Lab)
seeded with honest statuses; RIVORA/Hokm/Shelem omitted pending owner data.
**Rationale:** Anti-hallucination rule §40 — never invent products/statuses.
Each project page structure (problem/research/idea/design/build/learned) is
ready for owner enrichment.

## D-008 — Media mirrored with original upload paths; videos git-ignored
**Decision:** `/wp-content/uploads/YYYY/MM/x` → `/media/YYYY/MM/x` (files
copied, 301 for old paths). `*.mp4` excluded from git (63 MB of 92 MB);
re-hydration via migration script.
**Rationale:** Independence from the legacy platform without breaking old
image URLs; keeps repo clone-able.

## D-009 — Next.js 16 proxy convention for redirects
**Decision:** `src/proxy.ts` (not deprecated `middleware.ts`).
**Rationale:** Next 16 deprecates middleware file convention; proxy runs the
same matcher config.

## D-010 — One contact funnel, four intents
**Decision:** Single `/contact` page + intent select (work / collaboration /
partnership / other) + direct email shown.
**Rationale:** §13 — no five separate pages; investors treated as
relationship-building, no INVEST CTA.

## D-011 — Password-protected legacy post imported as draft
**Decision:** Post 7995 (smart-waste startup) → `status=draft`, not public.
**Rationale:** The password existed for a reason; publishing financial detail
publicly is an owner decision (ROADMAP open item).

## D-012 — No test suite code in this phase
**Decision:** QA via lint + scripted browser verification (agent-browser)
documented in the worklog; no committed test code.
**Rationale:** Project convention for this phase; golden paths are
browser-verified before every push.

## D-013 — English default, Persian full-RTL secondary (supersedes D-002)
**Date:** 2026-09-01
**Context:** Owner's updated master prompt (§4): GitHub, technical partners
and international discovery are English-first; the app itself shipped EN
default with complete FA RTL.
**Decision:** English is the default render; Persian is a full secondary
language (every UI string translated, persisted manual preference).
**Rationale:** Supersedes D-002 per explicit owner instruction; archive
quality stays Persian-first, surface language follows the audience mix.

## D-014 — Theme engine: exactly 5 themes on one shared token system
**Date:** 2026-09-01
**Context:** Owner request: 5 themes (Default / Autumn / Winter / Digital /
Nowruz) sharing a single design system, with Light/Dark independent of
theme. Current build has Default + Autumn/Ocean/Forest/Sunset/Midnight.
**Decision:** Formalize the existing CSS-variable override layer as the
design-token system; ship exactly Default, Autumn, Winter (new), Digital
(new), Nowruz (new); retire Ocean/Forest/Sunset/Midnight from the picker
(existing DB values map to the nearest new theme so no site ever renders
unstyled). Light/Dark stays a separate persisted preference.
**Rationale:** Owner instruction; seasonal identity beats arbitrary
palettes; token architecture makes each theme a config change.

## D-015 — TWA (Android) approved now (supersedes "app only after recurring utility")
**Date:** 2026-09-01
**Context:** Owner instruction overrides the earlier PWA-first gate: the
app MUST ship as a TWA. PWA layer is already complete.
**Decision:** Prepare full TWA packaging (twa-manifest, icons,
assetlinks.json, build docs). The signing keystore stays with the owner —
only its SHA-256 fingerprint is shared for assetlinks.
**Rationale:** Owner decision; all prerequisites except the keystore are
in-repo, so the owner runs one documented build command with their key.

## D-016 — Admin secret env-only, fail closed
**Date:** 2026-09-01
**Context:** Pre-push audit found the admin password hardcoded in
`src/lib/admin.ts` and shown as a UI hint — the repo is public.
**Decision:** `ADMIN_PASSWORD` comes from the environment with no
fallback; unset ⇒ every admin request rejected. Password rotated.
**Rationale:** Public repo ⇒ anything in source is public; fail-closed
beats fail-open for an auth path. Incident log: docs/SECURITY.md.

## D-017 — SQLite DB committed as the content snapshot of record
**Date:** 2026-09-01
**Context:** `db/custom.db` holds the migrated archive; rebuilding it from
scratch is a multi-script pipeline, and backups must never be published.
**Decision:** Commit `db/custom.db` (no user PII — Comment schema has no
email field; content is public-by-origin); gitignore all
`db/custom.backup-*.db` snapshots.
**Rationale:** GitHub-as-source-of-truth requires the content to survive
workspace loss; risk assessed in docs/SECURITY.md §3; a JSON export
pipeline may later replace the binary snapshot.

## D-018 — History squashed to one clean baseline before first push
**Date:** 2026-09-01
**Context:** Local history (auto-generated UUID commit messages) contained
`.env`, DB backups and pid files; remote already held a docs-complete
baseline without them.
**Decision:** Squash the entire local working state into a single
documented baseline commit and force-push over the remote main.
**Rationale:** Publishing history would leak local artifacts (§14); the
meaningful history starts at this documented baseline and is maintained
commit-by-commit from here (owner rule: push after every task).
