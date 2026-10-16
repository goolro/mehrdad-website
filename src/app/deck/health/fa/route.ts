// Health & Wellness landing — PERSIAN mirror — owner order 2026-10-16
// («فقط باید ترجمه بشه و نسخه فارسی اون ساخته بشه … با همین شکل فونت و زیبایی»).
// Built by scripts/build-health-landing.mjs from the SAME uploaded bytes as the
// EN version: identical design/fonts/layout — dir="rtl", Vazirmatn added only
// as the Persian glyph font (Inter/Space Grotesk untouched for Latin+digits),
// translated strings, placeholder slots verbatim, numeric tokens identical,
// and zero Persian comma «،» (standing rule). The EN version stays byte-exact.
// The ONLY injected UI is the language toggle the owner ordered (2026-10-16):
// it REPLACES the nav «عنوان موقت» badge 1:1 — same slot, same small badge
// look, small gap from the brand name. Every other byte stays untouched.
import { LANDING_FA } from '../landing-fa';
import { BADGE_FA, navLangToggle } from '../lang-toggle';

export const dynamic = 'force-static';

export async function GET() {
  // BADGE_FA is asserted to occur exactly once in LANDING_FA — deterministic
  // 1:1 swap; no other byte changes.
  const html = LANDING_FA.replace(
    BADGE_FA,
    navLangToggle({
      label: 'EN',
      href: '/deck/health',
      ariaLabel: 'تغییر به نسخه انگلیسی',
      title: 'English',
      fontFamily: 'Vazirmatn',
    }),
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
