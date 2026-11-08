#!/usr/bin/env bash
# deploy-netlify.sh — one-command production deploy to Netlify
# (Vercel → Netlify migration, 2026-11; the successor of the Vercel
# git-push deploy flow while the repo link is pending).
#
# What it does:
#   runs the netlify.toml pipeline verbatim —
#   prisma generate (Postgres/Supabase schema) → next build → postbuild
#   → @netlify/plugin-nextjs packaging → netlify-trim (250MB cap guard)
#   → upload → atomically swaps production.
#
# Requirements:
#   - netlify-cli installed (npm i -g netlify-cli)
#   - NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID in the environment
#   - the site env (DATABASE_URL/Supabase, CRON_SECRET, ...) lives on
#     Netlify and is applied by `netlify build` automatically; on a fresh
#     machine you can also export DATABASE_URL yourself.
#
# Usage:
#   NETLIFY_AUTH_TOKEN=... NETLIFY_SITE_ID=... bash scripts/deploy-netlify.sh "message"
#
# Notes:
#   - run it in the FOREGROUND: backgrounded builds were observed being
#     reaped by the sandbox supervisor (2026-11-08) and dying silently.
#   - NODE_OPTIONS heap cap of 2 GB is set below — without it Turbopack
#     production builds OOM on a 4 GB box.
set -euo pipefail

TOKEN="${NETLIFY_AUTH_TOKEN:?NETLIFY_AUTH_TOKEN required}"
SITE="${NETLIFY_SITE_ID:?NETLIFY_SITE_ID required}"
MSG="${1:-manual deploy $(date -u +%FT%TZ)}"

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
cd "$(dirname "$0")/.."

exec netlify deploy \
  --auth "$TOKEN" \
  --site "$SITE" \
  --prod \
  --build \
  --message "$MSG"
