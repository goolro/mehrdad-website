import sanitizeHtml from 'sanitize-html';

/**
 * Server-side HTML sanitizer for article content.
 *
 * WHY: post bodies (legacy WordPress imports, admin-authored and AI-generated
 * HTML) are rendered with dangerouslySetInnerHTML. Without sanitization a
 * <script> or onerror= handler in any of those sources becomes stored XSS —
 * most dangerously against the admin panel where the raw admin key lives in
 * page memory.
 *
 * STRATEGY (defense in depth):
 *  1. sanitize BEFORE save  — admin create/update + AI write/translate output
 *  2. sanitize ON READ      — every public API response that carries HTML
 *
 * Allowlist follows the reviewer recommendation: structural tags only,
 * no script/style/iframe/form, no event handlers, no javascript: URLs.
 */

/**
 * Only raster `data:` URIs survive. The scheme allowlist below permits `data:`
 * for `<img>` (sanitize-html's default), which also admits
 * `data:image/svg+xml` — and SVG is a script container. It cannot execute from
 * inside an `<img>`, but there is no reason to keep the door open
 * (round-3 finding L5).
 */
const SAFE_DATA_URI = /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i;

/**
 * The hosts that count as OUR OWN site for the link policy. Any href that is
 * root-relative (starts with '/'), a fragment, a mailto:, or points at one of
 * these hosts is internal → stays FOLLOWED so internal link equity flows.
 * Everything else is external → nofollow + new tab (editorial caution: we
 * never vouch for third-party pages, per the owner's Google-safety rule).
 */
function isInternalHref(href: string): boolean {
  const h = href.trim();
  if (!h) return true; // bare <a> without href — treat as harmless
  if (/^(\/|#)/.test(h)) return true;
  if (/^mailto:/i.test(h)) return true;
  try {
    const u = new URL(h);
    const siteHost = new URL(process.env.SITE_ORIGIN || 'https://mehrdad.ir').hostname.toLowerCase();
    const host = u.hostname.toLowerCase();
    return host === siteHost || host === 'mehrdad.ir' || host === 'www.mehrdad.ir';
  } catch {
    return false;
  }
}

function linkSeoTransform(attribs: sanitizeHtml.Attributes): { tagName: string; attribs: sanitizeHtml.Attributes } {
  const href = typeof attribs.href === 'string' ? attribs.href : '';
  if (isInternalHref(href)) {
    // preserve a rel that already exists (round-3 CI idempotency check): a
    // second pass must not rewrite rel — e.g. a <a> whose href was dropped
    // as a javascript: URL re-enters here with no href and must keep the
    // nofollow trio the first pass attached.
    return { tagName: 'a', attribs: { ...attribs, rel: attribs.rel || 'noopener' } };
  }
  return { tagName: 'a', attribs: { ...attribs, rel: 'nofollow noopener noreferrer', target: '_blank' } };
}

const POST_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // structure
    'p', 'br', 'hr', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // text semantics
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'code', 'pre', 'kbd',
    // lists & quotes
    'ul', 'ol', 'li', 'blockquote', 'q', 'cite',
    // tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup',
    // media & figures
    'img', 'figure', 'figcaption',
    // links
    'a',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel', 'dir', 'lang'],
    img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'dir'],
    span: ['dir', 'lang'],
    div: ['dir', 'lang'],
    p: ['dir', 'lang'],
    h1: ['id', 'dir'], h2: ['id', 'dir'], h3: ['id', 'dir'],
    h4: ['id', 'dir'], h5: ['id', 'dir'], h6: ['id', 'dir'],
    li: ['dir'],
    blockquote: ['cite', 'dir'],
    th: ['colspan', 'rowspan', 'scope', 'dir'],
    td: ['colspan', 'rowspan', 'dir'],
    col: ['span'], colgroup: ['span'],
    '*': ['lang'],
  },
  // no javascript:, vbscript:, data: (except the few safe image types below)
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowProtocolRelative: false,
  // SEO link policy (2026-09-28): INTERNAL links must stay FOLLOWED — nofollow
  // on our own URLs blunts internal link equity (owner request: لینک‌سازی داخلی).
  // EXTERNAL links get the cautious editorial treatment: nofollow + a new tab,
  // so we never vouch for third-party pages in Google's eyes.
  transformTags: {
    a: (tagName, attribs) => linkSeoTransform(attribs),
    img: (tagName, attribs) => {
      const next: Record<string, string> = { ...attribs, loading: attribs.loading || 'lazy' };
      if (typeof next.src === 'string' && /^\s*data:/i.test(next.src) && !SAFE_DATA_URI.test(next.src.trim())) {
        delete next.src; // non-raster data: URI dropped
      }
      return { tagName: 'img', attribs: next };
    },
  },
  disallowedTagsMode: 'discard',
};

/** Sanitize an article HTML body. Safe to call on already-clean input. */
export function sanitizePostHtml(html: string | null | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, POST_OPTIONS);
}

/**
 * Sanitize a plain-text user field (comments, names, subjects...).
 * Strips ALL tags — these fields are rendered as React text nodes,
 * so the safe representation is text, not HTML.
 */
export function sanitizePlainText(input: string | null | undefined, maxLength = 2000): string {
  if (!input) return '';
  const text = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/**
 * WP-migration artifact scrub for EXCERPTS (plain-text teaser fields).
 * The 2021-era WordPress excerpts were tag-stripped at migration, but
 * attribute fragments survived as literal text — e.g. a post teaser on
 * the homepage read `… on October 30, 2021 src="/media/Screenshot_…jpg"Clubho…`.
 * Strip orphaned `attr="value"` / `attr='value'` fragments and collapse
 * the leftover whitespace. Safe on clean input.
 */
export function sanitizeExcerpt(input: string | null | undefined, maxLength = 400): string {
  if (!input) return '';
  const text = input
    .replace(/\b(src|href|alt|title|class|width|height|loading|rel)\s*=\s*(["'])[^"']*\2/gi, ' ')
    .replace(/(^|\s)(src|href)=\S*/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, maxLength);
}
