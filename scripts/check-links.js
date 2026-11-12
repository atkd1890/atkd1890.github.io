#!/usr/bin/env node
// Checks links in the built site. Internal links (pages, assets, #anchors) always; external links with --external.
// Exit 1 when anything is broken. With --report=<file>, also writes a Markdown report (used by the weekly issue).
// Usage: node scripts/check-links.js [--external] [--report=links.md]
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import site from '../src/_data/site.js';
import { extractLinks, pageIds, classify, fileFor, verdict } from '../lib/links.js';

const root = '_site';
const args = process.argv.slice(2);
const external = args.includes('--external');
const reportFile = args.find((a) => a.startsWith('--report='))?.slice('--report='.length);

/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));

/** @type {Map<string, Set<string>>} */
const idsCache = new Map();
/** @param {string} file */
const idsOf = (file) => {
  if (!idsCache.has(file)) idsCache.set(file, pageIds(readFileSync(join(root, file), 'utf8')));
  return /** @type {Set<string>} */ (idsCache.get(file));
};

/** @type {string[]} */
const broken = [];
/** @type {Map<string, Set<string>>} external URL → pages that use it */
const outbound = new Map();

const pages = walk(root).filter((f) => f.endsWith('.html'));
for (const file of pages) {
  const rel = relative(root, file).split(sep).join('/');
  const pagePath = `/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
  for (const link of extractLinks(readFileSync(file, 'utf8'))) {
    const c = classify(link, pagePath, site.url);
    if (!c) continue;
    if (c.kind === 'external') {
      if (!outbound.has(c.url)) outbound.set(c.url, new Set());
      outbound.get(c.url)?.add(pagePath);
      continue;
    }
    const target = fileFor(c.path);
    if (!existsSync(join(root, target)) || statSync(join(root, target)).isDirectory()) {
      broken.push(`${pagePath} -> ${link} (missing page)`);
    } else if (c.hash && target.endsWith('.html') && !idsOf(target).has(c.hash)) {
      broken.push(`${pagePath} -> ${link} (missing #${c.hash})`);
    }
  }
}
console.log(`links: ${pages.length} pages checked, ${broken.length} broken internal`);

/** @type {string[]} */
const blocked = [];
if (external) {
  /** @param {string} url @returns {Promise<number>} */
  const status = async (url) => {
    for (const method of ['HEAD', 'GET']) {
      try {
        const res = await fetch(url, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: { 'user-agent': 'atkd-coding-link-check' },
        });
        if (res.ok || method === 'GET') return res.status;
      } catch {
        if (method === 'GET') return 0;
      }
    }
    return 0;
  };
  const urls = [...outbound.keys()];
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const url = urls[i++];
      let code = await status(url);
      if (verdict(code) === 'broken') code = await status(url); // one retry for flaky hosts
      const v = verdict(code);
      const where = [...(outbound.get(url) ?? [])].slice(0, 3).join(', ');
      if (v === 'broken') broken.push(`${url} (${code || 'no response'}) on ${where}`);
      if (v === 'blocked') blocked.push(`${url} (${code}) on ${where}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`links: ${urls.length} external checked, ${blocked.length} blocked by the host (not a failure)`);
}

if (reportFile) {
  const lines = [
    `${broken.length} broken link(s) found by \`npm run links:external\` on the built site.`,
    '',
    ...broken.map((b) => `- [ ] ${b}`),
    ...(blocked.length
      ? ['', 'Hosts that refused the checker (check by hand if needed):', '', ...blocked.map((b) => `- ${b}`)]
      : []),
  ];
  writeFileSync(reportFile, `${lines.join('\n')}\n`);
}
if (broken.length) {
  console.error(`links: ${broken.length} broken\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log('links: ok');
