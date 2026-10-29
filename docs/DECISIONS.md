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

---

## D-033 — Quiz of Koko: Cafe Bazaar link beside the web CTA (owner order 2026-10-13)

**Owner order (verbatim):** «کوکو توی کافه بازار منتشر شده اینم لینکش در جای مناسب
و با دقت قرار بده و فقط همین قسمت را تغییر بده مراقب باش جای دیگه تغییر نکنه و
بقیه قسمت ها را فریز کن»

**Decision:**
1. The Koko app's Android store link (https://cafebazaar.ir/app/com.quizofkoko.game
   — verified HTTP 200 on 2026-10-13) is added as a SECOND live link for the
   quiz-of-koko slug only, in the existing pure-code link system
   (src/lib/project-links.ts): a new optional `PROJECT_EXTRA_LINKS` map +
   `getProjectExtraLink()` accessor, same slug-keyed pattern as
   PROJECT_LINKS / PROJECT_LINK_CTA. No DB column, content travels with git.
2. ProjectDetail renders it as a secondary outline button (Smartphone icon,
   «دریافت از بازار» / "Get it on Cafe Bazaar" — the exact strings already
   used by driving-exam) beside the primary web CTA (quizofkoko.com stays
   primary, untouched). Slugs without an entry keep the single-button layout —
   every other project is byte-identical (freeze proven by diff: only
   project-links.ts + ProjectsView.tsx).
3. Repo hygiene: local main had diverged from origin/main — a duplicate of the
   D-032 commit (a76a237) had resurrected the two files that commit b316d41
   deliberately removed (stale src/middleware.ts + public/robots.txt which
   break builds). Local main was hard-reset to origin/main (1d078cd) BEFORE
   this work, so this task ships on top of the exact deployed tree.
4. Local test fixture: the local SQLite DB was missing the quiz-of-koko row
   (production DB only), so a local-only fixture was inserted copying the
   production row's real values verbatim (JSON-LD + RSC payload of
   mehrdad.ir/work/quiz-of-koko — zero invented copy). Not committed; the
   committed change remains 2 code files + this doc.

**Rationale:** the owner announced the Bazaar publication and asked for the link
in the appropriate place with everything else frozen. Adding a second channel
(the one-product-story pattern traffic-tempo already uses for Bazaar link +
browser demo) adds the new link without demoting the live web game or touching
any other section.

---

## D-034 — Reserved standalone address /deck/health (owner order 2026-10-13)

**Owner order (verbatim):** «یک صفحه بهت میدهم دقیق می خواهیم همینو نشون بدهیم
نه اینکه تو قالب وب سایت بره فقط برای پیج دک سلامتی هست باید ادرس بدهیم اوکی؟»
+ «نه سلامتی را لینکش را به انگلیسی بنویس — پیج دک را بهت میدهم و میگم چیکار
کنیم فعلا لینک را باید بسازی»

**Decision:**
1. The address is ENGLISH per the owner's correction: **mehrdad.ir/deck/health**
   (not the Persian transliteration). It is a RESERVED standalone surface for
   the Health & Wellness deck the owner will deliver next — when it arrives it
   renders EXACTLY as given, with ZERO site template around it (no header,
   footer, AI chat bubble, lang banner or theme background).
2. Bare-surface mechanism reuses the proven always-render-chrome + CSS
   opt-out pattern: a new `.deck-root` marker class joins .factory-root /
   .play-root in the globals.css bare-surface block. JSX never branches on
   pathname — no hydration risk. (First browser check caught a stale
   Turbopack CSS chunk serving the intermediate rule; re-triggering the
   bundler fixed it — the shipped file was verified complete: 5 selector
   groups + comment.)
3. Until the owner's page arrives the route renders a restrained
   reserved-note placeholder (DeckHealthReserved.tsx — bilingual, zero
   claims, zero invented numbers) and carries robots noindex INTENTIONALLY;
   the noindex must be removed in the same commit that replaces the
   placeholder with the real deck. Not added to sitemap.xml (manual list).
4. Engineering note learned on the way: the local SQLite DB is EPHEMERAL
   (a dev-server restart at 18:42 restored it to seed-only state — the
   uncommitted local quiz-of-koko fixture from D-033's testing vanished).
   Local-only data is never relied on for verification evidence anymore;
   production is always checked directly.

**Rationale:** the owner needs the shareable address to exist NOW and will
hand over the deck page afterwards; a reserved bare route costs nothing, is
reversible, and the real page will drop in without touching any other file.

---

## D-035 — Health & Wellness deck ships verbatim + bilingual (2026-10-13)

**Owner orders (verbatim):**
- «یک صفحه بهت میدهم دقیق می خواهیم همینو نشون بدهیم نه اینکه تو قالب وب سایت بره
  فقط برای پیج دک سلامتی هست باید ادرس بدهیم»
- «نه سلامتی را لینکش را به انگلیسی بنویس» → address = /deck/health (D-034)
- «فقط فعلا قرار بده چون تغییرات را هنوز انجام ندادیم و دو زبان قرار بده»
  (uploaded file: [Brand] — The Health & Wellness Super App (1).html)

**Decision:**
1. The deck is served as a FULL STANDALONE HTML DOCUMENT by route handlers
   (deck/health/route.ts + deck/health/fa/route.ts + shared deck-html.ts builder).
   Route handlers bypass the root layout — the site template (header, footer,
   globals.css, chat, PWA pill, fonts) physically cannot reach the deck. Stricter
   and more faithful than the .deck-root CSS opt-out; that CSS block stays in
   globals.css untouched (inert for this route, zero effect).
2. Bilingual = two baked documents from one builder (no runtime i18n, no FOUC,
   no reveal-animation glitches): /deck/health = EN exactly as delivered;
   /deck/health/fa = FA mirror (dir=rtl, Vazirmatn, mirrored tag pill + phone
   tilt, ← arrows, «فعال» tag). A language pill in the deck's own nav switches
   /deck/health ↔ /deck/health/fa preserving the #anchor.
3. ZERO content invention: every number comes from the owner's file (numeric
   tokens identical in both languages); placeholder slots ([Brand], [$X], [Y%],
   [K], [figure + source], [Founding story], [% complete / current stage],
   [prototype / alpha / beta], [waitlist or sign-ups]) remain VERBATIM in both
   languages — the owner explicitly said their edits are not done yet. FA copy
   contains no «،» (standing rule).
4. CSP: the deck loads Google Fonts, so /deck/health/:path* gets a deck-only CSP
   override in next.config.ts (adds fonts.googleapis.com to style-src +
   fonts.gstatic.com to font-src; everything else identical to the global floor).
   Next.js headers() last-match-wins per key — the deck rule is placed AFTER the
   global rule (verified by curl: deck gets the font CSP, /blog keeps the global
   one unchanged).
5. D-034 obligation executed in the same change: the reserved placeholder
   (DeckHealthReserved.tsx) and its temporary robots noindex are REMOVED now that
   the real deck is live. Not added to sitemap.xml (unchanged policy).

