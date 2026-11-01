import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { vazirmatn } from "@/lib/site-fonts";
import "../globals.css";
import { RootBody } from "@/components/site/RootBody";
import { siteMetadata as metadata, siteViewport as viewport } from "../site-shared";

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
