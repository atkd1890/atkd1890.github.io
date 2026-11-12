#!/usr/bin/env node
// Renders the PNG icons from the <CO/> mark with the site's own JetBrains Mono (dev-time; outputs are committed).
// Usage: node scripts/gen-icons.js
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const font = readFileSync(
  'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2',
).toString('base64');
/** @param {number} size @param {boolean} full full <CO/> mark or compact CO */
const html = (size, full) => `<!doctype html><html><head><style>
@font-face { font-family: M; font-weight: 700; src: url(data:font/woff2;base64,${font}) format('woff2'); }
html, body { margin: 0; background: #0d1117; }
.i { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: #0d1117; }
.m { width: ${Math.round(size * 0.72)}px; height: ${Math.round(size * 0.72)}px; box-sizing: border-box;
  border: ${Math.max(2, Math.round(size / 40))}px solid #7dd3fc; color: #7dd3fc; display: grid; place-items: center;
  font: 700 ${Math.round(size * (full ? 0.17 : 0.3))}px M; letter-spacing: -0.03em; }
</style></head><body><div class="i"><div class="m">${full ? '&lt;CO/&gt;' : 'CO'}</div></div></body></html>`;

const browser = await chromium.launch();
for (const [file, size, full] of /** @type {const} */ ([
  ['apple-touch-icon.png', 180, true],
  ['icon-192.png', 192, true],
  ['icon-512.png', 512, true],
])) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(html(size, full));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `src/assets/icons/${file}`, omitBackground: false });
  await page.close();
  console.log(`icons: ${file}`);
}
await browser.close();