**Rationale:** the owner wants the exact uploaded page at the reserved address,
in two languages, before they apply their own edits. A raw standalone document is
the only rendering that guarantees pixel-faithfulness ("not inside the site
template"), and route handlers make template leakage structurally impossible.

---

## D-036 — Final landing replaces the deck at /deck/health — EN byte-exact + FA mirror (2026-10-16)

**Owner order (verbatim):** «این فایل نهایی است --- پس اون فایل قبلی را پاک کن و اینو
جایگزین کن -- نباید فونت یا هر چیزی روی این تغییر کن فقط ابتدا بزار بدون هیچ تغییری
تا بهت بگم چیکار کنیم--- فقط باید ترجمه بشه و نسخه فارسی اون ساخته بشه همین اونم با
همین شکل فونت و زیبایی --- توجه داشته باش نسخه انگلیسی را اصلا نباید دستکاری کنید --
فقط باید نسخه انگلیسی را بزاری و نسخه فارسی را دقیق مثله همین بسازی»
(uploaded file: health-superapp-landing-en (1).html)

**Decision:**
1. The uploaded landing ("Vivora (working title)") REPLACES the 2026-10-13 investor
   deck (D-035) at the same addresses. deck-html.ts (the old deck) is DELETED per
   the owner's explicit order; git history retains it as the backup.
2. EN (/deck/health) is BYTE-EXACT: the file's exact bytes ship via
   landing-en.ts (generated by scripts/build-health-landing.mjs from the upload).
   Verified with `cmp` locally AND in production after deploy: zero difference —
   no font change, no wording change, no injected UI. Placeholder slots
   ([$X] [Y%] [CTO] [Medical advisor] [One line of relevant experience]
   [Founding story, one honest sentence] [HIPAA / GDPR roadmap] [ ]%) stay verbatim.
3. FA (/deck/health/fa) is built from the SAME bytes by an ordered exact-string
   replacement map (401 rules, 422 occurrences — every target asserted found):
   identical design/layout/CSS, lang="fa" dir="rtl", Vazirmatn added ONLY as the
   Persian glyph font (Inter/Space Grotesk untouched for Latin+digits so numbers
   keep the EN look), numeric tokens identical (149,962 / 303 / 147 / 1,139 /
   $6.8T / $9.8T / $2.3T / …), and zero Persian comma «،» (standing rule).
   FA-only CSS additions (appended inside the same <style>): Persian font stacks,
   letter-spacing resets for joined script, td.l/th.l right-aligned, roadmap tag
   and ring-score mirrored, end-of-line auto-margins flipped, arrow -6px hover.
4. Both routes remain standalone route handlers (force-static) — the site template
   cannot reach them. CSP: the existing D-035 deck override already whitelists
   fonts.googleapis.com + fonts.gstatic.com — next.config.ts untouched.
5. Language switching is by address only (/deck/health ↔ /deck/health/fa): the
   owner froze the EN file, so NO toggle pill is injected into either version —
   different from D-035's baked toggle. Reversible on owner order.
6. Not added to sitemap.xml (unchanged policy). No robots change (unchanged D-035
   policy: indexable, out of sitemap).

**Self-test evidence (before ship):** cmp byte-exact EN (local + prod); FA asserts
(no «،», dir=rtl, placeholders, numeric tokens); browser EN+FA at 1440px AND 390px —
no horizontal overflow; anchor nav works; unit-economics calculator interactive
(100k→500k users recompute correctly, $300K→$1.5M; FA outputs «2.0 ماه» و «$2.00M
تا $5.00M»); traction section shows all six verified numbers identical in FA.

## D-037 — Floating language toggle on the Health landing (2026-10-16)

**Owner order:** «فقط یک دکمه FA روی قسمت انگلیسی بزار و روی فارسی یک دکمه EN که
بین هم لینک شده باشند هواست باشه هیچ تغییر نمی خواهم بدهی خیلی مهمه گرافیک دست
نخوره». This supersedes D-036 item 5 (address-only switching, no toggle): the
owner now explicitly orders a toggle — and equally explicitly forbids any other
change («هیچ تغییر نمی خواهم … گرافیک دست نخوره»).

**Decision:** inject a single floating pill via the route handlers, NOT by
editing the landing files.
1. `landing-en.ts` / `landing-fa.ts` remain byte-frozen (D-036 generation) —
   zero bytes touched. Machine-proven: `html.replace(snippet,'') === original`
   for both languages, i.e. removing the toggle returns the EXACT uploaded
   bytes; `</body>` asserted to occur exactly once (deterministic splice).
2. New `src/app/deck/health/lang-toggle.ts` renders one `<style>` + one `<a
   id="lang-fab">` spliced right before `</body>` by each route handler.
   EN route: label **FA** → `/deck/health/fa`, fixed bottom-right. FA route:
   label **EN** → `/deck/health`, fixed bottom-left (RTL mirror).
3. Styling reuses the landing's own `:root` vars (--card/--line/--tx/--b) +
   already-loaded Space Grotesk/Inter, `position:fixed` (cannot reflow any
   existing element), z-index 50 (above the nav's 9), 44px tall (touch
   target), `env(safe-area-inset-bottom)` respected, `!important` on
   color/text-decoration so global link styles cannot alter it.
4. `next.config.ts` CSP: same-origin anchor link, no new sources — untouched.

**Self-test evidence (before ship):** eslint clean; byte-safety proof above;
browser EN↔FA round-trip at 1440px AND 390px (click pill → counterpart page
loads with correct lang/dir each way); no horizontal overflow anywhere; pill
does not overlap footer/nav/text at any scroll position (screenshots checked);
zero console errors.

## D-038 — Language toggle moves INTO the nav badge slot (2026-10-16)

**Owner order:** «WORKING TITLE … من دکمه تغییر زبان را ندیدم جای این متن بالا
با فاصله کمی از اسم برند بزار --- فونت کوچک باشد». Two causes addressed:
(1) D-037's commit was still local (push awaited the PAT), so production showed
no toggle at all; (2) the owner now specifies the placement: the toggle lives
EXACTLY where the "WORKING TITLE" / «عنوان موقت» nav badge sat — replacing it
1:1, small gap from the brand name, small font. D-037's floating pill is
removed (superseded).

**Decision:** deterministic 1:1 badge swap in the route handlers; landing files
stay byte-frozen.
1. `lang-toggle.ts` now exports the exact badge strings (asserted UNIQUE —
   count=1 in each file) + `navLangToggle()` rendering one `<style>` + one
   `<a id="lang-fab">` styled EXACTLY like the old badge: 10px font, muted
   pill (var(--mu)/var(--line), radius 999, padding 2px 8px, Inter + .06em
   tracking on EN / Vazirmatn + no tracking on FA). The .logo flex gap (10px)
   keeps the owner-specified small gap from the brand automatically.
   EN route: label **FA** → /deck/health/fa. FA route: label **EN** →
   /deck/health (mirrored by RTL automatically). Hover/focus affordances only.
2. Byte-proof (bun, both languages): badge unique; served HTML with the toggle
   removed and badge restored === EXACT original bytes; badge markup absent
   from served output; delta +294 B (the toggle itself); zero «،».
3. The <title> "(working title)" and footer «"Vivora" عنوان موقت است» are the
   owner's own content — NOT touched (freeze rule).
4. No CSP/sitemap/robots changes (same-origin link only).

**Self-test evidence:** eslint clean; browser EN+FA at 1440px AND 390px —
toggle inside nav next to brand (measured gap exactly 10px both directions,
31×18px, 10px font); aria-role link click navigates both ways (round-trip
verified); no horizontal overflow; no console errors; WORKING TITLE /
«عنوان موقت» badge absent from both navs.

## D-039 — FA button font fixed to the content font (2026-10-16)

**Owner order:** «سرمایه‌گذاری --این دکمه- این فونت بالا اصلا خوب نیست فونت را
بهتر کن مثله فونت محتوا».

**Root cause (logged per standing rule):** the landing's `.btn` rule hardcodes
`font:600 15.5px Inter`. Inter ships NO Persian glyphs, so on the FA page every
button (nav «سرمایه‌گذاری» + hero/footer CTAs — 8 elements sharing the class)
fell back to an arbitrary system font — the ugliness the owner saw.

**Decision:** FA page only — deterministic, asserted-unique byte swap in
`fa/route.ts`: `font:600 15.5px Inter` → `font:600 15.5px
Vazirmatn,Inter,system-ui,sans-serif` (the EXACT chain the FA content already
uses: body{font-family:Vazirmatn,Inter,…}). Size (15.5px/.btn.sm 14px),
weight (600), colors, gradient, paddings: untouched. EN page needs no fix —
Inter IS the EN content font — and stays byte-frozen.

**Byte-proof:** old string unique in LANDING_FA (count=1); served FA with the
two swaps restored (badge + font) === EXACT original bytes; new chain present
exactly once; old hardcode absent; zero «،».

**Self-test evidence:** eslint clean; browser FA 1440px — nav button computed
fontFamily = "Vazirmatn, Inter, system-ui, sans-serif" (weight 600, 14px kept);
screenshot reviewed — joined Persian script matches body text; EN nav button
still "Inter" (untouched by design). D-038 toggle re-verified present.

## D-040 — Pitch-deck block on /work/health-app (2026-10-16)

**Owner order:** «mehrdad.ir/deck/health/fa این لینک فارسی و انگلیسی را در
استارتاپ https://mehrdad.ir/work/health-app در اینجا اپدیت کردی بگی پیچ دک
داریم و …؟ و اینم لینکشه؟» — the startup page must SAY the pitch deck is live
and link BOTH language versions. Answer was NO (live page had zero deck links);
implemented in the same change.

**Decision:** pure-code, slug-keyed (same pattern as PROJECT_LINKS /
PROJECT_EXTRA_LINKS / D-033 — content travels with git, production Postgres
untouched):
1. `src/lib/project-links.ts`: new `PROJECT_PITCH_DECKS` map + validated
   getter. Single entry `health-app`: deckEn → https://mehrdad.ir/deck/health
   + deckFa → https://mehrdad.ir/deck/health/fa + bilingual note copy
   (FA note has no «،» per standing rule).
2. `ProjectsView.tsx` ProjectDetail: amber investor box between the market
   story and the contact CTA (they read as one investor closing): note line
   (RTL-aware) + TWO outline buttons with Presentation icon — «پیچ دک —
   فارسی» / «پیچ دک — انگلیسی» (EN: "Pitch deck — Persian/English").
   Labels/note go through the site's OWN i18n pick(lang,…) — no new strings
   system. target=_blank on purpose: the /deck/* pages are standalone (no
   site chrome, no back link) so the project page stays open.
3. Every slug without a map entry renders byte-identical to before
   (verified: traffic-tempo has zero deck links).
4. NO production DB change — the live health-app row stays as-is; the block
   is code-side so it ships with the deploy.

**Self-test evidence:** eslint clean; local page EN + ?lang=fa (client-state
lang per the 2026-09-08 lang-mixing fix — server HTML is EN-default by
design): FA view shows Persian note + Persian labels + dir=rtl; EN view
English; click opens the deck in a NEW TAB (verified tab list);
390px — buttons wrap, no horizontal overflow; localStorage-cleared EN default
re-verified English; other project pages untouched.

## D-041 — Deck replaced with the owner's 2026-10-17 revision at both addresses (2026-10-17)

**Owner order:** «این پیج دک بروز رسانی شد --- اینو جایگزین کن --- بدون هیچ تغییری فقط
دکمه fa را روی اون بزار مثله همان پیج دک قبلی -- و فارسی اونم بزار» + upload of
«Vivora (working title) — The Health & Wellness Super App (3).html» (88,837 bytes).

**Decision:** the uploaded revision REPLACES the previous deck at /deck/health and
/deck/health/fa. Same pipeline as D-036/D-038/D-039, one source of truth:
`scripts/build-health-landing.mjs` now reads the (3) revision:
1. **EN byte-exact:** `landing-en.ts` === the upload, proven non-tautologically
   (`EN === readFileSync(upload)`). ZERO modification. The ONLY injected UI stays
   the D-038 nav toggle which 1:1 replaces the «WORKING TITLE» badge (badge markup
   verified byte-identical in the new file, occurs exactly once).
2. **FA mirror regenerated** from the same bytes: dir=rtl, Vazirmatn as the Persian
   glyph font, translated strings — the revision's NEW/CHANGED content all mapped:
   hero eyebrow (controlled testing · angel round), 12-month target labels, assistants
   strategy lead, «06 Honest status» roadmap item, market «Expansion order»/«Why us»,
   competitor table (MyFitnessPal/Noom/Headspace/Fitbit/Flo Health) + matrix header
   «Product», moat GDPR/HIPAA line, the NEW #safety section (8 items), revenue grid
   (subscriptions with prices + advertising), calculator churn slider (c_h/o_h) +
   new note, sensitivity table (.cs) + paragraph, growth referral copy + K/$ grid,
   funds section (donut chart + legend + 6 milestones + planned advisor/technical
   lead) and the $200K-$300K angel CTA. FA-CSS injection retargeted from
   `</style>` to `</style>\n<noscript>` (asserted unique — the revision adds a
   second style block; naive injection would have duplicated the FA CSS) plus one
   new RTL fix `.lg b{margin-left:0;margin-right:auto}` for the donut legend.
   FA assertions extended: new-revision strings present in FA, old-EN strings absent,
   27 numeric tokens survive, zero «،».
3. **Placeholders are gone** in this revision ([CTO], [$X], [Y%], [ ]% … replaced by
   real copy) — the D-036 "placeholders verbatim" assertion was replaced by
   new-revision identity checks.
4. Route handlers unchanged in behavior: EN = 1 swap (badge→FA toggle), FA = 2 swaps
   (badge→EN toggle + D-039 .btn font chain). `font:600 15.5px Inter` verified still
   unique in the new file.

**Self-test evidence:** eslint clean; byte-proof EN===upload (true), badge count 1/1,
FA-CSS blocks=1; browser 1440px — EN: eyebrow "MVP in controlled testing · Angel round
open", #safety present, churn slider live ($2.00 default, o_h updates on input),
$250K donut + legend + milestones render, CTA "Raising $200K to $300K from angels.";
click FA toggle → /deck/health/fa: dir=rtl/lang=fa, Persian eyebrow/safety/milestones/
CTA/churn, Vazirmatn body font, FA .btn chain intact, EN toggle back-links; 390px EN —
badge-slot toggle beside brand, stats 5/2/1M with new labels.

**Known finding (reported to owner, NOT changed — «بدون هیچ تغییری»):** the revision's
new `.cs` sensitivity table (scenario section) is not inside a `.scroll` wrapper, so
at 390px it causes horizontal page overflow (scrollWidth 570 vs 390) on both EN and
FA. The previous deck had zero overflow at 390px. A one-line fix exists
(`.cs{display:block;overflow-x:auto}` swap in both route handlers, bytes otherwise
frozen) — awaiting owner approval before touching his file's rendering.

## D-042 — Deck mobile fix: sensitivity table scrolls internally (2026-10-17)

**Owner order:** «نسخه موبایل این پیج دک درست نمایش داده نمیشه مثلا برای فارسی
انگار باید صفحه را جابجا کنی ابتدا یک بررسی بکن» — then the deploy token (approval
to ship the proposed fix).

**Investigation (worklog Task 6):** the 2026-10-17 revision's `.cs` sensitivity
table is the ONLY table outside the file's own `.scroll{overflow-x:auto}`
container. The file's global `table{width:100%;min-width:520px}` pushed the whole
page 180px past a phone viewport (scrollWidth 570 vs 390). EN overflowed to the
right; FA (dir=rtl) overflowed to the LEFT edge — page opens with columns cut off
and must be shifted (owner's exact symptom). Hiding `.cs` in the browser returned
scrollWidth to exactly 390 on both languages → single root cause proven. Old deck
already had the min-width rule but no `.cs` table — the regression came with the
new revision. Affected: every viewport narrower than ~568px; desktop/tablet fine.

**Fix (minimal, owner-approved):** `src/app/deck/health/cs-scroll.ts` —
`mobileSafeCsTable(html)` does exactly two asserted-unique insertions:
1. `.cs-scroll{overflow-x:auto}` right after the unique `.cs th{…}` CSS rule —
   no borders/background/radius/margins, so on viewports where the table fits
   (~>=568px) nothing renders differently (clientW 993 === scrollW 993 at 1440px).
2. `<div class="cs-scroll">…</div>` around the unique `<table class="cs">`.
In RTL the container starts right-anchored → the first (rightmost) Persian
column is visible on load. Both route handlers apply it: EN = badge→toggle +
cs-scroll; FA = badge→toggle + .btn font chain + cs-scroll.

**Byte proofs:** round-trip positional inverse inside the helper (throws unless
removing the two insertions returns the EXACT original); external proof script:
container+rule exactly once per language, toggle/font/rtl/«،» assertions pass,
exact positional inverse === pre-D-042 output for both languages. Frozen
landing files untouched (still the owner's 2026-10-17 bytes verbatim); page grows
by exactly 56 bytes per language (89,176→89,232 EN, 100,204→100,260 FA).

**Self-test evidence:** eslint clean. Local 390×844: EN scrollW=390, .cs-scroll
289px client / 520px scroll (internal scroll), right edge 340<390; FA scrollW=390,
scrollLeft=0 (RTL right-anchored), screenshot shows the sensitivity table inside
its own card with the page unshifted. Desktop 1440: scrollW=1440, no scrollbar on
.cs-scroll, layout pixels unchanged. Toggle round-trip EN→FA→EN works at 390px.

**Deployment:** commit pushed to GitHub main with the owner's NEW fine-grained
PAT (inline, never stored — supersedes the earlier classic PAT); Vercel auto-deploy
verified below in the worklog entry with production byte-for-byte + mobile checks.

## D-043 — Vivora deck as a blog series: one post per slide, each with its own PDF (2026-10-17)

**Owner order:** «به نظرم به شکل صفحاتی در بیار در قسمت وبلاگ بزاریم» + «یعنی هم
فایل pdf باشه هم متن‌هایی برای توضیحات… تک تک صفحات را بزاریم بصورت pdf هم برای
هر کدام از صفحات توضیح بدهیم برای سرچ گوگل هم خوبه» — confirmed with «باشه».

**What was built:** the uploaded PPTX (19 slides) becomes 19 real blog posts in
the existing DB-driven blog (listing + archive + sitemap + RSS + admin-editable),
NOT static clones: `vivora-deck-01-cover` … `vivora-deck-19-team`. Each post
carries: the slide image as cover (PNG), an original bilingual explanation whose
every statement traces to that slide's own text (no invented numbers, each
slide's own caveat quoted as a blockquote), a link to that slide's PDF, a link
to the live interactive deck (EN → /deck/health, FA → /deck/health/fa), and
prev/next series links (internal link equity across all 19).

**Assets pipeline:** LibreOffice headless PPTX→PDF → per-page split →
Ghostscript /ebook re-distillation (988K→20-24K per page) →
`public/media/vivora-deck/vivora-deck-slide-XX.pdf` + 110dpi PNG covers
(48-100K). 2.8MB total. Glyph-heavy capability table and the $250K donut
verified visually.

**Data pipeline:** `scripts/seed-vivora-deck-posts.ts` (local SQLite) and
`scripts/seed-vivora-deck-posts-supabase.ts` (production, Management-API
over HTTPS, SUPABASE_TOKEN env-only) — upsert-by-slug, content-only refresh,
date/published/featured stay owner-managed (same contract as D-029 koko
seeds). Dates staggered −1min so the feed reads 01→19. Category سرمایه-گذاری
resolved, never invented. Built-in fail-loud asserts: 38 asset files exist
before any DB write; zero «،» in Persian copy (standing editorial rule).

**Sanitizer interaction (found + adapted):** the site-wide `sanitizePostHtml`
strips the `download` attribute and adds `rel=noopener` to internal links —
the seed content omits `download` so DB text equals rendered text; slide PDFs
open in the browser viewer (crawlable, `application/pdf`).

**Self-test evidence:** eslint clean; 19/19 seeded locally; /blog lists the
series in order; slide pages carry EN and (?lang=fa) FA bodies in initial
server HTML (blockquote + prev/next verified); PDFs served
`application/pdf`; sitemap +19 URLs; RSS carries the series; agent-browser:
listing order, PDF navigation, EN 1440 layout + footer, FA RTL toggle, 390×844
scrollWidth 390 (no overflow), related-posts cross-link the series; dev.log
clean.

**Deployment:** assets + scripts pushed to GitHub main (PAT inline, never
stored) → Vercel serves the PDFs/PNGs; production DB seed runs separately with
the owner's Supabase token, then one rebuild (blog is force-static) surfaces
the posts. Production verification logged in the worklog.

**Production completion (2026-10-18):** owner supplied the Supabase Management
API token (inline-only, never stored) → `seed-vivora-deck-posts-supabase.ts`
run against the production project: **19/19 rows INSERTed** (no rows pre-existed),
all `published=true featured=false source=ai`, dates staggered −1min
(slide 01 newest, feed reads 01→19), 19/19 category links → سرمایه‌گذاری
(exact DB slug matched, nothing invented), content sizes 886–1330 chars EN /
817–1284 chars FA; production Post table now holds 105 rows. The owner's
Vercel API token was tested and returned `403 invalidToken` on every endpoint —
so the rebuild was triggered the usual way: this documentation commit pushed to
main → Vercel auto-deploy (the mechanism that shipped every prior change).

## D-044 — Publora as the social-media bridge (2026-10-18)

**Owner order:** «از طریق این سایت می‌خواهیم https://app.publora.com/dashboard/quickstart
به شبکه‌های اجتماعی وصل بشیم» + API key provided inline.

**Investigation:** Publora = social scheduler with REST API + MCP (docs.publora.com,
LLM-friendly .md pages). REST base `https://api.publora.com/api/v1` with header
`x-publora-key`. Connecting social channels is BY DESIGN a manual dashboard OAuth
step — the API cannot do it. Free Starter plan: 3 accounts / 15 posts per month /
X (Twitter) requires Pro ($5.99/mo first account).

**Key tested:** owner's key valid — `GET /platform-connections` →
`{"success":true,"connections":[]}` (zero channels connected as of this writing).

**What was built:** `scripts/publora-push.ts` — the site→social bridge:
- `list` — connected channels + token health + plan hints when empty
- `show --slug S [--lang fa|en|both] [--tags ...]` — preview exact social copy
- `push --slug S [--lang ...] [--schedule ISO|--now] [--platforms linkedin,instagram] [--dry]`
  — creates ONE Publora post PER language (never a merged fa+en blob; the owner's
  own practice is separate fa/en posts), default mode DRAFT (safe: nothing goes
  out until scheduled/published from the dashboard)
- Content source: the site's own public `/api/posts/:slug` (production truth,
  zero tokens). Copy = post's own title/excerpt/category + link; cover PNG via
  `mediaUrls` (Publora downloads it server-side). NO invented facts, NO
  auto-translated text, hashtags only from `--tags` or the post's real category.
- Standing rule enforced: Persian copy zero «،» — incoming text normalised
  «،»→«؛» + fail-loud assert (verified on koko-investor-overview: 3 source
  commas → 0 in output).
- Secrets: PUBLORA_KEY env-only, inline, never stored (repo-wide policy).

**Self-test evidence:** eslint clean. `list` against live API: NONE + guidance.
`show` on vivora-deck-01-cover (both langs): correct bilingual copy, cover media
URL resolved, 0 «،». `show --tags` on vivora-deck-13: tags + category hashtag.
`push` without channels fails loud with the dashboard instruction (cannot
silently no-op). Full end-to-end push test is BLOCKED on the owner connecting
channels (manual OAuth) — the moment channels exist: `list` → `show` → `push`
`--dry` → real `push` draft → owner schedules from dashboard.

**Next step (owner, ~5 min):** dashboard → Channels → Add Channel → OAuth for
each platform (LinkedIn first per his drafts history). Then tell me which
platforms + whether Starter (free, no X) or Pro.

**First real push (2026-10-18, same day):** owner connected LinkedIn
(Mehrdad Heidari) + Instagram (startup_mt) — both token valid. Slide-01 of the
Vivora series pushed as TWO drafts (fa + en), each targeted at BOTH channels;
cover PNG ingested server-side (status ready). Verified via list-posts +
get-post APIs. Owner schedules from the dashboard. Allowance used: 2 of 15.

**Amendment (same day, owner order «فقط برای لینکدین استفاده کنیم»):** LinkedIn
is now the ONLY Publora target — script default changed (DEFAULT_PLATFORM =
linkedin; explicit --platforms still allows others) and both existing slide-01
drafts retargeted via the update-post API (Instagram removed). Verified via
get-post: both drafts now show a single LinkedIn target.

**Daily series staged (owner order «اولی را بفرست ولی مابقی فقط برای لینکدین
باشه هر روز یکی», 2026-10-19):** slide 01 published on LinkedIn (fa + en,
status published). Slides 02–04 scheduled daily at 10:00 Asia/Tehran
(06:30 UTC), fa only, LinkedIn only. Starter plan's real queue limit confirmed
empirically: 3 active scheduled posts (SCHEDULED_POST_LIMIT_REACHED at the 4th)
— so slides 05–19 are staged as 15 ready drafts (drafts consume neither the
queue nor the monthly allowance). Daily renewal: flip one draft to scheduled
per day (dashboard or via publora-push.ts with --schedule). fa-only daily fits
the 15-post monthly allowance across the Oct/Nov boundary.

## D-045 — KLIKA one-pager restored at its original URL /s/kilika.html (2026-10-20)

**Owner order:** owner uploaded upload/kilika.mhtml (Blink snapshot of his Figma
Make page mehrdad-skp.figma.site) with: «اینو بررسی کن بعنوان پیج دک فقط صفحه را
بساز هیچ تعییری توی گرافیک نده و فقط لینک بشه به دامنه اصلی سایت».

**Context:** the WP-era URL mehrdad.ir/s/kilika.html (linked from the old
«مشارکت در طرح‌ها و پروژه‌ها» page — evidence in analysis/wp_content.json: the
Elementor carousel slide «استارتاپ مالی بانکی کلیکا» pointed there and its
lightbox decoded to wp-content/uploads/2026/02/kilika.png, id 8081) was lost in
the Vercel migration — absent from the repo, from full git history, and from the
migrated WP uploads (public/uploads/wp holds 2022–2025 only; the 2026/02 assets
were never copied). Owner recovered his own Figma render as MHTML and supplied it.

**What was built:**
- public/s/kilika.html (195,493 B) + public/s/assets/kilika-figma.css (165,557 B
  verbatim) — byte-faithful static restoration; zero graphic/content change.
  HTML rewrites were infra-only: the 4 cid stylesheet links inlined in their
  original cascade order; the figma.site CSS link repointed to the local asset;
  3 inert figma runtime preloads removed; og:url + twitter:url repointed to
  https://mehrdad.ir/s/kilika.html (owner's "link to main domain" directive);
  canonical added. Body links already pointed at mehrdad.ir + admin@mehrdad.ir.
- src/proxy.ts — the legacy WP rule redirected ALL /s/* → / (root cause of the
  observed 301). Now /s/kilika.html and /s/assets/* pass through to the static
  files; every other legacy /s/* still redirects home.
- next.config.ts — /s/:path* receives the same Google-Fonts-allowing CSP as the
  deck (D-035 pattern; deckSecurityHeaders reused) so Inter + Vazirmatn load.
  Placed after the global rule (last-match-wins).
- Chat knowledge (src/app/api/chat/route.ts): base facts (EN + FA) now include
  the live one-pager URL plus the page's own figures (1M+ year-one users, 20+
  service categories, $4M requested funding, admin@mehrdad.ir) — owner's page
  text only, zero invented facts; the FA line respects the zero-«،» rule.

**Self-test evidence:** sha256 served == disk for both files (html 3066530b…,
css a7b4253a…). Agent Browser: desktop 1440 + mobile 390 full-page renders
verified (hero, orbit icons, stat cards, gradient CTA, footer buttons); zero
console errors / CSP violations; document.fonts.check('16px Vazirmatn') = true;
legacy /s/* redirect intact; /deck/health untouched (byte-freeze respected);
eslint clean.

**Deployment:** rebased onto remote main (D-044 line) and pushed with the
owner's inline PAT (token never stored); Vercel auto-deploy verified by polling
the production URL after push.

## D-046 — Deck page: top button = «Back to website» + the site's online chat ON the deck (2026-10-22)

**Owner order:** «دکمه بالای پیج دک فقط بذار بازگشت به وب‌سایت را داشته باشه …
هر کسی اینو دید — باید با گرافیک بخونه؛ همچنین چت آنلاین روی پیج دک روی این
صفحه هم نمایش داده شود.»

**Context:** the standalone Health & Wellness deck (/deck/health + /fa) is
served by route handlers that bypass the root layout (byte-exact owner upload,
D-041/D-042). Consequences: the deck's top nav ended in «Invest → /
سرمایه‌گذاری ←» (an in-page anchor, meaningless as an escape hatch to anyone
receiving the shared deck link), and the site's online AI chat physically
could not reach the page — the React ChatWidget lives in the layout the deck
bypasses.

**What was built (src/app/deck/health/site-chat.ts, new; both route handlers
chained after the existing D-038/D-039/D-042 swaps):**
1. Nav button swap (asserted unique in each landing): «Invest →» →
   «Back to website ↗» / «سرمایه‌گذاری ←» → «بازگشت به وب‌سایت ↗», same
   `.btn sm` slot — same animated gradient pill, same size, same `.ar` arrow
   span, so it reads natively with the deck graphics (↗ is the deck's own
   established "go to Mehrdad.ir" arrow from the founder CTA). Same-tab
   navigation to https://mehrdad.ir/ — a true "return".
2. Online chat: a self-contained vanilla-JS twin of the site ChatWidget
   injected as ONE inline <script> before </body> — same visual identity
   (violet→fuchsia launcher + green AI badge, 384px panel, streaming
   transcript, typing dots, privacy note, clear via DELETE /api/chat), same
   /api/chat SSE contract (session/token capture, delta rendering, 429 + JSON
   fallbacks). Bilingual by page: EN deck → EN chat, FA deck → FA chat
   (texts adapted to the zero-«،» standing rule). Body written as a raw
   string (not a stringified function) so dev and production builds inject
   byte-identical widget code; config keys are UPPERCASE (serialization
   contract, minifier-proof). The widget keeps the deck's single-file
   property and runs under the D-035 deck CSP (script-src 'unsafe-inline',
   connect-src 'self') — no config change needed.

**Freeze discipline:** landing-en.ts / landing-fa.ts untouched; both swaps
asserted unique and fail loud (cs-scroll pattern); round-trip proof run —
undoing exactly the two swaps returns the pre-D-046 HTML byte-exact for both
languages. ORDER_RE/PARTNER_RE lead-flow logic deliberately NOT touched
(site-wide owner design; questions containing «سرمایه‌گذاری»/invest still
enter the partnership script, same as the main site).

**Self-test evidence:** eslint clean; Agent Browser E2E on both languages —
button present in nav (native slot), chat opens, real questions answered from
the deck's own content («Two AI assistants are live…», Persian wellness-family
answer), streaming verified, clear/close/Escape work, fab↔panel toggle proven
(open → fab hidden, close → fab back), RTL panel correct, mobile 390px panel
full-width, zero console errors; clicking the button navigates to
https://mehrdad.ir/; regression curl: / , /investors-koko/deck ,
/s/kilika.html , /deck/health(/fa) all 200/307 as before; dev.log clean.

## D-047 — Driving-exam: Myket link beside the Cafe Bazaar CTA (owner order 2026-10-22)

**Owner order (verbatim):** «https://myket.ir/app/mix.azmon.app اینو برای برنامه
مرتبط بزار در صفحه خودش» + confirmation «اینجاس».

**Context:** /work/driving-exam (آزمون آیین‌نامه رانندگی, the Android app
published as mix.azmon.app) had a single store CTA — «Get it on Cafe Bazaar /
دریافت از بازار» (D-030-era PROJECT_LINKS + PROJECT_LINK_CTA override). The app
is ALSO published on Myket; the owner supplied the store URL and ordered it on
the app's own page.

**Decision:**
1. The Myket link (https://myket.ir/app/mix.azmon.app — verified HTTP 200 on
   2026-10-22) is added as the SECOND live link for the driving-exam slug only,
   via the existing pure-code second-channel map PROJECT_EXTRA_LINKS
   (src/lib/project-links.ts) — the exact D-033 mechanism quiz-of-koko uses for
   its Cafe Bazaar button. No DB column, no component change: ProjectDetail
   already renders the extra link as the secondary outline button (Smartphone
   icon) beside the primary CTA. Cafe Bazaar stays primary («دریافت از بازار»,
   gradient); Myket joins as «دریافت از مایکت» / "Get it on Myket".
2. The map's doc comment now records both usages (quiz-of-koko 2026-10-13,
   driving-exam 2026-10-22) so the pattern's history travels with the code.
3. Local QA fixture: the local SQLite DB lacked the quiz-of-koko row
   (production-DB-only), so the D-033 local-only fixture was re-inserted with
   the exact production RSC values (zero invented copy; uncommitted). The
   traffic-tempo 404 seen during QA is the owner's own 2026-10-05 display
   kill-switch (src/lib/project-visibility.ts) — correct behavior, not a
   regression.

**Rationale:** same one-product-story pattern already shipped twice (Bazaar link
+ browser demo on traffic-tempo; web CTA + Bazaar on quiz-of-koko): multi-channel
distribution reads as one system, the primary CTA is not demoted, and every
other project page stays byte-identical because the slug-keyed map returns null
without an entry.

**Self-test evidence:** eslint clean; Agent Browser E2E — /work/driving-exam EN
+ FA: both store buttons render with correct hrefs (cafebazaar.ir/app/mix.azmon.app
primary, myket.ir/app/mix.azmon.app secondary), desktop 1440 + mobile 390 fits
one row, RTL correct; /work/quiz-of-koko FA still shows exactly «بازی کن» +
«دریافت از بازار» (no Myket — untouched); code delta confined to
src/lib/project-links.ts (+ this doc). Push pending the owner's PAT
(transient, never stored).

## D-048 — Quiz of Koko: Telegram channel link + official QR on its project page (owner order 2026-10-23)

**Owner order (verbatim):** «https://t.me/quizofkoko ادرس کانال تلگرام را توی
سایت بزار» + the official @QUIZOFKOKO QR image (upload/pasted_image_…png,
1560×1641 PNG).

**Context:** /work/quiz-of-koko told a two-channel story (web play CTA +
Cafe Bazaar button, D-033). The game's Telegram broadcast channel
(@quizofkoko — verified HTTP 200, title «Telegram: View @quizofkoko») had no
surface on the site.

**Decision:**
1. New pure-code map `PROJECT_TELEGRAM` + `getProjectTelegram()` in
   src/lib/project-links.ts — the same slug-keyed pattern as
   PROJECT_LINKS/PROJECT_EXTRA_LINKS (D-033/D-047): content travels with git,
   no DB column, slugs without an entry stay byte-identical.
2. ProjectDetail renders a THIRD CTA button in the live-links card —
   «کانال تلگرام» / "Telegram channel", paper-plane (Send) icon, same outline
   style as the store button — href https://t.me/quizofkoko.
3. The owner's QR image is committed byte-identical (sha256
   8f30c9a0f763410d…) to public/media/quizofkoko-telegram-qr.png (D-008 media
   convention) and shown as a thumbnail card under the buttons with the
   channel URL as SELECTABLE TEXT (the ordered "address" lives on the page
   itself, not only in pixels) + a bilingual scan caption. Desktop visitors
   scan it straight into their phone.
4. Standing rule honored: the channel is presented with its full address
   https://t.me/quizofkoko (owner instruction: always send links with the
   complete mehrdad.ir-domain context — never bare relative paths).

**Rationale:** completes the one-product-story pattern (play web → get
Android → join community) with the channel the owner announced; pure-code map
keeps every other project page untouched; the QR upload is used verbatim as
the owner supplied it.

**Self-test evidence:** eslint clean; local Agent Browser E2E — EN: three
buttons "Play now"/"Get it on Cafe Bazaar"/"Telegram channel" (href
https://t.me/quizofkoko); FA: «بازی کن»/«دریافت از بازار»/«کانال تلگرام»; QR
img loads (1560×1641) and serves byte-identical off /media; desktop 1440 +
mobile 390 screenshots (buttons row → stack, RTL correct); zero console
errors; regression — /work/driving-exam still exactly its two store buttons,
no Telegram.

**Amendment (same day, owner order «https://www.instagram.com/quizofkoko/ پس
اینستاگرام هم در همین باکسی که تلگرام را گذاشتی بزار» + Instagram QR upload):**
the socials box became a TWO-channel card — Instagram (verified HTTP 200,
https://www.instagram.com/quizofkoko/) joined Telegram in the same box, each
with the owner's official QR (byte-identical, sha256 8d0a765f…) and its own
clickable URL directly under its QR, side by side (grid-cols-2, w-32 on mobile
/ w-44 on desktop). Data model generalized: PROJECT_TELEGRAM → PROJECT_SOCIALS
(array per slug); the Telegram CTA button stays and is now driven from the
same socials data (one source of truth). Card title «کوکو در شبکه‌های اجتماعی»
/ "Koko on social media". Verified: both QRs render 176px desktop / 128px
mobile in one box with links below, eslint clean, driving-exam untouched
(the «تلگرام» string its SSR payload carries is the site-wide ShareBar i18n,
pre-existing).

**Amendment 2 (same day, owner order «این رنگ را جایگزین قبلی کن برای
اینستاگرام» + black Instagram QR upload):** the Instagram QR inside the
socials box was swapped for the owner's BLACK version (QR + QUIZOFKOKO
caption, 2350×2700, sha256 7eafe5f5…, byte-identical copy at
/media/quizofkoko-instagram-qr.png). Pure asset swap — no code change: the
socials data and view reference the media path, so Telegram, layout, links
and alt text stay exactly as amended. Verified: local+production serve the
new bytes (hash match), link-below-DOM proof re-run, driving-exam regression
clean.

## D-049 — Blog article: «کوکو به تلگرام آمد» — the Koko Telegram bot announced as an SEO post (owner order 2026-10-23)

**Owner order (verbatim):** «یه مقاله بنویس و بزن که ما کوکو را توی تلگرام بصورت اپ اوردیم بالا @quizkokobot مقاله خوبی بنویس سئو شده باشه لینک داخلی هم بساز و qr»

**What shipped:**
- Blog post `quiz-of-koko-telegram-app` (source `ai`, published, non-featured) — bilingual FA/EN: title «کوکو به تلگرام آمد — بازی کوییز واژگان بدون نصب با بات @quizkokobot» / "Koko is now on Telegram — play the word quiz instantly with @quizkokobot".
- Content structure: strong announcement lead → what Koko is (grounded in the production project summary) → how to play in 3 steps → why Telegram → bot link + QR figure (owner upload, byte-identical, sha256 1fafcdb0…) → bot-vs-channel difference → all-channels list → 3-question FAQ.
- SEO: canonical + hreflang en/fa/x-default + OG article with cover; JSON-LD BlogPosting (author/publisher Person, dates, keywords from tags); 4 curated tags (telegram/koko/quiz/word-game) feeding keywords + blog filter row; internal links FOLLOWED (project page, blog index), external links auto-nofollow by the site's sanitizer policy.
- Internal links: /work/quiz-of-koko (×2 + FAQ) and /blog. External: t.me/quizkokobot (×9) + quizofkoko.com + Cafe Bazaar + t.me/quizofkoko + instagram.com/quizofkoko.
- Zero «،» in Persian text (programmatic check on rendered page = 0 hits) — standing rule.
- Channel: new scripts/seed-koko-telegram-post-supabase.ts (idempotent upsert-by-slug; content-only refresh; owner-managed date/published/featured untouched on re-run) over the established Supabase Management API path; data single-sourced in scripts/koko-telegram-post-data.ts.
- Verification: local SQLite seed + full local E2E (JSON-LD, meta, link rel policy, QR 420px, index/sitemap/feed refs, FA desktop+mobile screenshots, eslint clean). Production insert awaits the owner's SUPABASE_TOKEN (env-only, never stored).

**Rationale:** the owner announced the Telegram bot publicly; the blog is the site's announcement surface and its force-static SEO pipeline (JSON-LD + hreflang + sitemap + feed) is already built. Reusing the seeded-post channel keeps the owner-managed DB state safe.

**Standing rule honored:** owner-facing links carry the full mehrdad.ir domain; the article itself uses absolute URLs so internal equity stays with https://mehrdad.ir.

**D-049 publish note (2026-10-23):** the post was seeded into the production
Supabase Postgres (supabase Management API channel; id cmvljz93zw9w2l9ilkt;
published=true; 4/4 tag links koko/quiz/telegram/word-game; verification block
passed) and the article page already renders on demand at
https://mehrdad.ir/blog/quiz-of-koko-telegram-app — this commit triggers the
rebuild that also surfaces it in /blog + sitemap.xml + feed.xml.

## D-050 — Static Persian homepage `/fa`: real SSR Persian for crawlers + route-aware language (growth-agent session 2026-10-23, authorized via owner-provided GitHub/Vercel credentials)

**Context (owner order):** the owner opened the growth session by providing the
GitHub PAT + Vercel token for this repo, following the P1 translation-sync
audit (2026-10-23) whose #1 finding (🔴A) was: `?lang=fa` serves byte-identical
ENGLISH HTML to every crawler — the Persian experience existed only as a
post-hydration client flip, so the hreflang=fa variant had no server-rendered
Persian content for Bing / AI crawlers (ChatGPT, Perplexity), and the page
source never contains a single Persian word. The P1 fix pack called for
server-side Persian. This decision implements it for the #1 surface (the
homepage) inside the existing static architecture, WITHOUT touching the
EN-purity rule or the client-flip mechanism.

**What shipped:**
- `src/components/site/lang-context.tsx` (NEW): `LangProvider` + `useLang()` —
  route-aware language resolution. On `/fa*` routes lang is FORCED to 'fa' for
  server render, first client render and hydration alike (usePathname is
  request-aware during SSR → no hydration mismatch). On every other route it
  falls back to the persisted store language — the previous behavior, unchanged.
- `src/app/fa/page.tsx` (NEW): the static Persian homepage — same data contract
  as `/` (same queries, same NO-catch-to-empty build policy, same force-static),
  rendered AT BUILD TIME in Persian. Persian metadata (title «مهرداد — سازنده
  مستقل محصول | طراحی و ساخت سریع با هوش مصنوعی», description from the site's
  own fa.hero copy, OG `fa_IR` + `alternateLocale en_US`, twitter card) and a
  Persian WebSite JSON-LD node tied to the same Person entity.
- hreflang swap: `/` and `/fa` both declare `en: /`, `fa: /fa`,
  `x-default: /` — the fa variant now points at REAL Persian HTML instead of
  `/?lang=fa` (byte-identical EN). `sitemap.xml` carries the /fa URL with the
  same hreflang pair (priority 1).
- Boot script (layout.tsx): `/fa*` paths get `<html lang=fa dir=rtl>` pre-paint
  and persist `lang=fa` (route continuity for inner EN-route pages) — but do
  NOT set `lang-boot-fa`, because the SSR body is already Persian; hiding it
  would only delay correct content.
- Route-aware consumers (scope-frozen list): SiteChrome (provider + doc
  lang/dir effect), Header (useLang; the EN toggle on /fa now navigates to `/`
  because the route pins fa regardless of store), Footer, ChatWidget (also
  sends the route language to /api/chat), RouteIndicator, LangBanner (suppressed
  on /fa — suggesting "the site has a Persian version" to someone ALREADY
  reading Persian is nonsense), HomeView + WhatIDo (render Persian at build
  time on /fa; `/` unchanged).
- NOT changed (scope freeze): all other views (BlogView, ProjectsView,
  ServicesView, …) keep store-driven language; `?lang=fa` flip + boot-script
  body-hiding on EN routes; EN metadata on EN routes (EN-purity rule);
  route groups / root layout untouched (`<html>` stays lang=en in static HTML
  — dir/lang arrive pre-paint on /fa via the boot script; a per-route `<html>`
  would require moving every page into route groups = separate decision).

**Rationale:** closes the only P0 from the live audit at minimal architectural
risk. The static Persian homepage is generated once per build (zero runtime
cost, owner's static-first rule intact), is fully crawlable without JS, and
gives Google/Bing/LLM crawlers a real Persian surface to attach to the
existing hreflang graph. `?lang=fa` remains the human in-page flip; `/fa`
becomes its canonical crawlable target.

**Self-test evidence:** `tsc --noEmit` clean; `eslint .` clean; full
`next build` succeeds (`/fa` listed as static ○, CSP injected 114/114 pages).
Raw-HTML checks on the production build (no JS): Persian title/description,
«کسب‌وکار و محصولت رو با دقت طراحی می‌کنم» + nav «خانه» + «چه کاری انجام
می‌دهم» all present in the initial HTML; canonical `/fa`; hreflang
en→`/`, fa→`/fa`, x-default→`/` on BOTH home and /fa; og:locale fa_IR;
JSON-LD inLanguage fa-IR; EN home shows zero Persian leak. Agent Browser
(live server): /fa paints Persian instantly (`lang=fa dir=rtl`, NO
lang-boot-fa, body visible), footer «اسپرینت MVP» + Persian digits «٪» +
Jalali dates render; desktop 1280 AND 390px mobile correct, no horizontal
scroll; EN toggle on /fa → navigates to `/` in EN; `/?lang=fa` client flip
regression-clean; /fa → /services continuity keeps Persian via persisted
store; direct /services with a fa store behaves exactly as before.

## D-051 — Blog article CTA: every /blog article ends with the next step — MVP Sprint offer + direct contact (growth-agent session 2026-10-24, P1 sales action)

**What:** a new `ArticleCta` component renders once per blog article,
between the article body and ShareBar: a violet-gradient card (same visual
language as BuildLikeCta, D-042 era) with the productized offer
(«آماده‌ای این را به محصول تبدیل کنی؟» / "Ready to turn this into a
product?") linking to `/mvp-sprint` (primary) and `/contact` (secondary).
Bilingual strings live under `blog.cta` in i18n.ts (EN + FA, strict
language separation preserved via `pick()`).

**Why:** the growth-agent P1 audit (2026-10) flagged that articles — the
top of the funnel — end with zero conversion path: body → ShareBar →
comments. The owner rule of 2026-09-26 says every placement must invite
the next step; project pages had BuildLikeCta but blog articles never got
one. This adds the missing sales surface to EVERY article (past and
future, since it lives in the shared PostDetail template) with zero
content edits.

**Scope notes:**
- BlogView `PostDetail` only (used exclusively by /blog/[slug]) — the
  /daily editorial section is deliberately CTA-free (ArticleDetail header
  note: "No outbound links: the section exists to publish the owner's own
  analysis") and stays untouched.
- Links are crawlable `<a>` (Next `Link`), not JS-push buttons — the raw
  static HTML of every article now carries an internal link to
  /mvp-sprint, which also strengthens its crawl priority.
- No DB, no metadata, no language-routing changes (D-050 scope freeze
  intact).

**Self-test evidence:** `tsc --noEmit` clean; eslint clean on all three
touched files; full `next build` succeeds (116 pages, CSP 164 hashes).
Raw-HTML check on the production build: EN card + both links present in
the initial HTML of /blog/*. Agent Browser on the standalone prod server:
`?lang=fa` flip renders the Persian card («اسپرینت MVP را ببین») with
correct RTL, desktop 1280 and 390px mobile verified; the earlier local
"flip broken" symptom was a stale next-server on port 3100 serving an old
build (new chunk names 404 → no hydration), not a code bug.

## D-052 — Article CTA lead capture: one-field email form → /api/leads → Supabase `Lead` table (growth-agent session 2026-10-24, P1 sales phase 2)

**What:** the ArticleCta card (D-051) now ships a one-field lead form:
email → POST `/api/leads` → Prisma `Lead` row (source/lang/slug tagged)
→ best-effort SMTP forward to CONTACT_TO_EMAIL → server-side PostHog
`lead_captured` event (email = PostHog person id). Success collapses the
form to a thank-you line; failures show an inline retry message.

**Why:** D-051 gave every article a next step, but the capture was
click-only. A reader who is not ready to open /mvp-sprint or /contact
now has a zero-friction path — the missing piece of the lead follow-up
P1 (growth-agent action plan 2026-10).

**Security/spam:** 5 req/IP/10 min rate limit (rate-limit lib), 32 KB
body cap (readJsonBody), server-side email regex, lowercase+trim
normalization, and a hidden honeypot `website` field — bots get a
fake `{ok:true}` and no row. No new env vars required (reuses
SMTP_*/CONTACT_TO_EMAIL; when unset the DB row is still the source of
truth, same as /api/contact).

