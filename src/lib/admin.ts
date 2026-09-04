import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin authentication secret.
 *
 * SECURITY:
 * - The password is read from the ADMIN_PASSWORD environment variable and
 *   MUST NOT have a hardcoded fallback — this repo is public.
 * - Set it in the local `.env` file (gitignored). See `.env.example`.
 * - FAIL-CLOSED: if the variable is unset/empty, every admin operation
 *   returns 503 "Admin auth is unavailable" — an empty password can never
 *   match. This is enforced in checkAdmin() and in the login route.
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

/** True only when a real admin secret is configured at runtime. */
export function adminAuthAvailable(): boolean {
  return ADMIN_PASSWORD.length > 0;
}

/**
 * Constant-time string comparison.
 * Both inputs are hashed to a fixed length first, so the comparison
 * never leaks the secret's length and never throws on length mismatch.
 */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ha = createHash('sha256').update(a, 'utf8').digest();
  const hb = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdmin(req: NextRequest): NextResponse | null {
  if (!adminAuthAvailable()) {
    return NextResponse.json({ error: 'Admin auth is unavailable' }, { status: 503 });
  }
  const key = req.headers.get('x-admin-key') ?? '';
  if (!safeEqual(key, ADMIN_PASSWORD)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
