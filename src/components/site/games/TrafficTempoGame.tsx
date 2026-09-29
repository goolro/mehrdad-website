'use client';

import { useEffect, useRef, useState } from 'react';
import { Gamepad2, MousePointerClick, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../store';
import { ui } from '../i18n';

/**
 * Traffic Tempo — playable 2D web edition (owner request 2026-09-30:
 * «ترافیک تمپو بازی دو بعدی بنویس»). Embedded on /work/traffic-tempo
 * right after the Cafe Bazaar CTA: a faithful mini version of the
 * Android game's core fantasy — run an intersection, flip the lights,
 * keep the tempo, never let crossing traffic meet.
 *
 * Design contract:
 * - Canvas 2D in a fixed 480×480 logical space (DPR-scaled, CSS-fluid).
 * - Two two-way roads, right-hand traffic like Iran: each arm feeds ONE
 *   inbound lane — opposite greens never conflict (separate lanes) while
 *   perpendicular greens DO — that tension is the whole game.
 * - Cars queue kinematically (accel/brake curve + keep-gap following);
 *   once a car's nose crosses the stop line it is committed and never
 *   brakes for the light — the player owns the consequences.
 * - Fail states: a perpendicular crash inside the box, or a gold VIP
 *   whose patience bar empties while still queued (both straight from
 *   the real game's store listing: «VIP cars with limited patience»).
 * - Tempo: every 8 passed cars raise the level — spawns denser, cars
 *   faster, VIPs needier. The run ends; the best score persists locally.
 * - SSR-safe: the shell renders on the server; canvas + engine + audio
 *   live strictly inside effects and user gestures (AudioContext is
 *   created on the Start tap — never at module scope, never on mount).
 */

// ── geometry & tuning ─────────────────────────────────────────────────
const SIZE = 480; // logical square
const C = SIZE / 2;
const ROAD = 44; // road half-width → two 22px lanes
const STOP_AT = C - ROAD; // nose-of-car stop line, measured from spawn edge
const CAR_L = 30;
const CAR_W = 16;
const CLEAR_AT = SIZE - STOP_AT + CAR_L; // rear clears the far box edge
const ACCEL = 260; // px/s²
const BRAKE = 460; // px/s²
const MIN_GAP = 7; // px between queued bumpers
const TAP_R = 40; // light hit radius (logical px)

/** arms: 0=N (heading south) 1=E (heading west) 2=S (heading north) 3=W (heading east) */
type Arm = 0 | 1 | 2 | 3;
const CROSS_PAIRS: Array<[Arm, Arm]> = [
  [0, 1],
  [0, 3],
  [2, 1],
  [2, 3],
];

/** lane-center of the inbound lane + light-button position, per arm */
const LANE_CENTER: Record<Arm, { x: number; y: number }> = {
  0: { x: C - ROAD / 2, y: 0 }, // southbound — west lane (right-hand)
  1: { x: 0, y: C - ROAD / 2 }, // westbound  — north lane
  2: { x: C + ROAD / 2, y: 0 }, // northbound — east lane
  3: { x: 0, y: C + ROAD / 2 }, // eastbound  — south lane
};
const LIGHT_POS: Array<{ x: number; y: number }> = [
  { x: C - ROAD / 2, y: 26 },
  { x: SIZE - 26, y: C - ROAD / 2 },
  { x: C + ROAD / 2, y: SIZE - 26 },
  { x: 26, y: C + ROAD / 2 },
];

/** world center of a car whose nose has traveled s px from its spawn edge */
function carCenter(arm: Arm, s: number): { x: number; y: number } {
  switch (arm) {
    case 0: return { x: LANE_CENTER[0].x, y: s - CAR_L / 2 };
    case 1: return { x: SIZE - s + CAR_L / 2, y: LANE_CENTER[1].y };
    case 2: return { x: LANE_CENTER[2].x, y: SIZE - s + CAR_L / 2 };
    case 3: return { x: s - CAR_L / 2, y: LANE_CENTER[3].y };
  }
}

const level = (score: number) => Math.floor(score / 8);
const cruiseAt = (lv: number) => 95 * Math.min(2, 1 + lv * 0.12);
const spawnMeanAt = (lv: number) => 2600 / Math.min(2.6, 1 + lv * 0.16);
const patienceSecsAt = (lv: number) => Math.max(5, 11 - lv * 0.6);
const VIP_CHANCE = 0.13;

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
interface Car {
  arm: Arm;
  s: number; // nose distance from spawn edge
  v: number;
  vip: boolean;
  patience: number; // 1 → 0 while queued (VIP only)
  warned: boolean;
  passed: boolean;
}

interface Popup {
  x: number;
  y: number;
  age: number;
  text: string;
  gold: boolean;
}

interface EngineHooks {
  onHud: (score: number, tempo: number) => void;
  onOver: (reason: 'crash' | 'vip', score: number) => void;
}

class TempoEngine {
  private ctx2d: CanvasRenderingContext2D | null = null;
  private raf = 0;
  private running = false;
  private dead = false;
  private deadAt = 0;
  private last = 0;
  private lights: boolean[] = [true, false, true, false]; // N/S green at kickoff
  private cars: Car[] = [];
  private timers: number[] = [900, 1700, 900, 1700]; // staggered first spawns
  private popups: Popup[] = [];
  private score = 0;
  private flash = 0;
  private shake = 0;
  private hudScore = -1;
  private hudTempo = -1;
  private reducedMotion = false;
  private keyHandler: (e: KeyboardEvent) => void;
  private pointerHandler: (e: PointerEvent) => void;

  constructor(
    private canvas: HTMLCanvasElement,
    private hooks: EngineHooks,
    private audio: AudioKit
  ) {
    // crisp on hi-dpi; CSS keeps the layout size fluid
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    this.ctx2d = canvas.getContext('2d');
    if (this.ctx2d) this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    try {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      this.reducedMotion = false;
    }

    this.pointerHandler = (ev: PointerEvent) => {
      if (this.dead) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * SIZE;
      const y = ((ev.clientY - rect.top) / rect.height) * SIZE;
      let hit = -1;
      let bestD = TAP_R;
      LIGHT_POS.forEach((p, i) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestD) {
          bestD = d;
          hit = i;
        }
      });
      if (hit >= 0) this.toggleLight(hit as Arm);
    };
    canvas.addEventListener('pointerdown', this.pointerHandler);

    // keyboard 1–4 — but never while the user is typing somewhere else
    this.keyHandler = (e: KeyboardEvent) => {
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

  toggleLight(arm: Arm) {
    this.lights[arm] = !this.lights[arm];
    this.audio.click(this.lights[arm]);
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
    if (this.running || this.dead || !this.ctx2d) return;
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
    const tempo = Math.round((1 + level(this.score) * 0.12) * 10) / 10;
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
    const lv = level(this.score);

    // spawns — per-arm jittered timers, blocked lanes retry shortly
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      this.timers[arm] -= dt * 1000;
      if (this.timers[arm] > 0) continue;
      const blocked = this.cars.some((c) => c.arm === arm && c.s < CAR_L + 18);
      if (blocked) {
        this.timers[arm] = 450;
        continue;
      }
      const vip = Math.random() < VIP_CHANCE;
      this.cars.push({
        arm: arm as Arm,
        s: 0,
        v: cruiseAt(lv) * 0.6,
        vip,
        patience: 1,
        warned: false,
        passed: false,
      });
      const mean = spawnMeanAt(lv);
      this.timers[arm] = mean * (0.65 + Math.random() * 0.7);
    }

    // update cars (per arm so following uses the sorted queue)
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const lane = this.cars.filter((c) => c.arm === arm).sort((a, b) => b.s - a.s);
      for (let i = 0; i < lane.length; i++) {
        const car = lane[i];
        const cruise = cruiseAt(lv) * (car.vip ? 1.06 : 1);
        const committed = car.s >= STOP_AT - 1;
        let target: number | null = null; // nose position we must not pass
        if (!committed && !this.lights[arm]) target = STOP_AT - 4;
        if (i > 0) {
          const follow = lane[i - 1].s - CAR_L - MIN_GAP;
          target = target === null ? follow : Math.min(target, follow);
        }

        let desired = cruise;
        if (target !== null) {
          const d = target - car.s;
          desired = d <= 1 ? 0 : Math.min(cruise, Math.sqrt(2 * BRAKE * (d - 1)));
        }
        if (car.v < desired) car.v = Math.min(desired, car.v + ACCEL * dt);
        else car.v = Math.max(desired, car.v - BRAKE * dt);
        car.s += car.v * dt;

        // VIP patience drains only while actually waiting before the box
        if (car.vip && !committed && car.v < 8) {
          car.patience -= dt / patienceSecsAt(lv);
          if (car.patience < 0.35 && !car.warned) {
            car.warned = true;
            this.audio.warn();
          }
          if (car.patience <= 0) {
            this.gameOver('vip');
            return;
          }
        }

        // cleared the box → scored
        if (!car.passed && car.s > CLEAR_AT) {
          car.passed = true;
          const pts = car.vip ? 3 : 1;
          this.score += pts;
          const pos = carCenter(car.arm, Math.min(car.s, SIZE + 20));
          this.popups.push({ x: pos.x, y: pos.y, age: 0, text: `+${pts}`, gold: car.vip });
          this.audio.pass(car.vip);
          this.pushHud();
        }
      }
    }
    this.cars = this.cars.filter((c) => c.s < CLEAR_AT + 40);

    // crash check — perpendicular pairs overlapping inside the box
    for (const [a, b] of CROSS_PAIRS) {
      const A = this.cars.filter((c) => c.arm === a && !c.passed && c.s > STOP_AT - CAR_L);
      const B = this.cars.filter((c) => c.arm === b && !c.passed && c.s > STOP_AT - CAR_L);
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

  private gameOver(reason: 'crash' | 'vip') {
    this.dead = true;
    this.deadAt = performance.now();
    this.flash = 1;
    this.shake = this.reducedMotion ? 0 : 1;
    this.audio.crash();
    this.hooks.onOver(reason, this.score);
  }

  private carRect(car: Car): { x: number; y: number; w: number; h: number } {
    const { x, y } = carCenter(car.arm, car.s);
    const vertical = car.arm === 0 || car.arm === 2;
    return vertical
      ? { x: x - CAR_W / 2, y: y - CAR_L / 2, w: CAR_W, h: CAR_L }
      : { x: x - CAR_L / 2, y: y - CAR_W / 2, w: CAR_L, h: CAR_W };
  }

  // ── render ──────────────────────────────────────────────────────────
  private render() {
    const ctx = this.ctx2d;
    if (!ctx) return;
    ctx.save();
    if (this.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake * 7,
        (Math.random() - 0.5) * this.shake * 7
      );
    }

    // grass
    ctx.fillStyle = '#171b1e';
    ctx.fillRect(-8, -8, SIZE + 16, SIZE + 16);

    // roads
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(C - ROAD, 0, ROAD * 2, SIZE);
    ctx.fillRect(0, C - ROAD, SIZE, ROAD * 2);
    // box slightly lighter
    ctx.fillStyle = '#33383f';
    ctx.fillRect(C - ROAD, C - ROAD, ROAD * 2, ROAD * 2);

    // center divider dashes per road (between the two directions)
    ctx.strokeStyle = '#4a5058';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(C, 0);
    ctx.lineTo(C, C - ROAD);
    ctx.moveTo(C, C + ROAD);
    ctx.lineTo(C, SIZE);
    ctx.moveTo(0, C);
    ctx.lineTo(C - ROAD, C);
    ctx.moveTo(C + ROAD, C);
    ctx.lineTo(SIZE, C);
    ctx.stroke();
    ctx.setLineDash([]);

    // stop lines
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      ctx.beginPath();
      if (arm === 0) {
        ctx.moveTo(C - ROAD, STOP_AT);
        ctx.lineTo(C - ROAD / 2 + 2, STOP_AT);
      } else if (arm === 2) {
        ctx.moveTo(C + ROAD / 2 - 2, SIZE - STOP_AT);
        ctx.lineTo(C + ROAD, SIZE - STOP_AT);
      } else if (arm === 1) {
        ctx.moveTo(SIZE - STOP_AT, C - ROAD);
        ctx.lineTo(SIZE - STOP_AT, C - ROAD / 2 + 2);
      } else {
        ctx.moveTo(STOP_AT, C + ROAD / 2 - 2);
        ctx.lineTo(STOP_AT, C + ROAD);
      }
      ctx.stroke();
    }

    // inbound chevrons (subtle direction hints per lane)
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      for (const s of [92, 140]) {
        const p = carCenter(arm, s + CAR_L / 2);
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
      const { x, y } = carCenter(car.arm, car.s);
      const vertical = car.arm === 0 || car.arm === 2;
      ctx.save();
      ctx.translate(x, y);
      if (!vertical) ctx.rotate(Math.PI / 2);
      const w = CAR_W;
      const l = CAR_L;
      // body
      ctx.beginPath();
      roundRectPath(ctx, -w / 2, -l / 2, w, l, 5);
      if (car.vip) {
        const grad = ctx.createLinearGradient(-w / 2, -l / 2, w / 2, l / 2);
        grad.addColorStop(0, '#fcd34d');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = vertical ? '#2dd4bf' : '#fb923c';
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = car.vip ? '#fde68a' : 'rgba(0,0,0,0.35)';
      ctx.stroke();
      // windshield (front third)
      ctx.fillStyle = 'rgba(15,23,42,0.55)';
      roundRectPath(ctx, -w / 2 + 3, -l / 2 + 5, w - 6, 7, 2);
      ctx.fill();
      // headlights
      ctx.fillStyle = 'rgba(254,243,199,0.85)';
      ctx.fillRect(-w / 2 + 2, -l / 2 + 1, 4, 2);
      ctx.fillRect(w / 2 - 6, -l / 2 + 1, 4, 2);
      ctx.restore();

      // VIP patience arc — drawn only while queued
      if (car.vip && car.patience < 1 && car.s < STOP_AT) {
        ctx.save();
        ctx.translate(x, y - CAR_L / 2 - 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle =
          car.patience > 0.55 ? '#22c55e' : car.patience > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, car.patience));
        ctx.stroke();
        ctx.restore();
      }
    }

    // lights
    for (let arm = 0 as Arm; arm < 4; arm = (arm + 1) as Arm) {
      const p = LIGHT_POS[arm];
      const green = this.lights[arm];
      ctx.save();
      // pole base
      ctx.fillStyle = '#111417';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
      // lamp
      ctx.shadowColor = green ? '#22c55e' : '#ef4444';
      ctx.shadowBlur = 14;
      ctx.fillStyle = green ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // rim
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10.5, 0, Math.PI * 2);
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
      ctx.fillRect(-8, -8, SIZE + 16, SIZE + 16);
    }
    ctx.restore();
  }
}

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

