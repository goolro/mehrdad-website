// Health & Wellness landing — ENGLISH (default) — owner order 2026-10-16.
// The owner's FINAL single-file landing is served via landing-en.ts (generated
// from the upload by scripts/build-health-landing.mjs). The ONLY injected UI is
// the language toggle the owner ordered (2026-10-16): it REPLACES the nav
// "WORKING TITLE" badge 1:1 — same slot, same small badge look, small gap from
// the brand name. Every other byte of the landing stays untouched.
// A route handler bypasses the root layout entirely — the site template
// (header/footer/globals.css/chat/PWA pill) physically cannot reach this page.
// Supersedes the 2026-10-13 investor deck (D-035) at the same address — the
// owner ordered the previous file deleted and this one put in its place (D-036).
import { LANDING_EN } from './landing-en';
import { BADGE_EN, navLangToggle } from './lang-toggle';

export const dynamic = 'force-static';

export async function GET() {
  // BADGE_EN is asserted to occur exactly once in LANDING_EN — deterministic
  // 1:1 swap; no other byte changes.
  const html = LANDING_EN.replace(
    BADGE_EN,
    navLangToggle({
      label: 'FA',
      href: '/deck/health/fa',
      ariaLabel: 'Switch to the Persian (Farsi) version',
      title: 'فارسی',
      fontFamily: 'Inter',
      letterSpacing: true,
    }),
  );
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
