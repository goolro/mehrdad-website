'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

/**
 * PostHog product analytics (2026-02).
 *
 * One client entry point for the whole site:
 *  - autocapture (clicks / form submits / scrolls) — the "what do visitors actually do" layer
 *  - manual $pageview on every App Router navigation (capture_pageview:false
 *    is the official posthog-js + Next.js pattern; route changes are SPA
 *    navigations that a script-tag snippet would miss)
 *  - $pageleave for exit tracking, DNT-respecting, no /admin tracking
 *
 * Key handling: the PostHog project token (phc_…) is a PUBLIC ingest key by
 * design — it can only enqueue events, never read them — so a baked-in
 * fallback is safe and lets deployments work with zero Vercel env config.
 * NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST override it at build time.
 *
 * Region: project 619709 lives on US cloud → us.i.posthog.com (must match
 * the CSP allowances in next.config.ts + scripts/inject-csp.mjs).
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_poVbYiDr9sUZcuecq44ftUAPMVXU9hriYChzjXgiR4M3';
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let booted = false;

if (typeof window !== 'undefined' && KEY && !booted) {
  booted = true;
  posthog.init(KEY, {
    api_host: HOST,
    // verbose logging in dev only — production stays silent
    debug: process.env.NODE_ENV !== 'production',
    capture_pageview: false, // manual in PostHogPageView (App Router pattern)
    capture_pageleave: true,
    autocapture: true,
    respect_dnt: true, // browsers with Do-Not-Track enabled are never tracked
    persistence: 'localStorage+cookie',
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    // /admin is the owner's internal tool, not product surface — skip it so
    // dashboards, funnels and session data stay visitor-only.
    if (pathname.startsWith('/admin')) return;
    posthog.capture('$pageview');
  }, [pathname, searchParams]);

  return null;
}

export default function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* useSearchParams() requires a Suspense boundary on static pages,
          otherwise the whole tree opts out of static rendering at build */}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
    </>
  );
}
