/**
 * E2E test: browser-locale language suggestion banner (Task 13).
 * Launches chromium with locale fa-IR (real Persian-locale browser),
 * clears storage, then verifies the banner lifecycle:
 *   1. appears ~1.2s after load (fa locale, no prior choice)
 *   2. [فارسی] switches the UI to Persian + marks the choice
 *   3. after reload the banner NEVER appears again
 *   4. EN-locale context → banner never appears
 * Run: bun analysis/test_lang_banner.ts
 */
import { chromium } from 'playwright-core';

const exe = '/home/z/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL = 'http://localhost:3000/';
const ok: string[] = [];
const fail: string[] = [];

function check(name: string, cond: boolean) {
  (cond ? ok : fail).push(name);
  console.log(`${cond ? '✓' : '✗'} ${name}`);
}

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

// ── Scenario 1: fa-IR browser, fresh visitor ──
const ctxFa = await browser.newContext({ locale: 'fa-IR' });
const p1 = await ctxFa.newPage();
await p1.goto(URL, { waitUntil: 'networkidle' });
await p1.evaluate(() => localStorage.clear());
await p1.reload({ waitUntil: 'networkidle' });
await p1.waitForTimeout(2200); // banner shows after 1.2s delay

const bannerVisible = await p1.getByRole('status').getByText('نسخه فارسی').isVisible().catch(() => false);
check('banner appears for fa-IR fresh visitor', bannerVisible);

// click فارسی → UI switches to Persian
await p1.getByRole('button', { name: 'فارسی', exact: true }).first().click();
await p1.waitForTimeout(600);
const isFa = await p1.evaluate(() => document.documentElement.lang === 'fa' && document.documentElement.dir === 'rtl');
check('accept switches UI to fa/rtl', isFa);
const chosen = await p1.evaluate(() => localStorage.getItem('mehrdad-lang-chosen'));
check('choice persisted (mehrdad-lang-chosen)', chosen === '1');

// ── Scenario 2: reload → banner must never appear again ──
await p1.reload({ waitUntil: 'networkidle' });
await p1.waitForTimeout(2200);
const bannerAfter = await p1.getByRole('status').count();
check('banner never re-appears after acceptance', bannerAfter === 0);

await ctxFa.close();

// ── Scenario 3: en-US browser → banner never appears ──
const ctxEn = await browser.newContext({ locale: 'en-US' });
const p2 = await ctxEn.newPage();
await p2.goto(URL, { waitUntil: 'networkidle' });
await p2.waitForTimeout(2200);
const bannerEn = await p2.getByRole('status').count();
const langEn = await p2.evaluate(() => document.documentElement.lang);
check('no banner for en-US visitor', bannerEn === 0);
check('EN stays default', langEn === 'en');
await ctxEn.close();

// ── Scenario 4: fa browser dismisses → never again ──
const ctxDis = await browser.newContext({ locale: 'fa-IR' });
const p3 = await ctxDis.newPage();
await p3.goto(URL, { waitUntil: 'networkidle' });
await p3.evaluate(() => localStorage.clear());
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(2200);
await p3.getByRole('button', { name: 'Dismiss / بستن' }).click();
await p3.waitForTimeout(300);
const bannerGone = await p3.getByRole('status').count();
check('dismiss hides banner immediately', bannerGone === 0);
await p3.reload({ waitUntil: 'networkidle' });
await p3.waitForTimeout(2200);
const bannerAgain = await p3.getByRole('status').count();
check('dismissed banner stays hidden after reload', bannerAgain === 0);
const langAfterDismiss = await p3.evaluate(() => document.documentElement.lang);
check('dismiss did NOT change language', langAfterDismiss === 'en');
await ctxDis.close();

await browser.close();

console.log(`\n${ok.length} passed, ${fail.length} failed`);
if (fail.length) {
  console.log('FAILED:', fail.join(' | '));
  process.exit(1);
}
