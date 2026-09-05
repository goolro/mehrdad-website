import type { NextConfig } from "next";

// 'unsafe-eval' is needed ONLY in dev: React's development mode uses eval()
// for debugging features. Production React never evals, so the production
// CSP stays strict.
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  // Content-Security-Policy: everything is self-hosted (fonts are inlined by
  // next/font), so the policy can be strict. 'unsafe-inline' for scripts/
  // styles is required because statically prerendered pages embed inline
  // bootstrap tags WITHOUT a per-request nonce — nonce-based CSP would force
  // every page dynamic, which this weak shared host cannot afford.
  // It still blocks external script/style/img origins, plugins, framing,
  // form hijacking and base-tag injection on top of the sanitizer layers.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
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
