import { NextRequest, NextResponse } from 'next/server';
import redirects from '@/lib/wp-redirects.json';

/**
 * Proxy (Next 16 name for middleware), three jobs:
 *
 * 1. SEO redirects: every old WordPress URL 301-redirects to the new site.
 *    - post URLs (encoded + decoded Persian slugs) → /blog/<slug>
 *    - ?p=<wpId> / ?page_id= → mapped post
 *    - /services/* → /services, /category/* /tag/* /web-stories/* → /blog, etc.
 *    Targets are the REAL routes now (hash-routing retired); real routes
 *    themselves are guarded so the legacy map can never shadow them.
 *
 * 2. Strict CSP with a per-request nonce (production): script-src carries
 *    'nonce-…' + 'strict-dynamic' — no 'unsafe-inline'. Next.js reads the
 *    CSP from the request headers and propagates the nonce to its own
 *    scripts; layout.tsx passes the same nonce to the boot script.
 *
 * 3. Dev CSP keeps 'unsafe-inline'/'unsafe-eval' (React dev needs eval;
 *    the nonce is still emitted so behaviour matches production).
 */

type RedirectMap = { paths: Record<string, string>; wpIds: Record<string, string> };
const map = redirects as RedirectMap;

// long-slug keys sorted by length (descending) for prefix fallback
const longKeys = Object.keys(map.paths)
  .filter((k) => k.length >= 30)
  .sort((a, b) => b.length - a.length);

// real App Router routes — the legacy map is skipped for these, so an old
// WP page that happens to share a path can never shadow the new site.
// /blog and /work own their whole subtree; the single pages are exact —
// old WP /services/<slug> URLs must still hit the /services redirect rule.
const EXACT_REAL_ROUTES = new Set(['/blog', '/work', '/services', '/fde', '/lab', '/about', '/contact', '/admin']);
const REAL_SUBTREE = /^\/(blog|work)\//;

/** translate legacy hash targets ("/#blog/<slug>") to their real routes */
function toRealPath(t: string): string {
  if (t.startsWith('/#blog/')) return '/blog/' + t.slice('/#blog/'.length);
  switch (t) {
    case '/#blog': return '/blog';
    case '/#services': return '/services';
    case '/#projects': return '/work';
    case '/#about': return '/about';
    case '/#contact': return '/contact';
    case '/#fde': return '/fde';
    case '/#admin': return '/admin';
    case '/#home':
    case '/#':
      return '/';
    default:
      return t;
  }
}

function normalize(p: string): string {
  const noTrailing = p.replace(/\/+$/, '');
  return noTrailing === '' ? '/' : noTrailing.toLowerCase();
}

function lookup(rawPath: string, searchParams: URLSearchParams): string | null {
  // 1. WP id-style links first (path may be "/" for ?p=123)
  const pParam = searchParams.get('p');
  if (pParam && map.wpIds[pParam]) return map.wpIds[pParam];
  const pageId = searchParams.get('page_id');
  if (pageId) {
    if (map.wpIds[pageId]) return map.wpIds[pageId];
    return '/'; // WP static page → home
  }
  if (searchParams.get('feed') !== null && (rawPath === '/' || rawPath.startsWith('/blog'))) return '/blog';

  // 2. exact path match (raw, normalized, and decoded)
  const candidates = [rawPath, normalize(rawPath)];
  try {
    candidates.push(normalize(decodeURIComponent(rawPath)));
  } catch {}
  for (const c of candidates) {
    const hit = map.paths[c] || map.paths[c.toLowerCase()];
    if (hit) return hit;
  }

  // 2b. fuzzy prefix match for long Persian slugs — handles truncated
  // or slightly different old URLs (WP itself stored some slugs truncated)
  for (const c of candidates) {
    if (c.length < 30) continue;
    for (const k of longKeys) {
      if (c.startsWith(k) || k.startsWith(c)) return map.paths[k];
    }
  }

  // 3. prefix rules for WP sections
  const n = normalize(rawPath);
  if (n.startsWith('/services')) return '/services';
  if (n.startsWith('/category') || n.startsWith('/tag') || n.startsWith('/web-stories')) return '/blog';
  if (n.startsWith('/author')) return '/about';
  if (n.startsWith('/portfolio')) return '/work';
  if (n.startsWith('/s/')) return '/';
  if (n.startsWith('/wp-json') || n.startsWith('/xmlrpc.php')) return '/';

  return null;
}

function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' lets nonce-carrying scripts load chunks; the nonce
    // replaces 'unsafe-inline' entirely in production (CSP3)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // CSS: Tailwind ships as an external sheet; 'unsafe-inline' stays for
    // React's inline style *attributes* (progress bars, animations) —
    // style attributes cannot execute script in modern browsers.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(req: NextRequest) {
  // ── 1. legacy WP redirects (real routes are never shadowed) ──
  const path = req.nextUrl.pathname;
  const normalized = normalize(path);
  if (!EXACT_REAL_ROUTES.has(normalized) && !REAL_SUBTREE.test(path)) {
    const target = lookup(path, req.nextUrl.searchParams);
    if (target) {
      // Host-header poisoning guard: `req.nextUrl.origin` mirrors the
      // client's Host header, so a spoofed Host could turn the 301 into an
      // off-site redirect. When SITE_ORIGIN is configured (production),
      // redirects always anchor to it; dev falls back to the request origin.
      const base = process.env.SITE_ORIGIN || req.nextUrl.origin;
      return NextResponse.redirect(`${base}${toRealPath(target)}`, 301);
    }
  }

  // ── 2/3. per-request nonce CSP ──
  const isDev = process.env.NODE_ENV !== 'production';
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  // Next.js reads this request CSP and applies the nonce to its scripts
  requestHeaders.set('Content-Security-Policy', csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

export const config = {
  matcher: [
    // everything except Next internals, APIs and static assets
    '/((?!_next/static|_next/image|api/|icons/|media/|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|robots\\.txt|logo\\.svg|sitemap|uploads/|feed\\.xml).*)',
  ],
};
