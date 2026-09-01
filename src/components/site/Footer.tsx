'use client';

import { useApp } from './store';
import { ui } from './i18n';

export function Footer() {
  const { lang, setView } = useApp();
  const t = ui[lang];
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              ☼
            </span>
            <div className="text-sm">
              <div className="font-semibold">{lang === 'fa' ? 'مهرداد' : 'Mehrdad'}</div>
              <div className="text-xs text-muted-foreground">{t.footer.role}</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground" aria-label="Footer navigation">
            <button onClick={() => setView('services')} className="hover:text-foreground">{t.nav.services}</button>
            <button onClick={() => setView('projects')} className="hover:text-foreground">{t.nav.projects}</button>
            <button onClick={() => setView('blog')} className="hover:text-foreground">{t.nav.blog}</button>
            <button onClick={() => setView('contact')} className="hover:text-foreground">{t.nav.contact}</button>
          </nav>

          <a
            href="mailto:admin@mehrdad.ir"
            className="text-sm text-muted-foreground hover:text-foreground"
            dir="ltr"
          >
            admin@mehrdad.ir
          </a>
        </div>

        <p className="mx-auto mt-6 max-w-xl border-t border-border/40 pt-4 text-center text-xs italic leading-relaxed text-muted-foreground">
          «{t.footer.slogan}»
        </p>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          © {year} mehrdad.ir — {t.footer.rights} · {t.footer.builtWith} ✦
        </div>
      </div>
    </footer>
  );
}
