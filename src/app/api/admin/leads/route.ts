import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

// D-057 (growth funnel, 2026-10-25): Task 17 (D-052) captures article-CTA
// leads into the Lead table and emails the owner per lead — but capture
// without visibility is a leaky funnel. This endpoint is the owner's single
// view over every captured lead: JSON list + stats for the admin panel, and
// a CSV download (?format=csv) for outreach. Same checkAdmin gate as the
// other admin APIs — cookie-authenticated, no raw password ever travels.

function csvCell(value: string): string {
  // wrap every cell in quotes and double the inner quotes — safe for
  // commas, newlines and Excel's leading-= formula injection
  return `"${value.replace(/"/g, '""').replace(/^=/, "'=")}"`;
}

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });

    const now = Date.now();
    const day = 86_400_000;
    const age = (d: Date) => now - new Date(d).getTime();
    const stats = {
      total: leads.length,
      last7: leads.filter((l) => age(l.createdAt) <= 7 * day).length,
      last30: leads.filter((l) => age(l.createdAt) <= 30 * day).length,
      unique: new Set(leads.map((l) => l.email.trim().toLowerCase())).size,
    };

    if (req.nextUrl.searchParams.get('format') === 'csv') {
      // BOM so Excel opens the UTF-8 file correctly (Persian slugs stay readable)
      const rows = leads.map((l) =>
        [
          l.id,
          l.email,
          l.source,
          l.lang ?? '',
          l.slug ?? '',
          new Date(l.createdAt).toISOString(),
        ]
          .map(csvCell)
          .join(','),
      );
      const csv = '\uFEFF' + ['id,email,source,lang,slug,createdAt', ...rows].join('\r\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mehrdad-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({
      leads: leads.slice(0, 500).map((l) => ({
        id: l.id,
        email: l.email,
        source: l.source,
        lang: l.lang,
        slug: l.slug,
        createdAt: l.createdAt,
      })),
      stats,
    });
  } catch (e) {
    console.error('admin leads error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
