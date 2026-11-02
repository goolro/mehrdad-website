// Health & Wellness landing — ENGLISH (default) — owner order 2026-10-16.
// The owner's FINAL single-file landing is served via landing-en.ts (generated
// from the upload by scripts/build-health-landing.mjs). The ONLY injected UI is
// the language toggle the owner ordered (2026-10-16): it REPLACES the nav
// "WORKING TITLE" badge 1:1 — same slot, same small badge look, small gap from
// the brand name. Every other byte of the landing stays untouched.
// A route handler bypasses the root layout entirely — the site template
// (header/footer/globals.css/chat/PWA pill) physically cannot reach this page.
// Supersedes BOTH the 2026-10-13 investor deck (D-035) and the 2026-10-16
// landing (D-036): owner order 2026-10-17 (D-041) uploaded a revised deck and
// ordered it put in place of the previous one, byte-exact, with the same
// language toggle on top and the same Persian mirror.
// D-042 (owner order 2026-10-17, mobile fix): the revision's new .cs table is
// the only one outside a .scroll container and pushed the whole page 180px
// past a phone viewport — mobileSafeCsTable() wraps it in a neutral
// overflow-x:auto container + one CSS rule; every other byte stays frozen.
// D-046 (owner order): top nav button «Invest →» becomes «Back to website»
// (same .btn sm slot — reads natively with the deck graphics) and the site's
// ONLINE CHAT becomes available ON the deck via a self-contained inline
// widget twin (site-chat.ts) — the route handler bypasses the layout, so the
// React ChatWidget can never reach this page. Both swaps asserted unique.
import { LANDING_EN } from './landing-en';
import { BADGE_EN, navLangToggle } from './lang-toggle';
import { mobileSafeCsTable } from './cs-scroll';
import { deckSiteChat } from './site-chat';

export const dynamic = 'force-static';

export async function GET() {
  // Deterministic, asserted-unique swaps; every other byte stays frozen:
  // 1) nav "WORKING TITLE" badge → language toggle (D-038)
  // 2) .cs sensitivity table → neutral internal-scroll container (D-042)
  // 3) nav "Invest →" button → "Back to website" + online chat injection (D-046)
  const html = deckSiteChat(
    mobileSafeCsTable(
      LANDING_EN.replace(
        BADGE_EN,
        navLangToggle({
          label: 'FA',
          href: '/deck/health/fa',
          ariaLabel: 'Switch to the Persian (Farsi) version',
          title: 'فارسی',
          fontFamily: 'Inter',
          letterSpacing: true,
        }),
      ),
    ),
    'en',
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
