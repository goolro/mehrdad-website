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
 *
 * TRUST MODEL: Apache/Passenger acts as the only reverse proxy and APPENDS
 * the real client address to any client-sent X-Forwarded-For header. The
 * LAST entry is therefore the proxy-observed client IP; taking the FIRST
 * would let an attacker rotate spoofed IPs and bypass every rate limit.
 *
 * `X-Real-IP` is deliberately NOT consulted (round-3 finding M4): it is a
 * plain client-controlled header, so honouring it would hand an attacker a
 * one-header rate-limit bypass on any request path that reaches Node without
 * the proxy appending XFF. Requests with no XFF at all collapse into the
 * single 'unknown' bucket — stricter, never looser. Both real deployments
 * (cPanel/Apache and the Caddy preview) set X-Forwarded-For, so the bucket is
 * per-client in practice.
 */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown';
}

/**
 * Reject oversized JSON bodies early. The App Router has no default body
 * limit, and on a memory-capped shared host a multi-megabyte POST is a
 * trivially cheap DoS vector. Only the unauthenticated public endpoints
 * use this (authenticated admin is a trusted principal).
 */
export function bodyTooLarge(req: NextRequest, maxKb = 32): boolean {
  const len = Number(req.headers.get('content-length') || '0');
  return Number.isFinite(len) && len > maxKb * 1024;
}

/** Standard 413 response for the body-size guard. */
export function payloadTooLarge(): Response {
  return new Response(JSON.stringify({ error: 'Payload too large' }), {
    status: 413,
    headers: { 'Content-Type': 'application/json' },
  });
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

/** Standard 400 response for a body that is not valid JSON. */
export function badRequest(error = 'Invalid JSON body'): Response {
  return new Response(JSON.stringify({ error }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export type LimitedJsonResult =
  | { ok: true; data: any }
  | { ok: false; error: 'payload-too-large' }
  | { ok: false; error: 'invalid-json' };

/**
 * Read + parse a JSON body with a HARD size cap.
 *
 * WHY (round-3 finding M3): `bodyTooLarge()` only inspects `Content-Length`,
 * and a request sent with `Transfer-Encoding: chunked` carries no such
 * header — so the old guard returned false and the route handed an
 * unbounded body to `req.json()`. On a memory-capped shared host that is the
 * exact DoS the guard exists to prevent. This helper counts the bytes as
 * they stream in and stops at the limit regardless of the transfer encoding.
 *
 * The two failure modes are reported separately so each route can keep its
 * own status-code contract (login answers malformed JSON with 401, the
 * public forms with 400).
 */
export async function readJsonBody(req: NextRequest, maxKb = 32): Promise<LimitedJsonResult> {
  // fast path: an honest Content-Length over the cap never gets read at all
  if (bodyTooLarge(req, maxKb)) return { ok: false, error: 'payload-too-large' };

  const limit = maxKb * 1024;
  let text = '';
  try {
    if (req.body) {
      const reader = req.body.getReader();
      const decoder = new TextDecoder();
      let tooLarge = false;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          if (text.length > limit) {
            tooLarge = true; // chunked body with no Content-Length — counted here
            break;
          }
        }
        if (!tooLarge) text += decoder.decode();
      } finally {
        if (tooLarge) await reader.cancel().catch(() => {});
        else {
          try {
            reader.releaseLock();
          } catch {
            /* stream already closed */
          }
        }
      }
      if (tooLarge) return { ok: false, error: 'payload-too-large' };
    }
    if (!text) return { ok: true, data: null };
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, error: text.length > limit ? 'payload-too-large' : 'invalid-json' };
  }
}

/** Map a readJsonBody failure onto the standard public-endpoint responses. */
export function jsonBodyError(error: 'payload-too-large' | 'invalid-json'): Response {
  return error === 'payload-too-large' ? payloadTooLarge() : badRequest();
}
