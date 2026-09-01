import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaClient } from "@/components/site/PwaClient";

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
  title: "Mehrdad — Product Builder | مهرداد — سازنده محصول",
  description:
    "I design businesses and products with care, and build them fast with AI. Real projects, honest status, lessons from real work. کسب‌وکار و محصولت رو با دقت طراحی می‌کنم، و با AI سریع می‌سازمش.",
  keywords: ["Mehrdad", "product builder", "product design", "AI products", "startups", "smart city", "BIZPAL", "مهرداد", "سازنده محصول", "هوش مصنوعی"],
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
 * 3. applies the last-known site theme (cached by page.tsx; the live
 *    value still arrives from the DB via /api/site)
 * Wrapped in try/catch — a storage failure must never blank the site.
 */
const bootScript = `(function(){try{var raw=localStorage.getItem('mehrdad-app');if(raw){var s=(JSON.parse(raw)||{}).state||{};if(s.mode==='dark')document.documentElement.classList.add('dark');if(s.lang==='fa'){document.documentElement.lang='fa';document.documentElement.dir='rtl';}}var t=localStorage.getItem('mehrdad-theme-cache');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased bg-background text-foreground`}
      >
        <script id="theme-boot" dangerouslySetInnerHTML={{ __html: bootScript }} />
        {children}
        <Toaster />
        <PwaClient />
      </body>
    </html>
  );
}
