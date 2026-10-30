# scripts/ — operations map

Phase-6 hygiene pass (2026-10-30): the flat 32-file directory mixed the
active build/CI chain with 16 completed one-off migrations and seeds.
Active tools now live at the top level; finished one-offs are in
`archive/` (git-mv'd, full history preserved — nothing was deleted).

## Active (referenced by CI / build / owner ops — do NOT archive)

| File | Invoked by |
| --- | --- |
| `postbuild.mjs` | build (package.json + vercel.json) — calls `inject-csp.mjs` |
| `inject-csp.mjs` | build chain (next.config.ts CSP chain) |
| `build-agency-library.mjs` | `bun run agency:build`, documented in AgencyGuide UI |
| `check-schema-mirror.mjs` | CI (`ci.yml` verify job) |
| `security-checks.mts` + `security-checks-loader.mjs` | CI (`ci.yml` security-checks job; loader registered by the runner) |
| `build-health-landing.mjs` | `/deck/health` generator (D-041) — regenerate from uploads |
| `pentest-local.sh`, `pentest-round2.sh` | manual local pentest (intentionally NOT in CI, see `ci.yml`) |
| `generate-assetlinks.ts` | Android TWA assetlinks regenerator (MOBILE_APP.md) |
| `generate-totp-secret.ts` | admin-panel 2FA secret utility |
| `merge-duplicate-categories.sql` | **PENDING owner op** — run once in Supabase SQL editor |
| `deploy-watch.sh` | owner deploy-watch tool (token redacted, phase-1) |
| `publora-push.ts` | Publora social bridge (owner order 2026-10-18) |
| `social-queue-fill.ts` | production Social Studio queue fill (owner order 2026-10-11) |
| `check-en-fa.cjs` | re-runnable QA scan: Persian in EN seed fields (`src/lib/seed-import.ts`) |

`reels/` — subtitle/video build kit for the reels content pipeline (own
`.sh` runners + `.ass` subtitle files + fonts).

## archive/ — completed one-offs (kept for provenance)

Everything the repo finished with: SQLite→Turso→Supabase migrations
(`migrate-sqlite-to-supabase.ts`, `migrate-to-turso.ts`, `dev-seed.ts`),
one-off schema/seeding ops (`create-lead-table-supabase.ts`, the six
`seed-*` files + their data blobs `klika-seo-post-data.ts`,
`koko-telegram-post-data.ts`), the worklab restructure
(`apply-worklab-restructure.ts`), and the cPanel alt-pipeline tooling
(`cpanel-bootstrap.sh`, `cpanel-deploy.py`, `build-production.sh`,
plus the root `Caddyfile`). Decision entries that reference these by
their original `scripts/<name>` paths remain historically valid — the
files moved here in one rename-only commit (phase 6, 2026-10-30).

Revival: `git mv scripts/archive/<name> scripts/<name>` and update any
runbook that references it.
