#!/usr/bin/env bun
/**
 * Generate public/.well-known/assetlinks.json for the Android TWA.
 *
 * Usage:
 *   bun scripts/generate-assetlinks.ts <sha256-fingerprint> [more...] 
 *
 * Example:
 *   bun scripts/generate-assetlinks.ts "AA:BB:CC:...:99"
 *
 * Notes:
 * - Fingerprints are the SHA-256 of the APP SIGNING certificate — see
 *   docs/MOBILE_TWA.md §4 for how to extract them with keytool.
 * - Pass BOTH fingerprints when Play App Signing is enabled: your upload
 *   key fingerprint AND the Play-managed app-signing key fingerprint.
 * - The package id is read from twa-manifest.json (single source of truth).
 * - The output file is committed; fingerprints are PUBLIC by design
 *   (cert fingerprints are not secrets).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: bun scripts/generate-assetlinks.ts <sha256-fingerprint> [more...]');
  console.error('Extract one: keytool -list -v -keystore ./android.keystore -alias android | grep "SHA256:"');
  process.exit(1);
}

const FP = /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/;
const fps = args.map((f) => f.trim().toUpperCase().replace(/\s+/g, ''));

const bad = fps.filter((f) => !FP.test(f));
if (bad.length) {
  console.error('Invalid SHA-256 fingerprint format (expect 32 hex pairs, colon-separated):');
  bad.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

const twa = JSON.parse(readFileSync('twa-manifest.json', 'utf8'));
const out = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: twa.packageId,
      sha256_cert_fingerprints: fps,
    },
  },
];

writeFileSync('public/.well-known/assetlinks.json', JSON.stringify(out, null, 2) + '\n');
console.log(`✓ public/.well-known/assetlinks.json written`);
console.log(`  package: ${twa.packageId}`);
fps.forEach((f) => console.log(`  fingerprint: ${f}`));
console.log('Next: commit, deploy, then verify https://mehrdad.ir/.well-known/assetlinks.json returns it.');
