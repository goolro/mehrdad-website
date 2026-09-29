'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../store';
import { ui } from '../i18n';

/**
 * Traffic Tempo — full-screen MOBILE edition (owner request 2026-09-30:
 * «ترافیک تمپو بازی موبایل دو بعدی بنویس»). Lives at /play/traffic-tempo,
 * rendered bare (no site header/footer) so it feels like an installed app.
 *
 * Differences from the embedded square web edition:
 * - The board fills the real viewport (portrait-first): geometry is derived
 *   from the measured container every resize — longer approaches on phones,
 *   everything (roads, cars, physics) scales from one ROAD constant.
 * - Touch-first: the four lights sit on the four corners of the box (always
 *   reachable, never under queued cars), with a generous hit radius; a tap
 *   on a road arm also flips that arm's light.
 * - Native-feel extras: haptic pulses (vibrate API), screen Wake Lock while
 *   playing, safe-area insets, dvh sizing, no page scroll or rubber-banding.
 * Same proven rules as the web edition: one inbound lane per arm, committed
 * cars never brake for the light, perpendicular crash or an impatient gold
 * VIP ends the run, tempo rises every 8 passed cars, best score persists
 * locally under its own key (tt-mobile-best).
 *
 * SSR-safety: the shell renders on the server; canvas + engine + audio live
 * strictly inside effects and user gestures (the AudioContext is created on
 * the Start tap — never at module scope, never on mount).
 */

// ── physics & tuning (scaled from the 480px web reference) ────────────
const REF_ROAD = 44; // web-edition road half-width everything was tuned at
const TAP_R = 60; // generous touch hit radius (logical px)
const VIP_CHANCE = 0.13;

/** arms: 0 = N→S (heading south) 1 = E→W 2 = S→N 3 = W→E — right-hand traffic */
type Arm = 0 | 1 | 2 | 3;
const CROSS_PAIRS: Array<[Arm, Arm]> = [
  [0, 1],
  [0, 3],
  [2, 1],
  [2, 3],
];

/** per-arm geometry, rebuilt on every layout() from the measured viewport */
interface ArmGeom {
  axis: 'x' | 'y'; // travel axis
  sign: 1 | -1; // travel direction along that axis
  lane: number; // fixed coordinate of the inbound lane center
  entry: number; // spawn-edge coordinate along the travel axis
  stop: number; // nose stop-line coordinate (before zebra + box)
  boxIn: number; // near box edge
  boxOut: number; // far box edge
  exit: number; // screen edge the arm leaves through
  light: { x: number; y: number }; // corner light-button position
}

interface Car {
  arm: Arm;
  progress: number; // distance traveled from the spawn edge (direction-free)
  v: number;
  vip: boolean;
  patience: number; // 1 → 0 while queued (VIP only)
  warned: boolean;
  passed: boolean;
  hue: string; // body tint (non-VIP)
}

interface Popup {
  x: number;
  y: number;
  age: number;
  text: string;
  gold: boolean;
}

type HapticKind = 'tap' | 'pass' | 'warn' | 'crash';

interface EngineHooks {
  onHud: (score: number, tempo: number) => void;
  onOver: (reason: 'crash' | 'vip', score: number) => void;
  haptics: (kind: HapticKind) => void;
}

// ── audio (tiny WebAudio synth — lazily created on the Start gesture) ──
class AudioKit {
  private ctx: AudioContext | null = null;
  muted = false;

  ensure() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch {
        this.ctx = null; // audio stays best-effort
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    if (this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      /* never let sound break the game */
    }
  }

  click(green: boolean) {
    this.tone(green ? 740 : 420, 0.07, 'square', 0.05);
  }
  pass(vip: boolean) {
    this.tone(vip ? 980 : 660, 0.09, 'triangle', 0.06, vip ? 1560 : 880);
  }
  warn() {
    this.tone(330, 0.14, 'sawtooth', 0.05);
  }
  crash() {
    this.tone(190, 0.5, 'sawtooth', 0.12, 50);
    this.tone(95, 0.6, 'square', 0.09, 40);
  }
}

