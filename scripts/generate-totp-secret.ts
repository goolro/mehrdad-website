/**
 * Generate a TOTP secret for the admin panel's optional second factor.
 *
 *   bun scripts/generate-totp-secret.ts
 *
 * 1. Add the printed value as ADMIN_TOTP_SECRET in the hosting environment
 *    (cPanel → Node.js App → Environment variables).
 * 2. Add the same secret to your authenticator app (Google Authenticator,
 *    Aegis, 1Password…) via "Enter a setup key", or scan the otpauth URI
 *    with an app that supports it.
 * 3. Restart the app — login now requires password + 6-digit code.
 */
import { randomBytes } from 'node:crypto';

// RFC 4226 recommends ≥160-bit secrets; 20 bytes → base32 = 32 chars
const RAW = randomBytes(20);

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let bits = 0;
let value = 0;
let out = '';
for (const byte of RAW) {
  value = (value << 8) | byte;
  bits += 8;
  while (bits >= 5) {
    out += A[(value >>> (bits - 5)) & 31];
    bits -= 5;
  }
}
if (bits > 0) out += A[(value << (5 - bits)) & 31];

console.log('ADMIN_TOTP_SECRET (base32):', out);
console.log('\nAdd to your authenticator app as a setup key:');
console.log(`  issuer:  mehrdad.ir`);
console.log(`  secret:  ${out}`);
console.log(`  type:    Time-based (TOTP), 6 digits, 30 s, SHA-1`);
console.log(`  otpauth: otpauth://totp/mehrdad.ir:admin?secret=${out}&issuer=mehrdad.ir&algorithm=SHA1&digits=6&period=30`);
