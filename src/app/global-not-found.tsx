import { GeistSans } from "geist/font/sans";
import { vazirmatn } from "@/lib/site-fonts";
import "./globals.css";
import { RootBody } from "@/components/site/RootBody";
import { NotFoundContent } from "@/components/site/NotFoundContent";

/**
 * GLOBAL not-found — the 404 host for URLs that match NO route
 * (experimental.globalNotFound convention, Next 16).
 *
 * WHY THIS EXISTS (2026-11-01 route-group split, audit report section 1):
 * the site moved from one root layout to per-group root layouts — (site)
 * renders <html lang="en" dir="ltr"> and (fa) renders
 * <html lang="fa" dir="rtl"> so the RAW Persian HTML finally carries the
 * right lang/dir for no-JS crawlers. A side effect: there is no shared
 * root layout anymore, so the old top-level app/not-found.tsx had no
 * <html> to render into. Next's answer for multiple root layouts is this
 * file: a self-contained 404 document (own <html>/<body>) served with a
 * real 404 status for unmatched URLs — same chrome, fonts, boot script
 * and styling as every other page (RootBody), so the 404 UX is
 * byte-equivalent to the pre-refactor site.
 *
 * EN-purity rule (owner 2026-10-01): unmatched URLs are an EN surface.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${GeistSans.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <RootBody>
        <NotFoundContent />
      </RootBody>
    </html>
  );
}
