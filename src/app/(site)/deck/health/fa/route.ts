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
// D-042 (owner order 2026-10-17, mobile fix): the .cs table is the only one
// outside a .scroll container — in RTL its 520px min-width overflow lands on
// the LEFT edge (page opens cut off). mobileSafeCsTable() wraps it in a
// neutral overflow-x:auto container; the RTL container starts right-anchored,
// so the first (rightmost) Persian column is visible on load.
// D-046 (owner order): nav button «سرمایه‌گذاری ←» becomes «بازگشت به
// وب‌سایت» (same .btn sm slot — Vazirmatn font chain from D-039 still
// applies) and the site's ONLINE CHAT (Persian twin, zero «،») is injected —
// see site-chat.ts. Both swaps asserted unique.
import { LANDING_FA } from '../landing-fa';
import { BADGE_FA, navLangToggle } from '../lang-toggle';
import { mobileSafeCsTable } from '../cs-scroll';
import { deckSiteChat } from '../site-chat';

export const dynamic = 'force-static';

// Owner order 2026-10-16: «سرمایه‌گذاری --این دکمه- این فونت بالا اصلا خوب
// نیست فونت را بهتر کن مثله فونت محتوا». Root cause: .btn hardcodes
// `font:600 15.5px Inter` — Inter has NO Persian glyphs, so every FA button
// (nav «سرمایه‌گذاری» included) falls back to an arbitrary system font.
// Fix: on the FA page only, the button font becomes the SAME chain as the FA
// content font (body{font-family:Vazirmatn,Inter,system-ui,sans-serif}).
// The string is asserted unique; EN page needs no fix (Inter IS its content
// font) and stays untouched.
const BTN_FONT_OLD = 'font:600 15.5px Inter';
const BTN_FONT_NEW = 'font:600 15.5px Vazirmatn,Inter,system-ui,sans-serif';

export async function GET() {
  // Four deterministic, asserted-unique swaps; every other byte stays frozen:
  // 1) nav «عنوان موقت» badge → language toggle (D-038)
  // 2) .btn hardcoded Inter → the FA content-font chain (D-039)
  // 3) .cs sensitivity table → neutral internal-scroll container (D-042)
  // 4) nav «سرمایه‌گذاری» button → «بازگشت به وب‌سایت» + online chat (D-046)
  const html = deckSiteChat(
    mobileSafeCsTable(
      LANDING_FA.replace(
        BADGE_FA,
        navLangToggle({
          label: 'EN',
          href: '/deck/health',
          ariaLabel: 'تغییر به نسخه انگلیسی',
          title: 'English',
          fontFamily: 'Vazirmatn',
        }),
      ).replace(BTN_FONT_OLD, BTN_FONT_NEW),
    ),
    'fa',
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
