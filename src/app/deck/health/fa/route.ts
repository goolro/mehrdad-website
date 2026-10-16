// Health & Wellness landing — PERSIAN mirror — owner order 2026-10-16
// («فقط باید ترجمه بشه و نسخه فارسی اون ساخته بشه … با همین شکل فونت و زیبایی»).
// Built by scripts/build-health-landing.mjs from the SAME uploaded bytes as the
// EN version: identical design/fonts/layout — dir="rtl", Vazirmatn added only
// as the Persian glyph font (Inter/Space Grotesk untouched for Latin+digits),
// translated strings, placeholder slots verbatim, numeric tokens identical,
// and zero Persian comma «،» (standing rule). The EN version stays byte-exact.
import { LANDING_FA } from '../landing-fa';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(LANDING_FA, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
