/**
 * NEXUS ENGINE — the living field (raw WebGL2, zero dependencies).
 *
 * Research conclusion (oryzo.ai bundle autopsy): their quality comes from
 * hand-written GLSL (79 shader refs) + one 3D scene + DOM text on top —
 * a hybrid render stack. We apply the same philosophy at prototype scale:
 *
 *   PASS 1  FIELD   fullscreen fragment shader: fbm contour lines (a living
 *           technical map), faint blueprint grid, per-discipline light wells,
 *           a "torch" that follows the pointer, vignette. Camera parallax is
 *           folded into the noise coordinates.
 *   PASS 2  POINTS  gl.POINTS with additive gaussian sprites. Particles are
 *           simulated on CPU (typed arrays, zero GC) — each belongs to a
 *           discipline DISTRICT: it drifts on a pseudo-curl field but is
 *           spring-bound AND hard-capped to its node, so every hue keeps
 *           its own territory (owner feedback: colors must stay DISTINCT,
 *           the field CALM — no global rainbow wash).
 *
 * SCENARIO v2 (analysis/nexus-scenario.md): the world is CONTAINED — the
 * canvas covers only the framed stage, not the viewport. All coordinates
 * (mouse, nodes, particles, flow) are stage-local; the pointer has no
 * effect from outside the frame. Calmer densities: ~5.2k desktop /
 * ~2.4k mobile particles, dimmer additive alpha, reduced tint bleed.
 *
 * Lifecycle: IntersectionObserver outside decides start()/stop(); the engine
 * also stops when the tab hides. Adaptive quality ladder: DPR 1.5→1.25→1.0
 * and particle count downscales if the rolling frame average slips.
 * prefers-reduced-motion → one static painting, no loop.
 */

const NODE_N = 6;
const FLOW_N = 90;
const LADDER_DPR = [1.5, 1.25, 1.0];
/** district radius (CSS px): beyond this a particle is pulled home —
 *  keeps each discipline's color inside its own region of the map */
const DISTRICT_R = 150;

