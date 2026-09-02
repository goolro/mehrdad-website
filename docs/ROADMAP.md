# ROADMAP — mehrdad.ir

Last updated: 2026-09-01

## Done

- [x] Phase 0 — full audit (docs/AUDIT.md)
- [x] Phase 1 — foundation: content model, design tokens, RTL shell, routes
- [x] Phase 2 — content migration (82 posts, 17 comments, 138 media) with
      date-reconstruction evidence chain + MIGRATION_REPORT + REDIRECTS
- [x] Phase 3 — core site: Home, Work(+detail), Writing(+detail), Lab,
      About, Contact + moderated comments
- [x] Phase 4 — SEO: metadata, JSON-LD (Person/WebSite/Article), sitemap,
      robots, RSS, legacy 301 layer
- [x] Phase 5 — QA: browser-verified golden paths (desktop+mobile), sticky
      footer, forms, comment moderation, redirects, no console errors
- [x] Post-migration fixes: category-filter 500 (Prisma `some:` filter),
      percent-encoded Persian category slugs decoded, Persian-slug article
      404s (slug-candidates layer)
- [x] Evidence-based re-dating of all 83 posts (Wayback CDX probes +
      upload-path/comment/Jalali/LLM signals; 2019–2025 distribution)
- [x] In-content legacy links internalized — 316 occurrences now route
      inside the app; media mirrored locally (PDFs + MP4s)
- [x] PWA complete: manifest, service worker, icons, install prompt,
      shortcuts, iOS meta
- [x] Admin panel: env-only auth (fail closed), content CRUD, comment
      moderation, contact leads, theme setting, AI content tools
- [x] GitHub baseline: public repo synced with one clean squashed commit;
      secrets removed from tracking (docs/SECURITY.md incident log)
- [x] Forward Deployed Engineering — the brand's core service: dedicated
      bilingual experience page (#fde) with roles/Process/Deliverables/AI
      loop/comparison/scenario, highlighted Core-Service card in Services,
      page-context-aware AI assistant (suggested questions + grounded
      answers), per-language SEO metadata (owner directive 2026-09-01)

## Next (prioritized)

### P0 — current sprint (owner-approved 2026-09-01)
- [x] Theme engine on shared design tokens: exactly Default / Autumn /
      Winter / Digital / Nowruz × independent Light/Dark; retired
      Ocean/Forest/Sunset/Midnight (D-014 — docs/THEME_ENGINE.md)
- [x] TWA/Android packaging prepared: assetlinks generator
      (`scripts/generate-assetlinks.ts`), `*.keystore`/`*.apk` gitignored,
      full runbook docs/MOBILE_TWA.md — signed build + Play listing await
      the owner's keystore (D-015)
- [x] Browser-locale language suggestion banner (EN default preserved; offer-once, D-019)
- [x] EN translation loop for Persian-only archive posts — complete: every
      published post (82) has full EN content; the rail-corridor post that
      was content-filtered got a manual chunk rescue; the only Persian-only
      item is the draft smart-waste post (D-021)
- [x] Inline boot script kills the dark-mode/RTL first-paint flash (was a P2
      nicety in docs/THEME_ENGINE.md — now fixed)

### P1 — editorial
- [ ] Owner review: publish/draft decision for post 7995 (smart-waste
      startup financials, currently `draft`)
- [x] Curated tags (32 ≤ 50) replacing the retired 4,872-tag dump (D-020):
      fixed bilingual taxonomy, constrained assignment, blog filter UI
- [x] Alt-text completion for in-content images — DONE 118/118 (D-022):
      every unique in-content image now carries a concise descriptive
      bilingual alt (EN+FA) — 242/242 img tags descriptive, junk alt
      eliminated (post-apply audit: junk=0, empty=0, unique=118).
      Provenance: 16 hand-authored (Phase 1) + 102 agent-vision
      descriptions (Phase 2, sandbox LLM API rate-limited 8h+ so the
      agent's native vision authored them through the same
      `alt_manual.json` → `--merge-manual` → `--validate` (PASS) →
      `--apply` (backup `db/custom.backup-20260902074251.db`) path).
      Pipeline: `analysis/fix_alts.ts` (probe-first, resume-safe, QC)
- [ ] Import decision: 10 legacy web-stories as micro-notes (`kind=note`)
- [ ] Featured images for top articles (currently first-body-image fallback)

### P2 — content ops
- [x] Wayback Machine cross-check of pre-2021 dates (completed in the
      re-dating pass — 43 posts archived-anchored)
- [ ] Writing → LinkedIn repurposing templates (per-article metadata ready)
- [ ] RIVORA / Hokm / Shelem game project entry (needs owner input: status,
      screenshots, repo links — audit §41/open items)

### P3 — product
- [ ] Newsletter (only when there is real demand)
- [x] English version — shipped as the default language (D-013)
- [ ] Breadcrumb JSON-LD + article OG images

### P4 — future (do NOT build until real use case exists)
- [ ] User accounts / saved state
- [ ] Investment/partner pages (only with real traction)

## Open decisions for the owner

1. Password-protected post 7995 → publish or keep draft?
2. Web-stories → import as notes or drop?
3. Game project data (RIVORA/Hokm/Shelem) for a Work entry?
4. LinkedIn profile URL for About/Contact cross-linking?
