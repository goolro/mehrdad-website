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
  // every <a> gets safe rel defaults
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: 'a',
      attribs: { ...attribs, rel: 'noopener noreferrer nofollow' },
    }),
    img: (tagName, attribs) => ({
      tagName: 'img',
      attribs: { ...attribs, loading: attribs.loading || 'lazy' },
    }),
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
