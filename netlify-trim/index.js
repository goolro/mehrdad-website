// Netlify local plugin — trims the ___netlify-server-handler function dir
// BEFORE the post-build upload, keeping it under AWS Lambda's hard 250 MB
// unzipped cap (migration 2026-11-08: it hit 275 MB).
//
// 1. public/ (≈69 MB) — the Next runtime copies it into the function "just in
//    case", but Netlify's CDN already serves every public asset and the SSR
//    handler never fs-reads public files (same split as Vercel: public lives
//    on the CDN edge, never inside the lambda).
// 2. Dead-weight native binaries the tracer still picks up from a stale
//    .prisma client (debian-openssl-1.0.x = legacy cPanel engine, useless on
//    every modern runtime) and musl sharp/libsql builds (functions run
//    linux-x64 glibc).
//
// Must be listed AFTER @netlify/plugin-nextjs in netlify.toml so its onBuild
// runs once the handler dir exists and before the onPostBuild upload.
const fs = require('node:fs');
const path = require('node:path');

const DEAD_WEIGHT = [
  'node_modules/.prisma/client/libquery_engine-debian-openssl-1.0.x.so.node',
  'node_modules/@libsql/linux-x64-musl',
  'node_modules/@img/sharp-libvips-linuxmusl-x64',
  'node_modules/@img/sharp-linuxmusl-x64',
];

module.exports = {
  onBuild: async ({ constants, utils }) => {
    const fnDir = path.join(
      constants.INTERNAL_FUNCTIONS_SRC || path.join('.netlify', 'functions-internal'),
      '___netlify-server-handler',
    );
    if (!fs.existsSync(fnDir)) {
      utils.build.failBuild(`netlify-trim: handler dir not found at ${fnDir}`);
      return;
    }
    const targets = [path.join(fnDir, 'public'), ...DEAD_WEIGHT.map((rel) => path.join(fnDir, rel))];
    for (const target of targets) {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`[netlify-trim] removed ${path.relative(fnDir, target)}`);
      }
    }
    let total = 0;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else total += fs.statSync(p).size;
      }
    };
    walk(fnDir);
    console.log(`[netlify-trim] function dir now ≈ ${(total / 1024 / 1024).toFixed(1)} MB on disk`);
  },
};
