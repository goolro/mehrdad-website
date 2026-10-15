// Health & Wellness deck — ENGLISH (default) — owner order 2026-10-13.
// The owner's single-file HTML deck is served EXACTLY as delivered, as a
// full standalone document with zero site template around it (no site
// header/footer/CSS/JS — a route handler bypasses the root layout entirely).
// Placeholder slots ([Brand], [$X], …) stay verbatim: the owner said their
// edits are not done yet and will fill them later. Replaces the D-034
// reserved placeholder in the same change — the temporary robots noindex
// ends here, exactly as D-034 required.
import { buildHealthDeckHtml } from './deck-html';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(buildHealthDeckHtml('en'), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
