/**
 * Netlify Scheduled Function — replaces the vercel.json cron entry for
 * /api/cron/index-ping after the Vercel → Netlify migration (2026-11).
 *
 * Vercel ran it at "0 3 * * *" (03:00 Asia/Tehran) — Tehran is UTC+3:30
 * year-round, so 03:00 Tehran = 23:30 UTC: "30 23".
 *
 * Calls the real endpoint with the shared cron secret; the endpoint owns
 * all logic (sitemap sweep → IndexNow submission → optional Google ping).
 * Manual test: GET /.netlify/functions/cron-index-ping
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
    res = await fetch(`${origin}/api/cron/index-ping`, {
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

export const config = { schedule: '30 23 * * *' };
