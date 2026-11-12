#!/usr/bin/env node
// Renders every src/blog/**/*.mmd (Mermaid) to an .svg next to it (dev-time; outputs are committed).
// Colors are rendered as unique placeholders, then swapped for CSS variables, so the inlined SVG
// follows the site theme (light/dark, manual toggle) without two versions.
// Usage: node scripts/render-diagrams.js
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** placeholder → CSS variable */
const PALETTE = {
  '#010101': 'var(--fg)',
  '#020202': 'var(--bg)',
  '#030303': 'var(--panel)',
  '#040404': 'var(--line)',
  '#050505': 'var(--accent)',
  '#060606': 'var(--muted)',
  '#070707': 'var(--prompt)',
  // Colors Mermaid derives itself (arrowheads, error text, start dots, 6% drop shadows).
  '#fdfdfd': 'var(--muted)',
  '#000000': 'var(--fg)',
};
const theme = {
  background: '#020202',
  primaryColor: '#030303',
  primaryTextColor: '#010101',
  primaryBorderColor: '#050505',
  secondaryColor: '#030303',
  tertiaryColor: '#020202',
  lineColor: '#060606',
  textColor: '#010101',
  mainBkg: '#030303',
  nodeBorder: '#050505',
  clusterBkg: '#020202',
  clusterBorder: '#040404',
  edgeLabelBackground: '#020202',
  titleColor: '#070707',
  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
  fontSize: '14px',
};

/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));
const files = walk('src/blog').filter((f) => f.endsWith('.mmd'));
if (!files.length) {
  console.log('diagrams: none');
  process.exit(0);
}
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ path: 'node_modules/mermaid/dist/mermaid.min.js' });
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  /** @type {string} */
  const svg = await page.evaluate(async ([code, themeVariables]) => {
    // @ts-ignore mermaid is a global from the script tag
    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables, securityLevel: 'strict' });
    // @ts-ignore
    const { svg } = await mermaid.render(`d${Math.random().toString(36).slice(2)}`, code);
    return svg;
  }, /** @type {const} */ ([src, theme]));
  let out = svg;
  for (const [hex, cssVar] of Object.entries(PALETTE))
    out = out.replaceAll(hex, cssVar).replaceAll(hex.toUpperCase(), cssVar);
  out = out.replace(/ style="max-width: [^"]*"/, ' style="max-width: 100%"');
  writeFileSync(file.replace(/\.mmd$/, '.svg'), out);
  console.log(`diagrams: ${file} → .svg`);
}
await browser.close();
