'use client';

/**
 * NEXUS PROTOTYPE — «هسته» · Phase 3 R&D, fully isolated behind the
 * design-review gate. NOT part of the live site.
 *
 * The experience in one sentence: a dark living field (WebGL contours +
 * 9k particles) where six disciplines float as light wells, the cursor is
 * an external force (torch, repeller, swirl, parallax camera), and sweeping
 * across TWO disciplines forges a luminous arc — a synthesis — that names
 * the real thing their collision creates (DISCIPLINES → CONNECTIONS →
 * POSSIBILITY). That arc IS the core idea of Mehrdad, made touchable.
 *
 * Meaningful-interaction audit (per the design principle):
 *  1. user does      → moves the cursor across the field / hovers a node
 *  2. system responds→ torch lights the contours, particles repel+swirl,
 *                      the node's well flares, its glyph acts out its craft
 *  3. why            → the world must feel like a physical system, not a page
 *  4. communicates   → each discipline is a living presence with its own color
 *  5. improves?      → yes: it teaches the connection mechanic before the forge
 * The forge (two disciplines in <7s) is the ONE meaningful transformation.
 *
 * Rendering is hybrid (the oryzo lesson): WebGL only for field+particles,
 * DOM/SVG for nodes, arcs and the synthesis card (crisp, accessible, RTL-ready).
 * Fallback: no WebGL2 → static gradient, everything else still works.
 */

import {
  useEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Boxes, FlaskConical, GitMerge, Hammer, Lightbulb, Link2, MousePointer2, Package, Plus,
} from 'lucide-react';
import { NexusEngine } from './NexusEngine';
import { DisciplineGlyph } from './DisciplineGlyph';
import { DISCIPLINES, synthesisFor, type Synthesis } from './nexusData';
import { pick, useApp } from '../store';

interface ArcState {
  key: string;
  a: number;
  b: number;
  d: string;
  x1: number; y1: number; x2: number; y2: number;
  mx: number; my: number;
}

