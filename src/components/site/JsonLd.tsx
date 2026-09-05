import { headers } from 'next/headers';

/**
 * Server-rendered schema.org JSON-LD block (AI-SEO, 2026-09-05).
 *
 * Strict CSP (nonce-based, no 'unsafe-inline') blocks any inline script
 * without a nonce — including JSON-LD. This component reads the SAME
 * per-request nonce the middleware emits on `x-nonce` (same mechanism the
 * boot script in layout.tsx uses) so structured data passes CSP.
 *
 * `<` is escaped to \u003c so embedded strings can never close the tag.
 */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const h = await headers();
  const nonce = h.get('x-nonce') || undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
