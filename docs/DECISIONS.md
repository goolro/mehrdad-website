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

## D-019 — Language suggestion banner: offer once, never auto-switch
**Date:** 2026-09-01
**Context:** ROADMAP P0; Persian-locale visitors land on the English
default with no hint that a full Persian UI exists.
**Decision:** `LangBanner` offers Persian ONCE to `fa*`-locale browsers as
a fixed bottom pill; EN default and nothing auto-switches. An explicit
header language choice (`mehrdad-lang-chosen`) or dismissal
(`mehrdad-lang-banner`) persists forever. E2E-tested 9/9 with a real
fa-IR Playwright context.
**Rationale:** Discoverability without hijacking the approved EN-default
decision (D-013); persistence prevents nagging.

## D-020 — Curated topic tags: fixed 32-tag bilingual taxonomy, constrained assignment
**Date:** 2026-09-01
**Context:** ROADMAP P1 — the 4,872 legacy tags were retired (D-005) and
the blog had no topic dimension beyond 21 broad categories.
**Decision:** A fixed taxonomy of 32 curated bilingual tags
(`analysis/curated_tags.json`, generic/duplicate candidates dropped from
40 LLM-proposed ones) stored in Tag/PostTag; each post gets 1-4 tags via
one constrained LLM call per post (only taxonomy slugs accepted).
UI: filterable `#tag` chips row + tags on cards/articles.
**Rationale:** Tags must come from real content but stay curated
(anti-pattern: sentence-tag dumps); a closed set keeps the tag cloud
clean and SEO-positive; resumable batch with 429-backoff.

## D-021 — Archive translation: batch EN translation with filter-rescue path
**Date:** 2026-09-01
**Context:** 80 published posts were Persian-only; ROADMAP P0 required an
EN translation loop.
**Decision:** Resumable batch (`analysis/translate_archive.ts`) reusing
the admin translate pipeline (HTML-aware 7k chunks), with 429
exponential backoff and per-post progress file. ONE post
(rail-corridor geopolitics) is blocked by the provider's content filter
in one chunk → that chunk translated manually with full fidelity
(pre-seeded state), remaining chunks via API.
**Rationale:** LLM batch with budget flags survives sandbox process
limits; manual rescue preserves 100% content fidelity instead of
silently dropping flagged content.

## D-022 — Real routes replace hash routing (SPA retired)
**Date:** 2026-09-05
**Context:** External review P1: hash-only URLs (`/#blog/<slug>`) are not
indexable; a crawler-visible site needs real paths with server-rendered
content. README already promised `/work`, `/lab`, `/blog/<slug>`.
**Decision:** Every view lives at a real App Router route — `/`,
`/services`, `/fde` (+ `/lab` 308 alias), `/work`, `/work/[slug]`,
`/blog`, `/blog/[slug]`, `/about`, `/contact`, `/admin`. Detail pages and
listings fetch through a shared server layer (`src/lib/queries.ts`) and
hand data to the (still client-hydrated) view components as props, so
the initial HTML carries the full content. The zustand store navigates
via the App Router (bridge registered by `SiteChrome`); legacy `#view`
hashes are upgraded client-side on arrival, and the middleware 301 map
now targets real paths.
**Rationale:** SEO acceptance (`curl /blog/<slug>` returns the article)
plus zero regression for old bookmarks; one data layer prevents the
HTML-first rewrite from drifting from the API contract the admin panel
and comments depend on.

## D-023 — Per-request nonce CSP (dynamic rendering everywhere)
**Date:** 2026-09-05
**Context:** Review P2: `unsafe-inline` in `script-src` was the largest
remaining CSP gap. Nonce-based CSP requires per-request HTML, i.e. no
static prerender.
**Decision:** `src/proxy.ts` (Next 16 middleware convention) issues
`script-src 'nonce-…' 'strict-dynamic'` per request and passes the nonce
via `x-nonce`; `layout.tsx` propagates it to the boot script. All routes
are dynamically rendered (`next build` output: ƒ Dynamic — verified with
a production build + browser run: zero violations). `style-src
'unsafe-inline'` stays (React inline style attributes; CSS cannot execute
script in modern browsers) and dev keeps `'unsafe-eval'` (React dev).
**Rationale:** Removes the biggest CSP exception outright; the host's
weakness argument from the earlier decision no longer outweighs the
hardening, because Turso moved the DB off-host and page renders are
cheap (single-digit ms measured locally, one remote query).