export function TrafficTempoGame() {
  const { lang } = useApp();
  const t = ui[lang];
  const g = t.ttGame;
  const fmt = (n: number) =>
    n.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TempoEngine | null>(null);
  const audioRef = useRef<AudioKit | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [tempo, setTempo] = useState(1);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState<{ reason: 'crash' | 'vip'; score: number } | null>(null);
  const [muted, setMuted] = useState(false);

  // best score + sound preference — read once after mount (deferred: setState
  // must run in a callback, not synchronously in the effect body — lint rule
  // react-hooks/set-state-in-effect; a 0ms timer is invisible to the player)
  useEffect(() => {
    const read = () => {
      try {
        const b = Number(localStorage.getItem('tt-best') || '0');
        if (Number.isFinite(b) && b > 0) setBest(b);
        if (localStorage.getItem('tt-sound') === '0') setMuted(true);
      } catch {
        /* private mode etc. — defaults are fine */
      }
    };
    const id = window.setTimeout(read, 0);
    return () => window.clearTimeout(id);
  }, []);

  // engine lifecycle follows the phase
  useEffect(() => {
    if (phase === 'running') {
      if (!engineRef.current && canvasRef.current) {
        engineRef.current = new TempoEngine(
          canvasRef.current,
          {
            onHud: (s, tp) => {
              setScore(s);
              setTempo(tp);
            },
            onOver: (reason, finalScore) => {
              setOver({ reason, score: finalScore });
              setPhase('over');
              setBest((prev) => {
                const nb = Math.max(prev, finalScore);
                if (nb !== prev) {
                  try {
                    localStorage.setItem('tt-best', String(nb));
                  } catch {
                    /* ignore */
                  }
                }
                return nb;
              });
            },
          },
          audioRef.current as AudioKit
        );
      }
      engineRef.current?.start();
      return () => engineRef.current?.pause();
    }
  }, [phase]);

  useEffect(
    () => () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    },
    []
  );

  // auto-pause when the tab goes away
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setPhase((p) => (p === 'running' ? 'paused' : p));
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  // mute flag → audio kit + persistence
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    try {
      localStorage.setItem('tt-sound', muted ? '0' : '1');
    } catch {
      /* ignore */
    }
  }, [muted]);

  const startRun = () => {
    if (!audioRef.current) audioRef.current = new AudioKit();
    audioRef.current.muted = muted;
    audioRef.current.ensure(); // must happen inside the user gesture
    setScore(0);
    setTempo(1);
    setOver(null);
    setPhase('running');
  };

  const hudPill =
    'inline-flex min-w-16 items-center justify-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-bold';

  return (
    <section aria-labelledby="tt-web-game-title" className="mt-8">
      <h2 id="tt-web-game-title" className="flex items-center gap-2 text-lg font-bold">
        <Gamepad2 className="h-5 w-5 text-amber-500" aria-hidden />
        {t.projects.webGameTitle}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.projects.webGameSub}</p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        {phase === 'idle' ? (
          <div className="mx-auto max-w-md text-center">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-4xl"
              aria-hidden
            >
              🚦
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{g.startSub}</p>
            <div className="mt-5 text-start" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
              <p className="text-sm font-bold">{g.howTitle}</p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                  {g.ruleToggle}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  {g.ruleFlow}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" aria-hidden />
                  {g.ruleCrash}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" aria-hidden />
                  {g.ruleVip}
                </li>
              </ul>
            </div>
            {best > 0 && (
              <p className="mt-4 text-xs font-bold text-muted-foreground">
                {g.best}: {fmt(best)}
              </p>
            )}
            <button
              type="button"
              onClick={startRun}
              className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Play className="h-5 w-5" aria-hidden />
              {g.start}
            </button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[480px]">
            {/* HUD */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={hudPill} aria-live="polite">
                <span className="text-muted-foreground">{g.score}</span>
                {fmt(score)}
              </span>
              <span className={hudPill}>
                <span className="text-muted-foreground">{g.best}</span>
                {fmt(best)}
              </span>
              <span className={hudPill}>
                <span className="text-muted-foreground">{g.tempo}</span>
                ×{fmt(tempo)}
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
                disabled={phase === 'over'}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                aria-label={phase === 'running' ? g.pause : g.resume}
              >
                {phase === 'running' ? (
                  <Pause className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Play className="h-3.5 w-3.5" aria-hidden />
                )}
                {phase === 'running' ? g.pause : g.resume}
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label={muted ? g.soundOn : g.soundOff}
                aria-pressed={!muted}
              >
                {muted ? (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden />
                )}
                {muted ? g.soundOn : g.soundOff}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-[#171b1e]">
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                className="block h-auto w-full select-none touch-manipulation"
                aria-label={t.projects.webGameTitle}
                role="img"
              />

              {phase === 'paused' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/85 backdrop-blur-sm">
                  <p className="text-lg font-extrabold">{g.paused}</p>
                  <button
                    type="button"
                    onClick={() => setPhase('running')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <Play className="h-4 w-4" aria-hidden />
                    {g.resume}
                  </button>
                </div>
              )}

              {phase === 'over' && over && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 p-4 text-center backdrop-blur-sm">
                  <p className="text-xl font-extrabold">{g.gameOver}</p>
                  <p className="text-sm text-muted-foreground">
                    {over.reason === 'crash' ? g.reasonCrash : g.reasonVip}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums">{fmt(over.score)}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(over.score)} {g.passed}
                  </p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {g.best}: {fmt(best)}
                  </p>
                  <button
                    type="button"
                    onClick={startRun}
                    className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    {g.again}
                  </button>
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-xs text-muted-foreground">{g.vipNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
