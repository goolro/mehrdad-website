// Health & Wellness landing — PERSIAN mirror — owner order 2026-10-16
// («فقط باید ترجمه بشه و نسخه فارسی اون ساخته بشه … با همین شکل فونت و زیبایی»).
// Built by scripts/build-health-landing.mjs from the SAME uploaded bytes as the
// EN version: identical design/fonts/layout — dir="rtl", Vazirmatn added only
// as the Persian glyph font (Inter/Space Grotesk untouched for Latin+digits),
// translated strings, placeholder slots verbatim, numeric tokens identical,
// and zero Persian comma «،» (standing rule). The EN version stays byte-exact.
// The ONLY injected UI is the floating language toggle the owner explicitly
// ordered on 2026-10-16 — one fixed pill spliced before </body>, mirrored to
// the bottom-left for RTL; every other byte of the landing stays untouched.
import { LANDING_FA } from '../landing-fa';
import { langToggle } from '../lang-toggle';

export const dynamic = 'force-static';

export async function GET() {
  // '</body>' occurs exactly once in LANDING_FA (asserted) — deterministic splice.
  const html = LANDING_FA.replace(
    '</body>',
    langToggle({
      label: 'EN',
      href: '/deck/health',
      ariaLabel: 'تغییر به نسخه انگلیسی',
      side: 'left',
    }) + '</body>',
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
