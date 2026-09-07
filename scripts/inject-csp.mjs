#!/usr/bin/env node
/**
 * Build-time CSP injector — the ISR/static replacement for the old
 * per-request nonce middleware.
 *
 * WHY: every public page is now static/ISR. A per-request CSP nonce can
 * never match a cached HTML body, so the strict CSP moved from a response
 * header to a <meta> tag baked into the HTML at build time. This script:
 *
 *   1. walks every ".html" file under .next/server/app (all prerendered pages)
 *   2. hashes every inline <script> body (boot script, Next flight data,
 *      JSON-LD blocks — each is identical across visitors for a given build)
 *   3. injects <meta http-equiv="Content-Security-Policy"> right after
 *      <head> with: script-src 'self' <hashes> — foreign and inline-injected
 *      scripts are blocked, same-origin chunks and the hashed inlines run.
 *
 * Idempotent: a previously injected meta (marked data-build-csp) is
 * replaced, not duplicated. Run AFTER `next build`, BEFORE packaging
 * (standalone copy on cPanel / Vercel's output packaging).
 *
 * If no HTML files are found (e.g. unexpected Next output change) the
 * script exits 0 WITHOUT injecting — pages then run with the static
 * security headers from next.config only (functional, less strict) and the
 * build never breaks because of this hardening layer.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// .next/server/app        → Next's own prerender output
// .next/standalone/.next/server/app → the traced copy `output: 'standalone'`
//   makes DURING build (cPanel flow) — it must be patched too, otherwise the
//   deployed artifact serves un-injected HTML
const ROOTS = [
  join(process.cwd(), '.next', 'server', 'app'),
  join(process.cwd(), '.next', 'standalone', '.next', 'server', 'app'),
];
const MARKER = 'data-build-csp';

function walkHtml(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = [...new Set(ROOTS.flatMap((root) => walkHtml(root)))];
if (files.length === 0) {
  console.log('[inject-csp] no prerendered HTML found — nothing to do');
  process.exit(0);
}

const hashes = new Set();
const INLINE_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = INLINE_RE.exec(html)) !== null) {
    const body = m[1];
    if (!body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const meta = `<meta http-equiv="Content-Security-Policy" ${MARKER} content="${csp.replace(/"/g, '&quot;')}">`;

let injected = 0;
for (const file of files) {
  let html = readFileSync(file, 'utf8');
  // replace a previous injection (idempotent across rebuilds in place)
  const prev = new RegExp(`<meta http-equiv="Content-Security-Policy" ${MARKER}[^>]*>`);
  if (prev.test(html)) html = html.replace(prev, meta);
  else if (html.includes('<head>')) html = html.replace('<head>', `<head>${meta}`);
  else continue; // no head — skip file rather than corrupt it
  // packaging experiment marker: does a post-build mutation of .html files
  // reach the served deployment at all, or does Vercel re-generate them?
  html = html.replace('</html>', `<!--postbuild-mutation ${Date.now()}--></html>`);
  writeFileSync(file, html);
  injected++;
}

// ── CSP delivery layer ────────────────────────────────────────────────
// Self-hosted (standalone): the patched .html files ARE what the server
// serves, so the <meta> works there.
// Vercel: its packager does NOT take post-build mutations of
// .next/server/app/*.html (verified 2026-09-07 — an HTML-comment marker
// injected post-build never reached the served deployment), so the SAME
// policy is additionally attached as a response header by appending to
// .next/routes-manifest.json, which Vercel's packager DOES consume.
try {
  const manifestPath = join(process.cwd(), '.next', 'routes-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.headers = manifest.headers || [];
  if (!manifest.headers.some((h) => h.headerKey === 'x-build-csp')) {
    manifest.headers.push({
      source: '/:path*',
      headerKey: 'x-build-csp',
      headers: [{ key: 'Content-Security-Policy', value: csp }],
    });
    writeFileSync(manifestPath, JSON.stringify(manifest));
    console.log('[inject-csp] CSP header appended to routes-manifest.json');
  }
} catch (e) {
  console.warn('[inject-csp] routes-manifest CSP append skipped:', String(e).slice(0, 120));
}

console.log(`[inject-csp] ${hashes.size} unique inline-script hashes → CSP meta injected into ${injected}/${files.length} pages`);
if (hashes.size === 0) console.warn('[inject-csp] WARNING: no inline scripts found — CSP meta allows self scripts only');

// build probe (temporary, 2026-09-07): observable evidence of WHAT the
// Vercel build environment looked like when postbuild ran — fetched at
// /build-info.json. Remove once the CSP wiring is confirmed.
const probe = {
  at: new Date().toISOString(),
  cwd: process.cwd(),
  vercel: Boolean(process.env.VERCEL),
  candidates: ['.next/server/app', '.next/standalone/.next/server/app'].map((p) => ({
    path: p,
    exists: existsSync(join(process.cwd(), p)),
    htmlFiles: (() => {
      try {
        let n = 0;
        const walk = (d) => {
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const fp = join(d, e.name);
            if (e.isDirectory()) walk(fp);
            else if (e.name.endsWith('.html')) n++;
          }
        };
        walk(join(process.cwd(), p));
        return n;
      } catch {
        return -1;
      }
    })(),
  })),
};
try {
  writeFileSync('public/build-info.json', JSON.stringify(probe, null, 2));
  console.log('[inject-csp] probe written to public/build-info.json');
} catch (e) {
  console.warn('[inject-csp] probe write failed:', String(e).slice(0, 120));
}
