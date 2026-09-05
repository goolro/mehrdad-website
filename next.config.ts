import type { NextConfig } from "next";

const securityHeaders = [
  // Content-Security-Policy is intentionally NOT set here anymore: it is
  // issued per-request with a fresh nonce by src/middleware.ts (strict
  // 'nonce-…' + 'strict-dynamic', no 'unsafe-inline' for scripts in
  // production). A second static CSP here would AND-restrict the nonce
  // policy back to 'unsafe-inline' semantics and break every page.
  // clickjacking protection
  { key: "X-Frame-Options", value: "DENY" },
  // prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // don't leak full referrer URLs to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // disable browser features the site doesn't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // force HTTPS for 6 months (cPanel AutoSSL keeps the cert renewed)
  { key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  output: "standalone",
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
