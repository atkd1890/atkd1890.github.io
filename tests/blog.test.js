import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePost,
  duplicateVersions,
  pickVersions,
  versionsOf,
  blogPages,
  seriesNav,
  readingTime,
  toc,
} from '../lib/blog.js';

const base = () => ({
  title: 'Xin chào',
  slug: 'hello',
  date: new Date('2026-11-12T00:00:00Z'),
  type: 'deep-dive',
  tags: ['github', 'eleventy'],
  series: null,
  lang: 'vi',
  summary: 'Tóm tắt',
  url: null,
  codenames: ['atkd-ui'],
  source: 'human',
  agent_run: null,
  draft: false,
});
const FILE = '2026/2026-11-12-hello.md';

test('a valid post passes', () => {
  assert.deepEqual(validatePost(base(), FILE, ['atkd-ui']), []);
  assert.deepEqual(validatePost({ ...base(), lang: 'en' }, '2026/2026-11-12-hello.en.md', ['atkd-ui']), []);
});

test('contract violations are reported', () => {
  const errs = (/** @type {any} */ d, f = FILE) => validatePost({ ...base(), ...d }, f, ['atkd-ui']).join('\n');
  assert.match(errs({ type: 'essay' }), /type must be one of/);
  assert.match(errs({ type: 'link' }), /type link needs an https url/);
  assert.match(errs({ url: 'https://x' }), /url is only for type link/);
  assert.match(errs({ codenames: ['secret-thing'] }), /codenames must be a list/);
  assert.match(errs({ source: 'agent' }), /agent posts need agent_run/);
  assert.match(errs({ tags: ['Not Kebab'] }), /tags must be/);
  assert.match(errs({ extra: 1 }), /unknown frontmatter key "extra"/);
  assert.match(errs({ interactive: ['nope'] }), /interactive must list known components/);
  assert.match(errs({}, '2026/2026-11-13-hello.md'), /does not match file name/);
  assert.match(errs({}, '2026/2026-11-12-other.md'), /slug "hello" does not match/);
  assert.match(errs({ lang: 'en' }), /lang "en" does not match/);
  assert.match(errs({}, 'misc/hello.md'), /file must be/);
});

const post = (/** @type {string} */ slug, /** @type {string} */ lang, /** @type {string} */ day, extra = {}) => ({
  url: `${lang === 'vi' ? '' : `/${lang}`}/blog/${slug}/`,
  data: { slug, lang, date: new Date(`${day}T00:00:00Z`), type: 'til', tags: [], series: null, ...extra },
});

test('versions: reader language first, then vi; duplicates detected', () => {
  const posts = [post('a', 'vi', '2026-01-02'), post('a', 'en', '2026-01-02'), post('b', 'vi', '2026-01-03')];
  assert.deepEqual(
    pickVersions(posts, 'en').map((p) => `${p.data.slug}/${p.data.lang}`),
    ['b/vi', 'a/en'],
  );
  assert.deepEqual(versionsOf(posts, 'a'), { vi: '/blog/a/', en: '/en/blog/a/' });
  assert.deepEqual(duplicateVersions([...posts, post('a', 'en', '2026-01-05')]), ['duplicate post a/en']);
});

test('blogPages builds all/type/tag/series/year pages per language', () => {
  const posts = [
    post('a', 'vi', '2025-12-30', { type: 'til', tags: ['x'], series: 'bench' }),
    post('b', 'vi', '2026-01-03', { type: 'deep-dive', tags: ['x', 'y'], series: 'bench' }),
  ];
  const pages = blogPages(posts, [
    { code: 'vi', prefix: '' },
    { code: 'ja', prefix: '/ja' },
  ]);
  const urls = pages.map((p) => p.url);
  for (const u of ['/blog/', '/blog/type/til/', '/blog/tag/y/', '/blog/series/bench/', '/blog/2025/', '/ja/blog/2026/'])
    assert.ok(urls.includes(u), u);
  assert.ok(!urls.includes('/blog/type/link/'), 'empty types get no page');
  const series = pages.find((p) => p.url === '/blog/series/bench/');
  assert.deepEqual(
    series?.posts.map((p) => p.data.slug),
    ['a', 'b'],
    'series pages read oldest first',
  );
});

test('seriesNav links neighbours in date order', () => {
  const posts = [
    post('one', 'vi', '2026-01-01', { series: 's' }),
    post('two', 'vi', '2026-01-02', { series: 's' }),
    post('three', 'vi', '2026-01-03', { series: 's' }),
  ];
  const nav = seriesNav(posts, posts[1]);
  assert.equal(nav.prev?.data.slug, 'one');
  assert.equal(nav.next?.data.slug, 'three');
  assert.deepEqual(seriesNav(posts, post('x', 'vi', '2026-01-01')), { prev: null, next: null });
});

test('readingTime and toc', () => {
  assert.equal(readingTime(`<p>${'từ '.repeat(440)}</p><pre>${'code '.repeat(999)}</pre>`, 'vi'), 2);
  assert.equal(readingTime('<p>短い</p>', 'ja'), 1);
  assert.deepEqual(toc('<h2 id="a">Một <code>x</code></h2><h3 id="b">no</h3><h2 id="c" tabindex="-1">Hai</h2>'), [
    { id: 'a', text: 'Một x' },
    { id: 'c', text: 'Hai' },
  ]);
});