// ── engine ────────────────────────────────────────────────────────────
const levelOf = (score: number) => Math.floor(score / 8);

class MobileTempoEngine {
  private ctx2d: CanvasRenderingContext2D | null = null;
  private raf = 0;
  private running = false;
  private dead = false;
  private deadAt = 0;
  private last = 0;
  private lights: boolean[] = [true, false, true, false]; // N/S green at kickoff
  private cars: Car[] = [];
  private timers: number[] = [900, 1700, 900, 1700];
  private popups: Popup[] = [];
  private score = 0;
  private flash = 0;
  private shake = 0;
  private hudScore = -1;
  private hudTempo = -1;
  private reducedMotion = false;

  // layout state (set by layout())
  private W = 0;
  private H = 0;
  private S = 1; // scale factor vs the 480px web reference
  private Cx = 0;
  private Cy = 0;
  private ROAD = REF_ROAD;
  private CAR_L = 30;
  private CAR_W = 16;
  private ACCEL = 260;
  private BRAKE = 460;
  private MIN_GAP = 7;
  private arms: ArmGeom[] = [];

  private keyHandler: (e: KeyboardEvent) => void;
  private pointerHandler: (e: PointerEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private hooks: EngineHooks,
    private audio: AudioKit
  ) {
    this.ctx2d = canvas.getContext('2d');
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      this.reducedMotion = false;
    }

    // touch/click: corner light inside the hit radius wins; otherwise a tap
    // on a road arm flips that arm; otherwise the nearest corner light
    this.pointerHandler = (ev: PointerEvent) => {
      if (this.dead || this.W === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) * (this.W / rect.width);
      const y = (ev.clientY - rect.top) * (this.H / rect.height);
      let hit = -1;
      let bestD = TAP_R;
      this.arms.forEach((g, i) => {
        const d = Math.hypot(g.light.x - x, g.light.y - y);
        if (d < bestD) {
          bestD = d;
          hit = i;
        }
      });
      if (hit < 0) {
        if (Math.abs(x - this.Cx) < this.ROAD) hit = y < this.Cy ? 0 : 2;
        else if (Math.abs(y - this.Cy) < this.ROAD) hit = x > this.Cx ? 1 : 3;
      }
      if (hit < 0) {
        let nearD = Infinity;
        this.arms.forEach((g, i) => {
          const d = Math.hypot(g.light.x - x, g.light.y - y);
          if (d < nearD) {
            nearD = d;
            hit = i;
          }
        });
      }
      if (hit >= 0) this.toggleLight(hit as Arm);
    };
    canvas.addEventListener('pointerdown', this.pointerHandler);

    // keyboard 1–4 — only mid-run and never while the user is typing elsewhere
    this.keyHandler = (e: KeyboardEvent) => {
      if (!this.running) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const map: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
      const arm = map[e.key];
      if (arm === undefined || this.dead) return;
      e.preventDefault();
      this.toggleLight(arm as Arm);
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  /** re-derive all geometry from the measured viewport — safe mid-run */
  layout(w: number, h: number) {
    this.W = Math.max(120, Math.round(w));
    this.H = Math.max(220, Math.round(h));
    const minDim = Math.min(this.W, this.H);
    this.ROAD = Math.max(34, Math.min(54, Math.round(minDim * 0.115)));
    this.S = this.ROAD / REF_ROAD;
    this.CAR_L = Math.round(this.ROAD * 0.68);
    this.CAR_W = Math.round(this.ROAD * 0.37);
    this.ACCEL = 260 * this.S;
    this.BRAKE = 460 * this.S;
    this.MIN_GAP = 7 * this.S;
    this.Cx = Math.round(this.W / 2);
    this.Cy = Math.round(this.H * 0.52);

    const R = this.ROAD;
    const off = R / 2;
    const side = Math.max(16, 22 * this.S); // corner light offset from the box
    this.arms = [
      {
        axis: 'y', sign: 1, lane: this.Cx - off, entry: 0,
        stop: this.Cy - R - 32 * this.S, boxIn: this.Cy - R, boxOut: this.Cy + R, exit: this.H,
        light: { x: this.Cx - R - side, y: this.Cy - R - side },
      },
      {
        axis: 'x', sign: -1, lane: this.Cy - off, entry: this.W,
        stop: this.Cx + R + 32 * this.S, boxIn: this.Cx + R, boxOut: this.Cx - R, exit: 0,
        light: { x: this.Cx + R + side, y: this.Cy - R - side },
      },
      {
        axis: 'y', sign: -1, lane: this.Cx + off, entry: this.H,
        stop: this.Cy + R + 32 * this.S, boxIn: this.Cy + R, boxOut: this.Cy - R, exit: 0,
        light: { x: this.Cx + R + side, y: this.Cy + R + side },
      },
      {
        axis: 'x', sign: 1, lane: this.Cy + off, entry: 0,
        stop: this.Cx - R - 32 * this.S, boxIn: this.Cx - R, boxOut: this.Cx + R, exit: this.W,
        light: { x: this.Cx - R - side, y: this.Cy + R + side },
      },
    ];

    // crisp on hi-dpi
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    if (this.ctx2d) this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!this.running) this.render(); // static board preview behind overlays
  }

