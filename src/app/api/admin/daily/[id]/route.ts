import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { sanitizePostHtml, sanitizePlainText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseTags(v: unknown): string | null {
  if (v === undefined) return null;
  if (!Array.isArray(v)) return null;
  const arr = v
    .map((t) => String(t || '').trim())
    .filter(Boolean)
    .slice(0, 10);
  return JSON.stringify(arr);
}

/** edit one daily article — every field including the slug is patchable */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const b = await req.json();
    const data: Record<string, unknown> = {};
    if (b.slug !== undefined) {
      const slug = String(b.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
      if (!SLUG_RE.test(slug)) {
        return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
      }
      const clash = await db.dailyArticle.findUnique({ where: { slug } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });
      }
      data.slug = slug;
    }
    if (b.titleEn !== undefined) data.titleEn = sanitizePlainText(b.titleEn, 200);
    if (b.titleFa !== undefined) data.titleFa = sanitizePlainText(b.titleFa, 200);
    if (b.summaryEn !== undefined) data.summaryEn = sanitizePlainText(b.summaryEn, 400);
    if (b.summaryFa !== undefined) data.summaryFa = sanitizePlainText(b.summaryFa, 400);
    if (b.bodyEn !== undefined) data.bodyEn = sanitizePostHtml(b.bodyEn);
    if (b.bodyFa !== undefined) data.bodyFa = sanitizePostHtml(b.bodyFa);
    if (b.verdictEn !== undefined) data.verdictEn = sanitizePostHtml(b.verdictEn);
    if (b.verdictFa !== undefined) data.verdictFa = sanitizePostHtml(b.verdictFa);
    if (b.tagsEn !== undefined) data.tagsEn = parseTags(b.tagsEn);
    if (b.tagsFa !== undefined) data.tagsFa = parseTags(b.tagsFa);
    if (b.day !== undefined && DAY_RE.test(String(b.day))) data.day = b.day;
    if (b.published !== undefined) data.published = !!b.published;
    // staggered publishing: patch the go-live slot. Empty string / null clears it (live now).
    if (b.publishAt !== undefined) {
      if (b.publishAt === null || String(b.publishAt).trim() === '') {
        data.publishAt = null;
      } else {
        const d = new Date(String(b.publishAt));
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: 'publishAt is not a valid date' }, { status: 400 });
        }
        data.publishAt = d;
      }
    }

    const item = await db.dailyArticle.update({ where: { id }, data });
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    notifyIndexNow([`${BASE}/daily`, `${BASE}/daily/${item.slug}`]);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('admin daily patch error:', e);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    await db.dailyArticle.delete({ where: { id } });
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin daily delete error:', e);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