**Infra:** `model Lead` added to BOTH prisma schemas (mirror-check ✓ 27
models). Production table created via the Management-API SQL endpoint by
`scripts/create-lead-table-supabase.ts` (idempotent, shape-verified,
same channel as migrate-sqlite-to-supabase.ts — no direct PG in CI).
API route follows /api/contact verbatim (force-dynamic, Next `after`).

**Self-test evidence:** tsc + eslint clean; production build succeeds
(80/80 CSP). Local standalone server: valid POST → row
(lowercased, fa/en/slugged) ✓; invalid email → 400 ✓; honeypot →
fake-ok, no row ✓. Agent Browser: EN submit → "✓ Got it — I'll get
back to you soon."; FA submit → «✓ ثبت شد — به‌زودی جواب می‌دهم.»;
390px mobile stacks correctly, no horizontal scroll.

**Lead trace note (2026-10-24, growth-agent session):** the owner received
the notification email "mehrdad.ir — new lead from article_cta (article:
angel-investor-for-mvp-portfolio)" with reader address
`growth-agent-check@mehrdad.ir` at 15:09 Tehran (= 11:39 UTC) — six minutes
after this feature's deploy (commit 28b5649 pushed 11:33 UTC). Verified to be
that session's own production smoke test of the end-to-end pipeline
(form → Lead row → SMTP forward), NOT an external lead and NOT spam: the
reader address is a self-describing test name, the From header matches the
site template exactly, and the test row was deleted from the Supabase `Lead`
table right after verification (hence the table reads empty). Side effect:
this confirmed the whole live pipeline works — real reader leads arrive in
the owner's inbox the same way. Standing rule for future sessions: any
production test that lands an email in the owner's inbox MUST be announced
in chat first (OWNER_RULES #10 اطلاع‌رسانی) and MUST use an address that
is unmistakably a test.

## D-053 — KLIKA deck connected from /work/kilika-fintech (2026-10-25)

**Owner order:** «چرا پیج دک کلیکا که بهت دادم روی این صفحه متصل نکردی و توضیح
ندادی؟ https://mehrdad.ir/work/kilika-fintech» — a legitimate catch: D-045
shipped the owner's KLIKA deck page at /s/kilika.html (order there was «فقط
صفحه را بساز … و فقط لینک بشه به دامنه اصلی سایت») but the deck was never
linked FROM the project's own work page — the exact connection the health-app
got via D-040. Missed step, admitted; closed here with the same pattern.

