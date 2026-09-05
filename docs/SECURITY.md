# SECURITY — mehrdad.ir

Status: maintained · Last updated: 2026-09-05

This document is the single source of truth for how secrets, auth and
data-privacy are handled in this repository, and it records the security
incident history. It exists because **the repository is public** — anything
committed here must be assumed readable by everyone, forever.

## 1. Secret policy (non-negotiable)

- Secrets live **only** in the environment: local `.env` (gitignored) or
  the hosting platform's secret manager.
- `.env.example` lists variable **names only**, never values.
- Before every commit: `git diff --cached` is scanned for secrets
  (passwords, tokens, keys, connection strings) and `.gitignore` is
  checked. Runtime artifacts (`*.pid`, `dev.log`, DB backups) are ignored.
- If a secret is ever committed: **stop, treat it as compromised, rotate
  it** — deleting it in a follow-up commit is not enough because it stays
  in Git history.

### Current secret inventory

| Variable | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma | SQLite file path — no credential (dev; cPanel uses Turso). **Vercel mirror:** Supabase transaction-pooler URL with password — Vercel env only, never committed |
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | `src/lib/db.ts` | Remote DB credentials, set in cPanel env only |
| `ADMIN_PASSWORD` | `src/lib/admin.ts`, `src/lib/admin-session.ts` | Admin login; also the HMAC key material for session tokens |

No third-party API keys are currently stored. When AI provider keys are
introduced (provider management is on the roadmap), they follow the same
policy: env/secret-manager only, never in code, never in the DB in
plaintext.

## 2. Admin auth model

- `POST /api/admin/auth` compares the submitted password against
  `process.env.ADMIN_PASSWORD` (rate-limited 5/IP/15min, see §4).
- `src/lib/admin.ts` exposes `ADMIN_PASSWORD` **with no default**: if the
  variable is unset, the value is `''` and every comparison fails →
  **fail closed** (503 on every admin operation).
- On success the server issues a **stateless HMAC-signed session cookie**
  (`mehrdad_admin`): `<expiry>.<nonce 96-bit>.<HMAC-SHA256>`, key derived
  from `ADMIN_PASSWORD` (nonce added 2026-09-05 so same-second logins
  cannot collide on one token). There is **no session table** —
  verification is a constant-time HMAC recompute, and changing
  `ADMIN_PASSWORD` instantly invalidates every issued session; logout
  revokes the exact token (in-memory revocation set).
- Cookie flags: `HttpOnly` (JS never sees the token), `SameSite=Strict`
  (no cross-site sends → CSRF-resistant), `Secure` in production,
  `Max-Age=12h`.
- Every admin API route calls `checkAdmin(req)` which:
  1. verifies the session cookie (401 if missing/expired/forged),
  2. for state-changing methods rejects cross-origin `Origin` headers
     (403 — CSRF defense-in-depth; also honors `x-forwarded-host`
     behind the cPanel proxy).
- The raw password is typed only at login; it is cleared from client
  memory after login and never sent on API calls, never rendered,
  never logged, never shipped in the client bundle.
- Session restore: `GET /api/admin/auth` tells the client whether the
  cookie is still valid; logout is `DELETE /api/admin/auth`
  (expires the cookie **and** revokes the token).
- **Optional TOTP second factor (2026-09-05, D-025)**: when
  `ADMIN_TOTP_SECRET` (base32) is set, login requires a valid 6-digit
  code (`otpauth` lib, ±1 period drift window) in addition to the
  password; malformed secrets fail closed. Unset ⇒ single-factor
  behavior. Generate with `bun scripts/generate-totp-secret.ts`. The
  10^6 code space is covered by the login rate limit (5 / 15 min / IP).

## 3. User data policy

- The repository contains **no customer/user data**. The SQLite database
  (`db/custom.db`) holds the migrated public WordPress archive (articles,
  public comments — which have **no email field** by schema) plus site
  settings. It is committed as the content snapshot of record; its
  production pipeline is fully documented in `analysis/`.
- Contact-form submissions live only in the runtime database and are
  never committed, exported into fixtures, or referenced in commit
  messages.
- Comment moderation: new comments enter an unapproved queue; migrated
  historical comments are public-by-origin.

## 4. Incident log

