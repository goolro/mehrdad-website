import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaClient } from "@/components/site/PwaClient";
import { SiteChrome } from "@/components/site/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_ORIGIN || "https://mehrdad.ir"),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // nonce generated per request in src/middleware.ts (undefined when the
  // middleware did not run — e.g. some static contexts / older flows)
  const h = await headers();
  const nonce = h.get("x-nonce") || undefined;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased bg-background text-foreground`}
      >
        <script
          id="theme-boot"
          nonce={nonce}
          // the nonce differs per request, so a client-side navigation's RSC
          // payload would "mismatch" the already-executed document script —
          // that diff is intentional and must not be patched (suppressing it
          // keeps the original, correctly-nonced script untouched)
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
