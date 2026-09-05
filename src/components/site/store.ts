'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './i18n';

export type View = 'home' | 'services' | 'projects' | 'blog' | 'about' | 'contact' | 'fde' | 'admin';
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
  about: '/about',
  contact: '/contact',
  fde: '/fde',
  admin: '/admin',
};

/** pathname → view (drives nav highlighting after every navigation) */
export function viewFromPathname(pathname: string | null | undefined): View {
  const p = pathname || '/';
  if (p === '/' || p === '') return 'home';
  const seg = p.split('/')[1] || '';
  switch (seg) {
    case 'services': return 'services';
    case 'work': return 'projects';
    case 'blog': return 'blog';
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
  if (navigateFn) navigateFn(path);
  else if (typeof window !== 'undefined') window.location.assign(path);
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      view: 'home',
      chatOpen: false,
      theme: 'default',
      mode: 'light',
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
