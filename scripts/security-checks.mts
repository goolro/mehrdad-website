// ═══════════════════════════════════════════════════════════════════════
// Security regression harness for mehrdad.ir — the executable form of
// docs/SECURITY_REVIEW_2026-09-05-round3.md.
//
//   node --experimental-strip-types scripts/security-checks.mts
//
// It imports and EXECUTES the shipped modules (src/proxy.ts, src/lib/admin.ts,
// src/lib/admin-session.ts, src/lib/rate-limit.ts, src/lib/sanitize.ts and the
// two admin post route handlers) with real NextRequest objects. Nothing here
// re-implements application logic; the only stubs are process.env and the
// Prisma data layer (src/lib/db.ts), which the loader replaces with plain
// objects so the route handlers can be driven without a database.
//
// Complements scripts/pentest-local.sh / pentest-round2.sh, which are
// black-box HTTP suites and need a running instance + database.
// ═══════════════════════════════════════════════════════════════════════
import { register } from 'node:module';
import { createHash, createHmac } from 'node:crypto';
register('./security-checks-loader.mjs', import.meta.url);

process.env.NODE_ENV = 'production';
process.env.ADMIN_PASSWORD = 'audit-local-secret';
delete process.env.SITE_ORIGIN;

const { NextRequest } = await import('next/server');
const { proxy } = await import('@/proxy');
const { originAllowed, safeEqual, adminAuthAvailable, checkAdmin } = await import('@/lib/admin');
const {
  createAdminSessionToken, verifyAdminSessionToken, revokeAdminSessionToken,
  revokedSessionCount, ADMIN_COOKIE,
} = await import('@/lib/admin-session');
const { clientIp, bodyTooLarge, readJsonBody, rateLimit } = await import('@/lib/rate-limit');
const { sanitizePostHtml, sanitizePlainText } = await import('@/lib/sanitize');
const redirects = (await import('@/lib/wp-redirects.json')).default;

