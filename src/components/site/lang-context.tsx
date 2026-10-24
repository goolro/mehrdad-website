'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from './store';
import type { Lang } from './i18n';

/**
 * Route-aware language resolution (P1 translation-sync, 2026-10-23).
 *
 * Until now the ONLY Persian surface was the same URL + ?lang=fa, flipped
 * client-side after hydration — the static SSR HTML (what crawlers see
 * without JS) is always English, so the hreflang=fa variant has no
 * server-rendered Persian content for Bing/AI crawlers and the page source
 * is byte-identical for both languages (2026-10-23 live audit).
 *
 * This context adds a REAL static Persian route tree under /fa:
 *  - the server component page (src/app/fa/page.tsx) renders the same
 *    HomeView but the LangProvider below pins lang='fa' for the whole
 *    route, so the BUILD-TIME HTML is Persian — crawlable with zero JS,
 *    no flash, no boot-script body-hiding needed on this route;
 *  - every other route keeps the existing behavior: lang comes from the
 *    persisted store (?lang=fa client flip) — nothing changes there.
 *
 * useLang() is the single language read-point for UI components. Components
 * that only SET language keep using the store's setLang directly.
 */

const LangCtx = createContext<Lang | null>(null);

/** True on the static Persian route tree (/fa, /fa/...). */
export function isFaPath(p: string | null | undefined): boolean {
  return !!p && (p === '/fa' || p.startsWith('/fa/'));
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  // usePathname() is available during the server render too (App Router
  // feeds it from the request), so the SSG HTML and the first client
  // render agree — no hydration mismatch, no flash.
  const pathname = usePathname();
  const value: Lang | null = isFaPath(pathname) ? 'fa' : null;
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

/**
 * The language for this render: 'fa' is FORCED on /fa* routes (server and
 * client), every other route falls back to the persisted store language —
 * identical to the pre-context behavior there.
 */
export function useLang(): Lang {
  const ctx = useContext(LangCtx);
  const storeLang = useApp((s) => s.lang);
  return ctx ?? storeLang;
}
