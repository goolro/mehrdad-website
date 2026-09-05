# SECURITY REVIEW — mehrdad.ir (round 3)

Status: delivered · Date: 2026-09-05 · Scope: full repository audit (code + configuration +
dependency + deployment surface), plus live execution of the security-critical modules.

This is an independent review that follows `PENTEST_2026-09-05.md` and
`PENTEST_2026-09-05-round2.md`. It re-tests their claims instead of assuming them, and it
reports where the documentation and the code disagree.

---

## 0. How this was verified

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | **0 errors, 1 warning** (`scripts/migrate-sqlite-to-supabase.ts:178` unused expression) |
| Typecheck | `npx tsc --noEmit` | **exit 0, clean** |
| Dependency audit | `npm audit` and `npm audit --omit=dev` | **0 vulnerabilities** (both) |
| Reproducible install | `npm ci` | **FAILS** — `Missing: deepmerge-ts@8.0.2 from lock file` (see B1) |
| Behavioural harness | `node --experimental-strip-types local-audit-checks.mts` | **56 passed, 1 failed** — the 1 failure is finding **M2** |

The harness imports and executes the shipped modules directly — `src/proxy.ts`,
`src/lib/admin.ts`, `src/lib/admin-session.ts`, `src/lib/rate-limit.ts`,
`src/lib/sanitize.ts` — with a real `NextRequest`. Nothing is re-implemented or mocked.

**Not verifiable in this environment:** the HTTP-level suites
(`scripts/pentest-local.sh`, `scripts/pentest-round2.sh`). They need a running instance,
and the app cannot boot here because the Prisma query engine is downloaded from
`binaries.prisma.sh`, which this sandbox cannot reach
(`curl: (35) OpenSSL SSL_connect: SSL_ERROR_SYSCALL`). Every finding below is therefore
either static (file:line) or backed by direct execution of the module involved.

---

## 1. Findings

### H1 — Live credentials are documented, unrotated, in a public repo

`docs/SECURITY.md:90-91` and `worklog.md:553,882` publish the *prefixes* of three real
tokens — `ghp_9omo…` (GitHub PAT), `vcp_1f3s…` (Vercel), `sbp_fcd7…` (Supabase) — together
with the statement that the GitHub token **"remains valid — the owner explicitly decided
not to rotate it"** and that all three were shared through an IM channel.

The prefixes are truncated, so they are not directly usable, but the entry tells an
attacker exactly which accounts hold leaked credentials and that they are still active.
Anyone who ever saw that IM channel has the full values. The tokens are in Git history
forever; deleting the line does not help.

**Fix:** rotate all three now (GitHub → Developer settings, Vercel → Tokens,
Supabase → Access tokens), then remove the prefixes from the two documents. Treat the
history as burned and record the rotation in the incident log.

---

### M1 — Stored-XSS gap on the admin *update* path

`src/app/api/admin/posts/[id]/route.ts:14-21` — `PATCH` copies `contentEn` / `contentFa`
into the database untouched:

```ts
for (const k of ['titleEn', 'titleFa', 'excerptEn', 'excerptFa', 'contentEn', 'contentFa', 'cover']) {
  if (k in b) data[k] = b[k];        // no sanitizePostHtml()
}
```

`POST` *does* sanitize (`src/app/api/admin/posts/route.ts:53-54`), and `getPostDetail()`
sanitizes on read (`src/lib/queries.ts:135-136`), so the **public** blog is safe. But:

- `GET /api/admin/posts` (`route.ts:9-27`) returns `contentEn` raw, and
- `src/components/site/AdminView.tsx:496` renders it with `dangerouslySetInnerHTML`.

So HTML injected through `PATCH` is executed in the admin panel unless the CSP stops it.
The per-request nonce CSP (`script-src` without `unsafe-inline`/`unsafe-hashes`) is
currently the only thing standing between that payload and the admin session cookie —
i.e. `SECURITY.md §5`'s "sanitized two-layer … on write (admin posts)" is not true for the
update path.

**Fix:** call `sanitizePostHtml()` on `contentEn`/`contentFa` in `PATCH` (same as `POST`),
and sanitize in the `GET /api/admin/posts` response as well. Both are one-line changes.

---