  private cruise(lv: number) {
    return 95 * this.S * Math.min(2, 1 + lv * 0.12);
  }
  private spawnMean(lv: number) {
    return 2600 / Math.min(2.6, 1 + lv * 0.16);
  }
  private patienceSecs(lv: number) {
    return Math.max(5, 11 - lv * 0.6);
  }

  toggleLight(arm: Arm) {
    this.lights[arm] = !this.lights[arm];
    this.audio.click(this.lights[arm]);
    this.hooks.haptics('tap');
  }

  start() {
    this.dead = false;
    this.flash = 0;
    this.shake = 0;
    this.score = 0;
    this.cars = [];
    this.popups = [];
    this.lights = [true, false, true, false];
    this.timers = [900, 1700, 900, 1700];
    this.hudScore = -1;
    this.hudTempo = -1;
    this.pushHud();
    this.render();
    this.resume();
  }

  resume() {
    if (this.running || this.dead || !this.ctx2d || this.W === 0) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  pause() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.pause();
    this.canvas.removeEventListener('pointerdown', this.pointerHandler);
    window.removeEventListener('keydown', this.keyHandler);
  }

  private pushHud() {
    const tempo = Math.round((1 + levelOf(this.score) * 0.12) * 10) / 10;
    if (this.score !== this.hudScore || tempo !== this.hudTempo) {
      this.hudScore = this.score;
      this.hudTempo = tempo;
      this.hooks.onHud(this.score, tempo);
    }
  }

