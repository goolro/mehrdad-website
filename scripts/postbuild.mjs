#!/usr/bin/env node
/**
 * Post-build wrapper — the single entry point after `next build`:
 *
 * 1. inject the build-time hash CSP <meta> into every prerendered page
 *    (scripts/inject-csp.mjs — required on ALL platforms)
 * 2. copy static assets into the standalone output (SELF-HOSTED builds
 *    only — Vercel packages its own output and has no .next/standalone,
 *    so this step must never run there)
 */
import { execSync } from 'node:child_process';

execSync('node scripts/inject-csp.mjs', { stdio: 'inherit' });

if (!process.env.VERCEL) {
  execSync('cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/', { stdio: 'inherit' });
  console.log('[postbuild] standalone assets copied (self-hosted output)');
} else {
  console.log('[postbuild] VERCEL detected — skipped standalone packaging');
}
