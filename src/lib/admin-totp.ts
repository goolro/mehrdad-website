import { TOTP, Secret } from 'otpauth';

/**
 * Optional TOTP-based 2FA for the admin panel (defense-in-depth on top of
 * ADMIN_PASSWORD — see SECURITY.md §2).
 *
 * Enabled by setting ADMIN_TOTP_SECRET (base32, e.g. generated with
 * `bun scripts/generate-totp-secret.ts`) in the hosting environment.
 * When the variable is absent the factor is simply skipped, so existing
 * deployments keep working until the owner opts in.
 *
 * A 6-digit code has 10^6 possibilities; the login route's brute-force
 * guard (5 attempts / 15 min / IP) makes online guessing impractical.
 */

const ISSUER = 'mehrdad.ir';

function makeTotp(): TOTP | null {
  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!secret) return null;
  try {
    return new TOTP({
      issuer: ISSUER,
      label: 'admin',
      algorithm: 'SHA1', // standard for Google Authenticator / Aegis / etc.
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret.replace(/\s+/g, '').toUpperCase()),
    });
  } catch {
    // an invalid secret must fail closed, never open
    return null;
  }
}

/** true when the second factor is configured for this deployment */
export function totpEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOTP_SECRET);
}

/** verify a user-supplied code, tolerating ±1 period of clock drift */
export function verifyTotp(token: unknown): boolean {
  if (typeof token !== 'string') return false;
  const t = makeTotp();
  if (!t) return false;
  const clean = token.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  return t.validate({ token: clean, window: 1 }) !== null;
}

/** otpauth:// URI for the owner's authenticator app (setup once) */
export function totpProvisioningUri(): string {
  const t = makeTotp();
  return t ? t.toString() : '';
}