### M2 — The `SITE_ORIGIN` "hard allow-list" is not hard  *(the harness failure)*

`src/lib/admin.ts:66-73`:

```ts
if (siteOrigin) {
  ...
  if (siteHost) return originHost === siteHost || originHost === host;   // ← line 72, second disjunct
}
```

Because of `|| originHost === host`, a request carrying `Origin: https://evil.tld` **and**
`Host: evil.tld` passes even with `SITE_ORIGIN=https://mehrdad.ir` configured. Executed
against the real function:

```
[FAIL] SITE_ORIGIN allow-list defeats a matching Host+Origin pair — originAllowed()=true
[PASS] SITE_ORIGIN rejects a cross-site Origin against the real Host
```

This contradicts the guarantee written in the same file (`src/lib/admin.ts:51`: "no
header trickery can satisfy the check") and in `docs/SECURITY.md §5`.

Real-world exploitability is **low** — a browser cannot set `Host`, `SameSite=Strict` is
the primary CSRF defence, and non-browser clients have no cookie to abuse — but the
documented guarantee is false, which is how the next regression gets waved through.

**Fix:** when `SITE_ORIGIN` is set, return `originHost === siteHost` only.

---

### M3 — Body-size guard is bypassed by chunked encoding

`src/lib/rate-limit.ts:81-84`:

```ts
const len = Number(req.headers.get('content-length') || '0');
return Number.isFinite(len) && len > maxKb * 1024;
```

`Transfer-Encoding: chunked` carries no `Content-Length`, so the guard returns `false`
and the route calls `req.json()` on an unbounded body. Verified:

```
[PASS] oversized body (Content-Length) rejected
[PASS] chunked body (no Content-Length) BYPASSES the size guard
```

Affects the four public write endpoints (`/api/admin/auth`, `/api/chat`, `/api/contact`,
`/api/posts/[slug]/comments`) on a memory-capped cPanel/LVE host — exactly the DoS the
guard exists to prevent.

**Fix:** enforce the cap while reading (stream the body with a byte counter and abort),
and/or set `LimitRequestBody` in Apache / `request_body { max_size }` in the Caddy config.

---

### M4 — Rate limiting: per-process, per-IP, and IP-spoofable on the fallback path

- `src/lib/rate-limit.ts:66-73` — `clientIp()` takes the **last** `X-Forwarded-For` entry
  (correct behind Apache) but falls back to the client-supplied `X-Real-IP`. Any request
  path that reaches Node without the proxy appending XFF (direct port access, an extra
  proxy hop, a mis-set `ProxyPreserveHost`) makes every limiter rotatable by one header.
- The counters live in one Node process's memory. Passenger/cPanel can run more than one
  app instance, in which case each limit is multiplied by the instance count.
- Limits are per-IP only: 8 different IPs ⇒ 40 login attempts per 15 minutes, with no
  global ceiling. Verified: `[PASS] rotating the client IP resets the limiter`.
- `/api/chat` is unauthenticated and calls a **paid** AI provider (10/min/IP). A botnet has
  effectively no ceiling, and there is no daily budget cap.

**Fix:** drop the `X-Real-IP` fallback (or set it in the proxy config and trust only that),
add a global counter for `login:*` and `chat:*`, and add a daily spend/request budget for
chat (plus a challenge such as Turnstile if the cost matters).

---

### L1 — Unauthenticated memory growth in the logout revocation set

`DELETE /api/admin/auth` requires no authentication and revokes whatever cookie value it is
sent. `revokedPayloads` (`src/lib/admin-session.ts:35`) has no size cap and no expiry, and
is cleared only on process restart. Measured with the real function:

```
[PASS] revocation set grows unbounded — +5.6 MB heap for 500k unauthenticated logouts
```

**Fix:** only revoke tokens that pass `verifyAdminSessionToken()` (a forged token is
already invalid), and/or cap the set.

### L2 — AI admin endpoints echo internal error text

`src/app/api/admin/ai/write/route.ts:62`, `…/translate/route.ts:121`, `…/image/route.ts:34`
return `e.message` to the client. Keep the generic message in the response and log the
detail server-side.

### L3 — Unauthenticated CPU/DB amplifier in the chat RAG step

`src/lib/rag.ts:38-40` — `retrieveContext()` does `db.kbChunk.findMany()` with **no**
`where`, i.e. it loads the entire knowledge base into memory and scores it in JS for every
chat message. Filter in SQL (`OR: terms.map(t => ({ body: { contains: t } }))`) or cache
the chunk list in memory with a TTL.

### L4 — Chat sessions have no ownership binding

`POST /api/chat` accepts any existing `sessionId`, appends to it and feeds the previous
8 messages to the model; `DELETE /api/chat` deletes any session by id. IDs are `cuid()`
so guessing is impractical, but a leaked session id is a readable/writable conversation.
Consider a per-session client secret stored alongside the session.

### L5 — Sanitizer allows `data:` image URIs, including SVG

Verified output: `<img src="data:image/svg+xml;base64,…" loading="lazy" />` survives
`sanitizePostHtml()`. SVG in an `<img>` cannot execute script, so this is not exploitable
today, but it is an unnecessary allowance — restrict to
`data:image/png|jpeg|gif|webp` via `allowedSchemesByTag` + a transform check.

### L6 — Header hardening gaps

`next.config.ts` sets `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
`Permissions-Policy`, HSTS — good. Missing: `Cross-Origin-Resource-Policy` (protects
`/media`, `/uploads` from cross-origin embedding), `Cross-Origin-Opener-Policy`. The CSP's
`img-src 'self' data: blob: https:` leaves an outbound beacon channel if any injection
ever lands; narrowing it to `'self' data: https://mehrdad.ir` would close that.

### L7 — Deploy channel does not verify host keys

`scripts/cpanel-deploy.py:88` — `ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())`.
A MITM on the deploy path could substitute the artifact. Pin a `known_hosts` file
(`paramiko.RejectPolicy()` + `load_host_keys`).

### L8 — Stale references to a file that no longer exists

`next.config.ts:5` and `src/app/layout.tsx:92` both say the nonce is emitted by
`src/middleware.ts`. In Next 16 the file is **`src/proxy.ts`** (exported function `proxy`).
Cosmetic, but it misleads anyone tracing the CSP flow.

---

## 2. Build / supply chain

| # | Finding |
|---|---|
| **B1** | **`npm ci` fails at HEAD.** `package.json` has `overrides.deepmerge-ts = "8.0.2"` while `package-lock.json:1950` pins `7.1.5`. `.github/workflows/ci.yml` runs `npm ci --include=dev`, so CI cannot pass as committed. Fix: run `npm install`, commit the refreshed lock (or drop the override). |
| **B2** | Two lockfiles (`package-lock.json` and `bun.lock`) with no stated authority; `.github/dependabot.yml` only watches npm, so `bun.lock` drifts silently. |
| **B3** | `z-ai-web-dev-sdk@0.0.18` — a `0.0.x` package backing the **public** chat endpoint. It *is* already pinned exactly (no `^`); the remaining action is to review every Dependabot bump of it by hand rather than merging automatically. |
| — | `npm audit` (prod + dev): **0 vulnerabilities**. `.gitignore` covers `.env*`, `*.db`, keystores, `/upload/`, `/dist/`. `scripts/build-production.sh:50-53` **fails the build** if an `.env`/DB/secret file slips into the artifact — a genuinely good control. |

---

## 3. What held up (executed, not assumed)

- **CSP**: `script-src 'self' 'nonce-…' 'strict-dynamic'`, no `unsafe-inline`, unique nonce
  per request, `frame-ancestors 'none'`, `connect-src 'self'`, `object-src 'none'`,
  `upgrade-insecure-requests`. The nonce is also published on the request headers as
  `x-middleware-request-x-nonce`, which is what `layout.tsx` reads.
- **Session tokens**: forged-signature, wrong-key, expired, tampered-payload and garbage
  tokens are all rejected; a fresh token verifies; logout revokes exactly one token and
  leaves other sessions alive; two logins never share a token.
- **Fail-closed auth**: `safeEqual('','')` is `false`; `ADMIN_PASSWORD` unset ⇒ 503.
- **CSRF**: cross-origin `POST` with a valid cookie ⇒ 403; `Origin: null` rejected;
  `Origin` subdomain rejected; same-origin GET unaffected.
- **Redirects**: real routes (`/blog`, `/work`, …) are never shadowed by the legacy map;
  with `SITE_ORIGIN` set the 301 is anchored to it. Without it, the Location follows the
  request `Host` — verified — so setting `SITE_ORIGIN` in cPanel is not optional.
- **Limiter math**: exactly 5 of 8 login attempts pass.
- **Sanitizer**: strips `<script>`, all `on*` handlers, `javascript:` URLs, `<iframe>`,
  `<form>`, `<svg>`, inline `style`; forces `rel="noopener noreferrer nofollow"`; drops
  protocol-relative URLs; `sanitizePlainText()` strips all markup and truncates.
- **Injection surface**: no `$queryRaw`/`$executeRaw` anywhere in `src/` (Prisma
  parameterised queries only) ⇒ no SQLi. No `eval`, `new Function`, `child_process` or
  `exec` in `src/`. The only `fs` write is the admin AI-image route, and the filename is
  server-generated.
- **XSS sinks**: comments and contact messages render as React text nodes
  (`CommentsSection.tsx:240`, `AdminView.tsx:716`), chat replies as `{m.content}`, and the
  JSON-LD block escapes `<` (`JsonLd.tsx:23`).

---

## 4. Suggested order of work

1. **H1** rotate the three tokens (minutes, highest value).
2. **B1** refresh `package-lock.json` so CI runs at all.
3. **M1** sanitize in `PATCH /api/admin/posts/[id]` + on the admin read.
4. **M2** `originAllowed()` → `return originHost === siteHost` under `SITE_ORIGIN`.
5. **M3** enforce the body cap while reading (and `LimitRequestBody` in Apache).
6. **M4** drop the `X-Real-IP` fallback; add global login/chat ceilings.
7. L1–L8 as time allows; L7 (host-key pinning) is cheap.
8. Set `SITE_ORIGIN=https://mehrdad.ir` in cPanel if it is not already set — two findings
   (M2, and the redirect anchoring) depend on it.

---

## 5. Reproducing the harness

```bash
npm install --no-package-lock          # the lockfile is out of sync (B1)
node --experimental-strip-types local-audit-checks.mts
```

`local-audit-checks.mts` + `local-json-loader.mjs` are gitignored by the existing
`local-*` rule. The loader only maps the app's `@/…` alias and serves `.json` as ESM; it
contains no application logic.

---

## 6. Remediation applied the same day

Everything below is implemented in this working tree and re-verified.

| Finding | Fix | Verified by |
|---|---|---|
| **B1** `npm ci` broken | `package-lock.json` refreshed — the `deepmerge-ts@8.0.2` override is now in the lock (+19 lines, nothing else changed) | `npm ci --include=dev` → **added 667 packages in 25s** |
| **M1** XSS on the admin update path | `PATCH /api/admin/posts/[id]` sanitizes `contentEn`/`contentFa`; `GET /api/admin/posts` sanitizes on read | suite §8 drives the **real route handlers** with a stubbed Prisma layer and asserts the value reaching `db.post.update` equals `sanitizePostHtml(payload)`; `null` still clears a field |
| **M2** soft `SITE_ORIGIN` allow-list | the `\|\| originHost === host` disjunct is gone; `SITE_ORIGIN` (now a comma-separated list) is the only anchor when set | suite §3: a matching spoofed Host+Origin pair is rejected; the real origin still passes against any Host; an unparsable `SITE_ORIGIN` falls back to the Host comparison instead of failing open |
| **M3** chunked-body bypass | new `readJsonBody()` counts bytes while streaming and aborts at the cap; 413 oversized / 400 unparsable (login keeps 401 for unparsable) | suite §5 + **live HTTP**: `POST /api/contact`, `Transfer-Encoding: chunked`, 40 KB body, no `Content-Length` → `HTTP/1.1 413 Payload Too Large` |
| **M4** rotatable / unbounded rate limits | `X-Real-IP` fallback removed; global ceilings added — login 60/15 min, chat 120/min and 2000/day on top of the per-IP limits | suite §5 (`X-Real-IP` → `unknown`; 60 of 65 global login attempts; 120 of 130 chat attempts) |
| **L1** unbounded revocation set | only tokens that would otherwise verify are recorded; set capped FIFO at 5000 | suite §4: 500 000 forged logouts add **0** entries and retain **no** heap (measured after `--expose-gc`) |
| **L2** error-text leakage | the three AI admin routes return a generic message; details stay in the server log | code review (`git diff`) |
| **L3** RAG full-table scan | 5-minute in-process corpus cache, invalidated by every KB write (`addPostToKb`, `rebuildKb`) | code review; behaviour unchanged for callers |
| **L5** `data:image/svg+xml` | non-raster `data:` URIs are dropped from `<img>`; raster ones still work | suite §6 |
| **L6** missing headers | `Cross-Origin-Resource-Policy: same-site` + `Cross-Origin-Opener-Policy: same-origin` on every response | **live HTTP** response headers (see below) |
| **L7** deploy MITM | `cpanel-deploy.py` now uses `RejectPolicy()` + `--known-hosts` (default `~/.ssh/known_hosts`) and prints the `ssh-keyscan` command on failure | `python3 -c "ast.parse(...)"` (syntax) — the SSH path itself needs the real host |
| **L8** stale comments | `next.config.ts` and `layout.tsx` now point at `src/proxy.ts` | `git diff` |
| lint warning | `scripts/migrate-sqlite-to-supabase.ts` ternary → `if/else` | `npm run lint` → **0 problems** |

### Re-run after the fixes

| Check | Result |
|---|---|
| `npm ci --include=dev` | **passes** (was: `Missing: deepmerge-ts@8.0.2`) |
| `npm run lint` | **0 errors, 0 warnings** (was: 1 warning) |
| `npx tsc --noEmit` | **exit 0** |
| `npx next build` | **succeeds** — every route compiled, `ƒ Proxy (Middleware)` registered |
| `scripts/security-checks.mts` | **88 passed, 0 failed** (was 56/1 on the pre-fix code) |
| `npm audit` / `npm audit --omit=dev` | **0 vulnerabilities** |

Live HTTP against the built production server (`next start`, `NODE_ENV=production`):

```
GET /  →  X-Frame-Options: DENY
          X-Content-Type-Options: nosniff
          Referrer-Policy: strict-origin-when-cross-origin
          Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
          Strict-Transport-Security: max-age=15552000; includeSubDomains
          Cross-Origin-Resource-Policy: same-site        ← new
          Cross-Origin-Opener-Policy: same-origin        ← new
          content-security-policy: … script-src 'self' 'nonce-…' 'strict-dynamic' …
          (no X-Powered-By)

GET /iran-ousted-from-trade-corridors   Host: attacker.tld   SITE_ORIGIN=https://mehrdad.ir
      →  301  location: https://mehrdad.ir/blog/iran-ousted-from-trade-corridors

POST /api/contact   Transfer-Encoding: chunked, 40 KB, no Content-Length
      →  413 Payload Too Large
```

Pages themselves return 500 in this sandbox because the Prisma query engine
cannot be downloaded here (`binaries.prisma.sh` is unreachable) — the proxy,
the headers and the route guards all run before that point, which is why the
checks above are still meaningful.

### Not fixed here (needs the owner / a product decision)

- **H1 — rotate the three tokens.** No code change can do this: GitHub PAT,
  Vercel token and Supabase token must be revoked and reissued by the owner.
  The identifying prefixes were removed from `docs/SECURITY.md` and
  `worklog.md` (`git grep` over tracked files now returns **0** matches), but
  they remain in Git history, so rotation is still mandatory.
- **L4 — chat session ownership.** Needs a client-side change (a per-session
  secret stored by the widget) and would break existing in-flight sessions;
  left as a documented residual risk.
- **`img-src https:`** in the CSP stays: legacy migrated articles reference
  remote images, and narrowing it would break them. `connect-src 'self'`
  already blocks fetch/XHR exfiltration.

### Running the suite

```bash
node --expose-gc --experimental-strip-types scripts/security-checks.mts
```

Needs Node ≥ 22.6 (type stripping) and no database — the loader stubs
`src/lib/db.ts`, the boundary, while every route handler, guard, sanitizer and
token check runs for real. CI runs it as the `security-checks` job.
