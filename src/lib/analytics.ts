'use client';

/**
 * Typed client-side analytics events (PostHog, 2026-02).
 *
 * Every helper is a safe no-op until PostHog is initialized (SSR render,
 * missing key, Do-Not-Track browsers) — callers never need to guard.
 *
 * 2026-10-18 FIX (owner's live test exposed it): the old gate checked
 * `posthog.__loaded`, which only flips true AFTER the remote config loads.
 * On a HARD LANDING (visitor opens /mvp-sprint directly) the useEffect
 * fires before that, the helper returned early and the event was silently
 * DROPPED — funnels then undercount step 1. Evidence: PostHog showed the
 * $pageview + autocapture of that exact visit but no mvp_sprint_viewed.
 * posthog-js QUEUES capture() calls made after init() even while __loaded
 * is false (the ungated $pageview path already proves the queue works), so
 * the correct gate is "was init() called", not "is __loaded true".
 *
 * PERF (2026-10-27, Lighthouse mobile round): posthog-js is ~100KB gz and
 * 350ms+ of main-thread work. It used to be a STATIC dependency of this
 * module — every view that fired a single event pulled the whole SDK into
 * its chunk graph, and the provider booted it at hydration, making it the
 * single biggest Total-Blocking-Time contributor (TBT 760ms; 63KB of the
 * audited bundle was even flagged unused). The SDK now loads ONCE, lazily,
 * after first idle (requestIdleCallback, 2.5s cap) as a separate async
 * chunk, and this module is the ONLY place that imports it. Helpers await
 * the shared boot promise, so their capture() calls land inside posthog-js's
 * own init-queue — funnel events fire a beat later but are no longer
 * dropped on hard landings.
 *
 * Key handling: the PostHog project token (phc_…) is a PUBLIC ingest key by
 * design — it can only enqueue events, never read them — so a baked-in
 * fallback is safe. NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST
 * override it at build time. Region: project 619709 lives on US cloud →
 * us.i.posthog.com (must match the CSP allowances in next.config.ts +
 * scripts/inject-csp.mjs).
 */

type PostHogClient = (typeof import('posthog-js'))['default'];

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_poVbYiDr9sUZcuecq44ftUAPMVXU9hriYChzjXgiR4M3';
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let phPromise: Promise<PostHogClient | null> | null = null;
let booted = false;
let initCalled = false;
let optedOutForPrivate = false;

/**
 * /agency is the owner's PRIVATE AI workspace (chats, product tasks, team
 * runbooks), /admin is the internal tool — neither is ever tracked. The SDK
 * only BOOTS on public paths, so a direct private load never initializes
 * posthog at all (no autocapture listeners, no network calls).
 */
export function isPrivatePath(pathname: string | null): boolean {
  return !!pathname && (pathname.startsWith('/admin') || pathname.startsWith('/agency'));
}

function currentPath(): string | null {
  return typeof window === 'undefined' ? null : (window.location?.pathname ?? null);
}

/**
 * Lazy, idle-deferred SDK boot — the ONLY posthog-js import on the site.
 * Resolves null if the SDK fails to load (a blocked analytics script must
 * never break the site). Later callers await the SAME promise.
 */
export function bootPosthog(): Promise<PostHogClient | null> | null {
  if (booted) return phPromise;
  booted = true;
  phPromise = new Promise<PostHogClient | null>((resolve) => {
    const start = () =>
      import('posthog-js')
        .then(({ default: ph }) => {
          ph.init(KEY, {
            api_host: HOST,
            // verbose logging in dev only — production stays silent
            debug: process.env.NODE_ENV !== 'production',
            capture_pageview: false, // manual $pageview in PostHogPageView (App Router pattern)
            capture_pageleave: true,
            autocapture: true,
            respect_dnt: true, // browsers with Do-Not-Track enabled are never tracked
            persistence: 'localStorage+cookie',
          });
          initCalled = true;
          return ph;
        })
        .catch(() => null);
    // keep analytics entirely off the first-load/interaction path
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(() => resolve(start()), { timeout: 2500 });
    } else {
      setTimeout(() => resolve(start()), 1500);
    }
  });
  return phPromise;
}

/**
 * SPA navigation INTO a private surface: opt the browser out entirely
 * (blocks pageview, autocapture and session recording). Only opt-outs WE
 * made are reversed on the next public page — never a user's own
 * (DNT / manual opt-out stays respected).
 */
export function optOutForPrivateSurface(): void {
  if (!booted) return; // SDK never booted → nothing to opt out
  void phPromise?.then((ph) => {
    if (ph && !ph.has_opted_out_capturing()) {
      ph.opt_out_capturing();
      optedOutForPrivate = true;
    }
  });
}

/** Manual $pageview (App Router pattern) — public surfaces only. */
export function capturePageview(): void {
  if (typeof window === 'undefined') return;
  if (isPrivatePath(currentPath())) return;
  void bootPosthog()?.then((ph) => {
    if (!ph) return;
    if (optedOutForPrivate && ph.has_opted_out_capturing()) {
      ph.opt_in_capturing();
      optedOutForPrivate = false;
    }
    ph.capture('$pageview');
  });
}

function send(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!initCalled && isPrivatePath(currentPath())) return;
  void bootPosthog()?.then((ph) => {
    if (ph) ph.capture(event, props);
  });
}

/** A visitor opened a full article — the SEO/north-star engagement metric. */
export function trackArticleViewed(props: { slug: string; title: string; lang: 'fa' | 'en' }) {
  send('blog_article_viewed', props);
}

// ── Conversion funnel (phase 0+1, 2026-10-18) ─────────────────────────
// The four events below define the site's money funnel in PostHog:
//   mvp_sprint_viewed → mvp_sprint_cta → lead_submitted → (playbook alongside)
// Funnel: dashboard → Funnels → add these three in order.

/** A visitor opened the productized AI MVP Sprint offer page. */
export function trackMvpSprintViewed(props: { lang: 'en' | 'fa' }) {
  send('mvp_sprint_viewed', props);
}

/** A visitor clicked an MVP Sprint call-to-action (scope-call booking path). */
export function trackMvpSprintCta(props: { placement: 'hero' | 'tier' | 'faq'; lang: 'en' | 'fa' }) {
  send('mvp_sprint_cta', props);
}

/** A contact-form submission succeeded — the primary lead event.
 *  intent matches the ContactView intent keys; budget/timeline only
 *  present when the visitor used the services qualification fields. */
export function trackLeadSubmitted(props: {
  intent: string;
  lang: 'en' | 'fa';
  budget?: string;
  timeline?: string;
}) {
  send('lead_submitted', props);
}

/** A visitor requested the FDE Playbook via the email capture. */
export function trackPlaybookSubscribed(props: { placement: 'playbook_page' | 'footer'; lang: 'en' | 'fa' }) {
  send('playbook_subscribed', props);
}

// ── Free tool (phase 3, 2026-10-18) ────────────────────────────────────
// Scope Builder: the tool IS the scope-call prep — completing it is a
// high-intent signal, one step before the lead event.

/** A visitor generated their one-page scope in the MVP Scope Builder. */
export function trackScopeBuilderCompleted(props: { lang: 'en' | 'fa'; hadSmallestVersion: boolean }) {
  send('scope_builder_completed', props);
}
