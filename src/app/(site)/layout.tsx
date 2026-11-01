import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { vazirmatn } from "@/lib/site-fonts";
import "../globals.css";
import { RootBody } from "@/components/site/RootBody";
import { siteMetadata, siteViewport } from "../site-shared";

/**
 * 2026-11-02 (audit §3-8 D1+D4): the layout previously IMPORTED this
 * metadata without re-exporting it, so Next rendered NO root metadata at
 * all — every page fell back to RELATIVE canonical/hreflang URLs (Google
 * wants absolute), and the icon/manifest/appleWebApp block (the icons
 * files exist in public/icons/!) never rendered — the site had no favicon
 * link, no theme-color, no RSS autodiscovery on most pages. Exporting
 * here turns all of that on. Page-level metadata still wins field-by-field,
 * so the hand-written titles/descriptions that are live today are kept.
 */
export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

/**
 * Root layout of the (site) group — every ENGLISH route.
 *
 * 2026-11-01 (audit report section 1, route-group split): the site moved
 * from a single root layout to per-group root layouts so the (fa) group
 * can render <html lang="fa" dir="rtl"> in the RAW static HTML. Until then
 * the Persian page shipped an English <html> tag (crawlers without JS —
 * Bing, GPTBot, ClaudeBot — saw lang="en" on Persian content; the boot
 * script only fixed it client-side, pre-paint).
 *
 * This file is the EN side: byte-for-byte the old root layout, minus the
 * shared pieces now in site-shared.ts / RootBody.tsx / site-fonts.ts.
 * Groups don't affect URLs — every route here keeps its exact path.
 *
 * metadata/viewport are re-exported from site-shared — see the D1+D4
 * comment above the export.
 */
export default function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No per-request nonce anymore (2026-09-07): all HTML pages are static /
  // ISR and carry a BUILD-TIME hash-based CSP <meta> injected by
  // scripts/inject-csp.mjs — reading headers() here would force every page
  // to render dynamically on every request (~2.6s TTFB measured on prod).
  // The boot script text is identical for every visitor, so its hash
  // allow-lists it.
  return (
    <html
      lang="en"
      dir="ltr"
      // font variable classes live on <html> (not <body>): Tailwind's
      // --default-font-family resolves var(--font-geist-sans) at :root —
      // on body it never reached the html element, silently falling back
      // to the system font stack (pre-existing bug, fixed 2026-09-07)
      // PERF 2026-10-27: GeistMono dropped from the global tree — it was
      // preloaded (~70KB) on EVERY page but almost no page renders mono
      // (admin/agency/decks only). font-mono now resolves to a system mono
      // stack (globals.css); decks/agency still look right and ship 70KB less
      // on the critical path for every visitor.
      className={`${GeistSans.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <RootBody>{children}</RootBody>
    </html>
  );
}
