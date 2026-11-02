'use client';

/**
 * ARTIFACT SCENE — v4.1 «تندیس / The Artifact»
 * Real WebGL (three.js) following the researched award-site recipe:
 *   - ONE focal sculpture made of GPU particles (single draw call,
 *     all motion in the vertex shader — 80k desktop / 34k mobile)
 *   - EIGHT states = morph targets, eased on the GPU:
 *     torus-knot · a²+b²=c² · E=mc² · benzene ring · wave lattice
 *     · torus · rocket silhouette · car silhouette
 *     (formulas/objects are canvas-rendered then pixel-sampled —
 *     the classic "text→particles" technique)
 *   - Flat states (formulas/vehicles) auto-face the camera; volumetric
 *     states free-spin — blending between the two rotation modes
 *   - Pointer raycast → repulsion field inside the vertex shader
 *   - Camera parallax + additive glow (soft sprites instead of heavy
 *     post-processing → fast on mobile, no extra render targets)
 *   - Warm-dark "museum room" canvas — the oryzo/Lusion system
 * Honours prefers-reduced-motion: renders a single still painting and
 * only re-renders when the state changes. WebGL failure → CSS fallback.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── shared state table (imported by ArtifactShowcase) ─────────────── */
export const ARTIFACT_EVENT = 'artifact:state';

export interface ArtifactState {
  id: string;
  en: string;
  fa: string;
  tint: string;
  capEn: string;
  capFa: string;
}

export const ARTIFACT_STATES: ArtifactState[] = [
  { id: 'engineering', en: 'Engineering', fa: 'مهندسی', tint: '#ffb35c',
    capEn: 'Load paths and structures — the knot that holds.',
    capFa: 'مسیر بار و سازه — گره‌ای که نگه می‌دارد.' },
  { id: 'math', en: 'Mathematics', fa: 'ریاضی', tint: '#b48cff',
    capEn: 'Pythagoras, drawn in light — every point a proof.',
    capFa: 'فیثاغورث به خطِ نور — هر نقطه، یک برهان.' },
  { id: 'physics', en: 'Physics', fa: 'فیزیک', tint: '#5fd4c4',
    capEn: 'The most famous equation — mass is frozen energy.',
    capFa: 'معروف‌ترین معادلهٔ جهان — جرم، انرژیِ منجمد است.' },
  { id: 'chemistry', en: 'Chemistry', fa: 'شیمی', tint: '#8ee08a',
    capEn: 'The benzene ring — six carbons in a calm dance.',
    capFa: 'حلقهٔ بنزن — شش کربن در رقصی آرام.' },
  { id: 'digital', en: 'Digital', fa: 'دیجیتال', tint: '#e07df0',
    capEn: 'Bits as fields — a lattice that thinks in waves.',
    capFa: 'بیت‌ها به‌جای میدان — شبکه‌ای که موج‌وار فکر می‌کند.' },
  { id: 'design', en: 'Design', fa: 'طراحی', tint: '#ff8fa3',
    capEn: 'The loop of form and use — closed, endless.',
    capFa: 'حلقهٔ صورت و کاربرد — بسته، بی‌پایان.' },
  { id: 'rocket', en: 'Rocket', fa: 'موشک', tint: '#ffa94d',
    capEn: 'From ground to orbit — engineering that leaps.',
    capFa: 'از زمین تا مدار — مهندسیِ جهش.' },
  { id: 'car', en: 'Car', fa: 'خودرو', tint: '#ff7d6b',
    capEn: 'A body drawn with light — form serving motion.',
    capFa: 'بدنی که با نور ترسیم می‌شود — فرم در خدمت حرکت.' },
];

/* states that must stay readable → camera eases to face them */
const FLAT_STATES = new Set([1, 2, 3, 6, 7]);

/* per-state render fit: point size / alpha / vertical offset
   (text & vehicles bake to thin strokes → smaller, dimmer, sunk lower) */
