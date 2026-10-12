'use client';

/**
 * ARTIFACT SHOWCASE — v4 content layer for «تندیس / The Artifact».
 * Oryzo/Lusion system: cream typography floating in negative space over
 * ONE living sculpture (ArtifactScene). The six discipline chips re-forge
 * the artifact (morph + tint) via the ARTIFACT_EVENT custom event.
 * Bilingual, keyboard accessible, pointer-events only on the chips.
 */

import { useEffect, useRef, useState } from 'react';
import { useApp, pick } from './store';
import { ARTIFACT_EVENT, ARTIFACT_STATES, ArtifactScene } from './ArtifactScene';

/* fast demo cadence (owner request): 3s idle → tour, one state every 3s */
const TOUR_IDLE_MS = 3000;
const TOUR_STEP_MS = 3000;

export function ArtifactShowcase() {
  const { lang } = useApp();
  const rtl = lang === 'fa';
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  // start slightly "in the past" so the very first auto-step lands at ~3s,
  // not 6s (interval tick would otherwise miss the 3s threshold)
  const lastActRef = useRef(Date.now() - 600);
  const tourDirRef = useRef(1); // ping-pong direction: +1 … →7, -1 … →0

  const shown = preview ?? active;
  const state = ARTIFACT_STATES[shown];

  const markActive = () => { lastActRef.current = Date.now(); };
  const fire = (i: number) => window.dispatchEvent(new CustomEvent(ARTIFACT_EVENT, { detail: i }));

  // keep the scene in sync with the pinned selection (e.g. after reduced-motion mount)
  useEffect(() => { fire(active); }, [active]);

  // idle auto-tour: after 3s without interaction the artifact walks through
  // its states every 3s, ping-pong style (no jarring 7→0 rewind) —
  // paused while the tab is hidden and under prefers-reduced-motion
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (Date.now() - lastActRef.current < TOUR_IDLE_MS) return;
      lastActRef.current = Date.now();
      setActive((a) => {
        let next = a + tourDirRef.current;
        if (next >= ARTIFACT_STATES.length) {
          tourDirRef.current = -1;
          next = a - 1;
        } else if (next < 0) {
          tourDirRef.current = 1;
          next = a + 1;
        }
        return next;
      });
    }, TOUR_STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label={pick(lang, 'The Artifact — interactive WebGL sculpture', 'تندیس — مجسمهٔ تعاملی وب‌جی‌ال')}
      onPointerMove={markActive}
      onPointerDown={markActive}
      className="relative w-full overflow-hidden bg-[#0c0a08]"
    >
      {/* the ONE owner layer — real WebGL sculpture */}
      <ArtifactScene />

      {/* museum vignette so text always reads */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />
      {/* soft recess behind the words (particles dim where text lives) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(46% 34% at 50% 52%, rgba(12,10,8,0.60), rgba(12,10,8,0.28) 55%, transparent 78%)',
        }}
      />

      {/* content floats over the artifact */}
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[88svh] w-full max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 md:min-h-[92svh]"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-400">
          {pick(lang, 'One mind · eight states', 'یک ذهن · هشت حالت')}
        </p>
        <h2 className="mt-4 text-5xl font-extrabold tracking-tight text-stone-100 sm:text-6xl md:text-7xl">
          {pick(lang, 'The Artifact', 'تندیس')}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
          {pick(
            lang,
            'Every discipline I work in is one state of the same living sculpture — from Pythagoras and E = mc² to a rocket and a car, tens of thousands of points of light reforged as you explore.',
            'هر تخصص من یک حالت از همان تندیسِ زنده است — از فیثاغورث و E = mc² تا موشک و خودرو؛ ده‌ها هزار نقطهٔ نور که با گشت‌وگذارِ تو دوباره ریخته می‌شود.',
          )}
        </p>

        {/* discipline chips — the only interactive zone */}
        <div
          role="group"
          aria-label={pick(lang, 'Disciplines', 'رشته‌ها')}
          onMouseLeave={() => { setPreview(null); fire(active); }}
          className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {ARTIFACT_STATES.map((s, i) => {
            const isActive = i === active;
            const isShown = i === shown;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  markActive();
                  tourDirRef.current = i >= active ? 1 : -1;
                  setActive(i);
                  setPreview(null);
                  fire(i);
                }}
                onMouseEnter={() => { markActive(); setPreview(i); fire(i); }}
                onFocus={() => { markActive(); setPreview(i); fire(i); }}
                className="rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
                style={isShown
                  ? { borderColor: `${s.tint}99`, color: s.tint, background: `${s.tint}14`, boxShadow: `0 0 28px ${s.tint}2e` }
                  : { borderColor: 'rgba(231,229,228,0.18)', color: 'rgba(231,229,228,0.72)', background: 'rgba(231,229,228,0.04)' }}
              >
                {pick(lang, s.en, s.fa)}
              </button>
            );
          })}
        </div>

        {/* active-state caption */}
        <p className="mt-6 h-6 max-w-xl text-sm text-stone-400 sm:text-base" aria-live="polite">
          <span style={{ color: state.tint }}>{pick(lang, state.en, state.fa)}</span>
          {' — '}
          {pick(lang, state.capEn, state.capFa)}
        </p>

        <p className="mt-12 text-xs tracking-wide text-stone-500">
          {pick(
            lang,
            'sweep your pointer through it — 3s idle and it tours itself',
            'نشانگر را میان تندیس بچرخان — ۳ ثانیه سکوت کافی است تا خودش گردش کند',
          )}
        </p>
      </div>
    </section>
  );
}
