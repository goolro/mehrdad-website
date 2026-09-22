'use client';

/**
 * AURORA PROTOTYPE — «شفق» · scenario v4 (Phase 3 R&D, isolated behind the
 * design-review gate). Replaces the «Nexus» technical-map prototype after the
 * owner's verdict «اصلا خوب نیست»: the map was correct but cold. The new
 * scenario trades cartography for SKY:
 *
 *   A night sky with real aurora curtains (WebGL) and rising embers.
 *   Mehrdad's six disciplines hang in it as stars of a constellation.
 *   The lines between them are already drawn — faint, waiting.
 *   Sweep your cursor across two stars and the sky ignites: a luminous arc
 *   forges between them and names the real thing they create together.
 *
 * Meaningful-interaction audit:
 *  1. user does    → sweeps the cursor across the sky / over two stars
 *  2. system       → embers lean away softly, curtains brighten, parallax
 *                    shifts the sky in layers; two stars → arc + synthesis
 *  3. why          → the sky must feel alive, not decorative
 *  4. communicates → disciplines are presences in one connected sky
 *  5. improves?    → yes — the constellation lines PRE-TEACH the forge
 *
 * Rendering is hybrid: WebGL for sky+dust, DOM/SVG for stars, lines and the
 * synthesis card (crisp, accessible, RTL-ready). No WebGL2 → static gradient,
 * everything else still works. Data (disciplines + syntheses) reuses
 * nexusData.ts — one source of truth for meaning.
 */

import {
  useEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Boxes, FlaskConical, GitMerge, Lightbulb, Hammer, Link2, MousePointer2, Package, Plus, Sparkles,
} from 'lucide-react';
import { AuroraEngine } from './AuroraEngine';
import { DISCIPLINES, synthesisFor, type Synthesis } from '../nexus/nexusData';
import { pick, useApp } from '../store';

/** star layout — reads like a real constellation chart (stage %) */
const STARS = [
  { id: 0, x: 18, y: 66, depth: 1.15, hue: 42 },  // engineering · gold
  { id: 1, x: 34, y: 28, depth: 0.8, hue: 262 },  // mathematics · violet
  { id: 2, x: 52, y: 50, depth: 1.25, hue: 195 }, // physics · cyan
  { id: 3, x: 67, y: 20, depth: 0.75, hue: 150 }, // chemistry · emerald
  { id: 4, x: 79, y: 62, depth: 1.05, hue: 315 }, // digital · fuchsia
  { id: 5, x: 91, y: 34, depth: 1.3, hue: 345 },  // design · rose
];

/** the waiting constellation — faint lines already drawn between stars */
const LINES: Array<[number, number]> = [
  [0, 1], [1, 3], [3, 2], [2, 5], [5, 4], [1, 2],
];

interface ArcState {
  key: string;
  a: number;
  b: number;
  d: string;
  x1: number; y1: number; x2: number; y2: number;
  mx: number; my: number;
}

