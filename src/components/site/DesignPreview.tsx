'use client';

/**
 * DESIGN REVIEW GATE — PARKED.
 * The owner abandoned the «تندیس / The Artifact» WebGL style entirely
 * (2026-02 review round), so the preview is back to the ORIGINAL site.
 * DEFAULT_ON = false → nothing experimental renders on /
 * The whole v4 prototype stays parked on disk, reachable ONLY via
 *   /?design=1  (or localStorage clear) — for reference or deletion.
 * (v1 light-field + v3 «Momentum» SVG also parked: DesignAmbient.tsx /
 *  VelocityShowcase.tsx.)
 * The live site was NEVER touched by any of these experiments.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { EyeOff, Palette } from 'lucide-react';
import { ArtifactShowcase } from './ArtifactShowcase';
import { useApp, pick } from './store';

const KEY = 'mehrdad_design_review';
// style abandoned by owner → preview = original site; ?design=1 to peek at the parked prototype
const DEFAULT_ON = false;

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener('design-review', cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener('design-review', cb);
  };
}
// '0' = explicitly hidden, '1' = explicitly shown, absent = DEFAULT_ON (false now)
const getSnapshot = () => {
  const v = localStorage.getItem(KEY);
  if (v === '0') return false;
  if (v === '1') return true;
  return DEFAULT_ON;
};
const getServerSnapshot = () => false;

function setMode(on: boolean) {
  localStorage.setItem(KEY, on ? '1' : '0');
  window.dispatchEvent(new Event('design-review'));
}

export function DesignPreview() {
  const { lang } = useApp();
  const on = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // one-time URL switch (?design=1 / ?design=0) — side effect only,
  // the store subscription picks the change up (no setState in effect)
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('design');
    if (v === '1' || v === 'on') setMode(true);
    else if (v === '0' || v === 'off') setMode(false);
  }, []);

  if (!on) return null;

  return (
    <div>
      {/* v4: one WebGL sculpture + floating typography (oryzo system) */}
      <ArtifactShowcase />
      {/* review strip: makes crystal clear this is an isolated artifact */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
          <Palette className="h-4 w-4 shrink-0" />
          <span>
            {pick(
              lang,
              'Design preview — not part of the live site yet',
              'پیش‌نمایش طرح — هنوز بخشی از سایت اصلی نیست',
            )}
          </span>
        </div>
        <button
          onClick={() => setMode(false)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          aria-label={pick(lang, 'Hide design preview', 'پنهان کردن پیش‌نمایش طرح')}
        >
          <EyeOff className="h-4 w-4" />
          {pick(lang, 'Hide', 'پنهان')}
        </button>
      </div>
    </div>
  );
}
