import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score, filterItems, step, createSequencer, nextTheme } from '../src/assets/js/core.js';

test('score ranks prefix > word start > substring > fuzzy > none', () => {
  assert.equal(score('signal-desk', 'sig'), 100);
  assert.equal(score('signal-desk', 'desk'), 80);
  assert.equal(score('signals', 'gna'), 60);
  assert.equal(score('signal-desk', 'sdk'), 20);
  assert.equal(score('signal-desk', 'xyz'), 0);
  assert.equal(score('anything', '  '), 1);
});

test('filterItems ranks and keeps order on ties, matches keywords', () => {
  const items = [
    { id: 'a', group: 'Go', label: 'Signals', keywords: 'stats heatmap' },
    { id: 'b', group: 'Work', label: 'signal-desk' },
    { id: 'c', group: 'Go', label: 'Lab' },
  ];
  assert.deepEqual(
    filterItems(items, 'sig').map((i) => i.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    filterItems(items, 'heatmap').map((i) => i.id),
    ['a'],
  );
  assert.deepEqual(
    filterItems(items, '').map((i) => i.id),
    ['a', 'b', 'c'],
  );
});

test('step wraps around and handles empty lists', () => {
  assert.equal(step(0, -1, 3), 2);
  assert.equal(step(2, 1, 3), 0);
  assert.equal(step(0, 1, 0), -1);
});

test('sequencer handles two-key bindings, single keys and timeouts', () => {
  const seq = createSequencer({ 'g h': 'home', 'g b': 'blog', '/': 'search' }, 1000);
  assert.equal(seq('g', 0), null);
  assert.equal(seq('h', 500), 'home');
  assert.equal(seq('/', 600), 'search');
  assert.equal(seq('g', 1000), null);
  assert.equal(seq('b', 2500), null, 'expired');
  assert.equal(seq('x', 3000), null);
});

test('nextTheme flips', () => {
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('light'), 'dark');
});
