'use client';

import { useApp, pick } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Lock, Moon, Sun } from 'lucide-react';

export function Header() {
  const { lang, setLang, view, setView, setChatOpen, mode, setMode } = useApp();
  const t = ui[lang];

  const navItems: { key: 'home' | 'services' | 'projects' | 'blog' | 'about' | 'contact'; label: string }[] = [
    { key: 'home', label: t.nav.home },
    { key: 'services', label: t.nav.services },
    { key: 'projects', label: t.nav.projects },
    { key: 'blog', label: t.nav.blog },
    { key: 'about', label: t.nav.about },
    { key: 'contact', label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 font-bold tracking-tight"
          aria-label="Mehrdad home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg text-white shadow-lg shadow-violet-600/20">
            ☼
          </span>
          <span className="text-lg" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            {lang === 'fa' ? 'مهرداد' : 'Mehrdad'}
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === item.key
                  ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`rounded-md px-2 py-1 transition-colors ${
                lang === 'en' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('fa')}
              className={`rounded-md px-2 py-1 transition-colors ${
                lang === 'fa' ? 'bg-violet-600 text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              فا
            </button>
          </div>
          <button
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={mode === 'dark' ? (lang === 'fa' ? 'حالت روشن' : 'Switch to light mode') : (lang === 'fa' ? 'حالت تاریک' : 'Switch to dark mode')}
            aria-pressed={mode === 'dark'}
            title={mode === 'dark' ? (lang === 'fa' ? 'حالت روشن' : 'Light mode') : (lang === 'fa' ? 'حالت تاریک' : 'Dark mode')}
          >
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setView('admin')}
            className={`hidden rounded-lg p-2 transition-colors sm:inline-flex ${
              view === 'admin' ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label={t.nav.admin}
            title={t.nav.admin}
          >
            <Lock className="h-4 w-4" />
          </button>
          <Button
            size="sm"
            className="hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 sm:inline-flex"
            onClick={() => setChatOpen(true)}
          >
            ✦ AI
          </Button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-border/40 px-3 py-2 md:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === item.key
                ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400'
                : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
