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
  title: "Mehrdad ☼ Designer & Researcher | طراح و پژوهشگر",
  description:
    "Software & hardware product design, AI solutions, startup consulting, digital & traditional sales — Mehrdad's official website with AI assistant. طراحی محصول، هوش مصنوعی، مشاوره استارتاپ",
  keywords: ["Mehrdad", "designer", "researcher", "startups", "AI", "smart city", "investment", "BIZPAL", "KLIKA"],
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
    title: "Mehrdad ☼ Designer & Researcher",
    description: "Innovative software & hardware product design, AI solutions and startup consulting — with a built-in AI assistant.",
    siteName: "mehrdad.ir",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

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
        {children}
        <Toaster />
        <PwaClient />
      </body>
    </html>
  );
}