  private frame = (ts: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0.001, (ts - this.last) / 1000));
    this.last = ts;
    if (!this.dead) {
      this.update(dt);
    } else {
      this.flash = Math.max(0, this.flash - dt * 1.3);
      this.shake = Math.max(0, this.shake - dt * 1.6);
      if (performance.now() - this.deadAt > 900) {
        this.render();
        this.running = false;
        this.raf = 0;
        return;
      }
    }
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number) {
    const lv = levelOf(this.score);

    // spawns — per-arm jittered timers, blocked lanes retry shortly
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      this.timers[arm] -= dt * 1000;
      if (this.timers[arm] > 0) continue;
      const blocked = this.cars.some(
        (c) => c.arm === arm && c.progress < this.CAR_L + 18 * this.S
      );
      if (blocked) {
        this.timers[arm] = 450;
        continue;
      }
      const vip = Math.random() < VIP_CHANCE;
      this.cars.push({
        arm: arm as Arm,
        progress: 0,
        v: this.cruise(lv) * 0.6,
        vip,
        patience: 1,
        warned: false,
        passed: false,
        hue: CAR_HUES[Math.floor(Math.random() * CAR_HUES.length)],
      });
      const mean = this.spawnMean(lv);
      this.timers[arm] = mean * (0.65 + Math.random() * 0.7);
    }

    // update cars (per arm so following uses the sorted queue)
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const g = this.arms[arm];
      const stopProgress = g.sign * (g.stop - g.entry);
      const lane = this.cars.filter((c) => c.arm === arm).sort((a, b) => b.progress - a.progress);
      for (let i = 0; i < lane.length; i++) {
        const car = lane[i];
        const cruise = this.cruise(lv) * (car.vip ? 1.06 : 1);
        const committed = car.progress >= stopProgress - 1;
        let target: number | null = null; // progress we must not pass
        if (!committed && !this.lights[arm]) target = stopProgress - 4 * this.S;
        if (i > 0) {
          const follow = lane[i - 1].progress - this.CAR_L - this.MIN_GAP;
          target = target === null ? follow : Math.min(target, follow);
        }

        let desired = cruise;
        if (target !== null) {
          const d = target - car.progress;
          desired = d <= 1 ? 0 : Math.min(cruise, Math.sqrt(2 * this.BRAKE * (d - 1)));
        }
        if (car.v < desired) car.v = Math.min(desired, car.v + this.ACCEL * dt);
        else car.v = Math.max(desired, car.v - this.BRAKE * dt);
        car.progress += car.v * dt;

        // VIP patience drains only while actually waiting before the box
        if (car.vip && !committed && car.v < 8 * this.S) {
          car.patience -= dt / this.patienceSecs(lv);
          if (car.patience < 0.35 && !car.warned) {
            car.warned = true;
            this.audio.warn();
            this.hooks.haptics('warn');
          }
          if (car.patience <= 0) {
            this.gameOver('vip');
            return;
          }
        }

        // rear cleared the far box edge → scored
        const scoredAt = g.sign * (g.boxOut - g.entry) + this.CAR_L;
        if (!car.passed && car.progress > scoredAt) {
          car.passed = true;
          const pts = car.vip ? 3 : 1;
          this.score += pts;
          const pos = this.carCenter(car);
          this.popups.push({
            x: pos.x,
            y: pos.y,
            age: 0,
            text: `+${pts}`,
            gold: car.vip,
          });
          this.audio.pass(car.vip);
          this.hooks.haptics('pass');
          this.pushHud();
        }
      }
    }
    this.cars = this.cars.filter((c) => {
      const g = this.arms[c.arm];
      const goneAt = g.sign * (g.exit - g.entry) + this.CAR_L + 10 * this.S;
      return c.progress < goneAt;
    });

    // crash check — perpendicular pairs overlapping near/inside the box
    for (const [a, b] of CROSS_PAIRS) {
      const A = this.cars.filter((c) => c.arm === a && !c.passed && this.progressInBox(c));
      const B = this.cars.filter((c) => c.arm === b && !c.passed && this.progressInBox(c));
      for (const ca of A) {
        const ra = this.carRect(ca);
        for (const cb of B) {
          const rb = this.carRect(cb);
          if (ra.x < rb.x + rb.w && ra.x + ra.w > rb.x && ra.y < rb.y + rb.h && ra.y + ra.h > rb.y) {
            this.gameOver('crash');
            return;
          }
        }
      }
    }

    // popups age out
    for (const p of this.popups) p.age += dt;
    this.popups = this.popups.filter((p) => p.age < 0.9);
  }

  /** candidate for a perpendicular crash once its nose is within a car-length of the stop line */
  private progressInBox(car: Car) {
    return car.progress > this.stopProgressOf(car.arm) - this.CAR_L;
  }

  /** direction-free progress of the stop line for an arm */
  private stopProgressOf(arm: Arm) {
    const g = this.arms[arm];
    return g.sign * (g.stop - g.entry);
  }

  private gameOver(reason: 'crash' | 'vip') {
    this.dead = true;
    this.deadAt = performance.now();
    this.flash = 1;
    this.shake = this.reducedMotion ? 0 : 1;
    this.audio.crash();
    this.hooks.haptics('crash');
    this.hooks.onOver(reason, this.score);
  }

  /** world center of a car, from its direction-free progress */
  private carCenter(car: Car): { x: number; y: number } {
    const g = this.arms[car.arm];
    const nose = g.entry + g.sign * car.progress;
    const center = nose - g.sign * (this.CAR_L / 2);
    return g.axis === 'y' ? { x: g.lane, y: center } : { x: center, y: g.lane };
  }

  private carRect(car: Car): { x: number; y: number; w: number; h: number } {
    const { x, y } = this.carCenter(car);
    const vertical = this.arms[car.arm].axis === 'y';
    return vertical
      ? { x: x - this.CAR_W / 2, y: y - this.CAR_L / 2, w: this.CAR_W, h: this.CAR_L }
      : { x: x - this.CAR_L / 2, y: y - this.CAR_W / 2, w: this.CAR_L, h: this.CAR_W };
  }

  // ── render ──────────────────────────────────────────────────────────
  private render() {
    const ctx = this.ctx2d;
    if (!ctx || this.W === 0) return;
    const { W, H, Cx, Cy, ROAD: R, S } = this;
    const off = R / 2;

    ctx.save();
    if (this.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake * 7,
        (Math.random() - 0.5) * this.shake * 7
      );
    }

    // field
    ctx.fillStyle = '#15191c';
    ctx.fillRect(-8, -8, W + 16, H + 16);

    // sidewalk slabs on the four corners
    ctx.fillStyle = '#1d2226';
    ctx.fillRect(-8, -8, W + 16, Cy - R);
    ctx.fillRect(-8, Cy + R, W + 16, H - Cy + R + 8);
    ctx.fillRect(-8, Cy - R, Cx - R + 8, R * 2);
    ctx.fillRect(Cx + R, Cy - R, W - Cx + R + 8, R * 2);

    // roads
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(Cx - R, 0, R * 2, H);
    ctx.fillRect(0, Cy - R, W, R * 2);
    // conflict box slightly lighter
    ctx.fillStyle = '#33383f';
    ctx.fillRect(Cx - R, Cy - R, R * 2, R * 2);

    // center divider dashes (between the two directions)
    ctx.strokeStyle = '#4a5058';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(Cx, 0);
    ctx.lineTo(Cx, Cy - R);
    ctx.moveTo(Cx, Cy + R);
    ctx.lineTo(Cx, H);
    ctx.moveTo(0, Cy);
    ctx.lineTo(Cx - R, Cy);
    ctx.moveTo(Cx + R, Cy);
    ctx.lineTo(W, Cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // zebra crossings + stop lines per inbound lane
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const g = this.arms[arm];
      // zebra band between the stop line and the box
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      const bars = 4;
      for (let b = 0; b < bars; b++) {
        const t = 7 * S + b * 5.5 * S; // distance from the box edge, outward
        if (arm === 0) ctx.fillRect(Cx - R + 2, Cy - R - t - 3.5 * S, off - 4, 3.5 * S);
        else if (arm === 2) ctx.fillRect(Cx + off + 2, Cy + R + t, off - 4, 3.5 * S);
        else if (arm === 1) ctx.fillRect(Cx + R + t, Cy - R + 2, 3.5 * S, off - 4);
        else ctx.fillRect(Cx - R - t - 3.5 * S, Cy + off + 2, 3.5 * S, off - 4);
      }
      // stop line across the inbound half only
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (arm === 0) {
        ctx.moveTo(Cx - R, g.stop);
        ctx.lineTo(Cx - off + 2, g.stop);
      } else if (arm === 2) {
        ctx.moveTo(Cx + off - 2, g.stop);
        ctx.lineTo(Cx + R, g.stop);
      } else if (arm === 1) {
        ctx.moveTo(g.stop, Cy - R);
        ctx.lineTo(g.stop, Cy - off + 2);
      } else {
        ctx.moveTo(g.stop, Cy + off - 2);
        ctx.lineTo(g.stop, Cy + R);
      }
      ctx.stroke();
    }

    // inbound chevrons (direction hints behind the stop line)
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const g = this.arms[arm];
      const stopProgress = g.sign * (g.stop - g.entry);
      for (const back of [30, 58]) {
        const p = this.centerAtProgress(arm as Arm, stopProgress - back * S);
        ctx.save();
        ctx.translate(p.x, p.y);
        if (arm === 0) ctx.rotate(Math.PI / 2);
        else if (arm === 2) ctx.rotate(-Math.PI / 2);
        else if (arm === 1) ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(3, 0);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // cars
    for (const car of this.cars) {
      const { x, y } = this.carCenter(car);
      const vertical = this.arms[car.arm].axis === 'y';
      ctx.save();
      ctx.translate(x, y);
      if (!vertical) ctx.rotate(Math.PI / 2);
      const w = this.CAR_W;
      const l = this.CAR_L;
      // body
      ctx.beginPath();
      roundRectPath(ctx, -w / 2, -l / 2, w, l, 5 * S);
      if (car.vip) {
        const grad = ctx.createLinearGradient(-w / 2, -l / 2, w / 2, l / 2);
        grad.addColorStop(0, '#fcd34d');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = car.hue;
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = car.vip ? '#fde68a' : 'rgba(0,0,0,0.35)';
      ctx.stroke();
      // windshield (front third)
      ctx.fillStyle = 'rgba(15,23,42,0.55)';
      roundRectPath(ctx, -w / 2 + 3, -l / 2 + 5, w - 6, 7 * S, 2);
      ctx.fill();
      // headlights
      ctx.fillStyle = 'rgba(254,243,199,0.85)';
      ctx.fillRect(-w / 2 + 2, -l / 2 + 1, 4, 2);
      ctx.fillRect(w / 2 - 6, -l / 2 + 1, 4, 2);
      ctx.restore();

      // VIP patience arc — drawn only while queued
      if (car.vip && car.patience < 1 && car.progress < this.stopProgressOf(car.arm)) {
        ctx.save();
        ctx.translate(x, y - this.CAR_L / 2 - 10 * S);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 10 * S, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle =
          car.patience > 0.55 ? '#22c55e' : car.patience > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 10 * S, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, car.patience));
        ctx.stroke();
        ctx.restore();
      }
    }

    // corner lights
    const lampR = Math.max(9, 12 * S);
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const p = this.arms[arm].light;
      const green = this.lights[arm];
      ctx.save();
      // pole base
      ctx.fillStyle = '#111417';
      ctx.beginPath();
      ctx.arc(p.x, p.y, lampR + 5, 0, Math.PI * 2);
      ctx.fill();
      // lamp
      ctx.shadowColor = green ? '#22c55e' : '#ef4444';
      ctx.shadowBlur = 16;
      ctx.fillStyle = green ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, lampR * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // rim
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, lampR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // score popups
    for (const p of this.popups) {
      const alpha = 1 - p.age / 0.9;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.gold ? '#fbbf24' : '#e2e8f0';
      ctx.font = `bold ${p.gold ? 17 : 14}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y - 14 - p.age * 26);
      ctx.restore();
    }

    // crash flash
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(239,68,68,${this.flash * 0.45})`;
      ctx.fillRect(-8, -8, W + 16, H + 16);
    }
    ctx.restore();
  }

  /** helper for chevrons: center point at a given direction-free progress */
  private centerAtProgress(arm: Arm, progress: number): { x: number; y: number } {
    const g = this.arms[arm];
    const nose = g.entry + g.sign * progress;
    const center = nose - g.sign * (this.CAR_L / 2);
    return g.axis === 'y' ? { x: g.lane, y: center } : { x: center, y: g.lane };
  }
}

