'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from './store';
import { isFaPath, useLang } from './lang-context';
import { ui } from './i18n';
import { Languages, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHOSEN_KEY = 'mehrdad-lang-chosen';
const DISMISS_KEY = 'mehrdad-lang-banner';

/**
 * Browser-locale language suggestion (ROADMAP P0, decision D-019).
 *
 * English stays the site default — nothing is auto-switched. If the
 * browser locale is Persian (`fa*`) we OFFER the Persian UI once, as a
 * fixed bottom pill (zero layout shift). An explicit language choice in
 * the header (Header.tsx marks `mehrdad-lang-chosen`) or a dismissal is
 * remembered forever — the banner never nags again.
 *
 * The copy is intentionally bilingual and hardcoded: its audience is a
 * Persian-locale visitor who is currently reading the English site.
 */
export function LangBanner() {
  const { setLang } = useApp();
  const pathname = usePathname();
  // i18n phase-5: the live-region label is chrome (not the pill's bilingual
  // copy, which stays hardcoded per D-019) — announce it in the visitor's
  // language instead of hardcoded English on the Persian route.
  const lang = useLang();
  const t = ui[lang];
  const [show, setShow] = useState(false);

  // 1.2s delay preserved (original UX) — but now the role="status" region is
  // already mounted (empty), so the delayed content is a proper live-region
  // announcement instead of a region that mounts pre-populated.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // pointless on the static Persian routes (/fa) — the visitor is ALREADY
      // reading Persian (lang-context.tsx)
      if (isFaPath(pathname)) return;
      const locale = (navigator.language || '').toLowerCase();
      const isFaBrowser = locale.startsWith('fa');
      const chosen = localStorage.getItem(CHOSEN_KEY);
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (isFaBrowser && !chosen && !dismissed) {
        timer = setTimeout(() => setShow(true), 1200);
      }
    } catch {
      /* storage unavailable → never show */
    }
    return () => clearTimeout(timer);
  }, [pathname]);

  // a11y phase-4: the live region must EXIST before its content appears.
  // Some screen readers ignore a role="status" element that mounts already
  // populated, so an always-mounted empty region renders here and the pill
  // is injected inside it once `show` flips.
  return (
    <div role="status" aria-label={t.a11y.langSuggestion} aria-live="polite">
      {show && !isFaPath(pathname) && <LangSuggestion onAccept={accept} onDismiss={dismiss} />}
    </div>
  );

  function accept() {
    try {
      localStorage.setItem(CHOSEN_KEY, '1');
    } catch {}
    setLang('fa');
    setShow(false);
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setShow(false);
  }
}

function LangSuggestion({ onAccept, onDismiss }: { onAccept: () => void; onDismiss: () => void }) {
  return (
    <div className="site-langbanner fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-violet-500/30 bg-background/95 p-3 shadow-xl shadow-violet-600/10 backdrop-blur md:bottom-5">
      <Languages className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
      <p className="flex-1 text-sm leading-snug">
        <span className="font-medium">این سایت نسخه فارسی هم دارد.</span>{' '}
        <span className="text-muted-foreground">This site is also available in Persian.</span>
      </p>
      <Button
        size="sm"
        onClick={onAccept}
        className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
      >
        فارسی
      </Button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss / بستن"
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
