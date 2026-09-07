import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaClient } from "@/components/site/PwaClient";
import { SiteChrome } from "@/components/site/SiteChrome";

// Fonts are SELF-HOSTED (2026-09-07): next/font/google fetched CSS from
// fonts.googleapis.com at build time — an external dependency that broke
// hermetic builds (sandbox blocks it) and adds a Google round-trip to every
// deploy. Geist ships via the official `geist` package (next/font/local
// under the hood, same --font-geist-* variables); Vazirmatn's OFL variable
// font is committed in src/fonts.
const vazirmatn = localFont({
  src: "../fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_ORIGIN || "https://mehrdad.ir"),
  other: {
    // deploy fingerprint: tells the owner/support which commit the served
    // HTML came from (injected at build time, visible in view-source)
    "x-build": process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  },
  title: "Mehrdad — Product Builder | مهرداد — سازنده محصول",
  description:
    "I design businesses and products with care, and build them fast with AI. Real projects, honest status, lessons from real work. کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI سریع می‌سازمش.",
  keywords: ["Mehrdad", "product builder", "product design", "AI products", "startups", "smart city", "مهرداد", "سازنده محصول", "هوش مصنوعی"],
  authors: [{ name: "Mehrdad" }],
  manifest: "/manifest.json",
  applicationName: "Mehrdad",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mehrdad",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Mehrdad — Product Builder",
    description: "I design businesses and products with care, and build them fast with AI.",
    siteName: "mehrdad.ir",
    type: "website",
    // square brand mark as the fallback card image (per-page covers override)
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Mehrdad" }],
  },
  twitter: {
    card: "summary",
    title: "Mehrdad — Product Builder | مهرداد — سازنده محصول",
    description: "I design businesses and products with care, and build them fast with AI.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    // explicit + future-proof: allow index/follow, let AI crawlers in
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

/**
 * Pre-paint boot script (Theme Engine D-014 limitation fix: dark-mode
 * first-paint flash). Runs synchronously before React hydrates and:
 * 1. applies the persisted Light/Dark mode (.dark class)
 * 2. applies the persisted language direction (fa → rtl)
 * 3. applies the last-known site theme (cached by SiteChrome; the live
 *    value still arrives from the DB via /api/site)
 * Wrapped in try/catch — a storage failure must never blank the site.
 *
 * The script tag carries the per-request CSP nonce emitted by the
 * middleware (strict CSP, no 'unsafe-inline' for scripts in production).
 */
const bootScript = `(function(){try{var raw=localStorage.getItem('mehrdad-app');if(raw){var s=(JSON.parse(raw)||{}).state||{};if(s.mode==='dark')document.documentElement.classList.add('dark');if(s.lang==='fa'){document.documentElement.lang='fa';document.documentElement.dir='rtl';}}var t=localStorage.getItem('mehrdad-theme-cache');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
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
      className={`${GeistSans.variable} ${GeistMono.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background text-foreground">
        <script
          id="theme-boot"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: bootScript }}
        />
        <SiteChrome>{children}</SiteChrome>
        <Toaster />
        <PwaClient />
      </body>
    </html>
  );
}
