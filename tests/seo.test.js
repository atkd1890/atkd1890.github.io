import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ogPath, ogName, jsonLd, inlineJson, cspHash, sitemapUrl, sitemapXml } from '../lib/seo.js';
import { searchItems } from '../src/assets/js/core.js';

const site = { url: 'https://x.test', hub: 'https://hub.test', github: 'https://github.com/x' };

test('ogPath maps page URLs to one PNG each, and ogName reverses it', () => {
  assert.equal(ogPath('/'), '/og/index.png');
  assert.equal(ogPath('/en/'), '/og/en.png');
  assert.equal(ogPath('/ja/blog/post-a/'), '/og/ja/blog/post-a.png');
  assert.equal(ogPath('/404.html'), '/og/404.png');
  assert.equal(ogName('/og/ja/blog/post-a.png'), 'ja/blog/post-a');
});

test('jsonLd uses the persona, never anything else, as author', () => {
  const post = jsonLd({ kind: 'post', url: '/blog/a/', title: 'A', lang: 'en', date: new Date('2026-11-12') }, site);
  assert.equal(post['@type'], 'BlogPosting');
  assert.equal(post.datePublished, '2026-11-12');
  assert.equal(post.author.name, 'ATKD Coding');
  assert.deepEqual(post.author.sameAs, [site.hub, site.github]);
  const home = jsonLd({ kind: 'home', url: '/', lang: 'vi' }, site);
  assert.deepEqual(
    home['@graph'].map((/** @type {any} */ n) => n['@type']),
    ['WebSite', 'Person'],
  );
  const tools = jsonLd(
    { kind: 'tools', url: '/tools/', tools: [{ name: 't', url: 'https://g/t', homepage: null, description: null }] },
    site,
  );
  assert.equal(tools.itemListElement[0].item['@type'], 'SoftwareApplication');
  assert.equal(tools.itemListElement[0].item.url, 'https://g/t');
});

test('inlineJson cannot close its script tag', () => {
  assert.ok(!inlineJson({ t: '</script><script>alert(1)</script>' }).includes('<'));
});

test('cspHash matches the browser format', () => {
  const code = 'console.log(1)';
  assert.equal(cspHash(code), `'sha256-${createHash('sha256').update(code).digest('base64')}'`);
});

test('sitemap keeps real pages only, deduped and sorted', () => {
  assert.equal(sitemapUrl('index.html', ''), '/');
  assert.equal(sitemapUrl('en/blog/a/index.html', ''), '/en/blog/a/');
  assert.equal(sitemapUrl('404.html', ''), null);
  assert.equal(sitemapUrl('feed.xml', ''), null);
  assert.equal(sitemapUrl('x/index.html', '<meta name="robots" content="noindex">'), null);
  const xml = sitemapXml('https://x.test', ['/b/', '/', '/b/']);
  assert.equal((xml.match(/<loc>/g) ?? []).length, 2);
  assert.ok(xml.indexOf('<loc>https://x.test/</loc>') < xml.indexOf('<loc>https://x.test/b/</loc>'));
});

test('searchItems turns Pagefind hits into plain-text palette items', () => {
  const [item] = searchItems(
    [{ url: '/blog/a/', meta: { title: 'A' }, excerpt: 'the <mark>leak</mark> guard &amp; co' }],
    'Blog',
  );
  assert.deepEqual(item, {
    id: 'search-0',
    group: 'Blog',
    label: 'A',
    href: '/blog/a/',
    detail: 'the leak guard & co',
  });
  assert.equal(searchItems([{ url: '/x/' }], 'B')[0].label, '/x/');
});
