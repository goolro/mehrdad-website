/**
 * Server-rendered schema.org JSON-LD block (AI-SEO, 2026-09-05).
 *
 * 2026-09-07: no longer reads the per-request nonce — the ISR/static pages
 * carry a build-time hash-based CSP <meta> (scripts/inject-csp.mjs) that
 * hashes every inline <script> block, JSON-LD included. Reading headers()
 * here would force every page using structured data to render dynamically
 * on each request.
 *
 * `<` is escaped to \u003c so embedded strings can never close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
