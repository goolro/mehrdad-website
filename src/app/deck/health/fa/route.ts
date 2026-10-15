// Health & Wellness deck — PERSIAN mirror — owner order 2026-10-13
// («دو زبان قرار بده»). Same standalone document as /deck/health with the
// translated labels baked in server-side: lang="fa" dir="rtl", Vazirmatn,
// mirrored layout, flipped arrows. Placeholder slots stay verbatim in both
// languages; FA copy contains no Persian comma «،» (standing rule).
import { buildHealthDeckHtml } from '../deck-html';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(buildHealthDeckHtml('fa'), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
