import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLinks, pageIds, classify, fileFor, verdict } from '../lib/links.js';
import { scoreFailures } from '../lib/lighthouse.js';

const SITE = 'https://atkd1890.github.io';

test('extractLinks reads href/src and skips mailto/data', () => {
  const html =
    '<a href="/blog/">b</a><a class="x" href="mailto:a@b.c">m</a><img src="/i.png" alt=""><a href="https://x.dev/?a=1&amp;b=2">x</a><link rel="icon" href="data:,">';
  assert.deepEqual(extractLinks(html), ['/blog/', '/i.png', 'https://x.dev/?a=1&b=2']);
});

test('classify resolves internal paths, anchors and own absolute URLs', () => {
  assert.deepEqual(classify('#top', '/blog/a/', SITE), { kind: 'internal', path: '/blog/a/', hash: 'top' });
  assert.deepEqual(classify('../b/', '/blog/a/', SITE), { kind: 'internal', path: '/blog/b/', hash: '' });
  assert.deepEqual(classify(`${SITE}/feed.xml`, '/', SITE), { kind: 'internal', path: '/feed.xml', hash: '' });
  assert.deepEqual(classify('/ja/blog/x/#%E8%A6%81%E7%82%B9', '/', SITE), {
    kind: 'internal',
    path: '/ja/blog/x/',
    hash: '要点',
  });
  assert.deepEqual(classify('https://github.com/x', '/', SITE), { kind: 'external', url: 'https://github.com/x' });
  assert.equal(classify('ftp://x', '/', SITE), null);
});

test('fileFor and pageIds', () => {
  assert.equal(fileFor('/blog/'), 'blog/index.html');
  assert.equal(fileFor('/feed.xml'), 'feed.xml');
  assert.deepEqual([...pageIds('<h2 id="a">x</h2><div id="要点"></div>')], ['a', '要点']);
});

test('verdict: bot walls are not failures, 404 and timeouts are', () => {
  assert.equal(verdict(200), 'ok');
  assert.equal(verdict(301), 'ok');
  assert.equal(verdict(403), 'blocked');
  assert.equal(verdict(429), 'blocked');
  assert.equal(verdict(404), 'broken');
  assert.equal(verdict(0), 'broken');
});

test('Lighthouse: every category must reach 95', () => {
  const ok = {
    performance: { score: 1 },
    accessibility: { score: 0.95 },
    'best-practices': { score: 1 },
    seo: { score: 1 },
  };
  assert.deepEqual(scoreFailures('/', ok), []);
  assert.deepEqual(scoreFailures('/', { ...ok, performance: { score: 0.9 } }), ['/ performance 90 < 95']);
  assert.equal(scoreFailures('/', {}).length, 4);
});
