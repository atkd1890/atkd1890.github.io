#!/usr/bin/env node
// Lighthouse (mobile preset, simulated throttling) on key pages of the built site. Fails below MIN_SCORE.
// Uses Playwright's Chromium, so no separate Chrome install. Reports go to lighthouse/ (gitignored; a CI artifact).
// Usage: node scripts/lighthouse.js   (after npm run build)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { scoreFailures, CATEGORIES } from '../lib/lighthouse.js';

const PORT = 8091;
const PAGES = [
  '/',
  '/en/',
  '/blog/',
  '/blog/github-native-portfolio/',
  '/ja/blog/github-native-portfolio/',
  '/colophon/',
];

const server = spawn(process.execPath, ['scripts/serve.js'], { env: { ...process.env, PORT: String(PORT) } });
await new Promise((r) => setTimeout(r, 500));
const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
mkdirSync('lighthouse', { recursive: true });
/** @type {string[]} */
const fails = [];
try {
  for (const path of PAGES) {
    const url = `http://localhost:${PORT}${path}`;
    const result = await lighthouse(url, { port: chrome.port, output: 'html', logLevel: 'error' });
    if (!result) throw new Error(`lighthouse: no result for ${path}`);
    const cats = /** @type {Record<string, {score: number|null}>} */ (result.lhr.categories);
    console.log(
      `lighthouse ${path}: ${CATEGORIES.map((c) => `${c} ${Math.round((cats[c]?.score ?? 0) * 100)}`).join(', ')}`,
    );
    fails.push(...scoreFailures(path, cats));
    writeFileSync(`lighthouse/${path.replace(/\//g, '_') || 'home'}.html`, String(result.report));
  }
} finally {
  await chrome.kill();
  server.kill();
}
if (fails.length) {
  console.error(`lighthouse: ${fails.length} below threshold\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('lighthouse: ok');
