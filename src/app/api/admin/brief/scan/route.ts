import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { scanSources, isBriefCategory } from '@/lib/brief';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Stage 2 — fetch every active source of a lane and extract its heading
 * outline. Scans younger than 6h are reused unless force=true. The UI shows
 * per-source status so blocked/weak sources are visible at a glance.
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json().catch(() => ({}));
    const category = isBriefCategory(b.category) ? b.category : undefined;
    const results = await scanSources({ category, force: !!b.force });
    const ok = results.filter((r) => r.ok && r.headings.length > 0);
    const failed = results.filter((r) => !r.ok);
    const summary = results.map((r) => ({
      sourceId: r.sourceId,
      name: r.name,
      url: r.url,
      lang: r.lang,
      category: r.category,
      ok: r.ok,
      error: r.error,
      title: r.title,
      cached: r.cached,
      scanId: r.scanId,
      headingCount: r.headings.length,
    }));
    return NextResponse.json({
      ok: true,
      scanned: results.length,
      okCount: ok.length,
      failedCount: failed.length,
      totalHeadings: results.reduce((n, r) => n + r.headings.length, 0),
      results: summary,
    });
  } catch (e) {
    console.error('brief scan error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Scan failed' }, { status: 500 });
  }
}
