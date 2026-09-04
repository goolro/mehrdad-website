import type { NextRequest } from 'next/server';

/**
 * Minimal fixed-window rate limiter for a single-node deployment.
 *
 * WHY: the public endpoints (admin login, AI chat, contact form, comments)
 * had no request throttling at all — open to brute force, spam and AI-cost
 * abuse. This runs in-process (no Redis needed) which is the right fit for
 * the single Passenger instance on cPanel.
 *
 * Semantics: per-key counters with a fixed window. Good enough for abuse
 * control; not intended as exact accounting.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// memory hygiene: drop expired buckets when the map grows large
function sweep(now: number): void {
  if (buckets.size < 4000) return;
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** seconds until the window resets (for Retry-After header) */
  retryAfter: number;
}

/**
 * Check and consume one unit for `key`.
 * @param limit     max requests allowed per window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP for rate limiting behind the cPanel/Passenger proxy.
 */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

/** Standard 429 response with Retry-After. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Please slow down.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
    },
  });
}