export function NexusPrototype() {
  const { lang } = useApp();
  const rtl = lang === 'fa';

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NexusEngine | null>(null);
  const lastTouch = useRef<{ idx: number; t: number } | null>(null);
  const lastForge = useRef(0);

  const [fallback, setFallback] = useState(false);
  const [synth, setSynth] = useState<Synthesis | null>(null);
  const [arc, setArc] = useState<ArcState | null>(null);
  const [count, setCount] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const stageBoxRef = useRef<HTMLDivElement>(null);

  /* ── geometry helpers ── */
  const nodeXY = useMemo(
    () => DISCIPLINES.map((d) => ({ x: d.x, y: d.y })),
    [],
  );
  const hues = useMemo(() => DISCIPLINES.map((d) => d.hue), []);

  const arcFor = (a: number, b: number): ArcState => {
    const { w, h } = box;
    const ax = (DISCIPLINES[a].x / 100) * w;
    const ay = (DISCIPLINES[a].y / 100) * h;
    const bx = (DISCIPLINES[b].x / 100) * w;
    const by = (DISCIPLINES[b].y / 100) * h;
    const cx = (ax + bx) / 2 + (by - ay) * 0.22;
    const cy = (ay + by) / 2 - Math.abs(bx - ax) * 0.1 - 42;
    return {
      key: `${a}-${b}-${Date.now()}`,
      a, b,
      d: `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`,
      x1: ax, y1: ay, x2: bx, y2: by,
      mx: (ax + bx) / 2,
      my: (ay + by) / 2,
    };
  };

  /* ── engine lifecycle ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageBoxRef.current;
    const section = sectionRef.current;
    if (!canvas || !stage || !section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const engine = new NexusEngine(canvas, reduced);
    engineRef.current = engine;
    if (!engine.ok) setFallback(true);
    engine.setNodeSource(stage, nodeXY, hues);
    engine.resize(); // stage is known now — size the world to the frame

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // the cursor is an external force — feed it to the engine
    const onMove = (e: PointerEvent) => engine.setMouse(e.clientX, e.clientY);
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
      engineRef.current?.resize(); // stage-sized world follows its frame
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
  }, [nodeXY, hues]);

  /* ── forge logic ── */
  const touchNode = (i: number) => {
    const now = performance.now();
    const last = lastTouch.current;
    if (last && last.idx !== i && now - last.t < 7000) tryForge(last.idx, i);
    lastTouch.current = { idx: i, t: now };
  };

  const tryForge = (a: number, b: number) => {
    const now = performance.now();
    if (now - lastForge.current < 1200) return;
    lastForge.current = now;
    engineRef.current?.forge(a, b);
    setArc(box.w > 0 ? arcFor(a, b) : null);
    setSynth({ ...synthesisFor(a, b), a, b });
    setCount((c) => c + 1);
  };

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.onProximity = (i) => {
      if (i >= 0) {
        engine.setFocus(i);
        touchNode(i);
      } else {
        engine.setFocus(null);
      }
    };
  }, [box]);

  /* tap support (touch devices): pointerdown near a node counts as a touch */
  const onStageDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageBoxRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    let near = -1;
    let best = 64 * 64;
    DISCIPLINES.forEach((d) => {
      const dx = px - (d.x / 100) * r.width;
      const dy = py - (d.y / 100) * r.height;
      const dd = dx * dx + dy * dy;
      if (dd < best) {
        best = dd;
        near = d.id;
      }
    });
    if (near >= 0) {
      engineRef.current?.setFocus(near);
      touchNode(near);
    }
  };

  const cardPos = useMemo(() => {
    if (!arc || !box.w) return null;
    // clamp keeps the 272px card fully inside the framed stage on every screen
    const half = 148; // card half-width + margin
    const cx = Math.min(Math.max(arc.mx, half), Math.max(half, box.w - half));
    const cy = Math.min(Math.max(arc.my, box.h * 0.4), box.h * 0.78);
    return { left: (cx / box.w) * 100, top: (cy / box.h) * 100 };
  }, [arc, box]);

  const t = (fa: string, en: string) => pick(lang, en, fa);

  return (
    <section ref={sectionRef} className={`nx relative ${fallback ? 'nx-fallback' : ''}`} aria-label={t('هسته — پروتوتایپ میدان زنده', 'Nexus — living field prototype')}>
      {/* the chamber: the world is CONTAINED here (scenario v2) — the rest of
          the page keeps its own clean background, no fixed canvas behind it */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-2 pt-10 sm:px-6">
        <div className="nx-panel relative overflow-hidden rounded-[28px] border border-white/10 bg-[#05060a] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.85)]">
          {/* header (on the chamber floor, outside the framed stage) */}
          <div className="px-5 pt-8 text-center sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500/90">Nexus · هسته</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#f2f0fa] sm:text-4xl">
              {t('رشته‌های بی‌ربط، به هم می‌رسند', 'Where unrelated disciplines meet')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#b9b4cc] sm:text-base">
              {t(
                'موس شما یک نیروی خارجی است. از کنار هر رشته عبور کنید تا روشن شود؛ سپس دو رشته را به هم برسانید تا چیزی تازه ساخته شود.',
                'Your cursor is an external force. Sweep past a discipline to wake it, then bridge two of them — and something new takes shape.',
              )}
            </p>
          </div>

          {/* the stage — a framed window into the world */}
          <div
            ref={stageRef}
            className="nx-stage relative mt-6 px-3 sm:px-6"
            onPointerDown={onStageDown}
          >
            <div ref={stageBoxRef} className="relative h-[62vh] min-h-[460px] w-full overflow-hidden rounded-2xl border border-white/10">
              {/* the world */}
              <canvas ref={canvasRef} className="nx-canvas pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
              {fallback && <div className="nx-fallback-bg pointer-events-none absolute inset-0" aria-hidden="true" />}
            {/* synthesis arc */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              {arc && (
                <>
                  <defs>
                    <linearGradient
                      id={`nxg-${arc.a}-${arc.b}`}
                      gradientUnits="userSpaceOnUse"
                      x1={arc.x1} y1={arc.y1} x2={arc.x2} y2={arc.y2}
                    >
                      <stop offset="0" stopColor={`hsl(${DISCIPLINES[arc.a].hue} 90% 62%)`} />
                      <stop offset="0.5" stopColor="#ffe9c4" />
                      <stop offset="1" stopColor={`hsl(${DISCIPLINES[arc.b].hue} 90% 62%)`} />
                    </linearGradient>
                  </defs>
                  <path
                    key={arc.key}
                    className="nx-arc"
                    d={arc.d}
                    fill="none"
                    stroke={`url(#nxg-${arc.a}-${arc.b})`}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    pathLength={1}
                  />
                  <circle key={`${arc.key}-a`} className="nx-spark" cx={arc.x1} cy={arc.y1} r="4" fill={`hsl(${DISCIPLINES[arc.a].hue} 90% 62%)`} />
                  <circle key={`${arc.key}-b`} className="nx-spark" cx={arc.x2} cy={arc.y2} r="4" fill={`hsl(${DISCIPLINES[arc.b].hue} 90% 62%)`} />
                </>
              )}
            </svg>

            {/* discipline nodes */}
            {DISCIPLINES.map((d) => (
              <button
                key={d.key}
                type="button"
                className="nx-node group absolute"
                style={{ left: `${d.x}%`, top: `${d.y}%`, '--hue': d.hue, '--dep': d.depth } as CSSProperties}
                aria-label={pick(lang, d.name.en, d.name.fa)}
                onFocus={() => { engineRef.current?.setFocus(d.id); touchNode(d.id); }}
                onBlur={() => engineRef.current?.setFocus(null)}
                onMouseEnter={() => engineRef.current?.setFocus(d.id)}
                onMouseLeave={() => engineRef.current?.setFocus(null)}
              >
                <span className="nx-ring" />
                <span className="nx-glyph">
                  <DisciplineGlyph k={d.key} />
                </span>
                <span className="nx-label">{pick(lang, d.name.en, d.name.fa)}</span>
              </button>
            ))}

            {/* synthesis card */}
            {synth && cardPos && arc && (
              <div
                key={arc.key}
                className="nx-card absolute z-20 w-[272px] rounded-2xl border border-white/10 bg-[#0b0a12]/80 p-4 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:w-72"
                style={{ left: `${cardPos.left}%`, top: `${cardPos.top}%` }}
                role="status"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#b9b4cc]">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${DISCIPLINES[arc.a].hue} 90% 62%)` }} />
                  {pick(lang, DISCIPLINES[arc.a].name.en, DISCIPLINES[arc.a].name.fa)}
                  <Plus className="h-3 w-3" aria-hidden />
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: `hsl(${DISCIPLINES[arc.b].hue} 90% 62%)` }} />
                  {pick(lang, DISCIPLINES[arc.b].name.en, DISCIPLINES[arc.b].name.fa)}
                </div>
                <p className="mt-2 font-extrabold text-[#f5f3fc]">{pick(lang, synth.title.en, synth.title.fa)}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#b9b4cc]">{pick(lang, synth.desc.en, synth.desc.fa)}</p>
                {synth.sample && (
                  <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
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
            <span className="inline-flex items-center gap-2 text-[#b9b4cc]">
              <Link2 className="h-4 w-4 text-amber-400" aria-hidden />
              {t('دو رشته را با موس به هم برسانید', 'Sweep the cursor across two disciplines to connect them')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#f2f0fa]" aria-live="polite">
              <GitMerge className="h-4 w-4 text-violet-400" aria-hidden />
              {count > 0
                ? t(`${count} پیوند کشف شد`, `${count} connection${count === 1 ? '' : 's'} forged`)
                : t('هنوز پیوندی ساخته نشده', 'No connections yet')}
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

      <style>{NX_CSS}</style>
    </section>
  );
}

const NX_CSS = `
.nx { color-scheme: dark; color: #eceaf2; }
.nx-canvas { display: block; }
.nx-fallback .nx-canvas { display: none; }
.nx-fallback-bg { background:
  radial-gradient(60% 50% at 20% 30%, rgba(124,58,237,0.14), transparent 70%),
  radial-gradient(50% 40% at 80% 70%, rgba(245,158,11,0.10), transparent 70%),
  radial-gradient(40% 40% at 60% 18%, rgba(217,70,239,0.08), transparent 70%),
  #05060a; }

.nx-stage { --nx-par-x: 0; --nx-par-y: 0; --nx-energy: 0; }

/* nodes — parallax by depth, hue from the discipline */
.nx-node {
  --hue: 40; --dep: 1;
  transform: translate(calc(var(--nx-par-x, 0) * var(--dep) * 26px - 50%), calc(var(--nx-par-y, 0) * var(--dep) * 18px - 50%));
  display: grid; justify-items: center; gap: 6px;
  padding: 10px; border-radius: 9999px;
  will-change: transform; cursor: crosshair; -webkit-tap-highlight-color: transparent;
}
.nx-ring {
  position: absolute; top: 10px; left: 50%; translate: -50% 0;
  width: 62px; height: 62px; border-radius: 9999px;
  border: 1px solid hsl(var(--hue) 90% 65% / 0.30);
  box-shadow: 0 0 26px -8px hsl(var(--hue) 90% 60% / 0.55), inset 0 0 18px -8px hsl(var(--hue) 90% 60% / 0.4);
  transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
  animation: nx-breathe 5.5s ease-in-out infinite;
}
.nx-node:hover .nx-ring, .nx-node:focus-visible .nx-ring {
  transform: scale(1.28);
  border-color: hsl(var(--hue) 90% 68% / 0.85);
  box-shadow: 0 0 42px -6px hsl(var(--hue) 90% 62% / 0.9), inset 0 0 26px -8px hsl(var(--hue) 90% 62% / 0.7);
}
.nx-glyph { position: relative; z-index: 1; width: 34px; height: 34px; color: hsl(var(--hue) 92% 70%);
  filter: drop-shadow(0 0 7px hsl(var(--hue) 90% 60% / 0.55)); transition: transform 0.35s ease; }
.nx-node:hover .nx-glyph { transform: scale(1.08); }
.nx-label { position: relative; z-index: 1; font-size: 11px; letter-spacing: 0.04em; color: rgba(236,234,242,0.62);
  transition: color 0.3s ease, letter-spacing 0.3s ease; white-space: nowrap; }
.nx-node:hover .nx-label, .nx-node:focus-visible .nx-label { color: #fff; letter-spacing: 0.12em; }

/* per-discipline hover behaviours — each craft acts out itself */
.nx-node:hover .nx-gear { transform-origin: 24px 24px; animation: nx-rot 5s linear infinite; }
.nx-node:hover .nx-solid { transform-origin: 24px 26px; animation: nx-rot 9s linear infinite; }
.nx-node:hover .nx-ripple circle { animation: nx-ripple 1.6s ease-in-out infinite; }
.nx-node:hover .nx-atom { animation: nx-pulse 1.2s ease-in-out infinite; transform-origin: 39px 13px; }
.nx-node:hover .nx-net line { animation: nx-flicker 1.1s linear infinite; }
.nx-node:hover .nx-bezier { stroke-dasharray: 1; animation: nx-draw 1.4s ease-in-out infinite alternate; }

/* synthesis arc + sparks */
.nx-arc { stroke-dasharray: 1; stroke-dashoffset: 1; animation: nx-arc-draw 1s cubic-bezier(0.3, 0.7, 0.2, 1) forwards;
  filter: drop-shadow(0 0 6px rgba(255, 230, 180, 0.45)); }
.nx-spark { animation: nx-spark 1.1s ease-out both; transform-box: fill-box; transform-origin: center; }

/* synthesis card */
.nx-card { animation: nx-card-in 0.5s cubic-bezier(0.2, 0.85, 0.25, 1.15) both; transform: translate(-50%, calc(-100% - 20px)); }

@keyframes nx-rot { to { transform: rotate(360deg); } }
@keyframes nx-breathe { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
@keyframes nx-ripple { 0%, 100% { opacity: 0.35; transform: scale(0.94); } 50% { opacity: 1; transform: scale(1.06); } }
.nx-ripple circle { transform-box: fill-box; transform-origin: center; }
@keyframes nx-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.22); } }
.nx-atom { transform-box: fill-box; transform-origin: center; }
@keyframes nx-flicker { 0%, 100% { opacity: 0.35; } 45% { opacity: 1; } }
@keyframes nx-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.nx-bezier { stroke-dasharray: 1; stroke-dashoffset: 0; }
@keyframes nx-arc-draw { to { stroke-dashoffset: 0; } }
@keyframes nx-spark { 0% { transform: scale(0.2); opacity: 0; } 55% { transform: scale(1.7); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.65; } }
@keyframes nx-card-in { from { opacity: 0; transform: translate(-50%, calc(-100% - 6px)) scale(0.93); }
  to { opacity: 1; transform: translate(-50%, calc(-100% - 20px)) scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .nx-ring, .nx-gear, .nx-solid, .nx-ripple circle, .nx-atom, .nx-net line,
  .nx-bezier, .nx-arc, .nx-spark, .nx-card { animation: none !important; }
  .nx-arc { stroke-dashoffset: 0; }
}
`;
