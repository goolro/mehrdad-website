'use client';

/**
 * DESIGN AMBIENT — the live "light field" behind the review prototype.
 * This is the ORYZO-style layer the owner pointed at: a background that
 * EXISTS first (breathing glows, drifting rings, twinkling dust) and then
 * REACTS to the pointer:
 *   - a soft orb smoothly chases the cursor (lerped, never snappy)
 *   - its hue drifts violet → fuchsia with horizontal position (never blue)
 *   - moving FAST makes it flare (energy rises with velocity, then decays)
 *   - a warm amber orb breathes stronger as the cursor sinks lower
 *   - rings/dust sit at 3 depths and counter-move → real parallax 3D
 * Pointer-events-none, -z-10 (behind all content), transform/opacity only,
 * honours prefers-reduced-motion (renders as a still painting).
 */

import { useEffect, useRef } from 'react';

const FOLLOW_FACTORS = [0.5, 1.1, 1.9]; // parallax strength per depth group

export function DesignAmbient() {
  const followRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.38;
    let cx = tx;
    let cy = ty;
    let energy = 0;
    let lastX = tx;
    let lastY = ty;
    let lastT = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const tick = (t: number) => {
      const dt = lastT ? Math.max(8, t - lastT) : 16;
      lastT = t;

      // velocity → energy: fast sweeps make the light flare, idle lets it fade
      const v = Math.hypot(tx - lastX, ty - lastY) / dt;
      lastX = tx;
      lastY = ty;
      energy = Math.min(1, energy * 0.94 + v * 0.09);

      // smooth chase
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;

      const nx = cx / window.innerWidth - 0.5; // -0.5 … 0.5
      const ny = cy / window.innerHeight - 0.5;

      const f = followRef.current;
      if (f) {
        f.style.transform =
          `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${1 + energy * 0.45})`;
        f.style.opacity = String(0.5 + energy * 0.45);
        // violet (0deg) → fuchsia (~55deg); clamped so it never hits blue
        f.style.filter = `hue-rotate(${(nx + 0.5) * 55}deg)`;
      }
      const w = warmRef.current;
      if (w) {
        // the warm glow strengthens as the cursor sinks toward the ground
        w.style.opacity = String(0.3 + Math.max(0, ny + 0.5) * 0.55 + energy * 0.15);
      }
      groupRefs.current.forEach((g, i) => {
        if (!g) return;
        const k = FOLLOW_FACTORS[i] ?? 1;
        g.style.transform = `translate3d(${-nx * 46 * k}px, ${-ny * 34 * k}px, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="da pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* depth 0 — breathing base glows (pure CSS, alive without any input) */}
      <div className="da-vignette absolute inset-0" />
      <div className="da-blob da-b1" />
      <div className="da-blob da-b2" />
      <div ref={warmRef} className="da-warm" style={{ left: '68%', top: '86%' }} />

      {/* depth 1 — far: big wireframe ring + dust */}
      <div ref={(el) => { groupRefs.current[0] = el; }} className="absolute inset-0 will-change-transform">
        <div className="da-ring" style={{ left: '12%', top: '14%', width: '52vmin', height: '52vmin', animationDuration: '80s' }} />
        <span className="da-dot" style={{ left: '22%', top: '68%', animationDelay: '-1s' }} />
        <span className="da-dot" style={{ left: '78%', top: '24%', animationDelay: '-3s' }} />
        <span className="da-dot" style={{ left: '60%', top: '78%', animationDelay: '-5s' }} />
      </div>

      {/* depth 2 — mid: second ring + dust */}
      <div ref={(el) => { groupRefs.current[1] = el; }} className="absolute inset-0 will-change-transform">
        <div className="da-ring" style={{ left: '66%', top: '48%', width: '34vmin', height: '34vmin', animationDuration: '55s', animationDirection: 'reverse' }} />
        <span className="da-dot" style={{ left: '40%', top: '18%', animationDelay: '-2s' }} />
        <span className="da-dot" style={{ left: '86%', top: '60%', animationDelay: '-4s' }} />
      </div>

      {/* depth 3 — near: small ring, moves the most */}
      <div ref={(el) => { groupRefs.current[2] = el; }} className="absolute inset-0 will-change-transform">
        <div className="da-ring da-ring-near" style={{ left: '30%', top: '58%', width: '18vmin', height: '18vmin', animationDuration: '40s' }} />
      </div>

      {/* the cursor light — chases, flares with speed, hue-drifts */}
      <div ref={followRef} className="da-follow" style={{ left: 0, top: 0 }} />

      <style>{DA_CSS}</style>
    </div>
  );
}

const DA_CSS = `
.da-blob, .da-warm, .da-follow, .da-ring, .da-dot { position: absolute; border-radius: 9999px; }
.da-follow { width: 58vmin; height: 58vmin; will-change: transform, opacity, filter;
  background: radial-gradient(closest-side, rgba(124,58,237,0.42), rgba(124,58,237,0.16) 46%, transparent 72%); }
.da-warm { width: 74vmin; height: 74vmin; transform: translate(-50%, -50%); will-change: opacity;
  background: radial-gradient(closest-side, rgba(245,158,11,0.30), rgba(245,158,11,0.10) 48%, transparent 75%); }
.da-blob { will-change: transform, opacity; }
.da-b1 { left: -14%; top: -18%; width: 58vmin; height: 58vmin;
  background: radial-gradient(closest-side, rgba(217,70,239,0.20), transparent 70%);
  animation: da-breathe 11s ease-in-out infinite alternate; }
.da-b2 { right: -16%; top: 30%; width: 50vmin; height: 50vmin;
  background: radial-gradient(closest-side, rgba(124,58,237,0.22), transparent 70%);
  animation: da-breathe 13s ease-in-out -6s infinite alternate-reverse; }
.da-ring { border: 1.5px solid rgba(167,139,250,0.30); filter: blur(1.2px);
  animation: da-spin linear infinite; }
.da-ring-near { border-color: rgba(217,70,239,0.38); }
.da-dot { width: 4px; height: 4px; background: rgba(233,213,255,0.85);
  box-shadow: 0 0 8px 2px rgba(167,139,250,0.55);
  animation: da-twinkle 5.5s ease-in-out infinite; }
.da-vignette { background: radial-gradient(120% 120% at 50% 42%, transparent 58%, rgba(0,0,0,0.30) 100%); opacity: 0; }
.dark .da-vignette { opacity: 1; }
.dark .da-b1 { background: radial-gradient(closest-side, rgba(217,70,239,0.26), transparent 70%); }
.dark .da-b2 { background: radial-gradient(closest-side, rgba(124,58,237,0.30), transparent 70%); }
@keyframes da-breathe { from { transform: scale(1) translate(0, 0); opacity: 0.55; }
  to { transform: scale(1.14) translate(2.5%, 3%); opacity: 0.95; } }
@keyframes da-spin { to { transform: rotate(360deg); } }
@keyframes da-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
@media (prefers-reduced-motion: reduce) {
  .da-b1, .da-b2, .da-ring, .da-dot { animation: none !important; }
  .da-follow { display: none; }
}
`;
