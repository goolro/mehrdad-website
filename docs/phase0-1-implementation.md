# Phase 0+1 — Money Engine Implementation (2026-10-18)

Owner-approved execution of the mehrdad.ir audit: the site was a brochure
without a revenue path. This change set adds the offer, the qualification
funnel and the measurement — while touching nothing in the data layer.

## What changed (all zero-migration)

| # | File | Change |
|---|---|---|
| 1 | `src/app/mvp-sprint/page.tsx` + `src/components/site/MvpSprintView.tsx` | **NEW** — productized "AI MVP Sprint" page: 4-step process, 3 fixed-scope tiers (free scope call / one-feature MVP / full sprint), needs list, FAQ, proof links. Bilingual (EN/FA via existing i18n store), force-static like /services. |
| 2 | `src/app/playbook/page.tsx` + `src/components/site/PlaybookView.tsx` | **NEW** — the FDE Playbook lead magnet: the 10 steps shown ungated (trust first), email capture for the expanded PDF. Reuses `/api/contact` with a `[Playbook]` subject prefix → lands in DB + SMTP inbox + PostHog with zero API/schema changes. |
| 3 | `src/components/site/ContactView.tsx` | Deep-link preselect: `/contact?intent=services` (used by all MVP Sprint CTAs). When intent=services, optional **budget + timeline chips** appear; values ride inside the message body (`— Budget: … — Timeline: …`) so admin/API/schema untouched. |
| 4 | `src/lib/analytics.ts` | 4 typed PostHog events: `mvp_sprint_viewed`, `mvp_sprint_cta` (hero/tier/faq), `lead_submitted` (intent + budget + timeline), `playbook_subscribed`. |
| 5 | `src/components/site/Footer.tsx` | Footer nav now links **MVP Sprint, Playbook, Investors** — the money pages + investor funnel are crawlable from every page (were buried one deep blog post). |
| 6 | `docs/content-archive-plan.md` | Phase-0 content hygiene: KEEP / REWRITE / ARCHIVE classification of all 105 DB posts (from the production dump). |

## The funnel this wires up

```
visitor → /mvp-sprint (mvp_sprint_viewed)
        → CTA click  (mvp_sprint_cta)      → /contact?intent=services
        → form + budget/timeline (lead_submitted) → DB + inbox
alongside: /playbook (playbook_subscribed) → newsletter list seeds in inbox/DB
```

**PostHog setup (one-time, owner):** dashboard → Funnels → create
"Money funnel": `mvp_sprint_viewed` → `mvp_sprint_cta` → `lead_submitted`.
Add `playbook_subscribed` as a second funnel entry.

## Rollback (the reason the backup exists)

- Code: `git checkout backup/pre-phase0-2026-10-18 && git push origin main`
  (or revert the merge commit — this PR is additive, no migrations).
- Vercel dashboard → Deployments → Instant Rollback also works at any time.
- DB: untouched by this change set; dump exists at
  `upload/db-backup-2026-10-18.json` (28 tables, 1282 rows).

## Deliberately NOT in this change set

- No schema changes, no new API routes (reuses /api/contact end-to-end).
- No header nav edit (the View union is closed; footer links are crawlable
  and sufficient — revisit if the owner wants a header entry).
- No pricing numbers on tiers — the owner's "no invented numbers" rule;
  quotes are fixed at the end of the free scope call.
