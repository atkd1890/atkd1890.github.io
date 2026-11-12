#!/usr/bin/env node
// Renders one Open Graph image (1200×630 PNG) per built page, after `npm run build`.
// Every page already declares its image URL (og:image → /og/<path>.png, lib/seo.js); this script reads
// that tag plus og:title/og:description and screenshots a terminal-style card styled by the site's own
// CSS tokens (dark theme). Text comes from the built HTML, which the leak guard checks.
// Needs Playwright's Chromium (`npx playwright install chromium`). Usage: node scripts/og.js [outputDir]
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import site from '../src/_data/site.js';
import { ogName } from '../lib/seo.js';

const root = process.argv[2] || '_site';
const ORIGIN = 'http://og.local';
const TYPES = /** @type {Record<string, string>} */ ({
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
});

/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));

/** @param {string} s */
const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** @param {string} html @param {string} prop */
const meta = (html, prop) => decode(html.match(new RegExp(`<meta property="${prop}" content="([^"]*)"`))?.[1] ?? '');

const CARD = `<!doctype html>
<html data-theme="dark"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/css/main.css">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--bg); }
  .og { box-sizing: border-box; width: 1200px; height: 630px; display: flex; flex-direction: column;
    border-top: 8px solid var(--accent); font-family: var(--font-display); color: var(--fg); }
  .og-bar { display: flex; justify-content: space-between; padding: 22px 56px; border-bottom: 1px solid var(--line);
    color: var(--muted); font-size: 22px; }
  .og-body { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 24px; padding: 0 56px; }
  .og-body .prompt { font-size: 26px; }
  .og-title { margin: 0; font-weight: 700; font-size: 60px; line-height: 1.15; display: -webkit-box;
    -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .og-desc { margin: 0; color: var(--muted); font-size: 26px; line-height: 1.45; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .og-foot { display: flex; align-items: center; gap: 20px; padding: 0 56px 40px; color: var(--muted); font-size: 22px; }
  .og-foot .mark { width: 64px; height: 64px; }
  :lang(ja) .og-title, :lang(ja) .og-desc { font-family: var(--font-ja); }
</style></head>
<body><div class="og">
  <div class="og-bar"><span>~/atkd-coding — zsh</span><span id="lang"></span></div>
  <div class="og-body"><p class="prompt" id="prompt"></p><h1 class="og-title" id="title"></h1><p class="og-desc" id="desc"></p></div>
  <div class="og-foot"><div class="mark">&lt;CO/&gt;</div><span>${new URL(site.url).host}</span></div>
</div></body></html>`;

const pages = walk(root)
  .filter((f) => f.endsWith('.html'))
  .map((file) => {
    const html = readFileSync(file, 'utf8');
    const image = meta(html, 'og:image');
    if (!image.startsWith(site.url)) return null;
    const url = `/${relative(root, file).split(sep).join('/')}`.replace(/index\.html$/, '');
    return {
      out: join(root, 'og', `${ogName(image.slice(site.url.length))}.png`),
      lang: html.match(/<html lang="([^"]+)"/)?.[1] ?? 'vi',
      title: meta(html, 'og:title').replace(new RegExp(` · ${site.title}$`), ''),
      desc: meta(html, 'og:description'),
      prompt: /\/blog\/[^/]+\/$/.test(url) && meta(html, 'og:type') === 'article' ? `cat ${url}` : `cd ${url}`,
    };
  })
  .filter((p) => p !== null);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.route(`${ORIGIN}/**`, async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === '/') return route.fulfill({ contentType: 'text/html', body: CARD });
  try {
    const body = readFileSync(join(root, decodeURIComponent(path)));
    return route.fulfill({ contentType: TYPES[extname(path)] ?? 'application/octet-stream', body });
  } catch {
    return route.fulfill({ status: 404, body: '' });
  }
});
await page.goto(`${ORIGIN}/`);
for (const p of pages) {
  await page.evaluate((d) => {
    document.documentElement.lang = d.lang;
    /** @type {HTMLElement} */ (document.getElementById('lang')).textContent = d.lang.toUpperCase();
    /** @type {HTMLElement} */ (document.getElementById('prompt')).textContent = d.prompt;
    /** @type {HTMLElement} */ (document.getElementById('title')).textContent = d.title;
    /** @type {HTMLElement} */ (document.getElementById('desc')).textContent = d.desc;
    return document.fonts.ready;
  }, p);
  mkdirSync(dirname(p.out), { recursive: true });
  writeFileSync(p.out, await page.screenshot({ type: 'png' }));
}
await browser.close();
console.log(`og: ${pages.length} images`);
