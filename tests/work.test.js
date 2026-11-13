import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCaseStudy, workNav, workUrl, mediaKind } from '../lib/work.js';
import { paletteItems } from '../lib/palette.js';

const showcase = [
  { codename: 'atkd-ui', evidence: ['card', 'case-study'], placeholder: false },
  { codename: 'shift-board', evidence: ['card'], placeholder: false },
  { codename: 'demo-mobile-1', evidence: ['card', 'case-study'], placeholder: true },
];
const ok = {
  codename: 'atkd-ui',
  lang: 'vi',
  summary: 'x',
  date: new Date('2026-11-12'),
  source: 'human',
  agent_run: null,
  draft: false,
};

test('validateCaseStudy accepts the contract and ties the file to showcase.yml', () => {
  assert.deepEqual(validateCaseStudy(ok, 'atkd-ui.md', showcase), []);
  assert.deepEqual(validateCaseStudy({ ...ok, lang: 'ja' }, 'atkd-ui.ja.md', showcase), []);
  const bad = (/** @type {any} */ d, f = 'atkd-ui.md') => validateCaseStudy({ ...ok, ...d }, f, showcase).join('\n');
  assert.match(bad({ codename: 'nope' }, 'nope.md'), /not in showcase/);
  assert.match(bad({ codename: 'shift-board' }, 'shift-board.md'), /add "case-study"/);
  assert.match(bad({ codename: 'demo-mobile-1' }, 'demo-mobile-1.md'), /demo data/);
  assert.match(bad({}, 'atkd-ui.en.md'), /suffix must match lang/);
  assert.match(bad({}, 'other.md'), /must match codename/);
  assert.match(bad({ summary: ' ' }), /summary/);
  assert.match(bad({ source: 'agent' }), /agent_run/);
  assert.match(bad({ repo: 'x' }), /unknown frontmatter key "repo"/);
});

const s = (/** @type {string} */ codename, /** @type {string} */ lang) => ({
  url: `${lang === 'vi' ? '' : `/${lang}`}/work/${codename}/`,
  data: { codename, lang },
});
const studies = [s('a', 'vi'), s('a', 'en'), s('b', 'vi'), s('c', 'vi'), s('c', 'ja')];

test('workNav follows showcase order and prefers the reader language', () => {
  const nav = workNav(studies, 'b', 'en', ['a', 'b', 'c']);
  assert.equal(nav.prev?.url, '/en/work/a/');
  assert.equal(nav.next?.url, '/work/c/');
  assert.equal(workNav(studies, 'a', 'vi', ['a', 'b', 'c']).prev, null);
  assert.equal(workNav(studies, 'c', 'ja', ['a', 'b', 'c']).next, null);
});

test('workUrl falls back to VI, then to nothing', () => {
  assert.equal(workUrl(studies, 'a', 'en'), '/en/work/a/');
  assert.equal(workUrl(studies, 'b', 'ja'), '/work/b/');
  assert.equal(workUrl(studies, 'z', 'vi'), null);
});

test('mediaKind renders only files that exist, never a stand-in', () => {
  const files = new Set([
    'src/work/a/arch.svg',
    'src/work/a/home-light.png',
    'src/work/a/home-dark.png',
    'src/work/a/half-light.png',
  ]);
  const exists = (/** @type {string} */ p) => files.has(p);
  assert.equal(mediaKind('work/a/arch', exists), 'diagram');
  assert.equal(mediaKind('work/a/home', exists), 'shot');
  assert.equal(mediaKind('work/a/half', exists), null);
  assert.equal(mediaKind('work/a/missing', exists), null);
});

test('palette opens the case study when a codename has one', () => {
  const t = { groups: { go: 'Go', work: 'Work', action: 'A', link: 'L' }, items: /** @type {any} */ ({}) };
  const site = { hub: 'h', github: 'g', repo: 'r', email: 'e' };
  const items = paletteItems(
    [
      { codename: 'a', featured: true, placeholder: false, order: 1 },
      { codename: 'x', featured: true, placeholder: false, order: 2 },
    ],
    site,
    t,
    '/en',
    studies,
  );
  assert.equal(items.find((i) => i.id === 'work-a')?.href, '/en/work/a/');
  assert.equal(items.find((i) => i.id === 'work-x')?.href, '/en/#work-x');
});
