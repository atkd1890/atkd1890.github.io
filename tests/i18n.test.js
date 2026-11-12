import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tr, isTranslatable, fmt } from '../lib/i18n.js';
import i18n from '../src/_data/i18n.js';

test('tr returns strings as is and falls back to vi', () => {
  assert.equal(tr('same', 'ja'), 'same');
  assert.equal(tr({ vi: 'xin chào', en: 'hello' }, 'en'), 'hello');
  assert.equal(tr({ vi: 'xin chào' }, 'ja'), 'xin chào');
  assert.equal(tr(null, 'vi'), '');
});

test('isTranslatable requires vi and known languages only', () => {
  assert.equal(isTranslatable('x'), true);
  assert.equal(isTranslatable({ vi: 'x', ja: 'y' }), true);
  assert.equal(isTranslatable({ en: 'x' }), false);
  assert.equal(isTranslatable({ vi: 'x', fr: 'y' }), false);
  assert.equal(isTranslatable(''), false);
});

test('fmt fills placeholders and keeps unknown ones', () => {
  assert.equal(fmt('{n} dự án', { n: 3 }), '3 dự án');
  assert.equal(fmt('{a} {b}', { a: 1 }), '1 {b}');
});

/** @param {Record<string, unknown>} o @param {string} [p] @returns {string[]} */
const keys = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(/** @type {any} */ (v), `${p}${k}.`) : [`${p}${k}`],
  );

test('every UI language has exactly the same keys as vi', () => {
  const vi = keys(i18n.t.vi).sort();
  for (const lang of ['en', 'ja']) assert.deepEqual(keys(/** @type {any} */ (i18n.t)[lang]).sort(), vi, lang);
  assert.deepEqual(
    i18n.langs.map((l) => l.code),
    ['vi', 'en', 'ja'],
  );
  assert.equal(i18n.langs[0].prefix, '', 'vi is the default, without prefix');
});