| Date | Event | Remediation |
|---|---|---|
| 2026-09-01 | Discovered during the pre-push audit: the admin password was hardcoded as a fallback in `src/lib/admin.ts` **and displayed as a hint** in the admin login UI (`AdminView.tsx`). Had it been pushed, the password would have been public. Caught **before** any push of these files (the public remote predates the admin panel). | Fallback removed (env-only, fail closed); UI hint removed; password rotated to a generated secret stored only in `.env`; `.env.example` added. |
| 2026-09-01 | Local working history contained `.env`, DB backup snapshots and `dev.pid` (tracked before ignore rules matured). | Files untracked + gitignored; **entire local history squashed to one clean baseline commit** before the first push of this state, so none of it exists on the public remote. |
| 2026-09-01 | A GitHub personal access token was shared through an IM channel (not via the repository). | Used only for the git remote URL (stored in untracked `.git/config`). Owner advised to rotate the token after the initial sync. |
| 2026-09-05 | Same IM token was reused for pushes and **remains valid** — the owner explicitly decided not to rotate it for now. Mitigations enabled repo-side: secret scanning + push protection + Dependabot alerts/security updates (via API), so any future leak of a similar secret gets flagged; the token grants repo access only. | Owner reminder kept open: revoke/renew `ghp_9omo…` in GitHub → Settings → Developer settings whenever convenient; it is the single remaining known credential exposed outside the repo. |
| 2026-09-05 | **Vercel and Supabase tokens shared through the same IM channel** (`vcp_1f3s…`, `sbp_fcd7…` — the Supabase one project-scoped). Used transiently for: git pushes (token-in-URL, never saved to `.git/config`), Vercel CLI deploy, and Supabase schema/data setup + app role creation via the Management API. No token value ever entered a committed file; the Supabase **DB password stays owner-held** (never sent through the channel). | Rotation reminder now covers all three tokens — revoke in GitHub → Developer settings, Vercel → Account settings → Tokens, and Supabase → Account → Access tokens once the mirror is stable. |

## 5. Production hardening (cPanel)

- Secrets come only from env vars set in the cPanel Node.js App UI
  (`ADMIN_PASSWORD` fail-closed) — `.env.example` documents every variable;
  real values never enter the repo.
- The AI SDK credential file `.z-ai-config` is gitignored, `chmod 600`,
  placed in the app root or home dir; without it chat degrades gracefully.
- `X-Powered-By` removed (`poweredByHeader: false`).
- Rate limits (fixed window, per-IP, in-memory): login 5/15min,
  chat 10/min, contact 3/10min, comments 5/10min — with `Retry-After`.
- Admin compare is timing-safe (SHA-256 + `timingSafeEqual`); admin
  sessions are HMAC-signed HttpOnly cookies (see §2).
- Security headers: `X-Frame-Options: DENY`, `nosniff`, strict
  `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment off),
  HSTS 6 months.
- **Strict CSP with per-request nonce (2026-09-05, D-023)**:
  `src/proxy.ts` issues `script-src 'self' 'nonce-…' 'strict-dynamic'`
  per request — **no `'unsafe-inline'` for scripts in production**. All
  routes are dynamically rendered so every HTML response carries a fresh
  nonce (Next.js propagates it to its scripts; `layout.tsx` passes it to
  the pre-paint boot script). Verified against a production build in a
  real browser: zero violations. Remaining documented exceptions:
  `style-src 'unsafe-inline'` (React inline *style attributes* — CSS
  cannot execute script in modern browsers) and `'unsafe-eval'` in dev
  only (React development mode).
- CSP covers document routes only; API JSON responses intentionally
  carry no CSP (browsers do not execute JSON) — the harness checks CSP
  on `/` and `/blog` since 2026-09-05.
- XSS: all HTML content is sanitized two-layer with an allowlist
  (`src/lib/sanitize.ts`) — on write (admin posts / AI write / translate)
  and on read (public posts API).
- Admin session cookie is `Secure` only when `NODE_ENV=production` —
  keep the cPanel app in **Production** mode (§3 of the deployment doc)
  or the cookie loses the `Secure` flag.
- **Penetration testing (since 2026-09-05)**: an automated black-box
  suite lives in `scripts/pentest-local.sh` (55 checks: auth/session
  forgery, CSRF, rate-limit/DoS bodies, SQLi, stored XSS, headers,
  client-bundle secret scan, open redirect) with the report and residual-
  risk register in `docs/PENTEST_2026-09-05.md` — run it after every auth
  or API change. Hardening from the round: XFF last-entry IP selection
  (anti rate-limit bypass), logout token revocation, `no-store` on admin
  APIs, 413 body-size guards on public POSTs.
- **Penetration testing round 2 (2026-09-05)**: a deep-dive suite lives in
  `scripts/pentest-round2.sh` (82 checks: token fuzzing, cookie shadowing,
  session isolation, verb tampering, Origin-spoof matrix, parser abuse,
  query/operator injection, XFF-rotation floods, encoded stored XSS,
  info-exposure paths, Host-header poisoning) with the report in
  `docs/PENTEST_2026-09-05-round2.md`. Hardening from the round: strict
  Origin anchoring (client `X-Forwarded-Host` can no longer vouch for an
  Origin), Origin check also on login, 301 redirects anchored to
  `SITE_ORIGIN` (Host-poisoning-proof), NaN-safe pagination, unique
  nonces in session tokens (same-second logins no longer collide), and a
  rate limit on `DELETE /api/chat`. **Set `SITE_ORIGIN=https://mehrdad.ir`
  in cPanel env vars** — it activates the hard allow-list for CSRF and
  anchors all SEO redirects.

## 6. Reporting

This is a personal site; there is no bug bounty. If you find a security
issue, please report it privately via the contact form on
[mmehrdad.ir](https://mehrdad.ir) (choose "Just connecting" and mark it
security) rather than opening a public issue.
