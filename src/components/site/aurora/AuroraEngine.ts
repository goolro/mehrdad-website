/**
 * AURORA ENGINE — scenario v4 «شفق / Sky of Possibility» (raw WebGL2, zero deps).
 *
 * Owner verdict on v3 (the technical contour map): correct but cold —
 * «اصلا خوب نیست». So the scenario changes, not the tuning: the field is no
 * longer a map, it is a NIGHT SKY.
 *
 *   PASS 1  SKY    fullscreen fragment: deep night gradient, three aurora
 *           curtains (violet → fuchsia, amber whisper on top) drawn with fbm
 *           warping — soft body, bright lower rim, vertical striations — a
 *           starfield with slow twinkle, a horizon glow, vignette, and
 *           dithering (kills gradient banding on cheap panels).
 *   PASS 2  DUST   gl.POINTS, additive gaussian bokeh (~640 desktop / ~320
 *           mobile), drifting up like embers; the pointer gives them a very
 *           soft push (the sky notices you, it never fights you).
 *
 * The pointer also drives u_par (parallax) — curtains, stars and the DOM
 * constellation each shift by their own depth. Energy (pointer speed)
 * gently brightens the sky. prefers-reduced-motion → one static painting.
 *
 * Lifecycle: IntersectionObserver outside decides start()/stop(); tab-hide
 * stops the loop; DPR ladder 1.5→1.25→1.0 on a 90-frame perf window.
 * The world is CONTAINED to its stage (stage-local coordinates, scroll-safe).
 */

const DUST_N_CAP = 700;
const LADDER_DPR = [1.5, 1.25, 1.0];

const SKY_VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const SKY_FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_par;      // smoothed pointer, -1..1
uniform float u_energy;  // 0..1 pointer-motion energy
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
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = r * p * 2.03 + 7.7; a *= 0.55; }
  return v;
}
vec3 hue2rgb(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_res;
  float t = u_time;

  /* ── deep night base: vertical violet-night gradient + three soft glows ── */
  vec3 col = mix(vec3(0.012, 0.012, 0.024), vec3(0.032, 0.019, 0.058), uv.y * 0.85 + 0.10);
  col += vec3(0.055, 0.034, 0.090) * exp(-length(uv - vec2(0.50, 1.08)) * 2.2);
  col += vec3(0.024, 0.014, 0.044) * exp(-length(uv - vec2(0.16, -0.12)) * 2.6);
  col += vec3(0.030, 0.018, 0.052) * exp(-length(uv - vec2(0.55, -0.28)) * 3.2);

  /* ── starfield: sparse hash sparkles, slow twinkle, fade near bottom ── */
  vec2 cell = floor(px / 2.0);
  float sh = hash(cell);
  if (sh > 0.996) {
    float tw = 0.5 + 0.5 * sin(t * (0.5 + sh * 2.2) + sh * 43.0);
    col += vec3(0.87, 0.89, 1.0) * tw * 0.42 * smoothstep(0.02, 0.35, uv.y);
  }

  /* ── aurora: three curtains — violet→fuchsia body, amber whisper on top.
     Big slow folds (low freq, high amp) so they drape, not stripe ── */
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float seed = fi * 1.73 + 0.31;
    float baseY = mix(0.70, 0.40, fi * 0.5);
    float amp = 0.24 + fi * 0.06;
    float freq = 0.9 + fi * 0.45;
    float x = uv.x * (1.0 + freq * 0.35) + u_par.x * 0.014 * (1.0 + fi * 0.4);
    float warp = fbm(vec2(x * freq + seed * 13.1, t * 0.042 + seed * 7.7));
    float center = baseY + (warp - 0.5) * amp + 0.016 * sin(t * 0.10 + seed * 5.0);
    float d = uv.y - center;
    float body = exp(-max(d, 0.0) * 5.4) * smoothstep(-0.045, 0.014, d);
    float rim = exp(-abs(d) * 38.0) * 0.9;
    float str = 0.6 + 0.4 * fbm(vec2(uv.x * 21.0 + seed * 31.0 + u_par.x * 0.02, t * 0.055));
    float inten = (body * 0.46 + rim * 0.26) * str * (0.74 + 0.26 * sin(t * 0.05 + seed * 9.0));
    float hue = mix(0.70, 0.90, clamp(uv.x * 0.9 + (warp - 0.5) * 0.5, 0.0, 1.0));
    vec3 c = hue2rgb(hue);
    if (i == 2) c = mix(c, vec3(1.0, 0.80, 0.45), 0.5);
    col += c * inten * (0.9 + u_energy * 0.35) * mix(1.0, 0.6, fi * 0.5);
  }

  /* ── vignette (gentler — do not crush the lower sky) + dithering ── */
  float vg = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(u_res.x / u_res.y, 1.0)));
  col *= mix(0.80, 1.0, vg);
  col += (hash(px + fract(t)) - 0.5) * (1.8 / 255.0);

  frag = vec4(col, 1.0);
}`;

const DUST_VS = `#version 300 es
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

