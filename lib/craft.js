// "Proof of craft" for /colophon, read from the repo at build time: versions, workflows, ADRs,
// changelog, test declarations and shipped asset sizes. Every number has a file behind it.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { load as parseYaml } from 'js-yaml';

/** Test declarations in a test file: `test(` calls, including ones generated in loops (counted once). @param {string} src */
export const countTests = (src) => (src.match(/^\s*test\(/gm) ?? []).length;

/**
 * @param {string} yml
 * @param {string} file
 * @returns {{file: string, name: string, triggers: string[], jobs: string[], cron: string[]}}
 */
export function parseWorkflow(yml, file) {
  const wf = /** @type {any} */ (parseYaml(yml) ?? {});
  const on = wf.on ?? wf.true ?? {}; // YAML 1.1 reads a bare `on:` key as boolean true
  const triggers = typeof on === 'string' ? [on] : Array.isArray(on) ? on : Object.keys(on);
  const cron = (on.schedule ?? []).map((/** @type {any} */ s) => s.cron);
  return { file, name: wf.name ?? file, triggers, jobs: Object.keys(wf.jobs ?? {}), cron };
}

/** "# 0003. Leak guard là bước build bắt buộc" → {num: '0003', title: '…'}. @param {string} md @param {string} file */
export function parseAdr(md, file) {
  const m = md.match(/^#\s+(\d{4})\.\s+(.+)$/m);
  return m ? { num: m[1], title: m[2].trim(), file } : null;
}

/** "## 2026-11-12 — Blog" → {date, title}, newest first as written. @param {string} md */
export const changelogEntries = (md) =>
  [...md.matchAll(/^##\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+)$/gm)].map((m) => ({ date: m[1], title: m[2].trim() }));

/** @param {Buffer|string} b */
export const gzipSize = (b) => gzipSync(b, { level: 9 }).length;

/** Exact versions of the tools this site is built with. @param {Record<string, string>} deps */
export function stackVersions(deps) {
  const pick = /** @type {const} */ ([
    ['@11ty/eleventy', 'Eleventy'],
    ['@playwright/test', 'Playwright'],
    ['@axe-core/playwright', 'axe-core'],
    ['pagefind', 'Pagefind'],
    ['mermaid', 'Mermaid'],
    ['typescript', 'TypeScript'],
    ['prettier', 'Prettier'],
  ]);
  return pick.filter(([k]) => deps[k]).map(([k, name]) => ({ name, version: deps[k].replace(/^[\^~]/, '') }));
}

/** @param {string} root repo root */
export function collectCraft(root) {
  const read = (/** @type {string} */ p) => readFileSync(join(root, p), 'utf8');
  const ls = (/** @type {string} */ p) => readdirSync(join(root, p)).sort();
  const pkg = JSON.parse(read('package.json'));

  const unit = ls('tests')
    .filter((f) => f.endsWith('.test.js'))
    .reduce((n, f) => n + countTests(read(`tests/${f}`)), 0);
  const e2e = ls('tests/e2e')
    .filter((f) => f.endsWith('.spec.js'))
    .reduce((n, f) => n + countTests(read(`tests/e2e/${f}`)), 0);

  const workflows = ls('.github/workflows')
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) => parseWorkflow(read(`.github/workflows/${f}`), f));
  const adrs = ls('docs/adr')
    .filter((f) => /^\d{4}-.*\.md$/.test(f))
    .map((f) => parseAdr(read(`docs/adr/${f}`), `docs/adr/${f}`))
    .filter((a) => a !== null);

  // Home page assets as shipped (passthrough copies, no minifier): what a first visit downloads.
  const js = ['src/assets/js/craft.js', 'src/assets/js/core.js'].reduce((n, f) => n + gzipSize(read(f)), 0);
  const css = gzipSize(read('src/assets/css/main.css'));

  return {
    node: read('.nvmrc').trim(),
    stack: stackVersions(pkg.devDependencies ?? {}),
    tests: { unit, e2e },
    workflows,
    adrs,
    changelog: changelogEntries(read('CHANGELOG.md')),
    bytes: { js, css },
  };
}
