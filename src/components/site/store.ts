'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './i18n';

export type View = 'home' | 'services' | 'projects' | 'blog' | 'about' | 'contact' | 'admin';

interface AppState {
  lang: Lang;
  view: View;
  currentPostSlug: string | null;
  chatOpen: boolean;
  theme: string;
  setLang: (l: Lang) => void;
  setView: (v: View) => void;
  openPost: (slug: string) => void;
  closePost: () => void;
  setChatOpen: (o: boolean) => void;
  setTheme: (t: string) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      view: 'home',
      currentPostSlug: null,
      chatOpen: false,
      theme: 'digital',
      setLang: (lang) => set({ lang }),
      setView: (view) => set({ view, currentPostSlug: null }),
      openPost: (slug) => set({ currentPostSlug: slug }),
      closePost: () => set({ currentPostSlug: null }),
      setChatOpen: (chatOpen) => set({ chatOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'mehrdad-app',
      partialize: (s) => ({ lang: s.lang }),
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
