/**
 * Server-side PostHog events (2026-02).
 *
 * Fire-and-forget analytics for backend business events the client never
 * sees reliably (contact submissions after validation, AI pipeline runs,
 * LinkedIn publishes). Callers should schedule these with `after()` from
 * 'next/server' so delivery happens after the response is sent without
 * blocking it.
 *
 * Uses the same PUBLIC ingest key as the client provider (phc_… keys only
 * allow enqueueing events). No-ops silently when no key is configured, so
 * local/dev environments without analytics stay clean.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_poVbYiDr9sUZcuecq44ftUAPMVXU9hriYChzjXgiR4M3';
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export async function trackServerEvent(
  event: string,
  distinctId: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!KEY) return;
  try {
    const { PostHog } = await import('posthog-node');
    // One-shot client: flushAt 1 + shutdown() guarantees delivery before
    // a serverless function freezes (the Vercel-safe capture pattern).
    const client = new PostHog(KEY, { host: HOST, flushAt: 1, flushInterval: 0 });
    client.capture({ event, distinctId, properties });
    await client.shutdown();
  } catch (e) {
    // analytics must never break a business flow — log and move on
    console.error('[posthog] server event failed:', event, e instanceof Error ? e.message : e);
  }
}
