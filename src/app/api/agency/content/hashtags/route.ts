import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { HASHTAG_SEED, addHashtag, listHashtags, removeHashtag } from '@/lib/agency/content';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // bank seeding rides the same cold-start window

/** Static fallback rows (`static:<tag>` ids) when the database is degraded. */
function staticTags() {
  return HASHTAG_SEED.map((t, i) => ({ id: `static:${t.tag}:${i}`, ...t }));
}

/** GET — the full editable hashtag bank; falls back to the committed constants. */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const tags = await listHashtags();
    return NextResponse.json({ tags: tags.length > 0 ? tags : staticTags(), dbOk: tags.length > 0 });
  } catch {
    return NextResponse.json({ tags: staticTags(), dbOk: false });
  }
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

  try {
    await removeHashtag(id);
  } catch {
    // static fallback rows (and transient DB hiccups) — the UI already
    // removed the chip optimistically; nothing else to do
  }
  return NextResponse.json({ ok: true });
}
