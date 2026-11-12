import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseEntries, releaseUrl, slug, blogPages } from '../lib/blog.js';
import { where } from '../lib/filters.js';

const rel = {
  repo: 'atkd1890/json-tool',
  name: 'v1.2.0',
  tag: 'v1.2.0',
  url: 'https://github.com/atkd1890/json-tool/releases/tag/v1.2.0',
  publishedAt: '2026-11-10T00:00:00Z',
  body: '\n## Faster parsing\n- details',
};

test('releaseUrl is stable and URL-safe', () => {
  assert.equal(slug('Hello, World v1.2'), 'hello-world-v1-2');
  assert.equal(releaseUrl(rel), '/blog/release/atkd1890-json-tool-v1-2-0/');
});

test('releaseEntries look like posts to the blog index', () => {
  const [e] = releaseEntries([rel]);
  assert.equal(e.url, releaseUrl(rel));
  assert.equal(e.data.type, 'release');
  assert.equal(e.data.summary, 'Faster parsing');
  assert.equal(+e.data.date, Date.parse(rel.publishedAt));
  const pages = blogPages(releaseEntries([rel]), [{ code: 'vi', prefix: '' }]);
  assert.ok(pages.some((p) => p.kind === 'type' && p.value === 'release' && p.posts.length === 1));
  assert.deepEqual(releaseEntries(/** @type {any} */ (undefined)), []);
});

test('where filters by nested path, so per-type feeds are not empty', () => {
  const items = [{ data: { type: 'til' } }, { data: { type: 'release' } }, { type: 'til' }];
  assert.equal(where(items, 'data.type', 'til').length, 1);
  assert.equal(where(items, 'type', 'til').length, 1);
  assert.deepEqual(where(/** @type {any} */ (null), 'a', 1), []);
});
