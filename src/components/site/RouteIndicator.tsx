'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useLang } from './lang-context';
import {
  subscribeRouteIndicator,
  isRouteNavPending,
  routeNavStart,
  routeNavEnd,
} from '@/lib/nav-indicator';

/**
 * In-app navigation feedback (owner request 2026-09-29): a slim progress
 * bar pinned to the top edge + a small pill in the top-end corner while a
 * client-side navigation is in flight.
 *
 * WHY CLICK INTERCEPTION: the App Router has no global "navigation
 * started" event, and per-link useLinkStatus would mean wrapping every
 * <Link> in the codebase. A capture-phase click listener on internal
 * anchors catches next/link AND plain <a> navigations with zero
 * refactoring; the store⇄router bridge (SiteChrome) covers programmatic
 * routeNavStart calls; popstate covers back/forward. Arrival is detected
 * by the pathname effect here AND the URL poll in nav-indicator.ts (the
 * poll also catches ?lang=… search-only navigations).
 */

function isInternalNavClick(target: EventTarget | null): boolean {
  const el = target as Element | null;
  const anchor = el?.closest?.('a');
  if (!anchor) return false;
  const href = anchor.getAttribute('href') || '';
  // external / new-tab / download / same-page-hash clicks never hit the router
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  if ((anchor as HTMLAnchorElement).target === '_blank') return false;
  if (anchor.hasAttribute('download')) return false;
  const pathPart = href.split('#')[0];
  if (pathPart === location.pathname) return false;
  return true;
}

export function RouteIndicator() {
  const pending = useSyncExternalStore(subscribeRouteIndicator, isRouteNavPending, () => false);
  // route-aware language (lang-context.tsx): 'fa' is forced on /fa* routes
  const lang = useLang();
  const pathname = usePathname();

  // global triggers: internal anchor clicks (capture) + back/forward
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!isInternalNavClick(e.target)) return;
      routeNavStart();
    };
    const onPop = () => routeNavStart();
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // arrival: pathname change ends the pending state (the URL poll inside
  // nav-indicator.ts handles search-only navigations)
  useEffect(() => {
    routeNavEnd();
  }, [pathname]);

  if (!pending) return null;

  return (
    <>
      {/* top edge progress bar (decorative) */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-0.5 overflow-hidden">
        <div className="nav-indicator-bar h-full w-2/5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />
      </div>
      {/* corner pill — the small animation the owner asked for */}
      <div
        role="status"
        aria-live="polite"
        className="nav-indicator-pill fixed end-4 top-20 z-[95] flex items-center gap-2 rounded-full border border-violet-500/30 bg-background/95 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-lg shadow-violet-600/10 backdrop-blur"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600 dark:text-violet-400" aria-hidden />
        {lang === 'fa' ? 'در حال باز کردن صفحه…' : 'Opening…'}
      </div>
    </>
  );
}
