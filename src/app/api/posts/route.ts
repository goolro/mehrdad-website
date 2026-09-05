import { NextRequest, NextResponse } from 'next/server';
import { listPosts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    // `|| fallback`: a non-numeric page/perPage must degrade to the default,
    // never reach Prisma as NaN (NaN take/skip throws → 500)
    const page = Math.max(1, Number.parseInt(sp.get('page') || '1', 10) || 1);
    const perPage = Math.min(48, Math.max(1, Number.parseInt(sp.get('perPage') || '12', 10) || 12));
    const category = sp.get('category') || '';
    const tag = sp.get('tag') || '';
    const search = (sp.get('search') || '').trim();
    const featured = sp.get('featured') === '1';

    const result = await listPosts({ page, perPage, category, tag, search, featured });
    return NextResponse.json(result);
  } catch (e) {
    console.error('posts api error:', e);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}