let pass = 0;
let fail = 0;
const out: string[] = [];
function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; out.push(`  [PASS] ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail++; out.push(`  [FAIL] ${name}${detail ? ` — ${detail}` : ''}`); }
}
function section(t: string) { out.push(`\n═══ ${t} ═══`); }
const req = (url: string, headers: Record<string, string> = {}, method = 'GET', body?: string) =>
  new NextRequest(new URL(url), { headers, method, body });
const json = (r: Response) => r.json() as Promise<any>;

// ── 1. Content-Security-Policy ─────────────────────────────────────────
section('1. Content-Security-Policy (src/proxy.ts)');
const nonceOf = (c: string) => (c.match(/nonce-([^']+)/) || [])[1] || '';
const r1 = proxy(req('https://mehrdad.ir/'));
const csp = r1.headers.get('content-security-policy') || '';
const nonce = nonceOf(csp);
check('CSP header present on document routes', csp.length > 0);
const scriptSrc = csp.split(';').map((s) => s.trim()).find((s) => s.startsWith('script-src')) || '';
check("script-src = nonce + strict-dynamic, no 'unsafe-inline'",
  /nonce-/.test(scriptSrc) && /strict-dynamic/.test(scriptSrc) && !/unsafe-inline/.test(scriptSrc), scriptSrc);
check('frame-ancestors none', /frame-ancestors 'none'/.test(csp));
check('connect-src restricted to self', /connect-src 'self'/.test(csp));
check('object-src none + base-uri self + form-action self',
  /object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /form-action 'self'/.test(csp));
check('upgrade-insecure-requests present', /upgrade-insecure-requests/.test(csp));
check('nonce is unique per request', nonce.length > 10 && nonce !== nonceOf(proxy(req('https://mehrdad.ir/')).headers.get('content-security-policy') || ''));
check('nonce is published to the app on the request headers (layout.tsx reads x-nonce)',
  (r1.headers.get('x-middleware-request-x-nonce') || '') === nonce);
check("dev-only 'unsafe-eval' is absent in production", !/unsafe-eval/.test(csp));

// ── 2. Legacy redirects / Host header ──────────────────────────────────
section('2. SEO 301 redirects / Host handling (src/proxy.ts)');
const legacy = Object.keys(redirects.paths)[0];
const locNo = proxy(req(`https://attacker.tld${legacy}`, { host: 'attacker.tld' })).headers.get('location') || '';
check('without SITE_ORIGIN the Location follows the request Host (why SITE_ORIGIN is mandatory)',
  locNo.startsWith('https://attacker.tld/'), `Location: ${locNo}`);
process.env.SITE_ORIGIN = 'https://mehrdad.ir';
const locAnchored = proxy(req(`https://attacker.tld${legacy}`, { host: 'attacker.tld' })).headers.get('location') || '';
check('with SITE_ORIGIN the 301 is anchored to the configured origin',
  locAnchored.startsWith('https://mehrdad.ir/'), `Location: ${locAnchored}`);
check('redirect status is 301 (permanent)', proxy(req(`https://mehrdad.ir${legacy}`)).status === 301);
for (const route of ['/blog', '/work', '/services', '/fde', '/about', '/contact', '/admin']) {
  check(`real route ${route} is never shadowed by the legacy map`, proxy(req(`https://mehrdad.ir${route}`)).status === 200);
}
check('unknown path is not redirected', proxy(req('https://mehrdad.ir/definitely-not-a-page')).status === 200);
delete process.env.SITE_ORIGIN;

// ── 3. CSRF / Origin ───────────────────────────────────────────────────
section('3. CSRF Origin check (src/lib/admin.ts)');
const originCases: Array<[string, Record<string, string>, boolean, string]> = [
  ['same-origin browser request', { origin: 'https://mehrdad.ir', host: 'mehrdad.ir' }, true, ''],
  ['cross-site attacker page', { origin: 'https://evil.tld', host: 'mehrdad.ir' }, false, ''],
  ['no Origin header (curl / same-origin GET)', { host: 'mehrdad.ir' }, true, ''],
  ['Origin: null (sandboxed iframe)', { origin: 'null', host: 'mehrdad.ir' }, false, ''],
  ['spoofed x-forwarded-host alongside a real Host', { origin: 'https://evil.tld', host: 'mehrdad.ir', 'x-forwarded-host': 'evil.tld' }, false, ''],
  ['Origin subdomain', { origin: 'https://sub.mehrdad.ir', host: 'mehrdad.ir' }, false, ''],
  ['Origin with an attacker suffix', { origin: 'https://mehrdad.ir.evil.tld', host: 'mehrdad.ir' }, false, ''],
  ['unparsable Origin', { origin: 'not a url', host: 'mehrdad.ir' }, false, ''],
];
for (const [name, headers, expected, note] of originCases) {
  const got = originAllowed(req('https://mehrdad.ir/api/admin/stats', headers));
  check(name, got === expected, `originAllowed()=${got}${note ? ` (${note})` : ''}`);
}
process.env.SITE_ORIGIN = 'https://mehrdad.ir';
check('M2 FIXED: SITE_ORIGIN rejects a matching spoofed Host+Origin pair',
  originAllowed(req('https://mehrdad.ir/api/admin/stats', { origin: 'https://evil.tld', host: 'evil.tld' })) === false);
check('SITE_ORIGIN accepts the configured origin against any Host',
  originAllowed(req('https://mehrdad.ir/api/admin/stats', { origin: 'https://mehrdad.ir', host: 'anything.tld' })) === true);
process.env.SITE_ORIGIN = 'https://mehrdad.ir,https://www.mehrdad.ir';
check('SITE_ORIGIN accepts every host of a comma-separated list',
  originAllowed(req('https://mehrdad.ir/api/admin/stats', { origin: 'https://www.mehrdad.ir', host: 'www.mehrdad.ir' })) === true);
process.env.SITE_ORIGIN = 'garbage';
check('unparsable SITE_ORIGIN falls back to the Host comparison (fail-safe, not fail-open)',
  originAllowed(req('https://mehrdad.ir/api/admin/stats', { origin: 'https://evil.tld', host: 'mehrdad.ir' })) === false);
delete process.env.SITE_ORIGIN;

// ── 4. Admin session tokens ────────────────────────────────────────────
section('4. Admin session tokens (src/lib/admin-session.ts)');
check('admin auth available (fail-closed guard has a secret)', adminAuthAvailable() === true);
check('safeEqual rejects the empty password (fail-closed)', safeEqual('', '') === false);
check('safeEqual matches identical secrets', safeEqual('audit-local-secret', 'audit-local-secret') === true);
check('safeEqual rejects a prefix of the secret', safeEqual('audit-local-secre', 'audit-local-secret') === false);
const good = createAdminSessionToken();
check('freshly issued token verifies', verifyAdminSessionToken(good.token) === true);
check('two logins produce different tokens (unique nonce)', good.token !== createAdminSessionToken().token);
revokeAdminSessionToken(good.token);
check('logout revokes exactly that token', verifyAdminSessionToken(good.token) === false);
const forge = (payload: string, key: string) => {
  // signed the way the app signs, but with a key the attacker chose
  const k = createHash('sha256').update(`mehrdad-admin-session:${key}`).digest('hex');
  return `${payload}.${createHmac('sha256', k).update(payload).digest('base64url')}`;
};
const future = String(Math.floor(Date.now() / 1000) + 3600);
check('token signed with an attacker key is rejected',
  verifyAdminSessionToken(forge(`${future}.attacker-nonce`, 'not-the-password')) === false);
check('expired but correctly signed token is rejected',
  verifyAdminSessionToken(forge(`${Math.floor(Date.now() / 1000) - 10}.nonce12345678`, 'audit-local-secret')) === false);
check('tampered expiry with a valid-looking signature is rejected',
  verifyAdminSessionToken(forge(`${future}.nonce12345678`, 'audit-local-secret').replace(future, String(Number(future) + 99999))) === false);
check('garbage cookie value is rejected', verifyAdminSessionToken('9999999999.FORGED') === false);
check('undefined cookie is rejected', verifyAdminSessionToken(undefined) === false);
check('cookie name is the app-specific one', ADMIN_COOKIE === 'mehrdad_admin', ADMIN_COOKIE);
check('token TTL is bounded (12h)', good.maxAge === 12 * 3600, `${good.maxAge}s`);

// L1: the revocation set must not grow from unauthenticated forged logouts
const countBefore = revokedSessionCount();
const heapBefore = process.memoryUsage().heapUsed;
for (let i = 0; i < 500000; i++) revokeAdminSessionToken(`9999999999.${i}`);
check('L1 FIXED: forged logouts add nothing to the revocation set',
  revokedSessionCount() === countBefore, `size stayed ${revokedSessionCount()}`);
const gc = (globalThis as any).gc;
if (typeof gc === 'function') {
  gc();
  check('L1 FIXED: no retained heap after 500k forged logouts (run with --expose-gc)',
    process.memoryUsage().heapUsed - heapBefore < 2 * 1024 * 1024,
    `+${((process.memoryUsage().heapUsed - heapBefore) / 1024 / 1024).toFixed(2)} MB retained`);
} else {
  out.push('  [INFO] retained-heap check skipped — run with --expose-gc to enable it');
}
const live = createAdminSessionToken();
revokeAdminSessionToken(live.token);
check('a genuine token is still revoked by logout', revokedSessionCount() === countBefore + 1);
for (let i = 0; i < 6000; i++) {
  const t = createAdminSessionToken();
  revokeAdminSessionToken(t.token);
}
check('revocation set is capped FIFO at 5000', revokedSessionCount() <= 5000, `size ${revokedSessionCount()}`);

// ── 5. Rate limiting + body caps ───────────────────────────────────────
section('5. Rate limiting + body caps (src/lib/rate-limit.ts)');
check('clientIp takes the LAST X-Forwarded-For entry (proxy-appended)',
  clientIp(req('https://mehrdad.ir/api/chat', { 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' })) === '3.3.3.3');
check('M4 FIXED: a client-supplied X-Real-IP is ignored',
  clientIp(req('https://mehrdad.ir/api/chat', { 'x-real-ip': '9.9.9.9' })) === 'unknown');
check('no proxy headers ⇒ single shared bucket (stricter, never looser)',
  clientIp(req('https://mehrdad.ir/api/chat')) === 'unknown');
check('oversized body with Content-Length is rejected',
  bodyTooLarge(req('https://mehrdad.ir/api/contact', { 'content-length': '40000' })) === true);

const big = JSON.stringify({ message: 'A'.repeat(40000) });
const chunked = await readJsonBody(req('https://mehrdad.ir/api/chat', { 'content-type': 'application/json' }, 'POST', big));
check('M3 FIXED: chunked/uncapped body (no Content-Length) is rejected while streaming',
  !chunked.ok && chunked.error === 'payload-too-large', JSON.stringify(chunked));
const small = await readJsonBody(req('https://mehrdad.ir/api/chat', { 'content-type': 'application/json' }, 'POST', '{"message":"hi"}'));
check('readJsonBody parses a normal body', small.ok === true && small.ok && small.data.message === 'hi');
const bad = await readJsonBody(req('https://mehrdad.ir/api/chat', { 'content-type': 'application/json' }, 'POST', '{not json'));
check('readJsonBody reports invalid JSON distinctly (400, not 413)',
  !bad.ok && bad.error === 'invalid-json', JSON.stringify(bad));
const empty = await readJsonBody(req('https://mehrdad.ir/api/chat', { 'content-type': 'application/json' }, 'POST', ''));
check('readJsonBody tolerates an empty body', empty.ok === true);

let allowed = 0;
for (let i = 0; i < 8; i++) if (rateLimit('login:8.8.8.8', 5, 15 * 60 * 1000).ok) allowed++;
check('login limiter allows exactly 5 of 8 attempts from one IP', allowed === 5, `${allowed} allowed`);
let g = 0;
for (let i = 0; i < 65; i++) if (rateLimit('login:__global__', 60, 15 * 60 * 1000).ok) g++;
check('M4 FIXED: global login ceiling caps IP rotation', g === 60, `${g} of 65 allowed across 65 keys`);
let c = 0;
for (let i = 0; i < 130; i++) if (rateLimit('chat:__global__', 120, 60 * 1000).ok) c++;
check('M4 FIXED: global chat budget caps AI spend per minute', c === 120, `${c} of 130 allowed`);
check('expired windows reopen', rateLimit('probe:expired', 1, 1).ok === true);

// ── 6. HTML sanitizer ──────────────────────────────────────────────────
section('6. HTML sanitizer (src/lib/sanitize.ts)');
const dirty = `<script>alert(1)</script><img src=x onerror="alert(2)"><iframe src="//evil.tld"></iframe>` +
  `<a href="javascript:alert(3)">x</a><p onclick="alert(4)">hi</p><svg onload="alert(5)"></svg>` +
  `<div style="background:url(javascript:alert(6))">s</div><form action="//evil.tld"><input></form>` +
  `<object data="//evil.tld"></object><embed src="//evil.tld"><base href="//evil.tld">`;
const clean = sanitizePostHtml(dirty);
check('<script> removed', !/<script/i.test(clean));
check('all on* event handlers removed', !/onerror|onclick|onload/i.test(clean));
check('javascript: URLs removed', !/javascript:/i.test(clean));
check('<iframe>/<form>/<svg>/<object>/<embed>/<base> removed',
  !/<iframe|<form|<svg|<object|<embed|<base/i.test(clean));
check('inline style attributes removed', !/style=/i.test(clean));
check('surviving text is kept', /hi/.test(clean), JSON.stringify(clean.slice(0, 80)));
check('L5 FIXED: data:image/svg+xml is dropped from <img>',
  !/data:image\/svg\+xml/i.test(sanitizePostHtml('<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">')));
check('raster data: URIs still allowed',
  /data:image\/png;base64,/.test(sanitizePostHtml('<img src="data:image/png;base64,iVBORw0KGgo=">')));
check('links get rel="noopener noreferrer nofollow"',
  /rel="noopener noreferrer nofollow"/.test(sanitizePostHtml('<a href="https://evil.tld" target="_blank">x</a>')));
check('protocol-relative URLs rejected', !/href="\/\//.test(sanitizePostHtml('<a href="//evil.tld">x</a>')));
check('mailto: links survive', /href="mailto:/.test(sanitizePostHtml('<a href="mailto:a@b.co">x</a>')));
check('plain-text sanitizer strips all markup', sanitizePlainText('<b>a</b><script>alert(1)</script>c') === 'ac');
check('plain-text sanitizer truncates to maxLength', sanitizePlainText('x'.repeat(5000), 100).length === 100);
check('sanitizer is idempotent (safe to call twice)',
  sanitizePostHtml(sanitizePostHtml(dirty)) === sanitizePostHtml(dirty));

// ── 7. checkAdmin() gate ───────────────────────────────────────────────
section('7. checkAdmin() gate (src/lib/admin.ts)');
const session = createAdminSessionToken();
check('anonymous admin API call → 401', checkAdmin(req('https://mehrdad.ir/api/admin/posts'))?.status === 401);
check('valid session cookie → allowed',
  checkAdmin(req('https://mehrdad.ir/api/admin/posts', { cookie: `mehrdad_admin=${session.token}` })) === null);
check('cross-origin mutation with a valid cookie → 403',
  checkAdmin(req('https://mehrdad.ir/api/admin/posts', { cookie: `mehrdad_admin=${session.token}`, origin: 'https://evil.tld', host: 'mehrdad.ir' }, 'POST'))?.status === 403);
check('cross-origin GET with a valid cookie is allowed (read-only by design)',
  checkAdmin(req('https://mehrdad.ir/api/admin/posts', { cookie: `mehrdad_admin=${session.token}`, origin: 'https://evil.tld', host: 'mehrdad.ir' }, 'GET')) === null);
check('same-origin mutation with a valid cookie is allowed',
  checkAdmin(req('https://mehrdad.ir/api/admin/posts', { cookie: `mehrdad_admin=${session.token}`, origin: 'https://mehrdad.ir', host: 'mehrdad.ir' }, 'PATCH')) === null);
check('revoked session is rejected', (() => {
  const t = createAdminSessionToken();
  revokeAdminSessionToken(t.token);
  return checkAdmin(req('https://mehrdad.ir/api/admin/posts', { cookie: `mehrdad_admin=${t.token}` }))?.status === 401;
})());
// ── 8. Admin post write path (M1) ──────────────────────────────────────
section('8. Admin post write/read path — real route handlers, stubbed Prisma');
const { db } = await import('@/lib/db');
const dbAny = db as any;
const XSS = '<script>alert(1)</script><img src=x onerror="alert(2)"><p>kept</p>';
const adminHeaders = { cookie: `mehrdad_admin=${session.token}`, origin: 'https://mehrdad.ir', host: 'mehrdad.ir', 'content-type': 'application/json' };

let captured: any = null;
dbAny.post.update = async (args: any) => { captured = args.data; return { id: args.where.id }; };
const postIdRoute = await import('@/app/api/admin/posts/[id]/route.ts');
const patchRes = await postIdRoute.PATCH(
  req('https://mehrdad.ir/api/admin/posts/xyz', adminHeaders, 'PATCH', JSON.stringify({ contentEn: XSS, contentFa: XSS })),
  { params: Promise.resolve({ id: 'xyz' }) },
);
check('PATCH /api/admin/posts/[id] is accepted for an authed same-origin call', patchRes.status === 200, `status ${patchRes.status}`);
check('M1 FIXED: PATCH sanitizes contentEn before it reaches the DB',
  captured?.contentEn === sanitizePostHtml(XSS) && !/script|onerror/i.test(captured?.contentEn || ''),
  JSON.stringify(captured?.contentEn));
check('M1 FIXED: PATCH sanitizes contentFa too',
  captured?.contentFa === sanitizePostHtml(XSS) && !/script|onerror/i.test(captured?.contentFa || ''),
  JSON.stringify(captured?.contentFa));

await postIdRoute.PATCH(
  req('https://mehrdad.ir/api/admin/posts/xyz', adminHeaders, 'PATCH', JSON.stringify({ contentEn: null })),
  { params: Promise.resolve({ id: 'xyz' }) },
);
check('PATCH still clears a field with null (no behaviour change)', captured?.contentEn === null, JSON.stringify(captured?.contentEn));

dbAny.post.findMany = async () => [{
  id: '1', slug: 's', titleEn: 'T', titleFa: 'ت', date: new Date(), published: true, source: 'wordpress',
  cover: null, contentEn: XSS, categories: [],
}];
const postsRoute = await import('@/app/api/admin/posts/route.ts');
const getList = await json(await postsRoute.GET(req('https://mehrdad.ir/api/admin/posts', adminHeaders)));
check('M1 FIXED: GET /api/admin/posts sanitizes contentEn on read',
  getList.posts[0].contentEn === sanitizePostHtml(XSS) && !/script|onerror/i.test(getList.posts[0].contentEn),
  JSON.stringify(getList.posts[0].contentEn));

captured = null;
const unauth = await postIdRoute.PATCH(
  req('https://mehrdad.ir/api/admin/posts/xyz', { 'content-type': 'application/json' }, 'PATCH', JSON.stringify({ contentEn: XSS })),
  { params: Promise.resolve({ id: 'xyz' }) },
);
check('unauthenticated PATCH → 401 and never writes', unauth.status === 401 && captured === null, `status ${unauth.status}`);

console.log(out.join('\n'));
console.log(`\nRESULT: ${pass} passed, ${fail} failed (${pass + fail} checks)`);
process.exit(fail === 0 ? 0 : 1);
