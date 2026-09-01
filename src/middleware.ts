import { NextRequest, NextResponse } from 'next/server';
import redirects from '@/lib/wp-redirects.json';

/**
 * SEO redirects: every old WordPress URL 301-redirects to the new site.
 * - post URLs (encoded + decoded Persian slugs) → /#blog/<slug>
 * - ?p=<wpId> / ?page_id= → mapped post
 * - /services/* → services view, /category/* /tag/* /web-stories/* → blog, etc.
 */

type RedirectMap = { paths: Record<string, string>; wpIds: Record<string, string> };
const map = redirects as RedirectMap;

// long-slug keys sorted by length (descending) for prefix fallback
const longKeys = Object.keys(map.paths)
  .filter((k) => k.length >= 30)
  .sort((a, b) => b.length - a.length);

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
  if (searchParams.get('feed') !== null && (rawPath === '/' || rawPath.startsWith('/blog'))) return '/';

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
  if (n.startsWith('/services')) return '/#services';
  if (n.startsWith('/category') || n.startsWith('/tag') || n.startsWith('/web-stories') || n.startsWith('/blog/')) return '/#blog';
  if (n.startsWith('/author')) return '/#about';
  if (n.startsWith('/portfolio')) return '/#projects';
  if (n.startsWith('/s/')) return '/';
  if (n.startsWith('/wp-json') || n.startsWith('/xmlrpc.php')) return '/';

  return null;
}

export function middleware(req: NextRequest) {
  const target = lookup(req.nextUrl.pathname, req.nextUrl.searchParams);
  if (!target) return NextResponse.next();

  // target like "/#blog/<slug>" or "/" — build a clean absolute URL
  return NextResponse.redirect(`${req.nextUrl.origin}${target}`, 301);
}

export const config = {
  matcher: [
    // everything except Next internals, APIs and static assets
    '/((?!_next/static|_next/image|api/|icons/|media/|manifest\\.json|sw\\.js|favicon\\.ico|\\.well-known|robots\\.txt|logo\\.svg|sitemap).*)',
  ],
};
