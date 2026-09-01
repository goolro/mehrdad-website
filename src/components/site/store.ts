'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './i18n';

export type View = 'home' | 'services' | 'projects' | 'blog' | 'about' | 'contact' | 'fde' | 'admin';
export type ColorMode = 'light' | 'dark';

interface AppState {
  lang: Lang;
  view: View;
  currentPostSlug: string | null;
  chatOpen: boolean;
  theme: string;
  /** Light/Dark — independent of the site theme (Theme Engine, D-014) */
  mode: ColorMode;
  setLang: (l: Lang) => void;
  setView: (v: View) => void;
  openPost: (slug: string) => void;
  closePost: () => void;
  setChatOpen: (o: boolean) => void;
  setTheme: (t: string) => void;
  setMode: (m: ColorMode) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      view: 'home',
      currentPostSlug: null,
      chatOpen: false,
      theme: 'default',
      mode: 'light',
      setLang: (lang) => set({ lang }),
      setView: (view) => {
        set({ view, currentPostSlug: null });
        // keep the URL hash in sync so every view is shareable/deep-linkable
        if (typeof window !== 'undefined') window.location.hash = view;
      },
      openPost: (slug) => {
        set({ view: 'blog', currentPostSlug: slug });
        // deep-linkable article URL (#blog/<slug>) — also makes card clicks
        // work from any view (home featured posts, related articles, ...)
        if (typeof window !== 'undefined') window.location.hash = `blog/${slug}`;
      },
      closePost: () => {
        set({ currentPostSlug: null });
        if (typeof window !== 'undefined') window.location.hash = 'blog';
      },
      setChatOpen: (chatOpen) => set({ chatOpen }),
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'mehrdad-app',
      partialize: (s) => ({ lang: s.lang, mode: s.mode }),
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
