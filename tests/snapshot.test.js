import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snapshotYear, rebase, skipInSnapshot } from '../lib/snapshot.js';

const SITE = 'https://atkd1890.github.io';

test('snapshotYear accepts snapshot-YYYY tags only', () => {
  assert.equal(snapshotYear('snapshot-2026'), '2026');
  assert.equal(snapshotYear('snapshot-26'), null);
  assert.equal(snapshotYear('v1.0'), null);
});

test('rebase moves root-absolute URLs under /YYYY/ and leaves external ones alone', () => {
  const html =
    '<html data-home="/"><link rel="stylesheet" href="/assets/css/main.css"><a href="/blog/">b</a><a href="https://github.com/x">g</a>' +
    '<a href="//atkd1890.github.io/">live</a><meta property="og:url" content="https://atkd1890.github.io/blog/">' +
    '<script type="application/json">[{"href":"/en/"},{"href":"https://x.dev"}]</script>';
  const out = rebase(html, '.html', '2026', SITE);
  assert.match(out, /data-home="\/2026\/"/);
  assert.match(out, /href="\/2026\/assets\/css\/main.css"/);
  assert.match(out, /href="\/2026\/blog\/"/);
  assert.match(out, /href="https:\/\/github.com\/x"/);
  assert.match(out, /href="\/\/atkd1890.github.io\/"/, 'the banner link to the live site stays');
  assert.match(out, /content="https:\/\/atkd1890.github.io\/2026\/blog\/"/);
  assert.match(out, /"href":"\/2026\/en\/"/);
  assert.match(out, /"href":"https:\/\/x.dev"/);
  assert.equal(rebase('src: url(/assets/fonts/a.woff2)', '.css', '2026', SITE), 'src: url(/2026/assets/fonts/a.woff2)');
  assert.match(
    rebase('{"start_url": "/", "src": "/assets/i.png"}', '.webmanifest', '2026', SITE),
    /"\/2026\/".*"\/2026\/assets/,
  );
  assert.equal(rebase('binary', '.png', '2026', SITE), 'binary');
});

test('snapshots leave out root-only files', () => {
  for (const f of ['sitemap.xml', 'robots.txt', '404.html', '.well-known/security.txt'])
    assert.ok(skipInSnapshot(f), f);
  for (const f of ['index.html', 'feed.xml', 'pagefind/pagefind.js']) assert.ok(!skipInSnapshot(f), f);
});
