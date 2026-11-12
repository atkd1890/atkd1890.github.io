import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

// Every relative link and #anchor in the repo's Markdown must resolve,
// so tables of contents and cross-links never rot.
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const SKIP = new Set(['node_modules', '.git', '_site', '.cache']);

/** @param {string} dir @returns {string[]} */
const mdFiles = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (SKIP.has(n)) return [];
    return statSync(p).isDirectory() ? mdFiles(p) : n.endsWith('.md') ? [p] : [];
  });

/** GitHub heading slug. @param {string} h */
const slug = (h) =>
  h
    .trim()
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

/** @param {string} file */
const anchors = (file) => {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  return new Set([...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => slug(m[1])));
};

test('Markdown links and anchors resolve', () => {
  const broken = [];
  for (const file of mdFiles(ROOT)) {
    const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:)/.test(target)) continue;
      const [path, hash] = target.split('#');
      const dest = path ? resolve(dirname(file), path) : file;
      if (!existsSync(dest)) {
        broken.push(`${file.slice(ROOT.length + 1)} → ${target} (missing file)`);
        continue;
      }
      if (hash && dest.endsWith('.md') && !anchors(dest).has(decodeURIComponent(hash)))
        broken.push(`${file.slice(ROOT.length + 1)} → ${target} (missing anchor)`);
    }
  }
  assert.deepEqual(broken, []);
});
