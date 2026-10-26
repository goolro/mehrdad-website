'use client';

import { Suspense, useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { bootPosthog, capturePageview, isPrivatePath, optOutForPrivateSurface } from '@/lib/analytics';

/**
 * PostHog product analytics — client entry point for the whole site.
 *
 * One provider, one pageview reporter:
 *  - autocapture (clicks / form submits / scrolls) — the "what do visitors actually do" layer
 *  - manual $pageview on every App Router navigation (capture_pageview:false
 *    is the official posthog-js + Next.js pattern; route changes are SPA
 *    navigations that a script-tag snippet would miss)
 *  - $pageleave for exit tracking, DNT-respecting, no /admin tracking
 *
 * PERF (2026-10-27, Lighthouse mobile round): the SDK is no longer a static
 * dependency of this module — `src/lib/analytics.ts` is now the single lazy
 * owner (dynamic import after first idle). Nothing analytics-related ships
 * in the critical bundle; see analytics.ts for the full rationale.
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
      optOutForPrivateSurface();
      return;
    }
    capturePageview();
  }, [pathname, searchParams]);

  return null;
}
