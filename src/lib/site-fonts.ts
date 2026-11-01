import localFont from "next/font/local";

// Persian variable font — SELF-HOSTED since 2026-09-07 (see src/app layout
// history): no Google round-trip, hermetic builds. Path is relative to this
// file: src/lib → ../fonts = src/fonts. Imported by BOTH group root layouts
// ((site) and (fa)) so the --font-vazirmatn variable exists on <html> for
// every route, exactly as the pre-refactor single root layout did.
export const vazirmatn = localFont({
  src: "../fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  display: "swap",
});