export function AuroraPrototype() {
  const { lang } = useApp();
  const rtl = lang === 'fa';

  const sectionRef = useRef<HTMLElement>(null);
  const stageBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AuroraEngine | null>(null);
  const lastTouch = useRef<{ idx: number; t: number } | null>(null);
  const lastForge = useRef(0);

  const [fallback, setFallback] = useState(false);
  const [synth, setSynth] = useState<Synthesis | null>(null);
  const [arc, setArc] = useState<ArcState | null>(null);
  const [count, setCount] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState<number | null>(null);

  /* always-fresh forge wiring: the window pointermove listener is registered
     once, but the forge needs CURRENT stage geometry — call through a ref */
  const touchRef = useRef<(i: number) => void>(() => {});

  /* ── geometry helpers ── */
  const arcFor = (a: number, b: number): ArcState => {
    const { w, h } = box;
    const sa = STARS[a];
    const sb = STARS[b];
    const ax = (sa.x / 100) * w;
    const ay = (sa.y / 100) * h;
    const bx = (sb.x / 100) * w;
    const by = (sb.y / 100) * h;
    const cx = (ax + bx) / 2 + (by - ay) * 0.24;
    const cy = (ay + by) / 2 - Math.abs(bx - ax) * 0.12 - 46;
    return {
      key: `${a}-${b}-${Date.now()}`,
      a, b,
      d: `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`,
      x1: ax, y1: ay, x2: bx, y2: by,
      mx: (ax + bx) / 2,
      my: (ay + by) / 2,
    };
  };

  /* ── forge logic (declared before the effects that wire it) ── */
  const tryForge = (a: number, b: number) => {
    const now = performance.now();
    if (now - lastForge.current < 1200) return;
    lastForge.current = now;
    setArc(box.w > 0 ? arcFor(a, b) : null);
    setSynth({ ...synthesisFor(a, b), a, b });
    setCount((c) => c + 1);
  };

  const touchNode = (i: number) => {
    const now = performance.now();
    const last = lastTouch.current;
    if (last && last.idx !== i && now - last.t < 7000) tryForge(last.idx, i);
    lastTouch.current = { idx: i, t: now };
  };

  /* keep the ref pointed at the latest closure (fresh `box` geometry) —
     the window pointermove listener is registered ONCE in the mount effect
     below, so it must call through this always-fresh ref */
  useEffect(() => {
    touchRef.current = touchNode;
  });

  /* ── engine lifecycle + sweep detection (pointer proximity, DOM-side) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageBoxRef.current;
    const section = sectionRef.current;
    if (!canvas || !stage || !section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const engine = new AuroraEngine(canvas, reduced);
    engineRef.current = engine;
    if (!engine.ok) setFallback(true);
    engine.setStage(stage);
    engine.resize();

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // the cursor is a presence in the sky: feed the engine + detect star sweeps
    const onMove = (e: PointerEvent) => {
      engine.setMouse(e.clientX, e.clientY);
      const r = stage.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      let near = -1;
      let best = 90 * 90;
      for (const s of STARS) {
        const dx = px - (s.x / 100) * r.width;
        const dy = py - (s.y / 100) * r.height;
        const dd = dx * dx + dy * dy;
        if (dd < best) {
          best = dd;
          near = s.id;
        }
      }
      if (near >= 0) touchRef.current(near);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) engine.start();
          else engine.stop();
        }
      },
      { rootMargin: '120px' },
    );
    io.observe(section);

    const ro = new ResizeObserver(() => {
      setBox({ w: stage.clientWidth, h: stage.clientHeight });
      engineRef.current?.resize();
    });
    ro.observe(stage);
    setBox({ w: stage.clientWidth, h: stage.clientHeight });

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  /* tap support (touch devices): pressing near a star counts as a touch */
  const onStageDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageBoxRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    let near = -1;
    let best = 64 * 64;
    STARS.forEach((s) => {
      const dx = px - (s.x / 100) * r.width;
      const dy = py - (s.y / 100) * r.height;
      const dd = dx * dx + dy * dy;
      if (dd < best) {
        best = dd;
        near = s.id;
      }
    });
    if (near >= 0) touchNode(near);
  };

  const cardPos = useMemo(() => {
    if (!arc || !box.w) return null;
    const half = 148;
    const cx = Math.min(Math.max(arc.mx, half), Math.max(half, box.w - half));
    const cy = Math.min(Math.max(arc.my, box.h * 0.42), box.h * 0.8);
    return { left: (cx / box.w) * 100, top: (cy / box.h) * 100 };
  }, [arc, box]);

  const t = (fa: string, en: string) => pick(lang, en, fa);
  const starName = (id: number) => pick(lang, DISCIPLINES[id].name.en, DISCIPLINES[id].name.fa);

  return (
    <section ref={sectionRef} className={`au relative ${fallback ? 'au-fallback' : ''}`} aria-label={t('شفق — پروتوتایپ آسمان زنده', 'Aurora — living sky prototype')}>
      {/* the chamber: the sky is CONTAINED here — the rest of the page keeps
          its own clean background (separation the owner asked for) */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-2 pt-10 sm:px-6">
        <div className="au-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-[#04050c] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)]">
          {/* header (chamber floor, above the frame) */}
          <div className="px-5 pt-8 text-center sm:px-8">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-violet-300/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Aurora · شفق
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#f3f1fb] sm:text-4xl">
              {t('هر جفتِ تازه، آسمانی تازه روشن می‌کند', 'Every new pairing lights a new sky')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#b7b2cf] sm:text-base">
              {t(
                'ششمین رشتهٔ کاری تو، ستاره‌های این آسمان‌اند و خطوط بین‌شان از قبل کشیده شده — فقط منتظرند. نشانگر را از روی دو ستاره عبور بده تا بین‌شان روشنی تازه‌ای ساخته شود.',
                'Six crafts hang in this sky as stars, and the lines between them are already drawn — waiting. Sweep your cursor across two stars and watch what ignites between them.',
              )}
            </p>
          </div>

          {/* the stage — a framed window into the sky */}
          <div
            ref={stageBoxRef}
            className="au-stage relative mt-6 px-3 sm:px-6"
            onPointerDown={onStageDown}
          >
            <div className="relative h-[64vh] min-h-[480px] w-full overflow-hidden rounded-2xl border border-white/10">
              {/* the sky */}
              <canvas ref={canvasRef} className="au-canvas pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
              {fallback && <div className="au-fallback-bg pointer-events-none absolute inset-0" aria-hidden="true" />}

              {/* waiting constellation lines */}
              <svg className="au-lines pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                {box.w > 0 && LINES.map(([a, b]) => {
                  const sa = STARS[a];
                  const sb = STARS[b];
                  const hot = hovered === a || hovered === b || (arc && (arc.a === a || arc.a === b || arc.b === a || arc.b === b));
                  return (
                    <line
                      key={`${a}-${b}`}
                      x1={(sa.x / 100) * box.w}
                      y1={(sa.y / 100) * box.h}
                      x2={(sb.x / 100) * box.w}
                      y2={(sb.y / 100) * box.h}
                      className={`au-line ${hot ? 'au-line-hot' : ''}`}
                    />
                  );
                })}
              </svg>

              {/* synthesis arc */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                {arc && (
                  <>
                    <defs>
                      <linearGradient
                        id={`aug-${arc.a}-${arc.b}`}
                        gradientUnits="userSpaceOnUse"
                        x1={arc.x1} y1={arc.y1} x2={arc.x2} y2={arc.y2}
                      >
                        <stop offset="0" stopColor={`hsl(${STARS[arc.a].hue} 90% 68%)`} />
                        <stop offset="0.5" stopColor="#ffffff" />
                        <stop offset="1" stopColor={`hsl(${STARS[arc.b].hue} 90% 68%)`} />
                      </linearGradient>
                    </defs>
                    <path
                      key={arc.key}
                      className="au-arc"
                      d={arc.d}
                      fill="none"
                      stroke={`url(#aug-${arc.a}-${arc.b})`}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      pathLength={1}
                    />
                    <circle key={`${arc.key}-a`} className="au-spark" cx={arc.x1} cy={arc.y1} r="4.5" fill={`hsl(${STARS[arc.a].hue} 92% 70%)`} />
                    <circle key={`${arc.key}-b`} className="au-spark" cx={arc.x2} cy={arc.y2} r="4.5" fill={`hsl(${STARS[arc.b].hue} 92% 70%)`} />
                  </>
                )}
              </svg>

              {/* stars of the constellation */}
              {STARS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="au-star group absolute"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, '--hue': s.hue, '--dep': s.depth } as CSSProperties}
                  aria-label={starName(s.id)}
                  onFocus={() => touchNode(s.id)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="au-halo" />
                  <span className="au-core" />
                  <span className="au-label">{starName(s.id)}</span>
                </button>
              ))}

              {/* synthesis card */}
              {synth && cardPos && arc && (
                <div
                  key={arc.key}
                  className="au-card absolute z-20 w-[272px] rounded-2xl border border-white/10 bg-[#0c0a16]/80 p-4 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:w-72"
                  style={{ left: `${cardPos.left}%`, top: `${cardPos.top}%` }}
                  role="status"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#b7b2cf]">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${STARS[arc.a].hue} 90% 68%)` }} />
                    {starName(arc.a)}
                    <Plus className="h-3 w-3" aria-hidden />
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${STARS[arc.b].hue} 90% 68%)` }} />
                    {starName(arc.b)}
                  </div>
                  <p className="mt-2 font-extrabold text-[#f6f4fd]">{pick(lang, synth.title.en, synth.title.fa)}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#b7b2cf]">{pick(lang, synth.desc.en, synth.desc.fa)}</p>
                  {synth.sample && (
                    <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                      <MousePointer2 className="h-3 w-3" aria-hidden />
                      {t('نمونه: ', 'Sample: ')}{pick(lang, synth.sample.en, synth.sample.fa)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* hint + counter (chamber floor) */}
          <div className={`mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-sm transition-opacity duration-700 ${count > 0 ? 'opacity-45' : ''}`}>
            <span className="inline-flex items-center gap-2 text-[#b7b2cf]">
              <Link2 className="h-4 w-4 text-violet-300" aria-hidden />
              {t('نشانگر را از روی دو ستاره عبور بده', 'Sweep the cursor across two stars to connect them')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#f3f1fb]" aria-live="polite">
              <GitMerge className="h-4 w-4 text-fuchsia-300" aria-hidden />
              {count > 0
                ? t(`${count} روشنی کشف شد`, `${count} light${count === 1 ? '' : 's'} forged`)
                : t('هنوز ستاره‌ای به هم نرسیده', 'No stars connected yet')}
            </span>
          </div>

          {/* pipeline strip */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 pb-7 text-[11px] font-medium text-[#8f8aa6]" dir={rtl ? 'rtl' : 'ltr'}>
            {[
              { icon: Boxes, label: t('رشته‌ها', 'Disciplines') },
              { icon: GitMerge, label: t('اتصال', 'Connection') },
              { icon: FlaskConical, label: t('آزمایش', 'Experiment') },
              { icon: Lightbulb, label: t('ایده', 'Idea') },
              { icon: Hammer, label: t('نمونهٔ اولیه', 'Prototype') },
              { icon: Package, label: t('محصول', 'Product') },
            ].map(({ icon: Icon, label }, i) => (
              <span key={label} className="inline-flex items-center gap-2">
                {i > 0 && (rtl ? <span aria-hidden>←</span> : <span aria-hidden>→</span>)}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{AU_CSS}</style>
    </section>
  );
}

const AU_CSS = `
.au { color-scheme: dark; color: #eceaf2; }
.au-canvas { display: block; }
.au-fallback .au-canvas { display: none; }
.au-fallback-bg { background:
  radial-gradient(70% 55% at 50% 108%, rgba(124,58,237,0.28), transparent 70%),
  radial-gradient(55% 45% at 68% 62%, rgba(217,70,239,0.16), transparent 70%),
  radial-gradient(45% 40% at 30% 55%, rgba(139,92,246,0.14), transparent 70%),
  #04050c; }

.au-stage { --au-par-x: 0; --au-par-y: 0; }

/* waiting constellation lines */
.au-line { stroke: rgba(255,255,255,0.10); stroke-width: 1; transition: stroke 0.5s ease, filter 0.5s ease; }
.au-line-hot { stroke: rgba(196,181,253,0.55); filter: drop-shadow(0 0 4px rgba(167,139,250,0.6)); }

/* stars — parallax by depth, soft halo per hue */
.au-star {
  --hue: 262; --dep: 1;
  transform: translate(calc(var(--au-par-x, 0) * var(--dep) * -20px - 50%), calc(var(--au-par-y, 0) * var(--dep) * -14px - 50%));
  display: grid; justify-items: center; gap: 7px;
  padding: 10px; border-radius: 9999px;
  will-change: transform; cursor: crosshair; -webkit-tap-highlight-color: transparent;
}
.au-core {
  position: relative; z-index: 1; width: 7px; height: 7px; border-radius: 9999px;
  background: #fff;
  box-shadow: 0 0 10px 2px hsl(var(--hue) 85% 72% / 0.9), 0 0 26px 7px hsl(var(--hue) 85% 62% / 0.35);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.au-halo {
  position: absolute; top: 9px; left: 50%; translate: -50% 0;
  width: 34px; height: 34px; border-radius: 9999px;
  border: 1px solid hsl(var(--hue) 80% 70% / 0.22);
  transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}
.au-star:hover .au-core, .au-star:focus-visible .au-core {
  transform: scale(1.7);
  box-shadow: 0 0 14px 3px hsl(var(--hue) 90% 74% / 1), 0 0 40px 12px hsl(var(--hue) 90% 64% / 0.5);
}
.au-star:hover .au-halo, .au-star:focus-visible .au-halo {
  transform: scale(1.55);
  border-color: hsl(var(--hue) 85% 72% / 0.6);
  box-shadow: 0 0 24px -6px hsl(var(--hue) 85% 65% / 0.5) inset;
}
.au-label {
  position: relative; z-index: 1; font-size: 11px; letter-spacing: 0.06em;
  color: rgba(236,234,242,0.58); white-space: nowrap;
  text-shadow: 0 1px 8px rgba(0,0,0,0.8);
  transition: color 0.3s ease, letter-spacing 0.3s ease;
}
.au-star:hover .au-label, .au-star:focus-visible .au-label { color: #fff; letter-spacing: 0.14em; }

/* synthesis arc + sparks */
.au-arc { stroke-dasharray: 1; stroke-dashoffset: 1; animation: au-arc-draw 1s cubic-bezier(0.3, 0.7, 0.2, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(216, 180, 254, 0.5)); }
.au-spark { animation: au-spark 1.1s ease-out both; transform-box: fill-box; transform-origin: center; }

/* synthesis card */
.au-card { animation: au-card-in 0.5s cubic-bezier(0.2, 0.85, 0.25, 1.15) both; transform: translate(-50%, calc(-100% - 20px)); }

@keyframes au-arc-draw { to { stroke-dashoffset: 0; } }
@keyframes au-spark { 0% { transform: scale(0.2); opacity: 0; } 55% { transform: scale(1.7); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.65; } }
@keyframes au-card-in { from { opacity: 0; transform: translate(-50%, calc(-100% - 6px)) scale(0.93); }
  to { opacity: 1; transform: translate(-50%, calc(-100% - 20px)) scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .au-arc, .au-spark, .au-card { animation: none !important; }
  .au-arc { stroke-dashoffset: 0; }
}
`;
