import { NextRequest, NextResponse } from 'next/server';
import redirects from '@/lib/wp-redirects.json';

/**
 * Proxy (Next 16 name for middleware) — SEO redirects only, since the
 * 2026-09-07 ISR migration:
 *
 * Every public page is static/ISR and carries a BUILD-TIME hash-based CSP
 * <meta> injected by scripts/inject-csp.mjs. The old per-request
 * nonce+CSP logic lived here, but (a) a per-request nonce can never match a
 * cached HTML body, and (b) reading/setting it forced every page to render
 * dynamically on every request (~2.6s TTFB measured on production).
 *
 * Job:
 * - every old WordPress URL 301-redirects to the new site:
 *   - post URLs (encoded + decoded Persian slugs) → /blog/<slug>
 *   - ?p=<wpId> / ?page_id= → mapped post
 *   - /services/* → /services, /category/* /tag/* /web-stories/* → /blog, etc.
 *   Targets are the REAL routes now (hash-routing retired); real routes
 *   themselves are guarded so the legacy map can never shadow them.
 *
 * Security headers (HSTS, X-Frame-Options, …) come from next.config.ts
 * headers(); the script CSP comes from the per-page <meta> produced at
 * build time.
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

export function proxy(req: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // everything except Next internals, APIs and static assets
    '/((?!_next/static|_next/image|api/|icons/|media/|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|robots\\.txt|logo\\.svg|sitemap|uploads/|feed\\.xml).*)',
  ],
};
