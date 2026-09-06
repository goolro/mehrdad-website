import { db } from '@/lib/db';

/**
 * Server-only AI provider layer.
 *
 * The admin configures one or more OpenAI-compatible providers (baseUrl +
 * apiKey + model) in the admin panel; they are stored in the AiProvider
 * table and used by the public chatbot and the admin AI writer/translator.
 * Exactly one provider is "active" at a time.
 *
 * SECURITY: the raw apiKey never leaves the backend. Admin API responses
 * only ever contain maskKey()'d values, and this module is imported by
 * server routes exclusively.
 *
 * FALLBACK: when no provider is configured (or a call fails hard), callers
 * may fall back to the sandbox ZAI SDK (dev convenience). On hosting
 * environments where ZAI is unavailable the caller's try/catch converts the
 * failure into a graceful, user-facing message.
 */

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ChatTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Small TTL cache so a busy chat session does not hit the DB per message. */
const PROVIDER_CACHE_TTL_MS = 60 * 1000;
let providerCache: { at: number; value: ProviderConfig | null } | null = null;

/** Drop the cached provider (called after any admin provider write). */
export function invalidateProviderCache(): void {
  providerCache = null;
}

export async function getActiveProvider(): Promise<ProviderConfig | null> {
  if (providerCache && Date.now() - providerCache.at < PROVIDER_CACHE_TTL_MS) {
    return providerCache.value;
  }
  const row = await db.aiProvider.findFirst({ where: { active: true } });
  const value: ProviderConfig | null = row
    ? { id: row.id, name: row.name, baseUrl: row.baseUrl, apiKey: row.apiKey, model: row.model }
    : null;
  providerCache = { at: Date.now(), value };
  return value;
}

function endpointOf(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
}

/**
 * One OpenAI-compatible chat completion. Throws on HTTP/network errors —
 * callers own the retry & graceful-degradation policy.
 */
export async function chatCompletion(
  provider: ProviderConfig,
  messages: ChatTurn[],
  opts: { timeoutMs?: number; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 50_000);
  try {
    const res = await fetch(endpointOf(provider.baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: opts.maxTokens ?? 900,
        temperature: opts.temperature ?? 0.6,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`provider ${res.status}: ${detail.slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || '';
  } finally {
    clearTimeout(timer);
  }
}

/** Masked form for admin UI/API — safe to send to the browser. */
export function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 3)}••••••••${key.slice(-4)}`;
}

/** Basic URL sanity for the admin "add provider" form. */
export function isValidBaseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sandbox/dev fallback via the ZAI SDK. Returns '' when the SDK is
 * unavailable (e.g. on hosting platforms without it) — never throws for
 * "not available", so callers can decide the final degradation.
 *
 * NOTE: ZAI's gateway historically wants the system prompt delivered as the
 * first `assistant` message, so `system` roles are remapped here.
 */
export async function zaiComplete(
  messages: ChatTurn[],
  opts: { timeoutMs?: number; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  try {
    const { default: ZAI } = await import('z-ai-web-dev-sdk');
    const zai = await ZAI.create();
    const payload = {
      messages: messages.map((m) =>
        m.role === 'system' ? { role: 'assistant' as const, content: m.content } : { role: m.role, content: m.content }
      ),
      thinking: { type: 'disabled' as const },
    };
    const completion = await zai.chat.completions.create(payload);
    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error('zai fallback failed:', err);
    return '';
  }
}

/**
 * Strict text completion for admin tools (AI writer / translator):
 * admin provider first, ZAI fallback second; throws when BOTH paths fail
 * so callers return a clean 500 instead of persisting empty output.
 */
export async function textCompleteStrict(
  messages: ChatTurn[],
  opts: { timeoutMs?: number; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const provider = await getActiveProvider();
  if (provider) {
    try {
      const out = await chatCompletion(provider, messages, opts);
      if (out) return out;
      console.error('provider returned empty completion:', provider.name);
    } catch (e) {
      console.error('provider completion failed:', e);
    }
  }
  const out = await zaiComplete(messages, opts);
  if (out) return out;
  throw new Error(provider ? 'All AI providers failed' : 'No AI provider configured');
}
