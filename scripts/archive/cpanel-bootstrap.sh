#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# mehrdad.ir — one-paste bootstrap for cPanel Terminal (no SSH key needed)
#
# Usage (paste this ONE line inside cPanel → Terminal):
#   bash <(wget -qO- https://raw.githubusercontent.com/goolro/mehrdad-website/main/scripts/cpanel-bootstrap.sh)
#
# Downloads the production artifact from the GitHub Release, verifies its
# checksum, extracts it into ~/mehrdad-app and seeds data/production.db
# ONCE (a re-run never overwrites production data).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REL="https://github.com/goolro/mehrdad-website/releases/download/deploy-20260904"
TARBALL="mehrdad-deploy-20260904-163314.tar.gz"
APP="${HOME}/mehrdad-app"

echo "==> [1/5] download artifact (~138 MB) — GitHub -> server direct"
cd "$HOME"
rm -f "$TARBALL"
wget -q "$REL/$TARBALL" || { echo "FATAL: download failed — is GitHub reachable from this server?"; exit 1; }

echo "==> [2/5] verify SHA256"
wget -q "$REL/SHA256SUMS"
sha256sum -c SHA256SUMS

echo "==> [3/5] extract into $APP"
mkdir -p "$APP"
tar -xzf "$TARBALL" -C "$APP"
test -f "$APP/server.js" || { echo "FATAL: server.js missing after extract"; exit 1; }
ls "$APP"/node_modules/.prisma/client/libquery_engine-*.so.node >/dev/null 2>&1 \
  && echo "  server.js OK · Prisma engine OK"

echo "==> [4/5] production DB (create-once policy)"
if [ -f "$APP/data/production.db" ]; then
  echo "  data/production.db already exists — LEFT UNTOUCHED ✓"
else
  wget -q "$REL/custom.db"
  mkdir -p "$APP/data"
  cp custom.db "$APP/data/production.db"
  echo "  seeded data/production.db ✓"
fi

echo "==> [5/5] cleanup + Passenger restart hint"
rm -f "$TARBALL" SHA256SUMS custom.db
mkdir -p "$APP/tmp" && touch "$APP/tmp/restart.txt"
du -sh "$APP"

cat <<'EOF'

DONE — remaining steps are cPanel UI only:
  1) Setup Node.js App → Create Application:
       Node.js version  : 20.20.2 (any ≥ 20.9 works)
       Application mode : Production
       Application root : mehrdad-app
       Application URL  : your staging URL first (see chat/docs §3)
       Startup file     : server.js
  2) Environment variables (same page):
       DATABASE_URL   = file:/home/YOUR-USER/mehrdad-app/data/production.db
       ADMIN_PASSWORD = <long random secret>
       NODE_ENV       = production
       HOSTNAME       = 0.0.0.0
  3) Restart, then open the Application URL — /api/posts must return JSON.
EOF
