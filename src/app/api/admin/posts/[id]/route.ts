import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { sanitizePostHtml } from '@/lib/sanitize';
import { notifyIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const b = await req.json();
    const data: Record<string, unknown> = {};
    for (const k of ['titleEn', 'titleFa', 'excerptEn', 'excerptFa', 'contentEn', 'contentFa', 'cover']) {
      if (!(k in b)) continue;
      const v = b[k];
      // XSS guard on UPDATE, matching POST (round-3 finding M1): the admin
      // panel renders contentEn with dangerouslySetInnerHTML, so nothing
      // unsanitized may reach the DB through this path either. Null/undefined
      // still clears a field, exactly as before.
      data[k] =
        (k === 'contentEn' || k === 'contentFa') && typeof v === 'string' && v.length > 0
          ? sanitizePostHtml(v)
          : v;
    }
    if ('published' in b) data.published = Boolean(b.published);
    if ('featured' in b) data.featured = Boolean(b.featured);
    const post = await db.post.update({ where: { id }, data });
    // instant indexing: a (un)publish or content edit re-pings Bing/Yandex
    if (post.published) {
      notifyIndexNow([`${BASE}/blog/${encodeURIComponent(post.slug)}`, `${BASE}/blog`, `${BASE}/`]);
    }
    // content changed → trigger a fresh static build (public pages carry a
    // build-time CSP meta; regenerating HTML at runtime would drop it).
    // VERCEL_DEPLOY_HOOK_URL is optional — without it, changes publish on
    // the next deploy/git push instead.
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    console.error('admin patch post error:', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const gone = await db.post.delete({ where: { id } });
    // delist promptly: IndexNow + feed readers get the 404/refresh signal
    notifyIndexNow([`${BASE}/blog/${encodeURIComponent(gone.slug)}`]);
    // content changed → trigger a fresh static build (public pages carry a
    // build-time CSP meta; regenerating HTML at runtime would drop it).
    // VERCEL_DEPLOY_HOOK_URL is optional — without it, changes publish on
    // the next deploy/git push instead.
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin delete post error:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
