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
