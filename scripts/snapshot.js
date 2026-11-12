#!/usr/bin/env node
// Copies a finished build (_site) into <out>/<year>/ with every root-absolute URL moved under /<year>/.
// Used by the Snapshot workflow after `SNAPSHOT_YEAR=<year> npm run build && npm run og`.
// Usage: node scripts/snapshot.js <year> [out=snapshot-out]
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, relative, sep, dirname, extname } from 'node:path';
import site from '../src/_data/site.js';
import { rebase, skipInSnapshot } from '../lib/snapshot.js';

const [year, out = 'snapshot-out'] = process.argv.slice(2);
if (!/^\d{4}$/.test(year ?? '')) {
  console.error('usage: node scripts/snapshot.js <year> [out]');
  process.exit(2);
}
const root = '_site';
const dest = join(out, year);
/** @param {string} p @returns {string[]} */
const walk = (p) =>
  readdirSync(p).flatMap((n) => (statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)]));

rmSync(dest, { recursive: true, force: true });
let files = 0;
for (const file of walk(root)) {
  const rel = relative(root, file).split(sep).join('/');
  if (skipInSnapshot(rel)) continue;
  const target = join(dest, rel);
  mkdirSync(dirname(target), { recursive: true });
  const ext = extname(file).toLowerCase();
  const buf = readFileSync(file);
  writeFileSync(
    target,
    ['.html', '.css', '.xml', '.txt', '.webmanifest'].includes(ext)
      ? rebase(buf.toString('utf8'), ext, year, site.url)
      : buf,
  );
  files++;
}
console.log(`snapshot: ${files} files → ${dest}/`);
