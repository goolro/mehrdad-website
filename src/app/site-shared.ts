import type { Metadata, Viewport } from "next";

/**
 * Shared root-layout payload for the (site) and (fa) groups.
 *
 * The route-group split (2026-11-01, audit report section 1) gives /fa its
 * own root layout so the RAW HTML carries lang="fa" dir="rtl" — crawlers
 * without JS (Bing, GPTBot, ClaudeBot) no longer see an English <html> tag
 * on the Persian page. Metadata/viewport/boot-script are byte-identical for
 * both groups, so they live here once; each group layout re-exports them.
 */

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.SITE_ORIGIN || "https://mehrdad.ir"),
  other: {
    // deploy fingerprint: tells the owner/support which commit the served
    // HTML came from (injected at build time, visible in view-source)
    "x-build": process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
  },
  // EN-purity rule (owner 2026-10-01): every user-visible EN surface —
  // <title>, meta description, twitter card — is English-only. The Persian
  // experience lives on the real static /fa route, so the static metadata
  // that serves EN pages stays English.
  // title.template (phase-2 SEO): child pages that set a plain `title`
  // automatically get the " | Mehrdad" suffix; every existing page that
  // carries a full title opts out via `{ absolute: ... }`.
  title: {
    default: "Mehrdad — Product Builder",
    template: "%s | Mehrdad",
  },
  alternates: {
    // RSS autodiscovery (phase-2 SEO): the feed has existed at /feed.xml for
    // a while but no <link rel="alternate"> pointed at it — feed readers and
    // crawlers had to guess. Rendered on every page.
    types: { "application/rss+xml": "/feed.xml" },
  },
  description:
    "I design businesses and products with care, and build them fast with AI. Real projects, honest status, lessons from real work.",
  keywords: ["Mehrdad", "product builder", "product design", "AI products", "startups", "smart city"],
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
    locale: "en_US",
    alternateLocale: ["fa_IR"],
    // no images here (2026-09-08): the file-convention opengraph-image.tsx
    // generates a proper 1200×630 branded banner; the old 512×512 icon
    // override made WhatsApp/Telegram cards a tiny square.
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehrdad — Product Builder",
    description: "I design businesses and products with care, and build them fast with AI.",
  },
  robots: {
    // explicit + future-proof: allow index/follow, let AI crawlers in
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

/**
 * Pre-paint boot script (Theme Engine D-014 limitation fix: dark-mode
 * first-paint flash). Runs synchronously before React hydrates and:
 * 1. applies the Light/Dark mode (.dark class) — DARK is the site default
 *    (owner request 2026-09-08): a persisted 'light' keeps light, anything
 *    else (first visit / persisted 'dark') gets dark
 *    FIX 2026-09-08 (fresh-visitor flash): the mode check previously sat
 *    inside `if(raw)`, so a FIRST-VISIT browser (empty localStorage) never
 *    got the class pre-paint → light first paint, dark after hydration —
 *    the exact flash the owner saw in a fresh Chrome. The check is now
 *    unconditional: no state → dark; corrupt state → dark; 'light' → light.
 * 2. applies the persisted language direction (fa → rtl)
 * 3. applies the last-known site theme (cached by SiteChrome; the live
 *    value still arrives from the DB via /api/site)
 * Wrapped in try/catch — a storage failure must never blank the site.
 *
 * The script tag carries the per-request CSP nonce emitted by the
 * middleware (strict CSP, no 'unsafe-inline' for scripts in production).
 *
 * 2026-09-08 (SEO-growth): ?lang=fa|en URL override. The site renders EN
 * server-side (static, crawlable); Persian visitors and social shares land
 * with ?lang=fa and this script flips language+dir BEFORE first paint —
 * zero flash, zero extra rendering cost. Google's renderer executes this
 * script, so the hreflang=fa variants are indexable as Persian content.
 *
 * 2026-01 (English-flash fix, owner report): the SSR text itself is always
 * English (static build), so a FA user used to SEE English content for the
 * whole hydration window before the persisted lang applied. The script now
 * also sets `lang-boot-fa` (+ `lang-boot-light` for light-mode users): CSS
 * keeps <body> invisible until SiteChrome commits the Persian render
 * pre-paint — a FA user sees the dark background for a blink, then Persian,
 * never English. A CSS animation force-reveals the body after ~1.2s so a
 * JS failure can never blank the site (no-JS visitors never get the class
 * at all — it is only set by this script).
 *
 * 2026-10-23 (static Persian routes /fa, D-050): /fa is a REAL Persian
 * page — the SSR HTML is already Persian (lang-context.tsx pins lang=fa
 * for the whole /fa* route tree), so the script only needs to set the
 * <html> lang/dir attributes pre-paint and persist lang=fa (route
 * continuity for inner EN routes). It must NOT add `lang-boot-fa` here:
 * hiding the body would only delay already-correct Persian content.
 *
 * 2026-11-01 (route-group split): the (fa) group root layout now renders
 * lang/dir=fa/rtl server-side, so on /fa* this script re-affirms values
 * that are already correct — kept for ?lang= overrides, persisted-language
 * continuity when navigating /fa → EN routes, and the dark/light class.
 */
export const bootScript = `(function(){try{var q=new URLSearchParams(location.search).get('lang');if(q==='fa'||q==='en'){try{var raw2=JSON.parse(localStorage.getItem('mehrdad-app')||'{}');raw2.state=Object.assign({},raw2.state,{lang:q});localStorage.setItem('mehrdad-app',JSON.stringify(raw2));}catch(e){}if(q==='fa')document.documentElement.lang='fa',document.documentElement.dir='rtl';else document.documentElement.lang='en',document.documentElement.dir='ltr';}var p=location.pathname;var faRoute=(p==='/fa'||p.indexOf('/fa/')===0);if(faRoute){document.documentElement.lang='fa';document.documentElement.dir='rtl';try{var raw4=JSON.parse(localStorage.getItem('mehrdad-app')||'{}');raw4.state=Object.assign({},raw4.state,{lang:'fa'});localStorage.setItem('mehrdad-app',JSON.stringify(raw4));}catch(e){}}var s={};try{s=(JSON.parse(localStorage.getItem('mehrdad-app')||'{}').state)||{};}catch(e){}if(!s.mode||s.mode==='dark')document.documentElement.classList.add('dark');if(s.lang==='fa'&&!faRoute){document.documentElement.lang='fa';document.documentElement.dir='rtl';document.documentElement.classList.add('lang-boot-fa');if(s.mode==='light')document.documentElement.classList.add('lang-boot-light');}var t=localStorage.getItem('mehrdad-theme-cache');if(t)document.documentElement.dataset.theme=t;}catch(e){}})();`;
