import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { THEMES } from '@/lib/themes';

export const dynamic = 'force-dynamic';

// GET /api/admin/settings — current site settings
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const rows = await db.siteSetting.findMany();
  const settings: Record<string, string> = {};
  rows.forEach((r) => (settings[r.key] = r.value));

  return NextResponse.json({ settings, availableThemes: THEMES });
}

// PATCH /api/admin/settings — update a setting (e.g. { theme: "autumn" })
export async function PATCH(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const body = await req.json();

  if (body.theme) {
    if (!THEMES.some((t) => t.id === body.theme)) {
      return NextResponse.json({ error: 'Unknown theme' }, { status: 400 });
    }
    await db.siteSetting.upsert({
      where: { key: 'theme' },
      update: { value: body.theme },
      create: { key: 'theme', value: body.theme },
    });
    // content changed → trigger a fresh static build (public pages carry a
    // build-time CSP meta; regenerating HTML at runtime would drop it).
    // VERCEL_DEPLOY_HOOK_URL is optional — without it, changes publish on
    // the next deploy/git push instead.
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    return NextResponse.json({ ok: true, theme: body.theme });
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
}