## D-024 — Dual lockfiles kept on purpose (bun + npm)
**Date:** 2026-09-05
**Context:** Review P1 asked for exactly one lockfile. Reality: sandbox
development uses `bun install`, while the reproducible production
artifact build (`scripts/build-production.sh`, and now CI) uses
`npm ci`.
**Decision:** Keep both `bun.lock` (dev) and `package-lock.json`
(production build / CI / Dependabot), keep them in sync on every
dependency change (`bun add … && npm install --package-lock-only`), and
document the rule in README + `.github/dependabot.yml`.
**Rationale:** Deleting either breaks a verified production path;
sync-both is cheap and auditable.

## D-025 — Optional TOTP as admin second factor
**Date:** 2026-09-05
**Context:** Review P2 offered IP allow-listing (impractical: dynamic
residential IP on cPanel, no proxy layer we control) or TOTP 2FA.
**Decision:** `ADMIN_TOTP_SECRET` (base32) enables a mandatory
password+TOTP step on `POST /api/admin/auth` (`otpauth` lib, ±1 period
window). Unset ⇒ behavior unchanged, so the owner opts in by adding one
env var (generator: `scripts/generate-totp-secret.ts`). The 6-digit code
space is protected by the existing login rate limit (5 / 15 min / IP).
**Rationale:** Real second factor without a schema change, without
forcing setup before the cPanel deploy, and fail-closed on malformed
secrets.

