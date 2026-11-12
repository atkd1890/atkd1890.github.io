import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countTests, parseWorkflow, parseAdr, changelogEntries, stackVersions, collectCraft } from '../lib/craft.js';

test('countTests counts test( declarations at line start only', () => {
  assert.equal(countTests("test('a', () => {});\n  test('b', () => {});\n// contest(\nconst x = 'test(';"), 2);
});

test('parseWorkflow reads name, triggers, jobs and cron', () => {
  const wf = parseWorkflow(
    "name: Deploy\non:\n  push:\n  schedule:\n    - cron: '1 2 * * *'\njobs:\n  build: {}\n  deploy: {}\n",
    'deploy.yml',
  );
  assert.deepEqual(wf, {
    file: 'deploy.yml',
    name: 'Deploy',
    triggers: ['push', 'schedule'],
    jobs: ['build', 'deploy'],
    cron: ['1 2 * * *'],
  });
  assert.deepEqual(parseWorkflow('on: push\njobs: {a: {}}', 'x.yml').triggers, ['push']);
});

test('parseAdr and changelogEntries read the doc formats used in this repo', () => {
  assert.deepEqual(parseAdr('# 0003. Leak guard\n\nNgày: x', 'f.md'), {
    num: '0003',
    title: 'Leak guard',
    file: 'f.md',
  });
  assert.equal(parseAdr('# README', 'f.md'), null);
  assert.deepEqual(changelogEntries('# Changelog\n\n## 2026-11-12 — Blog\n\n- x\n## 2026-11-11 — Home\n'), [
    { date: '2026-11-12', title: 'Blog' },
    { date: '2026-11-11', title: 'Home' },
  ]);
});

test('stackVersions keeps known tools with exact versions', () => {
  assert.deepEqual(stackVersions({ '@11ty/eleventy': '^3.1.8', 'left-pad': '1.0.0' }), [
    { name: 'Eleventy', version: '3.1.8' },
  ]);
});

test('collectCraft reads this repo without throwing and finds real numbers', () => {
  const c = collectCraft('.');
  assert.ok(c.tests.unit > 0 && c.tests.e2e > 0);
  assert.ok(c.workflows.some((w) => w.name === 'Deploy'));
  assert.ok(c.adrs.length >= 7);
  assert.ok(c.changelog.length > 0);
  assert.ok(c.bytes.js > 0 && c.bytes.css > 0);
});
