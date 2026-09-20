# PostHog Product Analytics

Wired 2026-02. US-cloud project `619709` (https://us.posthog.com) — token
`phc_poVbYi…` is a **public ingest key** by design (it can only enqueue
events, never read them), so it ships baked-in as a fallback and analytics
works on Vercel with zero extra env setup.

## What is captured

| Signal | Source | Notes |
|---|---|---|
| `$pageview` / `$pageleave` | `PostHogProvider` (client) | manual capture on App Router route change (`capture_pageview: false` — official posthog-js pattern); `/admin/**` is never tracked |
| Autocapture (clicks, form submits, scrolls, dead clicks) | posthog-js | the "what do visitors actually do" layer |
| Session recordings | posthog-js (project setting) | inputs masked by default; only if enabled in the PostHog project |
| Exceptions | posthog-js exception-autocapture | uncaught client errors |
| `blog_article_viewed` | `PostDetail` (client) | slug + title + language — the article-engagement north star |
| `contact_form_submitted` | `/api/contact` (server, `after()`) | distinct_id = submitter's email → leads become identifiable persons |
| `ai_article_generated` | `/api/admin/ai/write` (server, `after()`) | pipeline throughput next to traffic |
| `linkedin_post_published` | `/api/admin/social/publish` (server, `after()`) | distribution loop end-to-end |

Server events go through `src/lib/server-analytics.ts` (posthog-node,
one-shot client with `flushAt: 1` + `shutdown()` — the Vercel-safe pattern),
scheduled with `after()` from `next/server` so the response is never blocked.

## Architecture / gotchas

- **CSP**: `us.i.posthog.com` (ingest XHR) and `us-assets.i.posthog.com`
  (remote config/features JS) are allowed in BOTH policies — the static
  floor in `next.config.ts` (what Vercel serves) and the build-time hash
  meta in `scripts/inject-csp.mjs` (what self-hosted builds serve). EU
  hosts are intentionally NOT allowed; switching region = env var + both
  CSP blocks.
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` override the
  baked-in fallbacks at build time (Vercel → Settings → Environment
  Variables).
- Both domains on this Vercel project (mehrdad.ir + quizofkoko.com) feed
  the same PostHog project — filter insights by `$current_url` host.
- DNT-enabled browsers are respected (`respect_dnt: true`).
- quizofkoko-only dashboards: filter on host, or later split by project if
  volumes grow.

## Verification checklist (done locally)

- `config.js` + lazy extension scripts load 200 from `us-assets.i.posthog.com`
- device_id / session persisted (`ph_phc_…` localStorage + cookie)
- pageview capture fires on route change (debug log, `__loaded=true`)
- direct `POST /batch/` with the project key → 200 (ingest reachable)
- `/api/contact` server event flows through `after()` without errors