**What shipped (pure code, slug-keyed, production DB untouched):**
- src/lib/project-links.ts — PROJECT_PITCH_DECKS: `deckFa` becomes OPTIONAL
  (single-deck products) + new entry `kilika-fintech` → deckEn
  https://mehrdad.ir/s/kilika.html with bilingual note («پیچ دک کامل این محصول
  منتشر شده است:» — no «،»); getter returns `deckFa: string | null`, URL-
  validating whichever links exist.
- src/components/site/ProjectsView.tsx — the amber investor box now renders
  TWO language-labelled buttons when deckFa exists (health-app unchanged:
  «پیچ دک — فارسی» / «پیچ دک — انگلیسی») or ONE unlabelled button («پیچ دک» /
  "Pitch deck") for a single deck page; shared button classes extracted to
  `deckBtnCls` (identical string — health-app renders pixel-identical).
  target=_blank + noopener noreferrer as before: /s/* is a standalone surface,
  the project page stays open.

**Self-test evidence (local):** eslint clean; fixture rows for kilika-fintech
+ health-app upserted into local SQLite mirroring production values (prod row
NEVER written); /work/kilika-fintech EN → note "The full pitch deck of this
product is live:" + single button → https://mehrdad.ir/s/kilika.html,
target=_blank, 1 button; FA (?lang=fa) → dir=rtl, Persian note + «پیچ دک»;
click opens the deck in a NEW TAB (tab list verified); 390px mobile — button
h=44px, box fits, zero horizontal overflow; regressions: health-app still
renders both deck buttons + contact CTA, traffic-tempo still renders zero deck
box; byte-freeze proof: sha256 public/s/kilika.html == production
(3066530b…) and kilika-figma.css == production (a7b4253a…).

**Rationale:** the D-040 amber box is the established "this product has a
pitch deck" surface; reusing it keeps one visual language for investor links
across all work pages. deckFa-optional is the minimal generalization that
fits one-deck products without per-slug label maps.

## D-054 — Pitch deck introduced at the BEGINNING and END of the text (2026-10-25)

**Owner order:** «چزا توضیحات درستی نمیدی پیج دک چیه تو باید توضیحات کاملی بدی
پیج دک هم اول و اخر متن معرفی بشه» — continuing the D-053 thread: the owner
also wants the pitch-deck page INTRODUCED AT THE BEGINNING AND THE END of the
text, not buried mid-story, plus complete explanations of what the pitch deck
is (the owner's recurring «توضیح ندادی» complaint — every deck change must now
ship with a plain-Persian explanation of what/where/why).

**Live evidence before this change:**
- /work/kilika-fintech + /work/health-app: the amber deck box sat MID-page
  (after Market & Growth, before the contact CTA) — neither at the beginning
  nor at the end of the متن (grep: exactly 1 deck link per page).
- vivora-deck-* blog posts: the owner's OWN first paragraph already
  introduces the interactive deck at the TOP of the text («نسخه‌ی تعاملی دک
  در mehrdad.ir/deck/health/fa زنده است» — live-verified in raw HTML), but
  the END of the text had nothing.

**What shipped (pure code, slug-keyed, production DB untouched):**
- src/lib/project-links.ts — new `BLOG_SERIES_PITCH_DECKS` map (slug-prefix →
  PROJECT_PITCH_DECKS entry) + `getSeriesPitchDeck(slug)` getter; vivora-deck-*
  → health-app. One source of truth for deck URLs + bilingual note across work
  pages and blog series.
- src/components/site/ProjectsView.tsx — the deck box extracted to a local
  `deckCard` const (identical markup/classes, margin applied by wrapper) and
  rendered TWICE: «اول متن» right after the summary, BEFORE the Market &
  Growth section (mt-6) + «آخر متن» after the last content block, before the
  share bar (mt-8). The mid-page instance was REMOVED (moved, not duplicated:
  2 mentions per page, exactly first + last).
- src/components/site/BlogView.tsx — PostDetail renders the same amber deck
  card at «آخر متن» (after the body, before the D-052 lead-form CTA) ONLY for
  slugs matching BLOG_SERIES_PITCH_DECKS prefixes; «اول متن» for these posts
  is already the owner's own paragraph, so no duplicate box was added on top.
  Every non-series post and every deck-less project stays byte-identical.

**Self-test evidence:** tsc + eslint clean; production build 116 pages;
local standalone on :3100 → /work/kilika-fintech EN shows the amber deck box
twice (top after summary, bottom before share bar), ?lang=fa RTL identical;
/blog/vivora-deck-01-cover EN+FA show the closing deck box with both
language buttons; a non-series article (no deck) renders unchanged; 390px
mobile no horizontal overflow.

**Rationale:** the owner's order is a SYSTEM, not a one-off: every relevant
text now OPENS and CLOSES with the pitch-deck offer — work pages via the
slug-keyed PROJECT_PITCH_DECKS box, deck-series posts via the series map.
Both surfaces share the same amber card + the same bilingual note from
project-links.ts, so future decks (or future series) need exactly one map
entry. Explanations to the owner now ship with every deck/CTA change (the
«توضیحات کامل» rule), in plain Persian.

## D-055 — KLIKA work page: the deck's full story written out (2026-10-25)

**Owner order:** «اسکول؟ از روی پیج دک توضیحاتی بردارد متن طولانی با توضیحات
کامل بنویس این چیه گذاشتی؟» — the /work/kilika-fintech page was a two-sentence
skeleton (DB summary only) while the owner's deck page /s/kilika.html carries
the complete investor pitch; the thin page (plus the newly added deck box)
read as unfinished. Order: take the explanations FROM the deck page and write
a LONG, fully-explained text.

**What shipped (src/lib/project-profiles.ts — new `kilika-fintech` profile,
marketStory block; pure code; production DB untouched):**
- LONG bilingual investor story — 12 sections / 44 bullets, ~9.4K chars FA +
  ~10.0K chars EN: the problem (fragmented digital life + hidden costs +
  business pains) → the ecosystem gap (WeChat 1.3B / Paytm 450M / Gojek 190M
  vs Iran 85M with no national super-app) → the solution + Iranian/
  international version strategy → market opportunity ($11.4B→$27.3B 19.1%
  CAGR; Iran 850 trillion toman/1404; 45M mobile users; 65% unified-wallet
  preference) → platform capabilities → four-stream revenue model (55/25/15/5
  split; 18B toman/month at 1M users; unit metrics AOV 250K / commission
  1,500 / 12 tx/user/month / ARPU 18K / CAC 150K / payback 8.3 months; float
  100B→3B at 3%) → B2B partnership gains (+35% satisfaction; −40% support
  cost; −50% support load; +60% usefulness; 90% faster API; +45% revenue) →
  competitive position (vs Blubank 20× capabilities; vs App 30–50% migration;
  70% lower CAC; 3–5× valuation) → next-gen neobank/movement/legal protection
  → the 1M-user year-one guarantee (11 B2B categories; 15M+ reach; 125K+ in
  pursuit; 144M annual transactions; network effect) → bank-partner advantage
  (+50–200% gateway; +10–100% banking) → for investors ($4M ask; Feb 2026
  deck; 3-year Blubank-overrun projection; internal link to the deck page).
- ZERO invented facts: every sentence and number re-flowed from the owner's
  deck page text (D-055 profile JSDoc documents the direction reversal vs
  health-app: FA = owner's own deck copy re-flowed; EN = faithful rendering).
- Standing rules applied: zero «،» in the Persian prose (deck punctuation
  normalized to «؛»/«و»; programmatic check on rendered page = 0 hits);
  EN string Persian-free; internal deck link uses the full
  https://mehrdad.ir/s/kilika.html domain.
- Render position: D-054's first deck box sits above the story; the story
  fills the marketStory slot (right under the summary); D-054's closing deck
  box ends the page — deck opens and closes the full text, as the owner's
  D-054 order already prescribed.

**Self-test evidence:** eslint clean; programmatic guards (FA «،»=0; EN
Persian-chars=0; 12 FA + 15 EN number spot-checks vs the deck all found; deck
link present in both languages); local E2E: FA page renders 12 h2 + 44 li,
9,389 rendered chars, deck boxes ×2 (first+last per D-054), deck link inside
the text → /s/kilika.html; EN LTR 12 sections; 390px mobile zero horizontal
overflow; full-page screenshots (desktop top/mid + mobile full).

## D-056 — Blog post: KLIKA short SEO edition with internal link building (owner order 2026-10-25)

**Owner order (verbatim):** «یک نسخه کوتاه سئو شده توی بلاگ بزار --- حتما لینک
این فحات مرتبط با کلیکا داخلش باشه سئو حرفه ای انجام بده با لینک سازی داخلی»

**What shipped:**
- Blog post `klika-fintech-superapp` (source `ai`, published, non-featured,
  investment category) — bilingual FA/EN SHORT, rewritten, keyword-focused
  edition of the KLIKA story. Deliberately NOT a copy of the D-055 long-form
  (hub-and-spoke: short post → long hub → deck page).
- Data single-sourced in scripts/klika-seo-post-data.ts; production seeder
  scripts/seed-klika-seo-post-supabase.ts (koko channel + vivora category
  pattern; idempotent upsert-by-slug; content-only refresh; owner-managed
  date/published/featured untouched).
- Purpose-built cover public/media/klika-superapp-seo-cover.png (1344×768,
  violet/amber super-app visual, no text) — the production Project row has
  cover NULL and no deck image asset exists, so a non-factual cover was
  generated instead of inventing a fake product screenshot.
- Facts policy: every number traces to public/s/kilika.html (trace table in
  the data file header): WeChat 1.3B / Paytm 450M / Gojek 190M / Iran 85M no
  national super-app; $11.4B (2026) → $27.3B (2031) 19.1% CAGR; 850 trillion
  toman (1404); 45M mobile users; 75% YoY online-tx growth; 65% unified-wallet
  preference; product definition «یک اپ و همه سرویس‌ها» + capabilities
  (unified account, top-ups from all banks, one-click payment). Zero invented
  numbers; programmatic 11-point FA + 11-point EN spot-checks all pass.
- Internal link building (all followed by the sanitizer, full-domain absolute
  URLs): /work/kilika-fintech ×5 (lead + market + deck section + FAQ + list),
  /s/kilika.html ×4 (lead + deck section + FAQ + list), /work ×2, /blog ×2,
  /contact ×2. SEO pipeline auto-applies: canonical + hreflang en/fa/x-default
  + JSON-LD BlogPosting (keywords from the 4 tags) + OG article with cover.
- Tags: 4 pre-existing production tags only (fintech / neo-bank / pitch-deck /
  startup) — no new tag invented; category = سرمایه-گذاری (same as the vivora
  deck series) via _CategoryToPost.
- Standing rules: zero «،» in Persian copy (one lead-paragraph slip was caught
  by the programmatic guard and fixed before deploy); EN content Persian-free;
  cover ships in the repo so the seeded /media path resolves after rebuild.

**Self-test evidence (local):** eslint clean; tsc clean (root-caused a stale
local Prisma client that pre-dated this task — `prisma generate` fixed it, no
code change); local SQLite seed → article renders with 9 h2, 15 internal
links, cover visible, JSON-LD BlogPosting+BreadcrumbList, canonical
https://mehrdad.ir/blog/klika-fintech-superapp, hreflang en/fa/x-default,
og:image → /media/klika-superapp-seo-cover.png, D-052 lead form present;
FA: dir=rtl, 1,713 FA chars, «،»=0 in article, numbers intact; 390px mobile
zero horizontal overflow; /blog index lists the post with its cover.

**Rationale:** the owner asked for the SEO surface as a blog post, not a code
page — the seeded-post channel (D-049 precedent) keeps owner-managed DB state
safe while the short edition funnels both readers and crawlers to the two
canonical KLIKA surfaces (work page + deck) via followed internal links.

## D-057 — Admin Leads tab + CSV export: close the funnel loop (growth pipeline, 2026-10-25)

**Context:** D-052 shipped the article-CTA lead capture (Lead table +
per-lead email forward) but the leads themselves had no home in the admin
panel — the owner only saw them one email at a time. Capture without
visibility is a leaky funnel; this is the "manage the leads" step of the
growth pipeline (see Task 17 next-step notes in the growth worklog).

**What shipped:**
- `GET /api/admin/leads` (new, `checkAdmin`-gated like every admin API):
  JSON list (newest first, capped 500) + stats `{total, last7, last30,
  unique}` (unique counts case-insensitive emails).
- `GET /api/admin/leads?format=csv`: full-table CSV download — UTF-8 BOM
  (Excel-safe Persian slugs), quoted cells with `""` escaping and leading-=
  neutralised (formula injection), `Content-Disposition: attachment;
  filename="mehrdad-leads-<date>.csv"`, `Cache-Control: no-store`.
- AdminView: new **Leads** tab (between Messages and Comments) — 4 stat
  cards, one-click CSV download anchor (the HttpOnly session cookie
  authenticates the download; no token plumbing needed), scrollable lead
  list (email + source badge + lang badge + date + link to the capturing
  article). Bilingual copy in i18n EN + FA (zero «،» per the standing rule).
- Lead rows use `dir="ltr"` so emails stay readable inside the RTL panel.

**Deliberate scope:** read-only. Leads are a contact surface — the owner
replies by email (the D-052 SMTP forward already sets reply-to), so no
edit/delete UI, no status workflow, no second source of truth. The dashboard
"new leads" bell (chat leads) is untouched — chat leads and article leads
remain two distinct surfaces on purpose.

**Self-test evidence (local):** tsc + eslint clean; seeded 3 leads (2
unique) → unauthenticated GET = 401; login → JSON `{total:3, last7:3,
last30:3, unique:2}`; CSV headers `text/csv; charset=utf-8` +
`attachment; filename="mehrdad-leads-2026-10-25.csv"`, 3 rows intact with
BOM; browser test: login → Leads tab → stat cards + list + CSV button all
render (screenshot shots/admin-leads-2.png); prod build clean. Note: the
`ADD COLUMN IF NOT EXISTS` raw shim (project-kind.ts) fails on the local
SQLite file but works on the production libSQL/Postgres — pre-existing,
unrelated.

**Rationale:** the fastest safe surface for lead management is the admin
panel the owner already uses with a working auth/TOTP flow — no new auth
surface, no new public endpoint (the API is admin-gated; the public POST
/api/leads stays the only unauthenticated lead write path).

## D-058 — Lead nurture automation: welcome + one 48h follow-up, max 2 emails ever (growth pipeline, 2026-10-25)

**Context:** D-052 captures leads and emails the OWNER per lead; D-057 made
them visible in the admin panel. Nothing ever wrote BACK to the reader — a
lead could leave an email and hear silence. This closes the last gap of the
capture → notify → manage → **nurture** pipeline.

**What shipped:**
- `Lead.nurtureStep Int @default(0)` in BOTH schema files (sqlite local +
  postgres-mirror for the Vercel build). Remote DB migrated by a lazy
  runtime shim `ensureLeadNurtureColumn()` (ADD COLUMN IF NOT EXISTS +
  fallback) — the exact proven pattern of ensureProjectKindColumn; called
  before every query that touches the column (lead POST, admin leads GET,
  cron).
- State machine (idempotent, `processLeadNurture()` in lib/lead-nurture.ts):
  step 0 + age <48h → welcome; step ≤1 + age ≥48h → follow-up (a ≥48h-old
  lead skips the welcome entirely — a two-day-old "hi!" reads like a
  glitch); step 2 → never emailed again. SMTP failure leaves the step
  untouched → the next daily run retries; with SMTP unset it is a no-op so
  state is never burned by a broken setup.
- Welcome sent immediately at capture: /api/leads runs `sendLeadWelcome()`
  inside `after()` (post-response, never blocks/fails the capture).
- Daily trigger = the EXISTING morning cron: vercel.json Hobby plan caps
  cron jobs at 2 (both slots taken), so /api/cron/daily-generate piggybacks
  `processLeadNurture()` in `after()` — failures are logged and can never
  break the generator. A standalone /api/cron/leads-nurture endpoint (same
  auth contract: Bearer $CRON_SECRET / ?key=<IndexNow key> / rate-limited
  open) exists for on-demand runs and is NOT registered in vercel.json.
- Emails: bilingual (lead.lang), text + HTML, RTL-aware FA wrapper, absolute
  mehrdad.ir links, zero «،» in FA copy, from "Mehrdad — mehrdad.ir",
  reply-to the owner inbox (so a reader reply lands in the same thread the
  notifications use). Welcome = what an MVP Sprint is + two ways to
  continue (/mvp-sprint or reply). Follow-up = the real KLIKA example
  (/work/kilika-fintech) + /mvp-sprint + an explicit "this was my last
  email" opt-out-by-silence line.
- Admin Leads tab (D-057): each row now shows the nurture state badge
  (no email yet / welcome sent / follow-up sent) and the CSV gained a
  nurtureStep column.

**Deliberate scope:** no unsubscribe link (2 emails total, the second says
it is the last — proportionate for a one-field form), no HTML tracking
pixel, no scheduler dependency beyond the existing cron, no new env vars.

**Self-test evidence (local):** tsc + eslint clean; local SMTP sink on
127.0.0.1:2525 captured every send. Seeded 4 leads → cron run 1
`{checked:4, welcomed:1, followed:2, failed:0}` (fresh→welcome; old step0→
follow-up only; old step1→follow-up; step2→skipped); run 2 idempotent
(0/0); POST /api/leads → capture ok + welcome in sink + step=1 via the
after() path; base64-decoded FA mail confirmed kilika + mvp-sprint links
intact; admin JSON rows carry nurtureStep; browser: badges render
(shots/admin-leads-nurture.png); prod build clean.

**Rationale:** the owner's funnel needed the reader-facing follow-up to be
automatic — but spam is the fastest way to burn a personal brand, so the
design is capped at two purposeful emails per lead with a stated ending.

## D-059 — 14-day Instagram campaign for @startup_mt: content + images + Composio publishing (owner order 2026-10-25)

**Owner order (verbatim):** «https://www.instagram.com/startup_mt/ برای این می
خواهم دو هفته پست بزاری برای دعوت به همکاری و دریافت سفارشات اپلیکیشن و وب
سایت و غیره … از طریق composio»

**What shipped:**
- `src/lib/instagram-campaign.ts`: 14 Persian captions (intro → MVP Sprint →
  KLIKA case → 5 mistakes → Vivora deck → why-2-weeks → engagement question →
  websites → validation → behind-the-scenes → investor decks → track record →
  FAQ → final CTA), each with hook-first structure, 10 hashtags, CTA +
  mehrdad.ir links. Facts trace to public site content (MVP Sprint promise,
  KLIKA story from the deck facts, Vivora 19-article series, 12+ projects /
  100+ articles indexes); zero invented numbers; zero «،».
- 14 brand-consistent images shipped in `public/media/instagram/day-01..14.png`
  (1024×1024, dark navy + violet/amber flat-vector style, no text) — repo
  ships them so the /media URLs resolve in prod AND serve as the public
  image_url Composio needs for the Meta media container.
- `SocialDraft.imageUrl String?` in BOTH schemas + lazy ALTER shim inside
  ensureSocialDraftTable (existing remote tables get the column on first
  touch).
- POST /api/admin/social/instagram-campaign (admin-gated, idempotent by
  ig-campaign-day-* topics) + a «کمپین ۱۴ روزه» button in the Social Studio
  drafts header — one click loads/tops up the campaign.
- Instagram publishing via Composio: src/lib/instagram-publish.ts executes
  INSTAGRAM_CREATE_MEDIA_CONTAINER → INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH
  (Composio REST v3 POST /tools/execute/{slug}, X-API-Key +
  connectedAccountId). /api/admin/social/publish now dispatches
  linkedin | instagram; the instagram branch needs COMPOSIO_API_KEY +
  COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID — missing → 503 with the exact
  4-step setup (fail-closed house pattern). Publish button now shows for
  instagram drafts too; the 503 setup steps render in the existing amber box.
- Daily auto-publish: the morning cron (only registered schedule — Hobby caps
  crons at 2) piggybacks autoPublishInstagramToday() — ONE queued instagram
  draft per calendar day (SiteSetting ig:lastAutoPublish day-guard), oldest
  first, env-gated no-op until credentials exist; failures retry next call
  without burning the day-guard.

**Deliberate scope:** no story/reel support (feed photo posts only — what the
official API allows reliably), no invented prices in FAQ («بعد از یک گفتگوی
۱۵ دقیقه‌ای عدد شفاف می‌گیری»), automation stays OFF until the owner connects
Composio so no post ever goes out unconfigured.

**Self-test evidence (local):** tsc + eslint clean; campaign POST →
{created:14}, re-click → {created:0, skipped:14}; 14 drafts all instagram +
imageUrl; publish without Composio env → 503 + 4 setup steps; images 200;
browser: campaign button + draft cards with thumbnails render
(shots/studio-campaign.png); prod build clean.

**Rationale:** the owner asked for the campaign to go out via Composio — the
content, images and publish plumbing are ready end-to-end, and the two
credentials (Composio API key + connected Instagram account id) are the only
missing pieces, which only the account owner can supply (Meta requires an
Instagram Business/Creator account linked to a Facebook Page).

## D-060 — Instagram growth cadence: 3 daily touches, not 3 daily posts (2026-10-25)

Owner proposed 3 posts/day (collab invite / educational / order + project
showcase). Composio's page audit (@startup_mt: 46 followers, 230 following,
9 posts, 30-day reach 1,014, engagement ~10.7%, top post = humorous AI reel)
names inconsistency + niche blur as the killers and recommends 4-5
reels/week. Decision: keep ONE feed post per day (the shipped D-059 campaign
is the 14-day engine + morning-cron auto-publish) and deliver the owner's
"3/day" as 3 DAILY TOUCHES: 1 feed post + 1-2 engagement stories + 1 CTA
story alternating order/collab. Rationale: 2 of 3 proposed pillars are
"asks" -> 3 posts/day would make ~66% of content self-promotional (violates
80/20) and repeats the burnout pattern after the 20-month posting gap.

- docs/INSTAGRAM_GROWTH_PLAN.md: pillar mapping of the 14 campaign days,
  repeatable weekly rhythm, story scripts, profile-fix gate (bio niche,
  trim 230 following, kill #stratup/#starupmt hashtags, no full AI prompts
  in captions, highlights), healthy hashtag set, Friday KPI ritual
  (46 -> 150+ followers / saves+shares 3x / DM conversations).
- Collab pillar gap (only day-14 touches it): 2 ready collab captions added
  in the plan (agency white-label + freelancer invite) — usable as day-6/7
  replacements before drafts are created or as week-3 posts.
- Stories stay manual: the official Instagram API cannot publish stories;
  feed posts go via Composio (D-059 plumbing) once the owner supplies
  COMPOSIO_API_KEY + COMPOSIO_INSTAGRAM_CONNECTED_ACCOUNT_ID. Their own
  Composio insights pull proves the account is Graph-grade
  (Business/Creator), so only the API key is outstanding.

**Rationale:** sustainable cadence beats burst volume for a 46-follower
page; the strategy keeps every existing artifact (campaign content, images,
publish plumbing) and adds the missing collab pillar without code churn.

## D-061 — Content impact standard: kinetic Persian reels with baked audio (2026-10-25)

Owner's bar: content must be impactful — short videos with fitting
background music, full audio-visual treatment, and audience hooks.
Owner will supply the Composio key; content quality is on us.

- **Pilot reels shipped** (committed): public/media/instagram/reels/
  day-04-reel.mp4 (25s, educational "5 mistakes") and day-02-reel.mp4
  (21.8s, order-driven "MVP sprint"). Format: kinetic Persian typography
  (libass + Vazirmatn Bold, RTL shaping verified frame-by-frame) over the
  brand image — blurred background plate + sharp centered card, alternating
  Ken Burns zoom, fade transitions, persistent @startup_mt watermark.
- **Audio:** royalty-free SYNTHESIZED ambient bed (chord pad + sub + noise
  texture; A-minor for serious topics, C-major for energetic) at 30% under
  whoosh SFX on every cut, mastered loudnorm -14 LUFS (Instagram norm).
  Zero copyright risk since it is original synthesis, not a licensed track.
- **Hooks:** 14 hook lines (one per campaign day) documented in
  docs/INSTAGRAM_GROWTH_PLAN.md §11.2 — number/contradiction in the first
  2 seconds, no preamble, same line opens the caption.
- **TTS verdict:** z-ai TTS voices mangle Persian — proven via a TTS→ASR
  round-trip control (English transcript came back near-perfect, Persian
  came back garbage). Text-driven reel format chosen instead; owner's own
  voice-over is the authentic upgrade path for the personal brand.
- **Trending-audio tradeoff:** Instagram trending sounds cannot be attached
  via the official API — reels auto-published through Composio carry the
  baked original music; posts intended for trending audio must be published
  manually from the app.
- **Reproducibility:** the pipeline is committed under scripts/reels/
  (build_day04.sh, build_day02.sh, day04.ass, day02.ass, Vazirmatn fonts),
  resumable per-scene (cache guards) — sandbox kills long CPU-bound calls,
  artifacts persist between calls.

**Rationale:** with a 46-follower page the hook + saveability + sound design
matter more than volume; this standard makes every future reel consistent
and lets auto-publish ship finished AV content, not naked images.

---

## D-062 (2026-10-25): Reel-aware Instagram publishing + language layering

**Context:** the owner confirmed the Composio key is on its way and asked
whether English AI generation is better/acceptable for the content
(«اگر زبان انگلیسی هم باشد مسئله‌ای نیست؟ آیا انگلیسی بهتر تولید می‌کند؟»).

- **Reel-aware publish (code):** SocialDraft gains a `videoUrl` column
  (both prisma schemas + lazy ALTER shims in ensureSocialDraftTable /
  ensureInstagramDraftsReady). `publishInstagramDraft` prefers the reel:
  `media_type=REELS` + `video_url` + `share_to_feed`, then publishes with a
  retry loop (6 × 8s) because Meta renders video containers asynchronously;
  image drafts keep the single-attempt photo flow. The daily auto-publish
  picks drafts chronologically and ships reel-carrying drafts as REELS
  automatically (detail string tags `reel` vs `photo`).
- **Backfill:** `campaignReelForTopic()` maps campaign day → produced reel
  (day-02, day-04 today; `CAMPAIGN_REELS` grows as more reels are built).
  The campaign seed button now stamps videoUrl on fresh creates AND repairs
  previously seeded unposted drafts (posted ones are never touched) — so
  even drafts created before this deploy go out as reels.
- **Language layering (the owner's question, answered as standing policy):**
  English for the generation layer — AI prompts (image generation, TTS
  control samples) because models are trained predominantly on English
  (our own TTS→ASR round-trip: English near-perfect, Persian garbled);
  Persian for the audience layer — captions, hooks, reel subtitles,
  on-video text, since @startup_mt's audience is Iranian and the Persian
  copy is first-party, not model-limited. AI-image rendered text is avoided
  entirely: Persian typography is burned in with libass + Vazirmatn
  (verified frame-by-frame). Technical English terms (MVP, AI, Deck) stay
  natural inside Persian copy. Documented in INSTAGRAM_GROWTH_PLAN.md §12.

**Rationale:** generation quality belongs to the tooling (English), brand
connection belongs to the audience (Persian); and once the key arrives the
queue ships finished AV content (reels) with zero extra clicks — naked-image
posts only remain for the days no reel exists yet.

---

## D-063 (2026-10-25): Persian narration inside the reels — subtitles now have a voice

**Context:** owner order: «زیرنویس هم اگر متن گفتاری داری داشته باشه» — a reel's
subtitle text must also be SPOKEN. D-061 had chosen music-only because the
z-ai TTS voices garble Persian (TTS→ASR round-trip proof).

- **Voice found:** Microsoft Edge neural voice `fa-IR-FaridNeural` via the
  `msedge-tts` package (devDependency) — passes the same TTS→ASR round-trip
  near-perfectly («این پنج اشتباه ایده‌های خوب را می‌کشد کدامش مال تو است»
  came back intact where the z-ai voices returned garbage). Persian narration
  is production-grade at zero cost.
- **Pipeline:** scripts/reels/voice.mjs — one spoken line per subtitle cue,
  timings mirror dayXX.ass, per-line cache; adaptive SSML rate (max +20%)
  fits each line inside its 3.2s scene window; spoken text is a compressed
  variant of the subtitle (subtitle keeps the full line — voice speaks the
  core so nothing spills into the next cue).
- **Mix:** voice full-level + music ducked 0.30 → 0.16 + whoosh on cuts,
  loudnorm −14 LUFS. Objective check: speech window −18.0dB mean vs
  music-only −36.2dB → ~18dB SNR, speech clearly dominant.
- **Verification honesty:** the z-ai ASR is itself flaky on Persian (it
  misreads CLEAN audio too — «قدم یک» → «کدام یک» on the raw voice file) —
  so final-mix ASR results were cross-checked with raw-line controls and
  volumedetect; day-04 hook and CTA read back through the full mix.
- **Reels rebuilt in place:** day-02-reel.mp4 (21.8s), day-04-reel.mp4
  (25s) — same public paths, `CAMPAIGN_REELS` untouched, video stream
  rebuilt from the same cached scenes (frames re-verified: subtitles, RTL
  shaping, watermark intact). Build scripts gained narration + cache guards
  (concat/music/mix/frames) — fully resumable.

**Rationale:** spoken narration is the single biggest AV upgrade after
hooks; a real Persian neural voice closes the «تأثیرگذاری» gap while the
owner's own voice-over remains the authentic upgrade path.

## D-064 — Legacy WP URLs of kill-switched posts now 301 to /blog (GSC 404-bucket cleanup; owner order 2026-10-25)

**Owner order:** after the Search Console analysis the owner said «خوب وضعیت
نمره منفی داره باید ارتقا بدهیم» — approving the improvement proposed in the
GSC report: the old WordPress URLs of the kill-switched posts must not
dead-end on a 404 target.

**Before:** old WP URL → 301 /blog/<hidden-slug> → 404 (the page-level
kill-switch). GSC saw "Page with redirect" chains ending in "Not found
(404)" — the 8-URL 404 bucket plus wasted crawl equity on every legacy
backlink to those posts.

**What shipped (3 files, redirect logic only — pages and content frozen):**
- src/lib/hidden-post-slugs.ts (NEW, pure, no db import): single source of
  truth for the kill-switch slug list + isHiddenPostSlug() — importable from
  BOTH the server runtime (Prisma) and the proxy/edge runtime.
- src/lib/queries.ts: the local UNPUBLISHED_POST_SLUGS array replaced by an
  import from the leaf module; isUnpublishedPostSlug() now delegates to
  isHiddenPostSlug() (identical semantics — slugCandidates forms on both
  sides). Behavior bit-identical; one list instead of two.
- src/proxy.ts: at the single 301 exit point, a target that translates to
  /blog/<hidden-slug> now redirects to /blog instead. Visible-post targets,
  special-cased map entries (e.g. /logo → /), and the page-level 404 for
  direct /blog/<hidden-slug> access are all untouched.

**Self-test evidence:** eslint clean; tsc clean (after regenerating the
stale local Prisma client — D-058/D-062 models, not this change). Local:
/iran-ousted-from-trade-corridors → 301 /blog (final 200); encoded Persian
hidden slug → 301 /blog; /logo → / per the map (200, deliberate); visible
/iran-railway-technology-startup → 301 its real page (unchanged);
/blog/iran-ousted… direct → still 404 (kill-switch preserved);
/blog/blockquote → 200 (unchanged); /category/* → 301 /blog (unchanged).

**Rationale:** the kill-switch stays 100% intact (rows kept; pages still
404; no surface lists these posts) — only the LEGACY URL handoff changes,
so old backlinks land on the live blog index instead of a dead end. GSC's
404 bucket drains as Google recrawls; the redirect bucket keeps behaving
by design.

## D-065 — Public-readiness audit: repo judged safe to go public; README corrected to English-first, fact-current (owner ask 2026-10-29)

**Owner order:** «آیا وب سایت به نقطه امنی رسیده که اونو توی گیت هاب عمومی کنیم؟» + README first in English — important for search.

**Verdict: SAFE TO GO PUBLIC.** Evidence (all reproducible from this repo):

- **All-refs, all-history content scan** (main + 7 tags incl. `backup-*`, 367 commits) for token patterns (`ghp_`/`sbp_`/`vcp_` with long bodies, AWS `AKIA`, PEM private keys, Supabase/GitHub JWTs, Postgres conn-strings with embedded passwords, `ADMIN_PASSWORD=` real values, Slack/Google keys): **zero secret values**. Only matches: the `<db-password>` template in docs/DEPLOYMENT.md and the literal `[REDACTED]` placeholder in scripts/deploy-watch.sh.
- **Short-prefix sweep** of the same history: `ghp_[REDACTED]`, `sbp_[REDACTED]`, `vcp_[REDACTED]` — three 8-character prefixes (unreconstructable), already self-disclosed in the SECURITY.md incident log, which mandates rotation of all three; the Vercel token is already dead (403 invalidToken, verified in the 2026-10 token-handoff audit).
- **Filename scan of all history** (`git log --all --diff-filter=A`): no `.env`, no `*.db`, no `*.pem`/key/keystore files ever added on any ref. `.env.example` carries names/placeholders only; INDEXNOW + PostHog values are public-by-design and documented as such.
- **Historical worklog.md** (committed 2026-09-04→09-19, gitignored since): every blob hand-checked for credential contexts — all matches are Persian policy prose (e.g. «هیچ secret/DB در artifact»), zero values.
- **GitHub Releases**: 4 releases, **zero assets** — the 2026-09-04 artifact + `custom.db` assets no longer exist. **Backup tags** `backup-2026-10-18`, `backup/pre-dep-upgrade-20261013`: file sets are strict subsets of main (comm found 0 extra files), secret-scan clean.
- **PII in tree**: `admin@mehrdad.ir` (already public on the site itself), `moshtarakinapp@gmail.com` (SMTP/notification *address* in contact/leads code — not a credential), test placeholders (`dev@corp.com`, `wsmith@acme.com`, `mehrdad.ir@evil.com` security fixtures). Zero phone numbers.
- **CI** (`.github/workflows/ci.yml`) uses dummy env values; admin-password near-miss (2026-09-01) was caught before any push; pre-baseline junk history was squashed before the first push (incident log). SECURITY.md was written public-first.

**README corrections (owner directive: English-first for search — it already was; made it search-friendly and fact-current):**
- Keyword tagline added under the repo links (Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma · Supabase Postgres · Vercel · PWA · SEO).
- Deployment section rewritten: **Vercel auto-deploy + Supabase Postgres = production** (verified: `vercel.json` tracked; SECURITY.md env inventory; docs/DEPLOYMENT.md «Vercel mirror + Supabase — DEPLOYED ✅»; `server: Vercel` observed on mehrdad.ir). cPanel artifact runbook kept as legacy reference.
- Architecture "Data" row: Turso-in-production → Supabase Postgres (libsql/Turso adapter noted as the remaining optional code path in `src/lib/db.ts`).

**Post-public checklist (owner's click — deliberately not performed by AI):**
1. GitHub → Settings → Danger Zone → Change visibility → Public.
2. On flip, GitHub's free secret scanning + push protection activate and the whole history is auto-scanned — expected clean per this audit.
3. Suggested topics: `nextjs, typescript, tailwindcss, shadcn-ui, prisma, supabase, vercel, blog, portfolio, rtl, seo, pwa`.
4. Standing reminder (SECURITY.md incident log): rotate the GitHub PAT and Supabase PAT when convenient — both remain valid and IM-exposed by definition.

**Explicitly NOT changed:** LICENSE (none — all-rights-reserved by default; MIT on owner request), worklog history (kept; secret-free; a purge would need history rewrite + force push — not done without explicit owner order), `.env.example` absolute dev path (cosmetic), the dated "Current status" section (frozen snapshot).

## D-066 — Owner order: NO password/token anywhere — token prefixes purged from the entire Git history (2026-10-29)

**Owner order (verbatim):** «پسورد گیت هاب -- یا توکن   vercel یا رمز یا توکن دیگری نباشه» — issued right after the D-065 audit report disclosed three 8-char prefixes living in history.

**Operation (non-destructive; backup first):**
- Backup: full bundle of ALL refs → `/home/z/mehrdad-pre-purge-20261029.bundle` (156 MB, outside the repo, never committed).
- Replacement table (byte-literal): the three 8-char token prefixes (GitHub PAT / Vercel token / Supabase PAT — values not reproduced here by design) each → `<their-prefix>_[REDACTED]`, plus the redacted bearer placeholder inside `scripts/deploy-watch.sh` → `[REDACTED]`.
- Tool: `git filter-repo --replace-text` over ALL refs (main + 7 tags idempotent — same SHAs; 383 commits remapped, incl. all 26 non-main remote branches fetched locally for the purge). Commit messages were already clean (no prefix ever appeared in one).
- Force-pushed: main + all 27 branches + all 7 tags; a SHA-comparison loop verified remote == local for every ref.

**Verification (authoritative):** fresh `git clone --mirror` from GitHub → `git fast-export refs/heads/* refs/tags/*` (every blob + every commit message) → grep for ghp_/sbp_/vcp_ fragments and the placeholder: **0 matches** (exit 1). The GitHub-served history is fragment-free.

**Residuals (honest disclosure):**
1. GitHub keeps pre-rewrite objects reachable by OLD SHAs via server-side caches (verified: old main SHA still answers HTTP 200) until GitHub-side GC — those objects contain prefixes only, never values. An absolute cache purge requires contacting GitHub Support; unwarranted for unreconstructable 8-char prefixes. Every ref now points at rewritten commits.
2. Open PRs (12 Dependabot + owner's #30) reference pre-rewrite objects through `refs/pull/*` — Dependabot self-heals on its next run; PR #30's head branch (`feat/team-room`) was rewritten and force-pushed, so the PR now points at clean commits.
3. Rotation reminder stands (SECURITY.md §4): GitHub PAT + Supabase PAT are IM-exposed by definition; the Vercel token is already dead (403 invalidToken).

**Kept as non-secrets (documented public-by-design):** INDEXNOW key (proves host control by protocol design), PostHog `phc_` public ingest key, the `<db-password>` URL template, CI's `ci-dummy-password`, and the `[REDACTED]` placeholders themselves.

**No content change:** zero code/page/deployment changes — Vercel redeploys an identical site (docs-only diffs).

**Post-record correction (same day, honest trail):** the D-066 commit itself briefly re-introduced the three prefixes by quoting the replacement table verbatim — caught by the same sweep method. A second filter-repo pass redacted those intermediate blobs, main was force-pushed again (adb612c→ab1d505), and a SECOND fresh mirror clone re-verified: 0 matches across all heads + tags, every blob and every commit message.
