/**
 * Netlify Scheduled Function — replaces the vercel.json cron entry for
 * /api/cron/daily-generate after the Vercel → Netlify migration (2026-11).
 *
 * Vercel ran it at "0 2 * * *" (02:00 Asia/Tehran) — Tehran is UTC+3:30
 * year-round since Iran dropped DST, so 02:00 Tehran = 22:30 UTC.
 * Netlify scheduled functions are UTC-only, hence "30 22".
 *
 * The handler simply calls the real endpoint with the shared cron secret:
 * all logic (auth, generation, logging) stays in ONE place —
 * src/app/api/cron/daily-generate/route.ts — and this wrapper never
 * duplicates it. Manual test: GET /.netlify/functions/cron-daily-generate
 */
export default async (req: Request) => {
  const origin = process.env.CRON_SELF_ORIGIN || 'https://mehrdad-website.netlify.app';
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ ok: false, error: 'missing CRON_SECRET' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
  let res: Response;
  try {
    res = await fetch(`${origin}/api/cron/daily-generate`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e).slice(0, 200) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
  const body = await res.text();
  return new Response(body.slice(0, 500), {
    status: res.status,
    headers: { 'content-type': 'application/json' },
  });
};

export const config = { schedule: '30 22 * * *' };
