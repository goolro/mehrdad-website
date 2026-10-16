// Health & Wellness landing — ENGLISH (default) — owner order 2026-10-16.
// The owner's FINAL single-file landing is served via landing-en.ts (generated
// from the upload by scripts/build-health-landing.mjs). The ONLY injected UI is
// the floating language toggle the owner explicitly ordered on 2026-10-16
// («فقط یک دکمه FA روی قسمت انگلیسی بزار … گرافیک دست نخوره») — one fixed pill
// spliced before </body>; every other byte of the landing stays untouched.
// A route handler bypasses the root layout entirely — the site template
// (header/footer/globals.css/chat/PWA pill) physically cannot reach this page.
// Supersedes the 2026-10-13 investor deck (D-035) at the same address — the
// owner ordered the previous file deleted and this one put in its place (D-036).
import { LANDING_EN } from './landing-en';
import { langToggle } from './lang-toggle';

export const dynamic = 'force-static';

export async function GET() {
  // '</body>' occurs exactly once in LANDING_EN (asserted) — deterministic splice.
  const html = LANDING_EN.replace(
    '</body>',
    langToggle({
      label: 'FA',
      href: '/deck/health/fa',
      ariaLabel: 'Switch to the Persian (Farsi) version',
      side: 'right',
    }) + '</body>',
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
