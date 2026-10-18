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
 *
 * Private surfaces (owner QA round 2026-10-06): /agency is the owner's
 * PRIVATE AI workspace — chats, product tasks, team runbooks. Analytics must
 * never see it. Two layers:
 *  1. the SDK only BOOTS on public paths — a direct /agency or /admin load
 *     never initializes posthog (no autocapture listeners, no network calls)
 *  2. SPA navigation into /agency opts the browser out entirely (blocks
 *     pageview, autocapture and session recording) and opts back in on the
 *     next public page — only reversing opt-outs WE made, never a user's own
 *     (DNT / manual opt-out stays respected).
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_poVbYiDr9sUZcuecq44ftUAPMVXU9hriYChzjXgiR4M3';
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let booted = false;
let optedOutForPrivate = false;

function isPrivatePath(pathname: string | null): boolean {
  return !!pathname && (pathname.startsWith('/admin') || pathname.startsWith('/agency'));
}

function bootPosthog() {
  if (booted) return;
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

export default function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPrivatePath(pathname)) bootPosthog();
  }, [pathname]);

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

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) {
      // /admin is the owner's internal tool, not product surface — skip it so
      // dashboards, funnels and session data stay visitor-only.
      return;
    }
    if (pathname.startsWith('/agency')) {
      if (booted && !posthog.has_opted_out_capturing()) {
        posthog.opt_out_capturing();
        optedOutForPrivate = true;
      }
      return;
    }
    if (booted && optedOutForPrivate && posthog.has_opted_out_capturing()) {
      posthog.opt_in_capturing();
      optedOutForPrivate = false;
    }
    posthog.capture('$pageview');
  }, [pathname, searchParams]);

  return null;
}