const FIELD_VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FIELD_FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;      // GL space (y flipped), device px
uniform float u_energy;    // 0..1 pointer-motion energy
uniform vec2 u_nodes[${NODE_N}];
uniform float u_nhue[${NODE_N}];
uniform float u_nglow[${NODE_N}];
out vec4 frag;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = r * p * 2.03 + 11.5; a *= 0.55; }
  return v;
}
vec3 hue2rgb(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}
void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_res;
  vec2 p = (px - 0.5 * u_res) / u_res.y;      // aspect-corrected, centered
  vec2 m = (u_mouse - 0.5 * u_res) / u_res.y;
  vec2 par = m * 0.035;                        // camera parallax

  float t = u_time;
  // scenario v3 «clean map»: barely-warped, slow field — crisp paper for the
  // contours, NOT organic worms (the v2 heavy warp was the mud factory)
  vec2 fp = p * 1.05 + par;
  float n = fbm(fp + fbm(fp * 0.55 - t * 0.028) * 0.16 - vec2(t * 0.01, t * 0.005));

  // contour lines — ONE thin scale, monochrome. Color never rides the lines:
  // hues live only inside their district (owner: colors must stay DISTINCT)
  float lv = 8.0;
  float cv = abs(fract(n * lv) - 0.5);
  float line = smoothstep(0.016, 0.0, cv) * 0.5;

  // blueprint grid (counter-parallax → depth) — whisper, not texture
  vec2 g = abs(fract(px / 56.0 + par * 6.0) - 0.5);
  float grid = smoothstep(0.035, 0.0, min(g.x, g.y)) * 0.026;

  // pointer torch
  float dm = length(p - m);
  float torch = exp(-dm * 4.0) * (0.45 + u_energy * 1.4);

  // discipline district discs — TIGHT gaussians (r≈140px): each hue owns a
  // small bounded patch on the floor; nothing overlaps, nothing washes out
  vec3 tint = vec3(0.0);
  float wells = 0.0;
  for (int i = 0; i < ${NODE_N}; i++) {
    vec2 np = (u_nodes[i] - 0.5 * u_res) / u_res.y;
    float d = length(p - np);
    float w = exp(-d * d * 30.0) * u_nglow[i];
    tint += hue2rgb(u_nhue[i]) * w;
    wells += w;
  }

  vec3 col = vec3(0.012, 0.013, 0.019);
  col += vec3(0.020, 0.017, 0.028) * (1.0 - min(length(p) * 0.45, 1.0));

  // the district floor: the ONLY place color exists in the field
  col += tint * 0.155;

  // neutral warm contour ink — no tint bleed; only the torch may light it
  vec3 ink = vec3(0.86, 0.78, 0.60);
  float inkI = 0.085 + 0.012 * sin(t * 0.12);
  inkI = mix(inkI, 0.5, torch);
  col += ink * line * (inkI + min(wells, 0.55) * 0.22);
  col += vec3(0.05, 0.05, 0.085) * grid * (0.6 + torch * 2.0);

  // vignette
  float vg = smoothstep(1.3, 0.3, length((uv - 0.5) * vec2(u_res.x / u_res.y, 1.0)));
  col *= mix(0.5, 1.0, vg);

  frag = vec4(col, 1.0);
}`;

const POINT_VS = `#version 300 es
layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec4 a_meta; // size, hue, alpha, _
uniform vec2 u_res;
out float v_hue;
out float v_alpha;
void main() {
  vec2 c = (a_pos / u_res) * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  gl_PointSize = a_meta.x;
  v_hue = a_meta.y;
  v_alpha = a_meta.z;
}`;

const POINT_FS = `#version 300 es
precision mediump float;
in float v_hue;
in float v_alpha;
out vec4 frag;
vec3 hue2rgb(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = exp(-dot(d, d) * 9.0) * v_alpha;
  if (a < 0.004) discard;
  frag = vec4(hue2rgb(v_hue) * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[nexus] shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram | null {
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[nexus] link:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export interface NexusStats {
  particles: number;
  fps: number;
  dpr: number;
  live: boolean;
}

export class NexusEngine {
  readonly ok: boolean;
  reduced: boolean;

  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private fieldP: WebGLProgram | null = null;
  private pointP: WebGLProgram | null = null;
  private uF: Record<string, WebGLUniformLocation | null> = {};
  private uPt: Record<string, WebGLUniformLocation | null> = {};
  private pb: WebGLBuffer | null = null;
  private fb: WebGLBuffer | null = null;

  private dpr = 1;
  private W = 1;
  private H = 1;

  // particles — packed [x, y, size, hue, alpha, 0] per particle
  private N = 1;
  private targetN = 0;
  private vel: Float32Array = new Float32Array(0);
  private ppacked: Float32Array = new Float32Array(0);
  private clu: Uint8Array = new Uint8Array(0);
  private dep: Float32Array = new Float32Array(0);
  private e: Float32Array = new Float32Array(0);
  private bsz: Float32Array = new Float32Array(0);

  // flow stream (synthesis arcs) — same packing
  private fpacked: Float32Array = new Float32Array(FLOW_N * 6);
  private ft = new Float32Array(FLOW_N);
  private favive = new Uint8Array(FLOW_N);
  private fA = new Float32Array(FLOW_N * 2);
  private fB = new Float32Array(FLOW_N * 2);
  private fC = new Float32Array(FLOW_N * 2);
  private fh = new Float32Array(FLOW_N * 2);

  // nodes
  private hues = new Float32Array(NODE_N);
  private glows = new Float32Array(NODE_N);
  private burst = new Float32Array(NODE_N);
  private nodePx = new Float32Array(NODE_N * 2); // CSS px, stage-local
  private devNodes = new Float32Array(NODE_N * 2); // device px, GL space, stage-local
  private stage: HTMLElement | null = null;
  private frac: Array<{ x: number; y: number }> = [];
  /** cached stage box in viewport CSS px (refreshed per frame — scroll-safe) */
  private rect = { left: 0, top: 0, w: 0, h: 0 };

  // pointer (device px, GL space)
  private mx = 0;
  private my = 0;
  private smx = 0;
  private smy = 0;
  private energy = 0;
  private focus = -1;

  // loop
  private raf = 0;
  private running = false;
  private lastT = 0;
  private acc = 0;
  private frames = 0;
  private fps = 0;
  private ladder = 0;
  private lastNear = -1;

  /** called when the nearest node under the pointer changes (or -1) */
  onProximity: ((idx: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, reduced = false) {
    this.canvas = canvas;
    this.reduced = reduced;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      this.ok = false;
      return;
    }
    this.gl = gl;
    this.fieldP = program(gl, FIELD_VS, FIELD_FS);
    this.pointP = program(gl, POINT_VS, POINT_FS);
    if (!this.fieldP || !this.pointP) {
      this.ok = false;
      return;
    }
    this.uF = {
      res: gl.getUniformLocation(this.fieldP, 'u_res'),
      time: gl.getUniformLocation(this.fieldP, 'u_time'),
      mouse: gl.getUniformLocation(this.fieldP, 'u_mouse'),
      energy: gl.getUniformLocation(this.fieldP, 'u_energy'),
      nodes: gl.getUniformLocation(this.fieldP, 'u_nodes'),
      nhue: gl.getUniformLocation(this.fieldP, 'u_nhue'),
      nglow: gl.getUniformLocation(this.fieldP, 'u_nglow'),
    };
    this.uPt = { res: gl.getUniformLocation(this.pointP, 'u_res') };
    this.pb = gl.createBuffer();
    this.fb = gl.createBuffer();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    canvas.addEventListener('webglcontextlost', this.onLost);
    document.addEventListener('visibilitychange', this.onVis);
    // scenario v3: sparse dust, not a swarm (declutter — half of v2)
    this.targetN = window.innerWidth < 768 ? 1400 : 3000;
    this.allocate(this.targetN);
    this.resize();
    this.ok = true;
  }

  private onLost = (e: Event) => {
    e.preventDefault();
    this.stop();
    this.canvas.style.display = 'none';
  };

  private onVis = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
    } else if (this.running && !this.reduced) {
      this.lastT = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private allocate(n: number) {
    this.N = Math.max(1, n);
    this.vel = new Float32Array(this.N * 2);
    this.ppacked = new Float32Array(this.N * 6);
    this.clu = new Uint8Array(this.N);
    this.dep = new Float32Array(this.N);
    this.e = new Float32Array(this.N);
    this.bsz = new Float32Array(this.N);
    this.seed();
  }

  private seed() {
    for (let i = 0; i < this.N; i++) {
      const c = i % NODE_N;
      this.clu[i] = c;
      this.dep[i] = 0.35 + Math.random() * 0.65;
      this.ppacked[i * 6] = Math.random() * this.W;
      this.ppacked[i * 6 + 1] = Math.random() * this.H;
      this.vel[i * 2] = (Math.random() - 0.5) * 6;
      this.vel[i * 2 + 1] = (Math.random() - 0.5) * 6;
      this.bsz[i] = 0.9 + Math.random() * 2.2;
    }
  }

  setNodeSource(stage: HTMLElement, fractions: Array<{ x: number; y: number }>, hues: number[]) {
    this.stage = stage;
    this.frac = fractions;
    for (let i = 0; i < NODE_N; i++) this.hues[i] = hues[i] / 360;
  }

  resize() {
    const gl = this.gl;
    if (!gl) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, LADDER_DPR[this.ladder] ?? 1.5);
    // the world is the STAGE, not the viewport (scenario v2: containment)
    const r = this.stage?.getBoundingClientRect();
    const cw = r && r.width > 0 ? r.width : window.innerWidth;
    const ch = r && r.height > 0 ? r.height : window.innerHeight;
    this.rect = { left: r?.left ?? 0, top: r?.top ?? 0, w: cw, h: ch };
    this.W = Math.max(1, Math.round(cw * this.dpr));
    this.H = Math.max(1, Math.round(ch * this.dpr));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    gl.viewport(0, 0, this.W, this.H);
    // park the torch far outside the frame: the map rests dim until the
    // pointer actually enters — entering IS the wake-up (meaningful fx)
    this.mx = this.smx = -1e5;
    this.my = this.smy = -1e5;
  }

  /** pointer → stage-local device px (GL y-up); outside the frame it simply
   *  lands far from everything, so the torch/repeller fade out naturally */
  setMouse(cssX: number, cssY: number) {
    this.mx = (cssX - this.rect.left) * this.dpr;
    this.my = (this.rect.h - (cssY - this.rect.top)) * this.dpr;
  }

  setFocus(i: number | null) {
    this.focus = i ?? -1;
  }

  /** forge a synthesis arc between two discipline nodes (stage-local) */
  forge(a: number, b: number) {
    if (!this.frac.length || !this.stage) return;
    const r = this.stage.getBoundingClientRect();
    if (!r.width) return;
    this.rect = { left: r.left, top: r.top, w: r.width, h: r.height };
    const ax = (this.frac[a].x / 100) * r.width;
    const ay = (this.frac[a].y / 100) * r.height;
    const bx = (this.frac[b].x / 100) * r.width;
    const by = (this.frac[b].y / 100) * r.height;
    const cx = (ax + bx) / 2 + (by - ay) * 0.22;
    const cy = (ay + by) / 2 - Math.abs(bx - ax) * 0.1 - 42;
    for (let i = 0; i < FLOW_N; i++) {
      this.fA[i * 2] = ax; this.fA[i * 2 + 1] = ay;
      this.fB[i * 2] = bx; this.fB[i * 2 + 1] = by;
      this.fC[i * 2] = cx; this.fC[i * 2 + 1] = cy;
      this.fh[i * 2] = this.hues[a]; this.fh[i * 2 + 1] = this.hues[b];
      this.ft[i] = -(i / FLOW_N) * 0.55; // staggered launch
      this.favive[i] = 1;
    }
    this.burst[a] = 1;
    this.burst[b] = 1;
  }

  start() {
    if (!this.ok || this.running) return;
    if (this.reduced) {
      this.updateNodes();
      for (let i = 0; i < NODE_N; i++) this.glows[i] = 0.3;
      this.renderField(9000, 0.25);
      return;
    }
    this.running = true;
    this.lastT = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    document.removeEventListener('visibilitychange', this.onVis);
    const gl = this.gl;
    if (!gl) return;
    gl.deleteProgram(this.fieldP);
    gl.deleteProgram(this.pointP);
    gl.deleteBuffer(this.pb);
    gl.deleteBuffer(this.fb);
    this.gl = null;
  }

  get stats(): NexusStats {
    return { particles: this.N, fps: this.fps, dpr: this.dpr, live: this.running };
  }

  private updateNodes() {
    const r = this.stage?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    this.rect = { left: r.left, top: r.top, w: r.width, h: r.height };
    for (let i = 0; i < NODE_N; i++) {
      const nx = (this.frac[i].x / 100) * r.width;
      const ny = (this.frac[i].y / 100) * r.height;
      this.nodePx[i * 2] = nx;                 // stage-local CSS px
      this.nodePx[i * 2 + 1] = ny;
      this.devNodes[i * 2] = nx * this.dpr;
      this.devNodes[i * 2 + 1] = this.H - ny * this.dpr; // GL y-up, stage-local
    }
  }

  private sim(dt: number) {
    const d = Math.min(dt, 50) / 16.67;
    const t = this.lastT;
    const W = this.W, H = this.H;
    const R = 175 * this.dpr;
    const R2 = R * R;
    const RC = DISTRICT_R * this.dpr; // district radius (device px)
    const eGain = 0.5 + this.energy * 1.7;

    for (let i = 0; i < NODE_N; i++) {
      const target = (this.focus === i ? 1 : 0.22) + this.burst[i] * 0.9;
      this.glows[i] += (target - this.glows[i]) * 0.08 * d;
      this.burst[i] *= Math.pow(0.972, d);
    }

    for (let i = 0; i < this.N; i++) {
      const i2 = i * 2;
      const i6 = i * 6;
      let x = this.ppacked[i6], y = this.ppacked[i6 + 1];
      const c = this.clu[i];
      const dep = this.dep[i];

      // pseudo-curl drift (gentle — the map breathes, it does not boil)
      const a1 =
        Math.sin(x * 0.0016 + t * 0.00023 + c * 1.7) +
        Math.cos(y * 0.0013 - t * 0.00019 + c * 0.9);
      this.vel[i2] += Math.cos(a1 * 3.14) * 0.02 * dep * d;
      this.vel[i2 + 1] += Math.sin(a1 * 3.14) * 0.02 * dep * d;

      // spring home (firm → districts stay distinct)
      this.vel[i2] += (this.devNodes[c * 2] - x) * 0.0016 * dep * d;
      this.vel[i2 + 1] += (this.devNodes[c * 2 + 1] - y) * 0.0016 * dep * d;

      // pointer: repel + swirl + energize (only meaningful inside the frame)
      const dx = x - this.smx, dy = y - this.smy;
      const d2 = dx * dx + dy * dy;
      let eg = 0;
      if (d2 < R2 && d2 > 1) {
        const dist = Math.sqrt(d2);
        const f = 1 - dist / R;
        const push = f * eGain * 1.15 * d;
        const inv = 1 / dist;
        this.vel[i2] += dx * inv * push - dy * inv * push * 0.65;
        this.vel[i2 + 1] += dy * inv * push + dx * inv * push * 0.65;
        eg = f;
      }
      this.e[i] = Math.max(this.e[i] * Math.pow(0.93, d), eg);

      // hard district cap: a hue never leaks into its neighbour's territory
      const ndx = x - this.devNodes[c * 2];
      const ndy = y - this.devNodes[c * 2 + 1];
      const nd2 = ndx * ndx + ndy * ndy;
      if (nd2 > RC * RC && nd2 > 1) {
        const nd = Math.sqrt(nd2);
        const pull = ((nd - RC) / nd) * 0.075 * d;
        this.vel[i2] -= ndx * pull;
        this.vel[i2 + 1] -= ndy * pull;
      }

      // integrate + damp
      this.vel[i2] *= Math.pow(0.94, d);
      this.vel[i2 + 1] *= Math.pow(0.94, d);
      x += this.vel[i2] * d;
      y += this.vel[i2 + 1] * d;

      // wrap (stage-local bounds)
      const m = 30 * this.dpr;
      if (x < -m) x = W + m; else if (x > W + m) x = -m;
      if (y < -m) y = H + m; else if (y > H + m) y = -m;
      this.ppacked[i6] = x;
      this.ppacked[i6 + 1] = y;

      // pack render data — hue stays locked to the district (no rainbow drift)
      const en = this.e[i];
      this.ppacked[i6 + 2] = this.bsz[i] * (1 + en * 1.3) * (0.6 + dep * 0.6) * this.dpr;
      this.ppacked[i6 + 3] = (this.hues[c] + 0.007 * Math.sin(t * 0.001 + i) + en * 0.03 + 1) % 1;
      this.ppacked[i6 + 4] = (0.026 + 0.05 * dep + en * 0.3) * (0.8 + this.energy * 0.4);
    }

    // smooth pointer chase + energy from velocity
    this.smx += (this.mx - this.smx) * 0.16 * d;
    this.smy += (this.my - this.smy) * 0.16 * d;
    const v = Math.hypot(this.mx - this.smx, this.my - this.smy) / (this.dpr * 40);
    this.energy = Math.max(this.energy * Math.pow(0.94, d), Math.min(1, v));
  }

  private simFlow(dt: number) {
    const d = Math.min(dt, 50) / 16.67;
    for (let i = 0; i < FLOW_N; i++) {
      const i6 = i * 6;
      if (!this.favive[i]) {
        this.fpacked[i6 + 4] = 0;
        continue;
      }
      this.ft[i] += 0.011 * d;
      const t = this.ft[i];
      if (t > 1) {
        this.favive[i] = 0;
        this.fpacked[i6 + 4] = 0;
        continue;
      }
      if (t < 0) {
        this.fpacked[i6 + 4] = 0;
        continue;
      }
      const i2 = i * 2;
      const it = 1 - t;
      const wob = Math.sin(t * 22 + i * 2.1) * 4 * this.dpr;
      const bx = it * it * this.fA[i2] + 2 * it * t * this.fC[i2] + t * t * this.fB[i2];
      const by = it * it * this.fA[i2 + 1] + 2 * it * t * this.fC[i2 + 1] + t * t * this.fB[i2 + 1];
      this.fpacked[i6] = bx * this.dpr + wob;
      this.fpacked[i6 + 1] = (this.rect.h - by) * this.dpr + wob;
      this.fpacked[i6 + 2] = (2.2 + Math.sin(i * 12.9) * 1.2) * this.dpr;
      this.fpacked[i6 + 3] = (this.fh[i2] + (this.fh[i2 + 1] - this.fh[i2]) * t + 1) % 1;
      this.fpacked[i6 + 4] = Math.sin(Math.PI * t) * 0.85;
    }
  }

  private renderField(time: number, energy: number) {
    const gl = this.gl;
    if (!gl || !this.fieldP) return;
    gl.useProgram(this.fieldP);
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.uniform2f(this.uF.res, this.W, this.H);
    gl.uniform1f(this.uF.time, time);
    gl.uniform2f(this.uF.mouse, this.smx, this.smy);
    gl.uniform1f(this.uF.energy, energy);
    gl.uniform2fv(this.uF.nodes, this.devNodes);
    gl.uniform1fv(this.uF.nhue, this.hues);
    gl.uniform1fv(this.uF.nglow, this.glows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private renderPoints() {
    const gl = this.gl;
    if (!gl || !this.pointP || !this.pb || !this.fb) return;
    gl.useProgram(this.pointP);
    gl.blendFunc(gl.ONE, gl.ONE); // additive
    gl.uniform2f(this.uPt.res, this.W, this.H);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pb);
    gl.bufferData(gl.ARRAY_BUFFER, this.ppacked, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.drawArrays(gl.POINTS, 0, this.N);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fb);
    gl.bufferData(gl.ARRAY_BUFFER, this.fpacked, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
    gl.drawArrays(gl.POINTS, 0, FLOW_N);
  }

  private tick = (t: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = this.lastT ? t - this.lastT : 16;
    this.lastT = t;
    const t0 = performance.now();

    this.updateNodes();
    this.sim(dt);
    this.simFlow(dt);
    this.renderField(t * 0.001, this.energy);
    this.renderPoints();

    // proximity → callback (nearest node within 90 stage-local CSS px)
    let near = -1;
    let best = 90 * 90;
    const cx = this.mx / this.dpr;
    const cy = this.rect.h - this.my / this.dpr;
    for (let i = 0; i < NODE_N; i++) {
      const dx = cx - this.nodePx[i * 2];
      const dy = cy - this.nodePx[i * 2 + 1];
      const dd = dx * dx + dy * dy;
      if (dd < best) {
        best = dd;
        near = i;
      }
    }
    if (near !== this.lastNear) {
      this.lastNear = near;
      this.onProximity?.(near);
    }

    // parallax vars on the stage (DOM layer follows with per-node depth)
    // clamped: the parked torch (-1e5) must not fling the DOM layer away
    const stage = this.stage;
    if (stage) {
      const nx = Math.max(-0.55, Math.min(0.55, this.smx / this.W - 0.5));
      const ny = Math.max(-0.55, Math.min(0.55, this.smy / this.H - 0.5));
      stage.style.setProperty('--nx-par-x', nx.toFixed(4));
      stage.style.setProperty('--nx-par-y', ny.toFixed(4));
      stage.style.setProperty('--nx-energy', this.energy.toFixed(3));
    }

    // rolling perf window → adaptive quality
    this.acc += performance.now() - t0;
    this.frames++;
    if (this.frames >= 90) {
      const avg = this.acc / this.frames;
      this.fps = Math.round(1000 / Math.max(avg, 4));
      this.acc = 0;
      this.frames = 0;
      if (avg > 22 && this.ladder < 2) {
        this.ladder++;
        this.resize();
        this.targetN = Math.round(this.targetN * 0.7);
        this.allocate(this.targetN);
      }
    }
  };
}
