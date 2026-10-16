// Health & Wellness landing — ENGLISH (default) — owner order 2026-10-16.
// The owner's FINAL single-file landing is served BYTE-EXACT via
// landing-en.ts (generated from the upload by scripts/build-health-landing.mjs).
// Zero modification: no font change, no wording change, no injected UI.
// A route handler bypasses the root layout entirely — the site template
// (header/footer/globals.css/chat/PWA pill) physically cannot reach this page.
// Supersedes the 2026-10-13 investor deck (D-035) at the same address — the
// owner ordered the previous file deleted and this one put in its place (D-036).
import { LANDING_EN } from './landing-en';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(LANDING_EN, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
