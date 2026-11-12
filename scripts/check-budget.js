#!/usr/bin/env node
// Fails when any built page exceeds the budget in lib/budget.js (gzipped sizes).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { gzipSync } from 'node:zlib';
import { BUDGET, pageAssets, staticImports, blockingFonts } from '../lib/budget.js';

const root = '_site';
/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));
/** @param {string} url */
const read = (url) => readFileSync(join(root, url));
const gz = (/** @type {Buffer} */ b) => gzipSync(b, { level: 9 }).length;
const kb = (/** @type {number} */ n) => `${(n / 1024).toFixed(1)} KB`;

/** Module graph of a script, following static relative imports. @param {string} url @param {Set<string>} seen */
function graph(url, seen = new Set()) {
  if (seen.has(url)) return seen;
  seen.add(url);
  for (const spec of staticImports(read(url).toString())) graph(posix.join(dirname(url), spec), seen);
  return seen;
}

const fails = [];
for (const file of walk(root).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(file);
  const { scripts, styles } = pageAssets(html.toString());
  const js = [...new Set(scripts.flatMap((s) => [...graph(s)]))].reduce((a, u) => a + gz(read(u)), 0);
  const css = styles.reduce((a, u) => a + gz(read(u)), 0);
  const blocking = styles.reduce((a, u) => a + blockingFonts(read(u).toString()), 0);
  const page = file.slice(root.length);
  console.log(`budget ${page}: html ${kb(gz(html))}, js ${kb(js)}, css ${kb(css)}`);
  if (gz(html) > BUDGET.html) fails.push(`${page}: HTML ${kb(gz(html))} > ${kb(BUDGET.html)}`);
  if (js > BUDGET.js) fails.push(`${page}: JS ${kb(js)} > ${kb(BUDGET.js)}`);
  if (css > BUDGET.css) fails.push(`${page}: CSS ${kb(css)} > ${kb(BUDGET.css)}`);
  if (blocking) fails.push(`${page}: ${blocking} @font-face without font-display swap/optional/fallback`);
}
if (fails.length) {
  console.error(`budget: ${fails.length} over\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('budget: ok');
