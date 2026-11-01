'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './i18n';

export type View = 'home' | 'services' | 'projects' | 'blog' | 'daily' | 'about' | 'contact' | 'fde' | 'admin';
export type ColorMode = 'light' | 'dark';

/**
 * Real-routes migration (2026-09-05): every view now lives at a real,
 * indexable App Router path. The store keeps the active view only for
 * UI state (nav highlighting); navigation itself goes through the
 * Next.js App Router via the bridge registered by SiteChrome.
 */
export const VIEW_PATH: Record<View, string> = {
  home: '/',
  services: '/services',
  projects: '/work',
  blog: '/blog',
  daily: '/daily',
  about: '/about',
  contact: '/contact',
  fde: '/fde',
  admin: '/admin',
};

/**
 * Persian twins (audit section 2, fix #1 — the fa tree): static Persian
 * pages exist for the nav routes, so the chrome keeps /fa visitors inside
 * the Persian tree instead of dumping them back on the EN site.
 * daily/fde/admin have NO Persian pages yet — they deliberately keep their
 * EN paths here so nothing can link to a 404.
 */
export const FA_VIEW_PATH: Record<View, string> = {
  home: '/fa',
  services: '/fa/services',
  projects: '/fa/work',
  blog: '/fa/blog',
  daily: '/daily', // no Persian twin yet — EN page on purpose
  about: '/fa/about',
  contact: '/fa/contact',
  fde: '/fde', // no Persian twin yet — EN page on purpose
  admin: '/admin',
};

/** True on the static Persian route tree — kept local to avoid a
 *  store ⇄ lang-context import cycle (same one-liner as lang-context). */
function isFaPathname(p: string): boolean {
  return p === '/fa' || p.startsWith('/fa/');
}

/**
 * Exact-match map used by the navigation bridge: on /fa* routes, programmatic
 * store navigation (setView) lands on the Persian twin when one exists.
 * EXACT matches only — deep paths (/blog/<slug>, /work/<slug>) have no
 * Persian twins and intentionally stay on the EN tree instead of 404ing.
 */
const FA_TWIN: Record<string, string> = {
  '/': '/fa',
  '/services': '/fa/services',
  '/work': '/fa/work',
  '/blog': '/fa/blog',
  '/about': '/fa/about',
  '/contact': '/fa/contact',
};

function faAwarePath(path: string): string {
  if (typeof window === 'undefined') return path;
  if (!isFaPathname(window.location.pathname)) return path;
  return FA_TWIN[path] ?? path;
}

/** pathname → view (drives nav highlighting after every navigation) */
export function viewFromPathname(pathname: string | null | undefined): View {
  let p = pathname || '/';
  // Persian tree (audit §2 #1): strip the /fa prefix so nav highlighting on
  // /fa/services etc. matches the same view keys as the EN routes
  if (p === '/fa') return 'home';
  if (p.startsWith('/fa/')) p = p.slice(3);
  if (p === '/' || p === '') return 'home';
  const seg = p.split('/')[1] || '';
  switch (seg) {
    case 'services': return 'services';
    case 'work': return 'projects';
    case 'blog': return 'blog';
    case 'daily': return 'daily';
    case 'about': return 'about';
    case 'contact': return 'contact';
    case 'fde':
    case 'lab': return 'fde';
    case 'admin': return 'admin';
    default: return 'home';
  }
}

interface AppState {
  lang: Lang;
  view: View;
  chatOpen: boolean;
  theme: string;
  /** Light/Dark — independent of the site theme (Theme Engine, D-014) */
  mode: ColorMode;
  setLang: (l: Lang) => void;
  setView: (v: View) => void;
  openPost: (slug: string) => void;
  closePost: () => void;
  openProject: (slug: string) => void;
  setChatOpen: (o: boolean) => void;
  setTheme: (t: string) => void;
  setMode: (m: ColorMode) => void;
}

// ── Router bridge ────────────────────────────────────────────────────
// zustand lives outside React, so it cannot call useRouter() itself.
// SiteChrome registers the App Router navigate function on mount; every
// store action then performs a real client-side navigation (no reload,
// real URLs). Falls back to a hard navigation if the bridge is missing.
type NavFn = (path: string) => void;
let navigateFn: NavFn | null = null;
export function registerNavigate(fn: NavFn) {
  navigateFn = fn;
}
function navigate(path: string) {
  // audit §2 #1: keep /fa visitors on the Persian tree for pages that have
  // a Persian twin (see FA_TWIN) — deep/unknown paths pass through unchanged
  const target = faAwarePath(path);
  if (navigateFn) navigateFn(target);
  else if (typeof window !== 'undefined') window.location.assign(target);
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      view: 'home',
      chatOpen: false,
      theme: 'default',
      // dark is the site default at first paint (owner request 2026-09-08);
      // an explicit light choice persists and wins
      mode: 'dark',
      setLang: (lang) => set({ lang }),
      setView: (view) => {
        set({ view });
        navigate(VIEW_PATH[view]);
      },
      openPost: (slug) => {
        set({ view: 'blog' });
        navigate(`/blog/${slug}`);
      },
      closePost: () => {
        set({ view: 'blog' });
        navigate('/blog');
      },
      openProject: (slug) => {
        set({ view: 'projects' });
        navigate(`/work/${slug}`);
      },
      setChatOpen: (chatOpen) => set({ chatOpen }),
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'mehrdad-app',
      partialize: (s) => ({ lang: s.lang, mode: s.mode }),
      // rehydrated AFTER first paint (SiteChrome effect) so the SSR HTML and
      // the first client render always match (React hydration guarantee);
      // the pre-paint boot script in layout.tsx still applies dir/mode
      // instantly from localStorage, so FA/dark users see no layout flash.
      skipHydration: true,
    }
  )
);

export function pick(lang: Lang, en: string | null | undefined, fa: string | null | undefined): string {
  if (lang === 'fa') return fa || en || '';
  return en || fa || '';
}

export function formatDate(lang: Lang, d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
