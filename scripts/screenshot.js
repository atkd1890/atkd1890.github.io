#!/usr/bin/env node
// Real screenshots for posts, light and dark (dev-time; outputs are committed).
// Usage: node scripts/screenshot.js <url> <out-base> [width] [height] [selector]
//   e.g. node scripts/screenshot.js https://atkd1890.github.io/ src/blog/2026/my-post/home 1280 800
// Writes <out-base>-light.png and <out-base>-dark.png. Playwright PNGs carry no EXIF; the leak guard checks anyway.
import { chromium } from '@playwright/test';

const [url, out, w = '1280', h = '800', selector] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: screenshot.js <url> <out-base> [width] [height] [selector]');
  process.exit(2);
}
const browser = await chromium.launch();
for (const scheme of /** @type {const} */ (['light', 'dark'])) {
  const page = await browser.newPage({
    viewport: { width: Number(w), height: Number(h) },
    colorScheme: scheme,
    reducedMotion: 'reduce',
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const target = selector ? page.locator(selector).first() : page;
  await target.screenshot({ path: `${out}-${scheme}.png` });
  await page.close();
  console.log(`screenshot: ${out}-${scheme}.png`);
}
await browser.close();
