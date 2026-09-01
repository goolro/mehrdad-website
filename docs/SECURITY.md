# SECURITY — mehrdad.ir

Status: maintained · Last updated: 2026-09-01

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
| `DATABASE_URL` | Prisma | SQLite file path — no credential |
| `ADMIN_PASSWORD` | `src/lib/admin.ts` | Admin panel + `x-admin-key` header on all `/api/admin/*` calls |

No third-party API keys are currently stored. When AI provider keys are
introduced (provider management is on the roadmap), they follow the same
policy: env/secret-manager only, never in code, never in the DB in
plaintext.

## 2. Admin auth model

- `POST /api/admin/auth` compares the submitted password against
  `process.env.ADMIN_PASSWORD`.
- `src/lib/admin.ts` exposes `ADMIN_PASSWORD` **with no default**: if the
  variable is unset, the value is `''` and every comparison fails →
  **fail closed**.
- Every admin API route calls `checkAdmin(req)`, which requires the
  `x-admin-key` header to equal `ADMIN_PASSWORD`.
- The password is typed by the owner at `/#admin`; it is never rendered,
  logged, or shipped in the client bundle.
- Known limitation (documented, accepted for current traffic): the
  comparison is a plain string equality over HTTPS and there is no
  rate limiting on the auth endpoint yet — rate limiting is on the
  roadmap before public deployment.

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

## 5. Reporting

This is a personal site; there is no bug bounty. If you find a security
issue, please report it privately via the contact form on
[mehrdad.ir](https://mehrdad.ir) (choose "Just connecting" and mark it
security) rather than opening a public issue.
