import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

// Eleventy v3 exposes the whole module namespace when a data file has named exports,
// which silently breaks templates. Every JS data file must export `default` only.
test('src/_data/*.js export default only', async () => {
  const dir = new URL('../src/_data/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    const mod = await import(new URL(f, dir).href);
    assert.deepEqual(Object.keys(mod), ['default'], `${f} has named exports`);
  }
});
