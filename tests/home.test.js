import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heatmap, topLanguages, eraSummary, selectedWork } from '../lib/home.js';

/** @param {string} start ISO date @param {number[]} counts */
const days = (start, counts) =>
  counts.map((count, i) => {
    const d = new Date(`${start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    return { date: d.toISOString().slice(0, 10), count };
  });

test('heatmap aligns columns to Sunday and scales levels to the busiest day', () => {
  // 2026-11-07 is a Saturday, so the first day is dropped.
  const h = heatmap(days('2026-11-07', [9, 0, 1, 2, 4, 8, 0, 0, 3]));
  assert.equal(h.weeks[0][0].date, '2026-11-08');
  assert.equal(h.weeks[0].length, 7);
  assert.equal(h.weeks[1].length, 1);
  assert.equal(h.max, 8);
  assert.deepEqual(
    h.weeks.flat().map((c) => c.level),
    [0, 1, 1, 2, 4, 0, 0, 2],
  );
  assert.equal(h.total, 18);
  assert.equal(h.activeDays, 5);
});

test('heatmap keeps only the last N weeks and survives empty input', () => {
  assert.equal(heatmap(days('2026-01-04', new Array(70).fill(1)), 4).weeks.length, 4);
  assert.deepEqual(heatmap([]), { weeks: [], total: 0, activeDays: 0, max: 0 });
});

test('topLanguages folds the tail into Other', () => {
  const out = topLanguages(
    [
      { name: 'A', pct: 50 },
      { name: 'B', pct: 30 },
      { name: 'C', pct: 15 },
      { name: 'D', pct: 5 },
    ],
    2,
  );
  assert.deepEqual(out, [
    { name: 'A', pct: 50 },
    { name: 'B', pct: 30 },
    { name: 'Other', pct: 20 },
  ]);
});

const e = (codename, era, o = {}) => ({ codename, era, featured: true, placeholder: false, order: 1, ...o });

test('eraSummary prefers real featured flagships and flags demo-only eras', () => {
  const out = eraSummary(
    [
      { id: 'ai', label: 'AI', years: '', stack: [], did: '' },
      { id: 'mobile', label: 'mobile', years: '', stack: [], did: '' },
      { id: 'system', label: 'systems', years: '', stack: [], did: '' },
    ],
    [
      e('b', 'ai', { order: 2 }),
      e('a', 'ai', { order: 1, featured: false }),
      e('demo', 'mobile', { placeholder: true }),
    ],
  );
  assert.equal(out[0].flagship.codename, 'b');
  assert.equal(out[0].projects, 2);
  assert.equal(out[1].demoOnly, true);
  assert.equal(out[1].projects, 0);
  assert.equal(out[2].flagship, null);
});

test('selectedWork skips demo data and caps the list', () => {
  const out = selectedWork(
    [
      e('x', 'ai', { order: 3 }),
      e('y', 'ai', { order: 1 }),
      e('d', 'ai', { placeholder: true }),
      e('n', 'ai', { featured: false }),
    ],
    5,
  );
  assert.deepEqual(
    out.map((x) => x.codename),
    ['y', 'x'],
  );
});

import { paletteItems } from '../lib/palette.js';

test('paletteItems lists featured real work only, with unique ids', () => {
  const items = paletteItems(
    [
      { codename: 'b', featured: true, placeholder: false, order: 2 },
      { codename: 'a', featured: true, placeholder: false, order: 1 },
      { codename: 'demo', featured: true, placeholder: true, order: 3 },
    ],
    { hub: 'https://hub', github: 'https://gh', repo: 'o/r', email: 'x@y' },
  );
  const work = items.filter((i) => i.group === 'Work').map((i) => i.label);
  assert.deepEqual(work, ['a', 'b']);
  assert.equal(new Set(items.map((i) => i.id)).size, items.length);
  assert.ok(items.every((i) => i.href || i.action));
});
