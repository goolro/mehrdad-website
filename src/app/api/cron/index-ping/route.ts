import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isUnpublishedPostSlug } from '@/lib/queries';
import { submitIndexNow, indexNowKey } from '@/lib/indexnow';
import { googleIndexingEnabled, notifyGoogleBatch } from '@/lib/google-indexing';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

/**
 * The indexing program (2026-09, owner request: «یه برنامه بزار ایندکس بشه»).
 *
 * A scheduled daily push of the site's URLs to the instant-indexing
 * channels, so fresh content reaches Bing/Yandex (IndexNow — Bing feeds
 * ChatGPT Search & Copilot) within a day even when nobody touches the
 * admin panel, and optionally Google (Indexing API) once the owner wires
 * a service account.
 *
 * Schedule: vercel.json crons → daily 03:00 UTC (≈06:30 Tehran).
 *   - Vercel calls with `Authorization: Bearer $CRON_SECRET` when the
 *     CRON_SECRET env is set on Vercel. Manual runs use ?key=<IndexNow key>.
 *   - If CRON_SECRET is not configured the endpoint stays open but is
 *     rate-limited: worst abuse is pinging the site's OWN public URLs —
 *     harmless by construction.
 *
 * Cadence policy (be a polite citizen, not a spammer):
 *   - EVERY run: home + /blog + /work + posts modified in the last 72h
 *   - FULL sweep additionally on Sundays (or ?full=1): every sitemap URL
 *     (~100 URLs — inside IndexNow's 10k and Google's daily quotas)
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

const STATICS = ['/', '/blog', '/work', '/services', '/fde', '/lab', '/about', '/contact'];

// daily set — only pages that plausibly change day-to-day. IndexNow's own
// usage guidance says repeatedly notifying UNCHANGED URLs makes them dampen
// your pings, so the rarely-changing pages ride the weekly Sunday sweep
// instead of being pinged every morning (owner asked: «باعث مشکل نشه؟»).

export async function GET(req: NextRequest) {
  // auth: Vercel cron bearer, manual indexnow key, or open-if-unset
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    const key = req.nextUrl.searchParams.get('key') || '';
    if (auth !== `Bearer ${secret}` && key !== indexNowKey()) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else {
    // no cron secret configured: light guard against hammering
    const rl = rateLimit(`cronping:${clientIp(req)}`, 4, 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);
  }

  const full =
    req.nextUrl.searchParams.get('full') === '1' || new Date().getUTCDay() === 0;

  try {
    // ── collect URL set ─────────────────────────────────────────────
    const urls = new Set<string>(
      (full ? STATICS : ['/', '/blog']).map((p) => `${BASE}${p}`),
    );

    const posts = await db.post.findMany({
      where: { published: true },
      orderBy: { modified: 'desc' },
      select: { slug: true, modified: true },
    });
    const fresh: string[] = [];
    const cutoff = Date.now() - 72 * 60 * 60 * 1000;
    for (const p of posts) {
      if (isUnpublishedPostSlug(p.slug)) continue; // 404s must never be pushed
      const url = `${BASE}/blog/${p.slug}`;
      if (full) urls.add(url);
      else if (p.modified.getTime() >= cutoff) fresh.push(url);
    }
    if (!full) {
      for (const url of fresh) urls.add(url);
    }

    if (full) {
      // project detail pages render under /work/<slug> for BOTH sections
      // (work + lab); the /lab page itself is in STATICS. Full sweep only.
      const projects = await db.project.findMany({ select: { slug: true } });
      for (const pr of projects) urls.add(`${BASE}/work/${pr.slug}`);
    }

    const list = [...urls];
    const indexNow = await submitIndexNow(list);
    const google = await notifyGoogleBatch(list);

    return NextResponse.json({
      ok: true,
      mode: full ? 'full' : 'incremental',
      urlCount: list.length,
      indexNow: { ok: indexNow.ok, status: indexNow.status, submitted: indexNow.count },
      google: {
        enabled: googleIndexingEnabled(),
        submitted: google.submitted,
        ok: google.ok,
        failed: google.failed,
      },
    });
  } catch (e) {
    console.error('index-ping cron error:', e);
    return NextResponse.json({ ok: false, error: 'index ping failed' }, { status: 500 });
  }
}
