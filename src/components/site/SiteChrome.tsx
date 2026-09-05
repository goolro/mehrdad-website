'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp, registerNavigate, viewFromPathname } from './store';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { LangBanner } from './LangBanner';
import { ThemeBackground } from './ThemeBackground';

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
  const { theme, mode, lang } = useApp();

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

  // navigation bridge: store actions navigate through the App Router
  useEffect(() => {
    registerNavigate((path) => router.push(path));
    // apply persisted language/mode AFTER first paint (hydration-safe —
    // see skipHydration note in store.ts)
    useApp.persist.rehydrate();
  }, [router]);

  // keep the active view in sync with the real pathname (nav highlighting)
  useEffect(() => {
    useApp.setState({ view: viewFromPathname(pathname) });
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

  return (
    <div className="relative isolate flex min-h-screen flex-col text-foreground">
      <ThemeBackground themeId={theme} />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <LangBanner />
    </div>
  );
}