const DUST_FS = `#version 300 es
precision mediump float;
in float v_hue;
in float v_alpha;
out vec4 frag;
vec3 hue2rgb(float h) {
  return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = exp(-dot(d, d) * 7.0) * v_alpha;
  if (a < 0.004) discard;
  frag = vec4(hue2rgb(v_hue) * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[aurora] shader:', gl.getShaderInfoLog(sh));
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
    console.error('[aurora] link:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export interface AuroraStats {
  dust: number;
  fps: number;
  dpr: number;
  live: boolean;
}

export class AuroraEngine {
  readonly ok: boolean;
  reduced: boolean;

  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private skyP: WebGLProgram | null = null;
  private dustP: WebGLProgram | null = null;
  private uS: Record<string, WebGLUniformLocation | null> = {};
  private uD: Record<string, WebGLUniformLocation | null> = {};
  private pb: WebGLBuffer | null = null;

  private dpr = 1;
  private W = 1;
  private H = 1;
  private ladder = 0;

  // ember dust — packed [x, y, size, hue, alpha, 0]
  private N = 1;
  private packed: Float32Array = new Float32Array(0);
  private vy: Float32Array = new Float32Array(0);
  private ph: Float32Array = new Float32Array(0);
  private bA: Float32Array = new Float32Array(0);
  private bsz: Float32Array = new Float32Array(0);
  private bhue: Float32Array = new Float32Array(0);

  // pointer (device px, GL space) + parallax smoothing
  private mx = 0;
  private my = 0;
  private smx = 0;
  private smy = 0;
  private parX = 0;
  private parY = 0;
  private energy = 0;

  // loop
  private raf = 0;
  private running = false;
  private lastT = 0;
  private acc = 0;
  private frames = 0;
  private fps = 0;

  private stage: HTMLElement | null = null;
  private rect = { left: 0, top: 0, w: 0, h: 0 };

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
    this.skyP = program(gl, SKY_VS, SKY_FS);
    this.dustP = program(gl, DUST_VS, DUST_FS);
    if (!this.skyP || !this.dustP) {
      this.ok = false;
      return;
    }
    this.uS = {
      res: gl.getUniformLocation(this.skyP, 'u_res'),
      time: gl.getUniformLocation(this.skyP, 'u_time'),
      par: gl.getUniformLocation(this.skyP, 'u_par'),
      energy: gl.getUniformLocation(this.skyP, 'u_energy'),
    };
    this.uD = { res: gl.getUniformLocation(this.dustP, 'u_res') };
    this.pb = gl.createBuffer();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    canvas.addEventListener('webglcontextlost', this.onLost);
    document.addEventListener('visibilitychange', this.onVis);
    this.N = window.innerWidth < 768 ? 320 : 640;
    this.allocate();
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

  private allocate() {
    this.packed = new Float32Array(this.N * 6);
    this.vy = new Float32Array(this.N);
    this.ph = new Float32Array(this.N);
    this.bA = new Float32Array(this.N);
    this.bsz = new Float32Array(this.N);
    this.bhue = new Float32Array(this.N);
    // ember palette: violet 45% · fuchsia 35% · warm gold 20% — one sky, one story
    for (let i = 0; i < this.N; i++) {
      const r = Math.random();
      this.bhue[i] = r < 0.45 ? 0.735 : r < 0.8 ? 0.875 : 0.115;
      this.bsz[i] = 3 + Math.random() * 8;
      this.bA[i] = 0.024 + Math.random() * 0.05;
      this.vy[i] = 4 + Math.random() * 10; // px/s upward
      this.ph[i] = Math.random() * Math.PI * 2;
    }
  }

  /** the world is the STAGE (contained), refreshed per frame — scroll-safe */
  setStage(stage: HTMLElement) {
    this.stage = stage;
  }

  resize() {
    const gl = this.gl;
    if (!gl) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, LADDER_DPR[this.ladder] ?? 1.5);
    const r = this.stage?.getBoundingClientRect();
    const cw = r && r.width > 0 ? r.width : window.innerWidth;
    const ch = r && r.height > 0 ? r.height : window.innerHeight;
    this.rect = { left: r?.left ?? 0, top: r?.top ?? 0, w: cw, h: ch };
    this.W = Math.max(1, Math.round(cw * this.dpr));
    this.H = Math.max(1, Math.round(ch * this.dpr));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    gl.viewport(0, 0, this.W, this.H);
    this.mx = this.smx = -1e5;
    this.my = this.smy = -1e5;
  }

  setMouse(cssX: number, cssY: number) {
    this.mx = (cssX - this.rect.left) * this.dpr;
    this.my = (this.rect.h - (cssY - this.rect.top)) * this.dpr;
  }

  start() {
    if (!this.ok || this.running) return;
    if (this.reduced) {
      this.paint(8.4, 0, 0, 0);
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
    gl.deleteProgram(this.skyP);
    gl.deleteProgram(this.dustP);
    gl.deleteBuffer(this.pb);
    this.gl = null;
  }

  get stats(): AuroraStats {
    return { dust: this.N, fps: this.fps, dpr: this.dpr, live: this.running };
  }

  private simDust(dt: number) {
    const d = Math.min(dt, 50) / 16.67;
    const W = this.W;
    const H = this.H;
    const R = 130 * this.dpr;
    const R2 = R * R;
    for (let i = 0; i < this.N; i++) {
      const i6 = i * 6;
      let x = this.packed[i6];
      let y = this.packed[i6 + 1];
      // lazy init below the frame on first frames (packed starts at 0)
      if (y === 0 && this.vy[i] > 0 && x === 0) {
        x = Math.random() * W;
        y = Math.random() * H;
      }
      // rise + sway
      y += this.vy[i] * this.dpr * 0.016 * d;
      x += Math.sin(this.ph[i] + y * 0.004 / this.dpr) * 0.14 * this.dpr * d;
      // pointer: a whisper of push — the sky never fights
      const dx = x - this.smx;
      const dy = y - this.smy;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2 && d2 > 1) {
        const dist = Math.sqrt(d2);
        const f = (1 - dist / R) * 0.32 * d;
        x += (dx / dist) * f;
        y += (dy / dist) * f;
      }
      // wrap
      const m = 20 * this.dpr;
      if (y > H + m) y = -m;
      if (x < -m) x = W + m;
      else if (x > W + m) x = -m;
      this.packed[i6] = x;
      this.packed[i6 + 1] = y;
      this.packed[i6 + 2] = this.bsz[i] * this.dpr;
      this.packed[i6 + 3] = this.bhue[i];
      this.packed[i6 + 4] = this.bA[i] * (1 + this.energy * 0.8);
    }
    // smooth pointer + energy
    if (this.mx > -1e4) {
      this.smx += (this.mx - this.smx) * 0.14 * d;
      this.smy += (this.my - this.smy) * 0.14 * d;
    }
    const v = this.mx > -1e4 ? Math.hypot(this.mx - this.smx, this.my - this.smy) / (this.dpr * 46) : 0;
    this.energy = Math.max(this.energy * Math.pow(0.95, d), Math.min(1, v));
    this.parX += (((this.smx > -1e4 ? this.smx / this.W - 0.5 : 0)) - this.parX) * 0.05 * d;
    this.parY += (((this.smy > -1e4 ? this.smy / this.H - 0.5 : 0)) - this.parY) * 0.05 * d;
  }

  private paint(time: number, parX: number, parY: number, energy: number) {
    const gl = this.gl;
    if (!gl || !this.skyP) return;
    gl.disable(gl.BLEND);
    gl.useProgram(this.skyP);
    gl.uniform2f(this.uS.res, this.W, this.H);
    gl.uniform1f(this.uS.time, time);
    gl.uniform2f(this.uS.par, parX, parY);
    gl.uniform1f(this.uS.energy, energy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!this.dustP || !this.pb) return;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.dustP);
    gl.uniform2f(this.uD.res, this.W, this.H);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pb);
    gl.bufferData(gl.ARRAY_BUFFER, this.packed, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.drawArrays(gl.POINTS, 0, this.N);
  }

  private tick = (t: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = this.lastT ? t - this.lastT : 16;
    this.lastT = t;
    const t0 = performance.now();

    this.simDust(dt);
    this.paint(t * 0.001, this.parX, this.parY, this.energy);

    // parallax vars for the DOM constellation (per-star depth)
    const stage = this.stage;
    if (stage) {
      stage.style.setProperty('--au-par-x', this.parX.toFixed(4));
      stage.style.setProperty('--au-par-y', this.parY.toFixed(4));
    }

    // perf window → DPR ladder
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
      }
    }
  };
}