const STATE_FIT: Array<{ size: number; alpha: number; y: number }> = [
  { size: 0.032, alpha: 0.75, y: 0 },     // knot
  { size: 0.016, alpha: 0.55, y: -1.05 }, // a²+b²=c²
  { size: 0.016, alpha: 0.55, y: -1.05 }, // E = mc²
  { size: 0.02,  alpha: 0.68, y: -0.55 }, // benzene
  { size: 0.032, alpha: 0.75, y: 0 },     // lattice
  { size: 0.032, alpha: 0.75, y: 0 },     // torus
  { size: 0.024, alpha: 0.72, y: -0.4 },  // rocket
  { size: 0.02,  alpha: 0.62, y: -0.9 },  // car
];

/* ── canvas sampling: shapes/text → point cloud ────────────────────── */
function sampleShape(
  n: number,
  w: number,
  h: number,
  targetW: number,
  depth: number,
  viewW: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): Float32Array {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  draw(ctx);

  const img = ctx.getImageData(0, 0, w, h).data;
  const cand: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (img[(y * w + x) * 4] > 110) cand.push(x, y);
    }
  }
  const out = new Float32Array(n * 3);
  if (cand.length < 2) return out;
  // fit: never wider than ~86% of the visible world width
  const worldW = Math.min(targetW, viewW * 0.86);
  const s = worldW / w;
  const m = cand.length / 2;
  for (let i = 0; i < n; i++) {
    const k = (Math.random() * m | 0) * 2;
    out[i * 3] = (cand[k] - w / 2) * s + (Math.random() - 0.5) * 0.015;
    out[i * 3 + 1] = -(cand[k + 1] - h / 2) * s + (Math.random() - 0.5) * 0.015;
    out[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return out;
}

/* ── the eight states, same particle count ─────────────────────────── */
function buildStates(n: number, viewW: number): Float32Array[] {
  const out: Float32Array[] = [];
  const rand = () => Math.random() - 0.5;

  // 0 engineering — torus knot (p2,q3)
  const knot = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 * 3;
    const R = 1.55, r = 0.62;
    knot[i * 3] = (R + r * Math.cos(3 * t)) * Math.cos(2 * t) + rand() * 0.34;
    knot[i * 3 + 1] = (R + r * Math.cos(3 * t)) * Math.sin(2 * t) + rand() * 0.34;
    knot[i * 3 + 2] = r * Math.sin(3 * t) * 1.6 + rand() * 0.34;
  }
  out.push(knot);

  // 1 math — Pythagoras, text→particles
  out.push(sampleShape(n, 1500, 380, 5.2, 0.1, viewW, (ctx) => {
    ctx.font = '700 195px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('a² + b² = c²', 750, 196);
  }));

  // 2 physics — E = mc², serif italic → particles
  out.push(sampleShape(n, 1100, 360, 4.6, 0.1, viewW, (ctx) => {
    ctx.font = 'italic 700 235px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E = mc²', 550, 182);
  }));

  // 3 chemistry — benzene ring diagram + C6H6 (manual subscripts)
  out.push(sampleShape(n, 640, 800, 3.4, 0.12, viewW, (ctx) => {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 30;
    const cx = 320, cy = 300, R = 195;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, 105, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let x = 168;
    ctx.font = '700 150px system-ui, sans-serif';
    ctx.fillText('C', x, 730); x += ctx.measureText('C').width;
    ctx.font = '700 96px system-ui, sans-serif';
    ctx.fillText('6', x, 762); x += ctx.measureText('6').width + 26;
    ctx.font = '700 150px system-ui, sans-serif';
    ctx.fillText('H', x, 730); x += ctx.measureText('H').width;
    ctx.font = '700 96px system-ui, sans-serif';
    ctx.fillText('6', x, 762);
  }));

  // 4 digital — wave lattice
  const lat = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const gx = (i % side) / (side - 1);
    const gz = Math.floor(i / side) / (side - 1);
    const x = (gx - 0.5) * 5.4 + rand() * 0.06;
    const z = (gz - 0.5) * 4.6 + rand() * 0.06;
    lat[i * 3] = x;
    lat[i * 3 + 1] = 0.85 * Math.sin(x * 1.9) * Math.cos(z * 2.2) + rand() * 0.1;
    lat[i * 3 + 2] = z;
  }
  out.push(lat);

  // 5 design — torus
  const tor = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const R = 1.85, r = 0.78;
    tor[i * 3] = (R + r * Math.cos(v)) * Math.cos(u) + rand() * 0.1;
    tor[i * 3 + 1] = r * Math.sin(v) * 1.25 + rand() * 0.1;
    tor[i * 3 + 2] = (R + r * Math.cos(v)) * Math.sin(u) + rand() * 0.1;
  }
  out.push(tor);

  // 6 rocket — BLUEPRINT OUTLINE (fills blur; strokes read)
  out.push(sampleShape(n, 480, 840, 2.9, 0.22, viewW, (ctx) => {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 15;
    ctx.lineJoin = 'round';
    // nose + body outline
    ctx.beginPath();
    ctx.moveTo(168, 600);
    ctx.lineTo(168, 300);
    ctx.quadraticCurveTo(172, 150, 240, 58);
    ctx.quadraticCurveTo(308, 150, 312, 300);
    ctx.lineTo(312, 600);
    ctx.stroke();
    // nozzle
    ctx.beginPath();
    ctx.moveTo(198, 600); ctx.lineTo(206, 648); ctx.lineTo(274, 648); ctx.lineTo(282, 600);
    ctx.stroke();
    // fins
    ctx.beginPath();
    ctx.moveTo(168, 452); ctx.lineTo(86, 618); ctx.lineTo(168, 618);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(312, 452); ctx.lineTo(394, 618); ctx.lineTo(312, 618);
    ctx.stroke();
    // porthole
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.arc(240, 380, 54, 0, Math.PI * 2);
    ctx.stroke();
    // body seams (technical-drawing feel)
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(168, 320); ctx.lineTo(312, 320);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(168, 540); ctx.lineTo(312, 540);
    ctx.stroke();
    // flame outline
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(212, 660);
    ctx.quadraticCurveTo(186, 722, 240, 784);
    ctx.quadraticCurveTo(294, 722, 268, 660);
    ctx.stroke();
  }));

  // 7 car — side-profile coupe silhouette → particles
  out.push(sampleShape(n, 980, 430, 5.8, 0.3, viewW, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(70, 300);
    ctx.lineTo(58, 252);
    ctx.quadraticCurveTo(66, 216, 150, 206);
    ctx.lineTo(300, 196);
    ctx.lineTo(432, 122);
    ctx.quadraticCurveTo(472, 108, 545, 112);
    ctx.lineTo(700, 150);
    ctx.quadraticCurveTo(795, 168, 882, 206);
    ctx.quadraticCurveTo(926, 228, 920, 272);
    ctx.lineTo(906, 300);
    ctx.lineTo(778, 300);
    ctx.arc(700, 300, 78, 0, Math.PI, true);
    ctx.lineTo(358, 300);
    ctx.arc(280, 300, 78, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    // glass (punched)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(330, 192); ctx.lineTo(440, 130); ctx.lineTo(542, 132); ctx.lineTo(548, 190);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(580, 132); ctx.lineTo(662, 142); ctx.lineTo(722, 186); ctx.lineTo(580, 190);
    ctx.closePath();
    ctx.fill();
    // wheels + hubs
    ctx.fillStyle = '#fff';
    for (const wx of [280, 700]) {
      ctx.beginPath();
      ctx.arc(wx, 300, 56, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#000';
    for (const wx of [280, 700]) {
      ctx.beginPath();
      ctx.arc(wx, 300, 21, 0, Math.PI * 2);
      ctx.fill();
    }
  }));

  return out;
}

/* ── shaders ───────────────────────────────────────────────────────── */
const VERT = /* glsl */ `
precision highp float;
attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3;
attribute vec3 aS4; attribute vec3 aS5; attribute vec3 aS6; attribute vec3 aS7;
attribute vec4 aRand; // phase, speed, size, warmth
uniform float uTime;
uniform float uMorph;    // 0..7 continuous
uniform vec3  uPointer;  // world space
uniform float uPointerOn;
uniform float uScale;    // pixel scale for point size
uniform float uSize;
uniform vec3  uTint;
uniform float uTintAmt;
uniform float uWobble;   // 1 volumetric → 0.3 flat (protect thin strokes)
varying float vGlow;
varying vec3  vColor;
varying float vFade;

vec3 pick(float k, vec3 a, vec3 b) { return mix(a, b, clamp(k, 0.0, 1.0)); }

void main() {
  float m = uMorph;
  // chain thresholds: state k is fully reached at uMorph == k
  vec3 p = position;
  p = pick(m,        p, aS1);
  p = pick(m - 1.0,  p, aS2);
  p = pick(m - 2.0,  p, aS3);
  p = pick(m - 3.0,  p, aS4);
  p = pick(m - 4.0,  p, aS5);
  p = pick(m - 5.0,  p, aS6);
  p = pick(m - 6.0,  p, aS7);

  // organic breathing (per-particle phase) — scaled by uWobble so
  // formulas/vehicles keep their strokes crisp
  float ph = aRand.x * 6.2831 + uTime * (0.35 + aRand.y * 0.5);
  p += normalize(p + 0.0001) * sin(ph) * 0.04 * uWobble;
  p.x += sin(ph * 0.7) * 0.025 * uWobble;
  p.y += cos(ph * 0.9) * 0.025 * uWobble;

  vec4 wp = modelMatrix * vec4(p, 1.0);

  // pointer repulsion (world space)
  vec3 d = wp.xyz - uPointer;
  float dist = length(d);
  float force = smoothstep(1.15, 0.0, dist) * uPointerOn;
  wp.xyz += (d / max(dist, 0.001)) * force * 0.5;
  wp.z += force * 0.25;

  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.45 + aRand.z * 1.1) * (1.0 + force * 1.7);
  gl_PointSize = size * (uScale / -mv.z);

  // colour: warm gold base, cream sparks, tinted by active state
  vec3 gold  = vec3(0.92, 0.64, 0.28);
  vec3 cream = vec3(1.0, 0.95, 0.82);
  vColor = mix(gold, cream, aRand.w * 0.55);
  vColor = mix(vColor, uTint, uTintAmt * (0.30 + 0.70 * aRand.w));
  vGlow = force;
  vFade = smoothstep(-9.0, -3.5, mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying float vGlow;
varying vec3  vColor;
varying float vFade;
uniform float uAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = pow(1.0 - d * 2.0, 2.2);
  vec3 col = vColor + vGlow * vec3(0.55, 0.42, 0.22);
  gl_FragColor = vec4(col, a * uAlpha * vFade);
}
`;

/* ── component ─────────────────────────────────────────────────────── */
export function ArtifactScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cleanup: (() => void) | undefined;

    try {
      cleanup = initScene(host);
    } catch {
      // WebGL unavailable → CSS gradient fallback (content stays readable)
      host.textContent = '';
      const fb = document.createElement('div');
      fb.setAttribute('aria-hidden', 'true');
      fb.style.cssText =
        'position:absolute;inset:0;background:' +
        'radial-gradient(60% 55% at 50% 46%, rgba(240,192,112,0.20), transparent 70%),' +
        'radial-gradient(85% 80% at 50% 50%, #171310, #0c0a08 78%)';
      host.appendChild(fb);
    }
    return () => { cleanup?.(); };
  }, []);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}

