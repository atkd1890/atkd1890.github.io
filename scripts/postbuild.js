#!/usr/bin/env node
// Runs after Eleventy (`npm run build`): writes sitemap.xml from the built pages and builds the
// Pagefind search index (one index per language, read from <html lang>).
// Usage: node scripts/postbuild.js [outputDir]
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import * as pagefind from 'pagefind';
import site from '../src/_data/site.js';
import { sitemapUrl, sitemapXml } from '../lib/seo.js';

const root = process.argv[2] || '_site';
/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));

const urls = walk(root)
  .filter((f) => f.endsWith('.html'))
  .map((f) => sitemapUrl(relative(root, f).split(sep).join('/'), readFileSync(f, 'utf8')))
  .filter((u) => u !== null);
writeFileSync(join(root, 'sitemap.xml'), sitemapXml(site.url, /** @type {string[]} */ (urls)));
console.log(`postbuild: sitemap.xml, ${urls.length} urls`);

const { index, errors } = await pagefind.createIndex({});
if (!index) throw new Error(`pagefind: ${errors.join(', ')}`);
const added = await index.addDirectory({ path: root });
if (added.errors.length) throw new Error(`pagefind: ${added.errors.join(', ')}`);
const written = await index.writeFiles({ outputPath: join(root, 'pagefind') });
if (written.errors.length) throw new Error(`pagefind: ${written.errors.join(', ')}`);
console.log(`postbuild: pagefind, ${added.page_count} pages indexed`);
await pagefind.close();
