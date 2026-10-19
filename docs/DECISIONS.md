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
