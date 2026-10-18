'use client';

import posthog from 'posthog-js';

/**
 * Typed client-side analytics events (PostHog, 2026-02).
 *
 * Every helper is a safe no-op until PostHog is initialized (SSR render,
 * missing key, Do-Not-Track browsers) — callers never need to guard.
 */

function ready(): boolean {
  return typeof window !== 'undefined' && posthog.__loaded === true;
}

/** A visitor opened a full article — the SEO/north-star engagement metric. */
export function trackArticleViewed(props: { slug: string; title: string; lang: 'fa' | 'en' }) {
  if (!ready()) return;
  posthog.capture('blog_article_viewed', props);
}

// ── Conversion funnel (phase 0+1, 2026-10-18) ─────────────────────────
// The four events below define the site's money funnel in PostHog:
//   mvp_sprint_viewed → mvp_sprint_cta → lead_submitted → (playbook alongside)
// Funnel: dashboard → Funnels → add these three in order.

/** A visitor opened the productized AI MVP Sprint offer page. */
export function trackMvpSprintViewed(props: { lang: 'en' | 'fa' }) {
  if (!ready()) return;
  posthog.capture('mvp_sprint_viewed', props);
}

/** A visitor clicked an MVP Sprint call-to-action (scope-call booking path). */
export function trackMvpSprintCta(props: { placement: 'hero' | 'tier' | 'faq'; lang: 'en' | 'fa' }) {
  if (!ready()) return;
  posthog.capture('mvp_sprint_cta', props);
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
  if (!ready()) return;
  posthog.capture('lead_submitted', props);
}

/** A visitor requested the FDE Playbook via the email capture. */
export function trackPlaybookSubscribed(props: { placement: 'playbook_page' | 'footer'; lang: 'en' | 'fa' }) {
  if (!ready()) return;
  posthog.capture('playbook_subscribed', props);
}
