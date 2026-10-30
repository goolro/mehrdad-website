'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp, registerNavigate, viewFromPathname } from './store';
import { LangProvider, useLang } from './lang-context';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { LangBanner } from './LangBanner';
import { ThemeBackground } from './ThemeBackground';
import { RouteIndicator } from './RouteIndicator';
import { routeNavStart, routeNavEnd } from '@/lib/nav-indicator';
import { ui } from './i18n';

/**
 * useLayoutEffect runs BEFORE the browser paints; useEffect runs after.
 * SSR code must not call useLayoutEffect (React warns), so an isomorphic
 * alias picks the right hook per environment.
 */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Shared chrome for every real route (real-routes SEO migration).
 * Moved out of the old hash-router page.tsx:
 *  - theme loading + Light/Dark + language direction effects
 *  - store ⇄ App Router navigation bridge
 *  - one-time upgrade of legacy hash deep-links (#blog/<slug>, #about…)
 *    to their real paths, so old bookmarks keep working.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, mode } = useApp();
  // route-aware language (lang-context.tsx): 'fa' is forced on /fa* routes
  // so the <html> lang/dir effect matches the SSR'd Persian content there;
  // every other route keeps the persisted store language (unchanged)
  const lang = useLang();
  // a11y phase-4: skip link must be translated like the rest of the chrome.
  // useLang here is already imported above; when the provider hasn't
  // hydrated yet it falls back to 'en' (same as every other i18n consumer).
  const t = ui[lang];

  // Full-screen game routes (/play/*) and the content factory (/factory,
  // preview-workspace only) are BARE surfaces: no header, footer, chat
  // bubble, lang banner or theme background.
  //
  // HYDRATION SAFETY (2026-10 owner error report): these used to be JSX
  // conditionals driven by usePathname(). At the dev-307 boundary (preview
  // panel opens "/" → 307 → "/factory") the server can render /factory
  // while the client hydrates with pathname "/" — the conditional chrome
  // then produces a STRUCTURAL mismatch (client tree has a <header> where
  // the server HTML has <main>) and React regenerates the whole tree.
  //
  // Fix: the chrome is now ALWAYS rendered (structure identical on both
  // sides, for every pathname) and hidden via CSS on bare surfaces
  // (body:has(.factory-root) / body:has(.play-root) rules in globals.css).
  // Attribute-free, branch-free JSX can never hydration-mismatch.
  const bare = false; // kept as documentation anchor — see comment above
  void bare;

  // load the globally selected theme (set in the admin panel)
  useEffect(() => {
    fetch('/api/site')
      .then((r) => r.json())
      .then((d) => {
        if (d.theme) {
          useApp.setState({ theme: d.theme });
          // cache for the pre-paint boot script (layout.tsx) so returning
          // visitors don't see a palette flash before the DB value arrives
          try {
            localStorage.setItem('mehrdad-theme-cache', d.theme);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // apply theme to <html> for CSS variable overrides
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // apply Light/Dark (independent of theme — Theme Engine D-014)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // set document direction & lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  // navigation bridge: store actions navigate through the App Router.
  // ISO-LAYOUT-EFFECT (2026-01 English-flash fix): the persisted language
  // must be applied to the store BEFORE the browser's first paint, not in
  // a post-paint useEffect. With skipHydration (store.ts) the first client
  // render matches the SSR HTML (English); this hook then synchronously
  // reads localStorage and re-renders in Persian in the SAME commit —
  // the user paints Persian once and never sees an English frame.
  // Also removes the boot script's `lang-boot-fa` body guard (globals.css)
  // in the same pre-paint window, revealing the committed Persian UI.
  useIsoLayoutEffect(() => {
    // nav feedback: programmatic store navigations announce themselves the
    // same way clicked links do (RouteIndicator listens for both)
    registerNavigate((path) => {
      routeNavStart();
      router.push(path);
    });
    try {
      const raw = JSON.parse(localStorage.getItem('mehrdad-app') || '{}').state || {};
      if (raw.lang === 'fa' || raw.lang === 'en') useApp.setState({ lang: raw.lang });
      if (raw.mode === 'light' || raw.mode === 'dark') useApp.setState({ mode: raw.mode });
    } catch {}
    document.documentElement.classList.remove('lang-boot-fa', 'lang-boot-light');
    // full persist hydration (sync storage) — same values, kept for any
    // future persisted fields beyond lang/mode
    useApp.persist.rehydrate();
  }, [router]);

  // keep the active view in sync with the real pathname (nav highlighting)
  useEffect(() => {
    useApp.setState({ view: viewFromPathname(pathname) });
    routeNavEnd(); // navigation finished — clear the corner indicator
  }, [pathname]);

  // legacy hash deep-links → real paths (one-time, on first mount).
  // Old bookmarks and previously-issued redirects like /#blog/<slug>,
  // /#projects, /#contact keep working after the hash-router removal.
  useEffect(() => {
    const raw = window.location.hash;
    if (!raw || raw.length < 2) return;
    const h = raw.slice(1);
    if (h.startsWith('blog/')) {
      window.history.replaceState(null, '', window.location.pathname);
      router.replace(`/blog/${h.slice(5)}`);
      return;
    }
    const targets: Record<string, string> = {
      home: '/',
      services: '/services',
      projects: '/work',
      work: '/work',
      blog: '/blog',
      about: '/about',
      contact: '/contact',
      fde: '/fde',
      lab: '/fde',
      admin: '/admin',
    };
    const target = targets[h];
    if (target !== undefined) {
      window.history.replaceState(null, '', window.location.pathname);
      if (target !== '/') router.replace(target);
    }
    // anything else (e.g. in-page anchors) is left untouched
  }, [router]);

  // LangProvider pins lang='fa' on /fa* (static Persian routes) for EVERY
  // consumer below — header, footer, chat and the page content all render
  // the same language the server rendered (lang-context.tsx).
  return (
    <LangProvider>
      <div className="relative isolate flex min-h-screen flex-col text-foreground">
        {/* a11y phase-4: skip link — first tab stop on every page. Visually
            hidden until focused (sr-only → fixed visible pill). RTL-safe via
            logical start offset. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          {t.a11y.skipToContent}
        </a>
        <ThemeBackground themeId={theme} />
        <Header />
        {/* a11y phase-4: target of the skip link; tabIndex=-1 lets the link
            actually move focus/scroll position into the content */}
        <main id="main" tabIndex={-1} className="relative z-10 flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <ChatWidget />
        <LangBanner />
        <RouteIndicator />
      </div>
    </LangProvider>
  );
}