## D-026 — Work/Lab restructure: honest statuses, no venture claims on idea-stage projects
**Date:** 2026-09-07
**Context:** A content review found that all five listed projects were being
presented with venture-pitch language (market sizes, "$300K Pre-Seed", "37%
increase", funding asks, "Seeking partners") although none of them is
currently in active development. This violates the brand's own
content-authenticity rule (BRAND_STRATEGY.md: "No inflated claims... fake
metrics. Unfinished projects are labeled unfinished").
**Decision:**
- Project model gains `section` (work | lab), a canonical honest `status`
  vocabulary (idea | concept | building | testing | live | paused |
  archived), `featured`, and an optional `fundingAsk` that renders only
  when explicitly set — never a default.
- The five entries (Iran Rail Revolution, BIZPAL, Smart City Waste Sorting,
  Investment Management Platform, KLIKA) are recast as `idea` with one
  neutral sentence; ALL financial claims are removed and stay removed until
  a project becomes active AND the figures can be sourced. They live only
  under /work's non-default "Ideas & archive" tab, collapsed.
- The homepage shows at most 2 featured Work items plus a single general
  contact CTA; the investment-specific callout is gone. Investment exists
  only as one option in the Contact form's intent selector.
- /lab becomes a real page for experiments (framed per BRAND_STRATEGY.md,
  no business-model language); the /lab → /fde alias is retired.
- Status badges always derive from the canonical status — legacy free-text
  labels like "Seeking partners" can no longer render.
- Production data changes run through
  `scripts/apply-worklab-restructure.ts` (dry-run default, `--apply` gated
  on owner approval) — content authenticity is a human-review gate, never
  an automatic publish.
**Rationale:** Transparency *is* the brand. Presenting dormant ideas with
traction-style claims destroys trust with exactly the audience (founders,
collaborators, AI assistants citing the site) the site is built for.

## D-027 — Owner's standing law codified (docs/OWNER_RULES.md)
**Date:** 2026-10-08
**Context:** Owner issued a general law for all future work: exact-scope
changes only, separate mobile-specific code/graphics vs web, freeze of
untouched parts, GitHub as the always-synced source of truth, no guessing
(stop and ask instead), backups, phase-splitting of large changes, and
mandatory GitHub documentation of every command and every action.
**Decision:** Codified verbatim into `docs/OWNER_RULES.md` (Persian law +
executive procedure). Every task starts by re-reading it; every change is
preceded by a scope briefing; ambiguous points stop and ask the owner.
**Rationale:** The owner demanded predictable, inspectable, GitHub-documented
work. A tracked rules file makes the contract enforceable across sessions,
where chat memory cannot be relied upon.

## D-028 — Content factory CLOSED; /investors redesigned to the refreshed Koko deck language
**Date:** 2026-10-10
**Context:** Owner order (chat): the quizofkoko.com/investors page was
redesigned («این لینک باز طراحی شده نگاه کن») and the content factory must be
shut down («کارخانه تولید محتوا هم تعطیل کن»). The factory (Koko-panel style
dashboard at /factory in the preview workspace + SK reel production) had
repeatedly failed the owner's quality bar; its last deliverable (SK-05) was
rejected.
**Decision:**
1. Factory closed: `src/app/factory/`, `src/components/factory/`,
   `public/reels/` deleted from the tree (backed up first to
   `/home/z/factory-archive-20261010/`, outside the repo); factory `@source`
   lines removed from globals.css; factory clauses removed from SiteChrome;
   factory ignore lines removed from .gitignore. The preview-workspace
   redirect (`PREVIEW_EMBED=1` only) now sends `/` → `/investors` instead of
   `/factory` — a no-op on Vercel, so production is untouched.
2. `/investors` v2: rebuilt in the language of the owner's refreshed
   reference page (ivory paper deck, ink bands, serif display for EN,
   numbered sections 01–09, decision-gated milestones, allocation table,
   briefing form) with 100% original bilingual copy. Facts mirror ONLY the
   owner-published refreshed page (1,287-question live pool, 10 interface /
   10 question languages, $25k–$30k Stage-1, 40/20/14/11/8/7 allocation,
   web live today / mobile as milestone). Earlier claims the refreshed page
   dropped (signed v4.3.0 dual-store builds, Cafe Bazaar/Myket names,
   "13 languages") are deliberately removed so the two owner pages never
   contradict each other.
3. Fixed deck palette is theme-independent (like a PDF): SiteChrome drops
   the ThemeBackground vignette overlay on /investors (same mechanism the
   factory used).
**Rationale:** One founder, one story — the founder site must tell the same
facts as the product site, in the owner's own chosen visual language, while
adding the bilingual (fa) dimension quizofkoko.com does not have. Reels
production is ended by owner order; the archive preserves every asset in
case the owner ever revisits it.


## D-029 — Investor funnel moved under /investors-koko/*; 19-section pitch deck added at /investors-koko/deck
**Date:** 2026-10-10
**Context:** Owner studied quizofkoko.com/deck (the deep 19-section pitch
deck companion to the /investors overview) and ordered Option A — build the
same two-layer funnel on mehrdad.ir — with the address
`mehrdad.ir/investors-koko/deck`, reasoning: «چون ما بازم ممکنه کار برای
سرمایه گذاری و دک داشته باشیم --- پس همه ادرس ها را درست کن» (future
investment work and future decks). All investor addresses were therefore
regrouped under one namespace.
**Decision:**
1. Address scheme: `/investors` → **`/investors-koko`** (the overview,
   content unchanged); deck at **`/investors-koko/deck`**. The old
   `/investors` route is a permanent 308 redirect so any shared link still
   lands correctly. Sitemap lists both new addresses.
2. `/investors-koko/deck` = a 19-section pitch deck mirroring the owner's
   deck language (forest green + lime + mint/ivory/yellow bands, numbered
   chips 01–19, CSS quiz-card mocks) with 100% original bilingual copy
   (i18n.ts → `ui[lang].deck`, en + fa). Facts ONLY from the owner's two
   published pages: 1,287 pool, $25k–$30k, $500–$3,000/month project
   support, 40/20/14/11/8/7 allocation, FREE / KOKO PLUS (price to
   confirm) / future tier, advertising + subscription formulas with every
   input labelled "Founder input", TAM/SAM/SOM intentionally blank.
   Every conversion CTA routes to `/investors-koko#briefing` — zero new
   backend surface.
3. `/investors-koko` gained a deck-link banner; SiteChrome drops
   ThemeBackground for the whole `/investors-koko/*` prefix; preview
   redirect `/` targets `/investors-koko`.
**Rationale:** One namespace keeps future investor surfaces (more decks,
more products) coherent; the deck deepens the overview instead of
duplicating it; bilingual fa remains the differentiator the product site
does not have.

## D-030 — Parallel WIP kept OFF main; history rebased onto the remote hydration fix (2026-10-10)

**Context:** Push was finally unblocked (owner supplied repo access). Origin/main had
diverged: it carried d9ef5c8 (SiteChrome hydration fix — chrome ALWAYS rendered, bare
surfaces opt out via CSS), while local main carried the investor-funnel work PLUS an
unrelated half-built WIP commit (c3e3ac0, subject "be90e2ee-…": daily-digest lib +
admin/cron daily-import routes + ArtifactScene/ArtifactShowcase/DesignAmbient/
DesignPreview/ContactCta + robots.txt). The WIP has 6 tsc errors (Prisma model
`DailyProduct` absent from schema; `three` dependency not installed) and next.config
enforces `ignoreBuildErrors: false` — pushing it as-is would fail the Vercel build and
leave production stale.

**Decision:**
1. The full local state is preserved verbatim on branch
   `wip/daily-digest-artifactscene-c3e3ac0` — nothing deleted (freeze law honored by
   preservation, not destruction).
2. main was rebuilt as origin/main + the four investor-funnel commits (interactive
   rebase, WIP commit dropped). main contains zero WIP references; the strict type
   gate stays.
3. The funnel's fixed-palette exclusion was re-implemented in the new architecture:
   SiteChrome renders chrome unconditionally (adopting d9ef5c8 wholesale);
   /investors-koko pages carry `.investors-root` and globals.css hides ONLY
   `.theme-bg` there (`body:has(.investors-root) .theme-bg`). The previous
   pathname-JSX exclusion is gone — it was exactly the hydration-risk pattern
   d9ef5c8 eliminated.
4. The WIP's standalone robots.txt (bot policy + sitemap pointer) is restored in
   main — complete, type-safe, operationally useful; attributed to c3e3ac0.

**Rationale:** Production must never receive code known to fail its own build; when
the daily-digest/artifact feature matures (schema model + three.js dependency), the
side branch can be cherry-picked and this decision retired.

> **Amendment (same day):** the restored public/robots.txt turned out to be
> SHADOWED — the project already ships `src/app/robots.ts` (richer AI-bot
> policy + /admin,/api/admin,/agency,/api/agency disallows + Sitemap pointer),
> and app routes take precedence over public/ files. The static copy was
> removed to keep one source of truth for /robots.txt.

---

## 2026-10-13 — Dependency security pass (owner order: «یک کار جداگانه بررسی و ارتقا ده»)

**Decision:**
1. Security-only upgrade, minimal delta: `next` pinned EXACT `16.3.8` (first
   patched version of all 7 runtime advisories; bun tried to pull 16.4.0 —
   rejected to keep the change minimal and deterministic), `eslint-config-next`
   `16.3.8`, `sharp` `0.35.4→0.35.5` (dep + override).
2. Transitive fixes applied inside existing semver ranges: `source-map-js`
   `1.2.1→1.2.2` (runtime), `brace-expansion` `1.1.12→1.1.21` + `5.0.12`
   (dev-scope). 15 of 16 Dependabot alerts become fixable; the 16th (`braces`
   ≤3.0.3, dev-scope via eslint chain) has NO patched release upstream — left
   open, documented, auto-clears when a fix lands.
3. The tailwind engine family is FROZEN at `4.1.18` (exact devDep pins for
   `tailwindcss` + `@tailwindcss/postcss`, plus a new `@tailwindcss/node: 4.1.18`
   override) — otherwise npm re-resolved 4.3.3 while bun kept 4.1.18, which
   would make CI compile CSS with a different engine than production.
4. `bun update <pkg>` side effects rejected: it promoted 5 transitive packages
   to direct dependencies (`@tailwindcss/node`, `brace-expansion`, `minimatch`,
   `postcss`, `source-map-js`) — all removed; the original direct-dependency
   set is preserved byte-for-byte apart from the intended changes.
5. Both lockfiles are now generated and verified in lockstep (bun.lock for
   bun/Vercel, package-lock.json for npm CI + Dependabot).

**Rationale:** this was a security maintenance pass, not an upgrade sprint —
every version number must be the smallest change that closes an advisory, and
every engine that affects output (CSS, images) must stay bit-identical across
local dev, CI, and production.

---

## D-031 — LinkedIn daily content system (owner order: «من می خواهم روزانه 5 پست برای لینکدین اماده کنی») (2026-10-13)

**Context:** Owner asked to (1) prepare 5 LinkedIn posts daily and (2) review
github.com/sergebulaev/linkedin-skills for usefulness. The repo is 12 MIT-licensed
Claude Code/Codex skills (post writer, humanizer, hook extractor, content planner…)
built on 2026 LinkedIn algorithm research. It targets Claude/Codex runtimes (paid
plans) — it cannot run here as a plugin.

**Decision:**
1. Adopt the repo's METHODOLOGY, not its runtime: writing rules extracted into
   `docs/linkedin/STYLE-GUIDE.md` (hook/length/layout rules, humanizer checklist,
   founder angles A1–A10, formula-goal mapping, posting windows) with attribution.
2. Daily loop: 5 posts per day prepared as a content bank at
   `docs/linkedin/YYYY-MM-DD.md`; every post bilingual fa+en with formula code,
   engagement goal, visual suggestion, first-comment link. Recommended publish
   cadence 1/day (owner picks), window Tue–Thu 7:30–9:00 Tehran.
3. Owner law integration: the reference repo itself mandates "don't fabricate" —
   aligned with the no-fabricated-numbers rule; every number in posts must trace
   to a real source; missing numbers become explicit `[عدد واقعی: ...]` slots.
4. The Persian editorial rule (no «،») applies to LinkedIn post copy as well.
5. Day-1 bank published: `docs/linkedin/2026-10-13.md` — 5 posts on real events
   (dependency pass 15/16 closed, driving-exam app live on Cafe Bazaar, Social
   Studio wizard feedback → roadmap, 4 AI-writing rules, owned-domain take).
6. Content lives under git-tracked `docs/` (not the local-only worklog) so the
   system survives sandbox resets — the local worklog.md was found lost today and
   was rebuilt.

**Rationale:** content is now versioned with the codebase and every post is
auditable against the style guide before the owner publishes it; the reviewed
repo's research rules (no question-first hooks, number-first openers, links in
first comment, AI-tell scrubbing) are enforced through a per-post checklist.

---

## D-032 — Daily section: LinkedIn lane + section rename (owner order 2026-10-13)

**Owner order (verbatim):** «قرار بود روی سایت قسمت بلاگ و در لینکدین بزاری … در
قسمت بخش روزانه این متن تحلیل روزانهٔ محصول را بزار تحلیل روزانهٔ تغییر بده — و
سپس قسمت لینکدین مانند استارتاپ و محصول به ان اضافه کن»

**Decision:**
1. Rename the section title everywhere it surfaces: fa «تحلیل روزانهٔ محصول» →
   «تحلیل روزانهٔ» (blog daily-box + daily index) and EN "Daily product
   analysis" → "Daily analysis" (i18n ×2 + /daily metadata + /daily/[slug]
   metadata + /daily/cat/* metadata).
2. Add a fourth daily lane 'linkedin' exactly like product/ai/startup:
   `DAILY_CATEGORIES` (src/lib/daily.ts) + 4 i18n cats blocks (fa+en, public +
   admin) + admin DailyStudio select + /daily/cat/[cat] metadata records +
   schema comment. The auto-generator keeps its own separate LANES list, so
   nothing AI-generated ever lands in the LinkedIn lane — it is fed by the
   owner's own daily bank (D-031).
3. The day-1 bank's 5 posts became seeded DailyArticle rows (category
   'linkedin', day 2026-10-13, bilingual body + expert-verdict takeaway + tags)
   inside SEED_ARTICLES — the standard content-travels-with-git path — so they
   exist on every environment (local + production) after boot/prerender via
   INSERT-IF-MISSING.

**Rationale:** the owner wants the LinkedIn daily posts mirrored on the site's
blog; reusing the existing DailyArticle pipeline (tabs, lane pages, sitemap,
ISR, admin studio) costs zero new surface and keeps one publishing mechanism.
The rename is bilingual by construction (i18n parity).