const CAR_HUES = ['#2dd4bf', '#fb923c', '#f472b6', '#a3e635', '#e879f9', '#facc15', '#38bdf8'];

/** small path helper — ctx.roundRect is not universal yet */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── React shell ───────────────────────────────────────────────────────
type Phase = 'idle' | 'running' | 'paused' | 'over';

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNav = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

export function TrafficTempoMobile() {
  const { lang } = useApp();
  const t = ui[lang];
  const m = t.ttMobile;
  const fmt = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MobileTempoEngine | null>(null);
  const audioRef = useRef<AudioKit | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const bestRef = useRef(0);
  const rmRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [tempo, setTempo] = useState(1);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState<{ reason: 'crash' | 'vip'; score: number; record: boolean } | null>(
    null
  );
  const [muted, setMuted] = useState(false);

  const buzz = (kind: HapticKind) => {
    if (rmRef.current) return;
    try {
      const pattern = kind === 'crash' ? [70, 50, 120] : kind === 'warn' ? 40 : kind === 'pass' ? 12 : 10;
      navigator.vibrate?.(pattern);
    } catch {
      /* haptics are best-effort */
    }
  };

  const requestWake = async () => {
    try {
      const nav = navigator as WakeLockNav;
      if (nav.wakeLock && !wakeRef.current) wakeRef.current = await nav.wakeLock.request('screen');
    } catch {
      /* denied / unsupported — fine */
    }
  };
  const releaseWake = () => {
    try {
      wakeRef.current?.release();
    } catch {
      /* ignore */
    }
    wakeRef.current = null;
  };

  // best score + sound preference — read once after mount (deferred: setState
  // must run in a callback, not synchronously in the effect body — lint rule
  // react-hooks/set-state-in-effect)
  useEffect(() => {
    const read = () => {
      try {
        const b = Number(localStorage.getItem('tt-mobile-best') || '0');
        if (Number.isFinite(b) && b > 0) {
          bestRef.current = b;
          setBest(b);
        }
        if (localStorage.getItem('tt-sound') === '0') setMuted(true);
        rmRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch {
        /* private mode etc. — defaults are fine */
      }
    };
    const id = window.setTimeout(read, 0);
    return () => window.clearTimeout(id);
  }, []);

  // engine lifecycle: created once on mount, started/stopped by the phase
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (!audioRef.current) audioRef.current = new AudioKit();
    const engine = new MobileTempoEngine(canvas, { onHud, onOver, haptics: buzz }, audioRef.current);
    engineRef.current = engine;

    const fit = () => {
      const r = wrap.getBoundingClientRect();
      engine.layout(r.width, r.height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      engine.destroy();
      engineRef.current = null;
    };

    function onHud(s: number, tp: number) {
      setScore(s);
      setTempo(tp);
    }
    function onOver(reason: 'crash' | 'vip', finalScore: number) {
      const record = finalScore > bestRef.current;
      setOver({ reason, score: finalScore, record });
      setPhase('over');
      if (record) {
        bestRef.current = finalScore;
        setBest(finalScore);
        try {
          localStorage.setItem('tt-mobile-best', String(finalScore));
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  // the engine follows the phase (start on running, pause otherwise)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (phase === 'running') {
      engine.start();
      void requestWake();
      return () => {
        engine.pause();
        releaseWake();
      };
    }
    if (phase === 'paused' || phase === 'over') engine.pause();
  }, [phase]);

  // auto-pause when the tab or app goes to the background
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setPhase((p) => (p === 'running' ? 'paused' : p));
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  // mute flag → audio kit + persistence (shared key with the web edition)
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    try {
      localStorage.setItem('tt-sound', muted ? '0' : '1');
    } catch {
      /* ignore */
    }
  }, [muted]);

  // never leave the screen lock on while unmounting mid-run
  useEffect(
    () => () => {
      releaseWake();
    },
    []
  );

  const startRun = () => {
    if (!audioRef.current) audioRef.current = new AudioKit();
    audioRef.current.muted = muted;
    audioRef.current.ensure(); // must happen inside the user gesture
    setScore(0);
    setTempo(1);
    setOver(null);
    setPhase('running');
  };

  const backHref = lang === 'fa' ? '/work/traffic-tempo?lang=fa' : '/work/traffic-tempo';

  const hudPill =
    'inline-flex min-w-14 items-center justify-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm';

  return (
    <div
      ref={wrapRef}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      className="fixed inset-x-0 top-0 z-40 h-screen overflow-hidden bg-[#15191c] text-white select-none supports-[height:100dvh]:h-[100dvh]"
      style={{ overscrollBehavior: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-label={m.title}
        role="img"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href={backHref}
          className="pointer-events-auto inline-flex h-9 items-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
          {m.back}
        </Link>
        <span className="flex-1" />
        {phase !== 'idle' && (
          <>
            <span className={hudPill} aria-live="polite">
              <span className="text-white/60">{m.score}</span>
              {fmt(score)}
            </span>
            <span className={`${hudPill} hidden sm:inline-flex`}>
              <span className="text-white/60">{m.best}</span>
              {fmt(best)}
            </span>
            <span className={hudPill}>
              <span className="text-white/60">{m.tempo}</span>×{fmt(tempo)}
            </span>
            <button
              type="button"
              onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
              disabled={phase === 'over'}
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-40"
              aria-label={phase === 'running' ? m.pause : m.resume}
            >
              {phase === 'running' ? (
                <Pause className="h-4 w-4" aria-hidden />
              ) : (
                <Play className="h-4 w-4" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMuted((v) => !v)}
              className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label={muted ? m.soundOn : m.soundOff}
              aria-pressed={!muted}
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden />
              )}
            </button>
          </>
        )}
      </div>

      {/* start screen */}
      {phase === 'idle' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0c1013]/85 p-5 backdrop-blur-[3px]">
          <div className="w-full max-w-sm text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-500/25 text-4xl"
              aria-hidden
            >
              🚦
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight">{m.title}</h1>
            <p className="mt-1 text-sm text-white/70">{m.sub}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-start">
              <p className="text-sm font-bold">{m.howTitle}</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-white/70">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  {m.ruleToggle}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-white/50" aria-hidden />
                  {m.ruleFlow}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden />
                  {m.ruleCrash}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                  {m.ruleVip}
                </li>
              </ul>
            </div>
            {best > 0 && (
              <p className="mt-4 text-xs font-bold text-white/60">
                {m.best}: {fmt(best)}
              </p>
            )}
            <button
              type="button"
              onClick={startRun}
              className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-lg font-black text-white shadow-lg shadow-amber-500/30 transition-transform active:scale-[0.98]"
            >
              <Play className="h-5 w-5" aria-hidden />
              {m.start}
            </button>
          </div>
        </div>
      )}

      {/* paused */}
      {phase === 'paused' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0c1013]/85 backdrop-blur-[3px]">
          <p className="text-xl font-extrabold">{m.paused}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPhase('running')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 font-bold text-white shadow-lg shadow-amber-500/25 transition-transform active:scale-[0.98]"
            >
              <Play className="h-4 w-4" aria-hidden />
              {m.resume}
            </button>
            <button
              type="button"
              onClick={startRun}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-5 font-bold text-white transition-colors hover:bg-black/50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {m.again}
            </button>
          </div>
        </div>
      )}

      {/* game over */}
      {phase === 'over' && over && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-[#0c1013]/90 p-6 text-center backdrop-blur-[3px]">
          <p className="text-2xl font-black">{m.gameOver}</p>
          <p className="text-sm text-white/70">
            {over.reason === 'crash' ? m.reasonCrash : m.reasonVip}
          </p>
          {over.record && (
            <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400">
              ★ {m.newRecord}
            </span>
          )}
          <p className="mt-1 text-5xl font-black tabular-nums">{fmt(over.score)}</p>
          <p className="text-xs text-white/60">
            {fmt(over.score)} {m.passed}
          </p>
          <p className="text-xs font-bold text-amber-500">
            {m.best}: {fmt(best)}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={startRun}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 font-bold text-white shadow-lg shadow-amber-500/25 transition-transform active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {m.again}
            </button>
            <Link
              href={backHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 px-5 font-bold text-white transition-colors hover:bg-black/50"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {m.exit}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
