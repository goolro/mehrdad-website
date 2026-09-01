import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin authentication secret.
 *
 * SECURITY (docs/SECURITY.md):
 * - The password is read from the ADMIN_PASSWORD environment variable and
 *   MUST NOT have a hardcoded fallback — this repo is public.
 * - Set it in the local `.env` file (gitignored). See `.env.example`.
 * - Empty value => every admin request is rejected (fail closed).
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export function checkAdmin(req: NextRequest): NextResponse | null {
  const key = req.headers.get('x-admin-key');
  if (key !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
