import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { addHashtag, listHashtags, removeHashtag } from '@/lib/agency/content';

export const dynamic = 'force-dynamic';

/** GET — the full editable hashtag bank. */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const tags = await listHashtags();
  return NextResponse.json({ tags });
}

/** POST { tag, lang?, category? } — add a popular hashtag. */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  let body: { tag?: string; lang?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }

  const tag = (body.tag ?? '').trim().replace(/^#/, '');
  if (!tag) return NextResponse.json({ error: 'هشتگ خالی است' }, { status: 400 });

  try {
    const created = await addHashtag(tag, body.lang === 'en' ? 'en' : 'fa', body.category || 'general');
    return NextResponse.json({ ok: true, tag: created });
  } catch {
    return NextResponse.json({ error: 'این هشتگ قبلاً اضافه شده است' }, { status: 409 });
  }
}

/** DELETE ?id= — remove a hashtag from the bank. */
export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id لازم است' }, { status: 400 });

  await removeHashtag(id);
  return NextResponse.json({ ok: true });
}
