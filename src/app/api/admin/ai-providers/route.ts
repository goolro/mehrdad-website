import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { invalidateProviderCache, isValidBaseUrl, maskKey } from '@/lib/ai-provider';
import { readJsonBody, jsonBodyError } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Admin CRUD for AI providers (OpenAI-compatible text endpoints).
 *
 * The raw apiKey is write-only: GET responses carry maskKey()'d values and a
 * PATCH without `apiKey` keeps the stored one. Exactly one provider is
 * active at a time — activating one deactivates the rest.
 */

function serialize(row: {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  active: boolean;
  createdAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    baseUrl: row.baseUrl,
    model: row.model,
    active: row.active,
    keyMasked: maskKey(row.apiKey),
    createdAt: row.createdAt,
  };
}

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const rows = await db.aiProvider.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ providers: rows.map(serialize) });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const parsed = await readJsonBody(req, 8);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const b = parsed.data || {};
    const name = String(b.name ?? '').trim().slice(0, 80);
    const baseUrl = String(b.baseUrl ?? '').trim().slice(0, 300).replace(/\/+$/, '');
    const apiKey = String(b.apiKey ?? '').trim().slice(0, 400);
    const model = String(b.model ?? '').trim().slice(0, 120);

    if (!name || !baseUrl || !apiKey || !model) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!isValidBaseUrl(baseUrl)) {
      return NextResponse.json({ error: 'Invalid base URL' }, { status: 400 });
    }

    const count = await db.aiProvider.count();
    const created = await db.aiProvider.create({
      data: { name, baseUrl, apiKey, model, active: count === 0 }, // first one auto-activates
    });
    invalidateProviderCache();
    return NextResponse.json({ ok: true, provider: serialize(created) });
  } catch (e) {
    console.error('ai-providers create error:', e);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const parsed = await readJsonBody(req, 8);
  if (!parsed.ok) return jsonBodyError(parsed.error);

  try {
    const b = parsed.data || {};
    const id = String(b.id ?? '').trim();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const existing = await db.aiProvider.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data: Record<string, unknown> = {};

    if (typeof b.active === 'boolean') {
      data.active = b.active;
      if (b.active) {
        // single-active invariant: deactivate everyone else first
        await db.aiProvider.updateMany({ where: { id: { not: id } }, data: { active: false } });
      }
    }

    if (b.name !== undefined) {
      const name = String(b.name).trim().slice(0, 80);
      if (!name) return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
      data.name = name;
    }
    if (b.baseUrl !== undefined) {
      const baseUrl = String(b.baseUrl).trim().slice(0, 300).replace(/\/+$/, '');
      if (!isValidBaseUrl(baseUrl)) return NextResponse.json({ error: 'Invalid base URL' }, { status: 400 });
      data.baseUrl = baseUrl;
    }
    if (b.model !== undefined) {
      const model = String(b.model).trim().slice(0, 120);
      if (!model) return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
      data.model = model;
    }
    if (b.apiKey !== undefined && String(b.apiKey).trim()) {
      data.apiKey = String(b.apiKey).trim().slice(0, 400);
    }

    const updated = await db.aiProvider.update({ where: { id }, data });
    invalidateProviderCache();
    return NextResponse.json({ ok: true, provider: serialize(updated) });
  } catch (e) {
    console.error('ai-providers update error:', e);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    await db.aiProvider.delete({ where: { id } });
    invalidateProviderCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
