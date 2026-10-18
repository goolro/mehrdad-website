/**
 * Reproduce agent-browser crash: inject persisted state then load.
 * Run: bun analysis/probe_client_error2.ts
 */
import { chromium } from 'playwright-core';

const exe = '/home/z/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  localStorage.setItem('mehrdad-app', JSON.stringify({ state: { lang: 'fa', mode: 'dark' }, version: 0 }));
  localStorage.setItem('mehrdad-lang-chosen', '1');
  localStorage.setItem('mehrdad-theme-cache', 'default');
});
const page = await ctx.newPage();
page.on('pageerror', (err) => {
  console.log('PAGEERROR:', err.message);
  console.log(err.stack?.split('\n').slice(0, 10).join('\n'));
});
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('CONSOLE-ERR:', msg.text().slice(0, 400));
});

await page.goto('http://localhost:3000/#fde', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log('body:', (await page.evaluate(() => document.body.innerText.slice(0, 70))).replace(/\n/g, ' | '));
console.log('lang:', await page.evaluate(() => document.documentElement.lang));
console.log('dark:', await page.evaluate(() => document.documentElement.classList.contains('dark')));
await browser.close();
