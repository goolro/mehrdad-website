import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { vazirmatn } from "@/lib/site-fonts";
import "../globals.css";
import { RootBody } from "@/components/site/RootBody";
import { siteMetadata as metadata, siteViewport as viewport } from "../site-shared";

/**
 * Root layout of the (fa) group — the static Persian route tree (/fa).
 *
 * 2026-11-01 (audit report section 1 — the RTL fix): the raw HTML of /fa
 * used to ship <html lang="en" dir="ltr"> because a single root layout
 * served every route. The boot script flipped lang/dir pre-paint (D-050),
 * so USERS never saw a wrong page — but crawlers that don't execute JS
 * (Bing, GPTBot, ClaudeBot, PerplexityBot) read the raw HTML and saw an
 * English <html> tag wrapping Persian content. With this per-group root
 * layout the SERVER-RENDERED HTML is lang="fa" dir="rtl" — no JS needed.
 *
 * Everything else (fonts, body chrome, metadata, boot script) is shared
 * with the (site) group: site-shared.ts / RootBody.tsx / site-fonts.ts.
 * The boot script's fa-route branch now re-affirms values that are already
 * correct server-side (kept for ?lang= overrides and dark/light mode).
 */
export default function FaRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Same CSP rationale as (site)/layout.tsx: static pages + build-time
  // hash-based CSP meta, no per-request nonce.
  return (
    <html
      lang="fa"
      dir="rtl"
      // Vazirmatn is the Persian workhorse font (loaded since 2026-09-07);
      // GeistSans stays in the class list so EN glyph fallbacks inside the
      // RTL page (latin snippets, numbers in EN) keep their font.
      className={`${GeistSans.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <RootBody>{children}</RootBody>
    </html>
  );
}
