'use client';

import { useEffect } from 'react';
import { useApp } from '@/components/site/store';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { HomeView } from '@/components/site/HomeView';
import { ServicesView } from '@/components/site/ServicesView';
import { ProjectsView } from '@/components/site/ProjectsView';
import { BlogView, PostDetail } from '@/components/site/BlogView';
import { AboutView } from '@/components/site/AboutView';
import { ContactView } from '@/components/site/ContactView';
import { FdeView } from '@/components/site/FdeView';
import { AdminView } from '@/components/site/AdminView';
import { ChatWidget } from '@/components/site/ChatWidget';
import { LangBanner } from '@/components/site/LangBanner';
import { ThemeBackground } from '@/components/site/ThemeBackground';
import { getTheme } from '@/lib/themes';

export default function Page() {
  const { view, currentPostSlug, lang, theme, mode } = useApp();

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

  // hash-based deep links (#blog, #blog/slug, #contact, ...)
  useEffect(() => {
    function onHash() {
      const h = window.location.hash.replace(/^#/, '');
      if (h.startsWith('blog/')) {
        useApp.setState({ view: 'blog', currentPostSlug: h.slice(5) });
      } else if (['blog', 'contact', 'about', 'services', 'projects', 'fde', 'home', 'admin'].includes(h)) {
        useApp.setState({ view: h === 'home' ? 'home' : (h as 'blog' | 'contact' | 'about' | 'services' | 'projects' | 'fde' | 'admin'), currentPostSlug: null });
      }
    }
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="relative isolate flex min-h-screen flex-col text-foreground" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <ThemeBackground themeId={theme} />
      <Header />
      <main className="relative z-10 flex-1">
        {view === 'home' && <HomeView />}
        {view === 'services' && <ServicesView />}
        {view === 'projects' && <ProjectsView />}
        {view === 'blog' && (currentPostSlug ? <PostDetail slug={currentPostSlug} /> : <BlogView />)}
        {view === 'about' && <AboutView />}
        {view === 'contact' && <ContactView />}
        {view === 'fde' && <FdeView />}
        {view === 'admin' && <AdminView />}
      </main>
      <Footer />
      <ChatWidget />
      <LangBanner />
    </div>
  );
}
