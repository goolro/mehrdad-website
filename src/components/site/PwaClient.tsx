'use client';

import { useEffect, useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Registers the service worker and shows a discreet "Install app" pill
 * when the browser fires beforeinstallprompt (Android/Chrome/Edge).
 */
export function PwaClient() {
  const { lang } = useApp();
  const t = ui[lang];
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // capture install prompt
    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // only show if not previously dismissed
      try {
        if (!localStorage.getItem('pwa-install-dismissed')) setVisible(true);
      } catch {
        setVisible(true);
      }
    }
    window.addEventListener('beforeinstallprompt', onPrompt);

    // support ?chat=open shortcut from app shortcuts
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('chat') === 'open') {
      useApp.setState({ chatOpen: true });
    }

    function onInstalled() {
      setInstallEvent(null);
      setVisible(false);
    }
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible || !installEvent) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 start-4 z-40 flex items-center gap-2 rounded-full border border-violet-500/40 bg-card/95 px-3 py-2 shadow-xl backdrop-blur"
    >
      <Download className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      <span className="text-xs font-medium sm:text-sm">{t.pwa.install}</span>
      <Button
        size="sm"
        className="h-7 rounded-full bg-violet-600 px-3 text-xs hover:bg-violet-700"
        onClick={async () => {
          await installEvent.prompt();
          const choice = await installEvent.userChoice;
          if (choice.outcome === 'accepted') setVisible(false);
        }}
      >
        {t.pwa.installBtn}
      </Button>
      <button
        aria-label={t.pwa.close}
        className="ms-1 rounded-full p-1 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem('pwa-install-dismissed', '1');
          } catch {}
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
