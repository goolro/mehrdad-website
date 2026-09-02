#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# mehrdad.ir — Production artifact builder for cPanel (no-SSH deployment)
#
# Produces: dist/mehrdad-deploy-<stamp>.tar.gz  +  SHA256SUMS
#
# The artifact contains the Next.js standalone server + static assets ONLY.
# The SQLite database is deliberately EXCLUDED — production DB lives at
# <app-root>/data/production.db and must NEVER be overwritten by a deploy.
#
# Usage:  bash scripts/build-production.sh
# Requires: Node.js >= 20.9, npm  (run on the build machine, not on cPanel)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="dist"
ARTIFACT="mehrdad-deploy-${STAMP}.tar.gz"

echo "==> [1/5] install dependencies (npm ci if lockfile present, else npm install)"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

echo "==> [2/5] build (prisma generate + next build + assemble standalone)"
npm run build

echo "==> [3/5] sanity checks on the standalone bundle"
test -f .next/standalone/server.js || { echo "FATAL: standalone server.js missing"; exit 1; }
test -d .next/standalone/.next/static || { echo "FATAL: static assets not copied"; exit 1; }
test -d .next/standalone/public || { echo "FATAL: public not copied"; exit 1; }
PRISMA_ENGINE="$(find .next/standalone/node_modules -name 'libquery_engine-*.so.node' 2>/dev/null | head -1 || true)"
if [ -z "$PRISMA_ENGINE" ]; then
  echo "WARN: Prisma query engine not found in standalone node_modules — DB queries will fail on the server."
  echo "      Fix: copy node_modules/.prisma/client/libquery_engine-*.so.node into the artifact."
fi

echo "==> [4/5] pack artifact (env files, database and secrets excluded)"
mkdir -p "$OUT_DIR"
# Next's standalone step copies build-machine .env* files into .next/standalone.
# They must NEVER ship: on cPanel the artifact is extracted over the app root
# and would clobber the operator's env. Config travels via cPanel env vars
# (see docs/CPANEL_DEPLOYMENT.md §3), never inside the artifact.
tar -czf "$OUT_DIR/$ARTIFACT" \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='./.z-ai-config' \
  -C .next/standalone .

echo "==> [5/5] checksums + artifact hygiene guard"
# Fail the build (not just warn) if env/secret/db files slipped into the pack.
if tar -tzf "$OUT_DIR/$ARTIFACT" | grep -E '^\./(\.env|[^/]*\.db|[^/]*\.db-journal|\.z-ai-config)' >/dev/null; then
  tar -tzf "$OUT_DIR/$ARTIFACT" | grep -E '^\./(\.env|[^/]*\.db|[^/]*\.db-journal|\.z-ai-config)'
  echo "FATAL: artifact contains .env / database / secret files — deploy would clobber server config"
  exit 1
fi
( cd "$OUT_DIR" && sha256sum "$ARTIFACT" > SHA256SUMS )
echo ""
echo "Artifact : $OUT_DIR/$ARTIFACT ($(du -h "$OUT_DIR/$ARTIFACT" | cut -f1))"
echo "Checksum : $OUT_DIR/SHA256SUMS"
echo ""
echo "Next steps (see docs/CPANEL_DEPLOYMENT.md):"
echo "  1. Upload the tar.gz via cPanel File Manager and extract into the app root."
echo "  2. Create data/production.db ONCE (first deploy) — later deploys must not touch it."
echo "  3. Create .z-ai-config (chmod 600) if AI chat should work."
echo "  4. Restart the Node.js Application from cPanel."
