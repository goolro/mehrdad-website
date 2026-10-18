/**
 * One-shot client-error probe: loads pages, prints full pageerror stacks.
 * Run: bun analysis/probe_client_error.ts
 */
import { chromium } from 'playwright-core';

const exe = '/home/z/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage();

page.on('pageerror', (err) => {
  console.log('PAGEERROR:', err.message);
  console.log(err.stack?.split('\n').slice(0, 8).join('\n'));
});
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('CONSOLE-ERR:', msg.text().slice(0, 300));
});

for (const route of ['/#home', '/#fde']) {
  console.log(`\n=== loading ${route}`);
  await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const text = await page.evaluate(() => document.body.innerText.slice(0, 80));
  console.log('body:', text.replace(/\n/g, ' | '));
}

await browser.close();
