import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { chatCompletion, getActiveProvider, type ProviderConfig } from '@/lib/ai-provider';
import { readJsonBody } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Admin "test connection" for a stored provider: runs a tiny completion so
 * the owner can verify a new key/endpoint/model works before relying on it.
 * Body: { id } — an empty/absent body tests the currently active provider.
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const parsed = await readJsonBody(req, 2);
  const id = parsed.ok && parsed.data ? String(parsed.data.id ?? '').trim() : '';

  let provider: ProviderConfig | null = null;
  if (id) {
    const row = await db.aiProvider.findUnique({ where: { id } });
    if (row) {
      provider = { id: row.id, name: row.name, baseUrl: row.baseUrl, apiKey: row.apiKey, model: row.model };
    }
  } else {
    provider = await getActiveProvider();
  }

  if (!provider) {
    return NextResponse.json({ ok: false, error: 'Provider not found' }, { status: 404 });
  }

  const started = Date.now();
  try {
    const reply = await chatCompletion(
      provider,
      [
        { role: 'system', content: 'You are a connection test. Reply with exactly: OK' },
        { role: 'user', content: 'ping' },
      ],
      // thinking models (GLM-4.5+/5.x) burn tokens on reasoning before the
      // final "OK" — a tiny cap returned an empty content and failed the
      // test even with a perfectly valid key.
      { timeoutMs: 30_000, maxTokens: 200, temperature: 0 }
    );
    return NextResponse.json({
      ok: reply.length > 0,
      latencyMs: Date.now() - started,
      model: provider.model,
      sample: reply.slice(0, 60),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, latencyMs: Date.now() - started, error: String((e as Error)?.message || e).slice(0, 300) },
      { status: 502 }
    );
  }
}
