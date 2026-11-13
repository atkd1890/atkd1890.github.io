#!/usr/bin/env node
// Lighthouse (mobile preset, simulated throttling) on key pages of the built site. Fails below MIN_SCORE.
// Uses Playwright's Chromium, so no separate Chrome install. Reports go to lighthouse/ (gitignored; a CI artifact).
// Usage: node scripts/lighthouse.js   (after npm run build)
//   --summary=<file>  also write the lowest score per category as JSON (Deploy keeps it for /colophon)
//   --no-fail         report only, exit 0 (Deploy: PRs already gate on the threshold)
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { scoreFailures, CATEGORIES, lowestScores } from '../lib/lighthouse.js';

const args = process.argv.slice(2);
const summaryFile = args.find((a) => a.startsWith('--summary='))?.slice('--summary='.length);
const noFail = args.includes('--no-fail');

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
/** @type {Array<Record<string, {score: number|null}>>} */
const all = [];
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
    all.push(cats);
    writeFileSync(`lighthouse/${path.replace(/\//g, '_') || 'home'}.html`, String(result.report));
  }
} finally {
  await chrome.kill();
  server.kill();
}
if (summaryFile) {
  writeFileSync(summaryFile, JSON.stringify({ pages: PAGES.length, scores: lowestScores(all) }));
  console.log(`lighthouse: summary written to ${summaryFile}`);
}
if (fails.length && !noFail) {
  console.error(`lighthouse: ${fails.length} below threshold\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('lighthouse: ok');
