import type { NextConfig } from "next";

// SANDBOX PREVIEW EMBED: the space-z.ai preview panel shows the site inside
// an iframe — X-Frame-Options: DENY / frame-ancestors 'none' make the panel
// render "refused to connect" instead of the site. PREVIEW_EMBED=1 comes
// ONLY from the `dev` script (sandbox + local dev). Every production build
// (Vercel AND the cPanel standalone artifact) runs without it and keeps the
// strict clickjacking denial — audited by scripts/security-checks.mts and
// scripts/pentest-local.sh, which always run against production-like boots.
const PREVIEW_EMBED = process.env.PREVIEW_EMBED === "1";

const securityHeaders = [
  // Content-Security-Policy is intentionally NOT set here anymore: it is
  // issued per-request with a fresh nonce by src/proxy.ts (Next 16's name
  // for middleware) (strict
  // 'nonce-…' + 'strict-dynamic', no 'unsafe-inline' for scripts in
  // production). A second static CSP here would AND-restrict the nonce
  // policy back to 'unsafe-inline' semantics and break every page.
  // clickjacking protection (relaxed only for the sandbox preview embed —
  // see PREVIEW_EMBED above; frame-ancestors below is the modern control
  // and takes precedence in browsers that support CSP)
  ...(PREVIEW_EMBED ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
  // prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // don't leak full referrer URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // disable browser features the site doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // force HTTPS for 6 months (cPanel AutoSSL keeps the cert renewed)
  { key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" },
  // CSP FLOOR (2026-09-07): Vercel packages prerendered HTML itself and
  // ignores post-build mutations of .next (verified — both .html edits and
  // routes-manifest header appends never reached the deployment), so a
  // per-build hash CSP cannot be delivered there. This static policy is
  // the floor everywhere: foreign scripts, framing, object embeds and
  // base/form hijacks are blocked; inline scripts are allowed ('unsafe-inline'
  // — SSR content is owner-authored and sanitized, so the injection surface
  // is minimal). SELF-HOSTED builds additionally get the strict hash-based
  // <meta CSP> from scripts/inject-csp.mjs — CSP policies INTERSECT, so the
  // strict meta wins wherever it exists.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // PostHog US cloud (2026-02): the posthog-js module is bundled locally
      // ('self') but the /decide+/e ingest XHRs go to us.i.posthog.com and
      // remote config/features JS is fetched from us-assets.i.posthog.com.
      // EU hosts are NOT allowed on purpose — the project is pinned to US
      // cloud; widening here must stay in sync with scripts/inject-csp.mjs.
      "script-src 'self' 'unsafe-inline' https://us.i.posthog.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://us.i.posthog.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      PREVIEW_EMBED ? "frame-ancestors *" : "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  // cross-origin isolation basics (round-3 finding L6): other origins cannot
  // embed/hotload our resources, and our documents get their own browsing
  // context group (blocks a whole class of cross-window side channels)
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // `standalone` serves the cPanel artifact flow (scripts/build-production.sh).
  // Vercel builds its own output and its builder FAILS on standalone tracing
  // (ENOENT .next/next-server.js.nft.json), so disable it there — VERCEL=1 is
  // set by the platform during Vercel builds.
  output: process.env.VERCEL ? undefined : "standalone",
  // Turso/libsql driver stack must stay a real node_modules dependency in the
  // standalone bundle: it loads native bindings (@libsql/linux-x64-gnu) at
  // runtime, which cannot be bundled into server chunks. Without this the
  // artifact ships without the packages and remote DB mode crashes on boot.
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "@libsql/engine"],
  // don't advertise the framework version in production responses
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // admin responses are private — never let any cache store them
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  typescript: {
    // type errors now FAIL the build — tsconfig excludes the one-off
    // analysis/skills/examples scripts, so the app code itself is clean
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
