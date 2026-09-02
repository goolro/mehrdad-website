'use client';

import { useEffect, useState } from 'react';
import { useApp } from './store';
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
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
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
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(CHOSEN_KEY, '1');
    } catch {}
    setLang('fa');
    setShow(false);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setShow(false);
  };

  return (
    <div
      role="status"
      aria-label="Language suggestion"
      className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-violet-500/30 bg-background/95 p-3 shadow-xl shadow-violet-600/10 backdrop-blur md:bottom-5"
    >
      <Languages className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
      <p className="flex-1 text-sm leading-snug">
        <span className="font-medium">این سایت نسخه فارسی هم دارد.</span>{' '}
        <span className="text-muted-foreground">This site is also available in Persian.</span>
      </p>
      <Button
        size="sm"
        onClick={accept}
        className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
      >
        فارسی
      </Button>
      <button
        onClick={dismiss}
        aria-label="Dismiss / بستن"
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