function initScene(host: HTMLDivElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const COUNT = mobile ? 34000 : 80000;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.8);
  renderer.setPixelRatio(dpr);
  host.appendChild(renderer.domElement);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0.15, 7.4);

  const resize = () => {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uScale.value = (h * dpr) * 0.5 / Math.tan((camera.fov * Math.PI) / 360);
  };

  /* geometry — eight states + per-particle randomness */
  const geo = new THREE.BufferGeometry();
  const viewW0 = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * Math.max(host.clientWidth / Math.max(1, host.clientHeight), 0.4);
  const states = buildStates(COUNT, viewW0);
  const rand = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    rand[i * 4] = Math.random();
    rand[i * 4 + 1] = Math.random();
    rand[i * 4 + 2] = Math.random();
    rand[i * 4 + 3] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(states[0], 3));
  geo.setAttribute('aS1', new THREE.BufferAttribute(states[1], 3));
  geo.setAttribute('aS2', new THREE.BufferAttribute(states[2], 3));
  geo.setAttribute('aS3', new THREE.BufferAttribute(states[3], 3));
  geo.setAttribute('aS4', new THREE.BufferAttribute(states[4], 3));
  geo.setAttribute('aS5', new THREE.BufferAttribute(states[5], 3));
  geo.setAttribute('aS6', new THREE.BufferAttribute(states[6], 3));
  geo.setAttribute('aS7', new THREE.BufferAttribute(states[7], 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));

  /* material */
  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uPointer: { value: new THREE.Vector3(99, 99, 0) },
    uPointerOn: { value: 0 },
    uScale: { value: 1 },
    uSize: { value: STATE_FIT[0].size },
    uAlpha: { value: STATE_FIT[0].alpha },
    uTint: { value: new THREE.Color(ARTIFACT_STATES[0].tint) },
    uTintAmt: { value: 0.6 },
    uWobble: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  /* halo sprites — cheap bloom */
  const haloTex = makeHaloTexture();
  const halos: THREE.Sprite[] = [];
  for (const [scale, opacity] of [[7.5, 0.16], [4.6, 0.22]] as const) {
    const m = new THREE.SpriteMaterial({
      map: haloTex, transparent: true, opacity, depthWrite: false,
      blending: THREE.AdditiveBlending, color: new THREE.Color(ARTIFACT_STATES[0].tint),
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    s.position.z = -1.4;
    group.add(s);
    halos.push(s);
  }

  /* far dust — depth cue */
  const dustN = 340;
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 16;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
    dustPos[i * 3 + 2] = -2 - Math.random() * 7;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xd9c9a6, size: 0.035, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  scene.add(dust);

  /* sizing */
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  /* pointer — raycast to z=0 plane + camera parallax */
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ndc = new THREE.Vector2(99, 99);
  let px = 0, py = 0;         // smoothed NDC for parallax
  let pointerActive = 0;
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerActive = 1;
  };
  const onLeave = () => { pointerActive = 0; };
  if (!reduced) {
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
  }

  /* state switching via event (fired by ArtifactShowcase chips) */
  let targetMorph = 0;
  let flatBlend = 0; // 1 = camera-facing (formulas/vehicles), 0 = free spin
  let sizeT = STATE_FIT[0].size;
  let alphaT = STATE_FIT[0].alpha;
  let yT = STATE_FIT[0].y;
  const setState = (e: Event) => {
    const idx = (e as CustomEvent<number>).detail ?? 0;
    const i = Math.max(0, Math.min(ARTIFACT_STATES.length - 1, idx));
    targetMorph = i;
    sizeT = STATE_FIT[i].size;
    alphaT = STATE_FIT[i].alpha;
    yT = STATE_FIT[i].y;
    const tint = new THREE.Color(ARTIFACT_STATES[i].tint);
    (halos[0].material as THREE.SpriteMaterial).color.copy(tint);
    (halos[1].material as THREE.SpriteMaterial).color.copy(tint);
    (uniforms.uTint.value as THREE.Color).copy(tint);
    if (reduced) {
      uniforms.uSize.value = sizeT;
      uniforms.uAlpha.value = alphaT;
      group.position.y = yT;
      renderStill();
    }
  };
  window.addEventListener(ARTIFACT_EVENT, setState);

  /* visibility pause */
  let visible = true;
  const io = new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; }, { threshold: 0.02 });
  io.observe(host);
  const onVis = () => { visible = !document.hidden; };
  document.addEventListener('visibilitychange', onVis);

  /* loop */
  const hit = new THREE.Vector3();
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  let spinY = 0.5;

  const renderStill = () => {
    uniforms.uTime.value = 4.2;
    uniforms.uMorph.value = targetMorph;
    group.rotation.y = FLAT_STATES.has(targetMorph) ? 0.1 : 0.5;
    group.rotation.x = FLAT_STATES.has(targetMorph) ? 0.03 : 0.12;
    renderer.render(scene, camera);
  };

  const tick = () => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.25); // generous clamp: low-fps machines still ease in near-real-time
    const t = clock.elapsedTime;

    // ease morph + tint + per-state fit (size/alpha/y)
    uniforms.uMorph.value += (targetMorph - uniforms.uMorph.value) * Math.min(1, dt * 3.0);
    const near = Math.abs(targetMorph - uniforms.uMorph.value) < 0.02 ? 0.72 : 0.85;
    uniforms.uTintAmt.value += (near - uniforms.uTintAmt.value) * Math.min(1, dt * 2.0);
    uniforms.uSize.value += (sizeT * (mobile ? 1.5 : 1) - uniforms.uSize.value) * Math.min(1, dt * 3.0);
    uniforms.uAlpha.value += (alphaT - uniforms.uAlpha.value) * Math.min(1, dt * 3.0);
    group.position.y += (yT - group.position.y) * Math.min(1, dt * 2.4);

    // rotation: volumetric states free-spin, flat states UNWIND to face-on
    const flatTarget = FLAT_STATES.has(targetMorph) ? 1 : 0;
    flatBlend += (flatTarget - flatBlend) * Math.min(1, dt * 1.6);
    if (flatTarget === 1) {
      const zero = Math.round(spinY / (Math.PI * 2)) * Math.PI * 2;
      spinY += (zero - spinY) * Math.min(1, dt * 1.8);
    } else {
      spinY += dt * 0.14;
    }
    uniforms.uWobble.value = 1 - flatBlend * 0.7;
    group.rotation.y = spinY + Math.sin(t * 0.16) * 0.1 * flatBlend;
    group.rotation.x = Math.sin(t * 0.18) * 0.1 * (1 - flatBlend * 0.75) + 0.03 * flatBlend;

    // pointer → world
    if (pointerActive) {
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        (uniforms.uPointer.value as THREE.Vector3).lerp(hit, Math.min(1, dt * 9));
      }
    }
    uniforms.uPointerOn.value += ((pointerActive ? 1 : 0) - uniforms.uPointerOn.value) * Math.min(1, dt * 4);

    // camera parallax
    px += (ndc.x * (ndc.x < 50 ? 1 : 0) - px) * Math.min(1, dt * 2.2);
    py += (ndc.y * (ndc.y < 50 ? 1 : 0) - py) * Math.min(1, dt * 2.2);
    camera.position.x += (px * 0.62 - camera.position.x) * Math.min(1, dt * 2.2);
    camera.position.y += (0.15 + py * 0.4 - camera.position.y) * Math.min(1, dt * 2.2);
    camera.lookAt(0, 0, 0);

    dust.rotation.y -= dt * 0.008;
    halos.forEach((s, i) => {
      const m = s.material as THREE.SpriteMaterial;
      m.opacity = (i === 0 ? 0.14 : 0.2) + Math.sin(t * (0.5 + i * 0.23)) * 0.05;
    });

    uniforms.uTime.value = t;
    renderer.render(scene, camera);
  };

  if (reduced) {
    renderStill();
  } else {
    clock.start();
    raf = requestAnimationFrame(tick);
  }


  /* cleanup */
  return () => {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener(ARTIFACT_EVENT, setState);
    document.removeEventListener('visibilitychange', onVis);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    geo.dispose();
    dustGeo.dispose();
    mat.dispose();
    (dust.material as THREE.Material).dispose();
    haloTex.dispose();
    halos.forEach((s) => (s.material as THREE.Material).dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}

/* soft radial sprite texture (glow without post-processing) */
function makeHaloTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
