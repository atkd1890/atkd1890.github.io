import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, tokens } from '../lib/contrast.js';

const css = readFileSync(new URL('../src/assets/css/main.css', import.meta.url), 'utf8');
const light = tokens(css, [':root']);
const dark = tokens(css, [':root', ":root[data-theme='dark']"]);

// [text, background, minimum ratio]. 4.5:1 = WCAG AA for normal text.
const PAIRS = [
  ['--fg', '--bg', 4.5],
  ['--fg', '--panel', 4.5],
  ['--muted', '--bg', 4.5],
  ['--muted', '--panel', 4.5],
  ['--accent', '--bg', 4.5],
  ['--accent', '--panel', 4.5],
  ['--prompt', '--bg', 4.5],
  ['--hash', '--bg', 4.5],
  ['--hash', '--panel', 4.5],
  ['--sys', '--bg', 4.5],
  ['--inv', '--accent', 4.5],
  ['--era-mobile', '--bg', 4.5],
  ['--era-indie-game', '--bg', 4.5],
  ['--era-system', '--bg', 4.5],
  ['--era-ai', '--bg', 4.5],
  ['--era-indie-game', '--panel', 4.5],
];

test('contrast helper matches known values', () => {
  assert.equal(Math.round(contrast('#000000', '#ffffff')), 21);
  assert.equal(contrast('#777777', '#777777'), 1);
});

for (const [name, t] of [
  ['light', light],
  ['dark', dark],
]) {
  test(`${name} theme: every text token meets WCAG AA on its backgrounds`, () => {
    const fails = PAIRS.map(([fg, bg, min]) => ({ fg, bg, min, r: contrast(t[fg], t[bg]) }))
      .filter((x) => x.r < x.min)
      .map((x) => `${x.fg} on ${x.bg}: ${x.r.toFixed(2)} < ${x.min}`);
    assert.deepEqual(fails, []);
  });

  test(`${name} theme: the 4 era colors differ in lightness, not only hue`, () => {
    const eras = ['--era-mobile', '--era-indie-game', '--era-system', '--era-ai'].map((k) => t[k]);
    for (let i = 0; i < eras.length; i++)
      for (let j = i + 1; j < eras.length; j++)
        assert.ok(
          contrast(eras[i], eras[j]) >= 1.1,
          `${eras[i]} vs ${eras[j]}: ${contrast(eras[i], eras[j]).toFixed(2)}`,
        );
  });
}

test('dark tokens are identical in the media query and the manual override', () => {
  const media = tokens(css, [':root', "  :root:not([data-theme='light'])"]);
  for (const k of [
    '--bg',
    '--fg',
    '--muted',
    '--accent',
    '--prompt',
    '--hash',
    '--sys',
    '--heat-4',
    '--era-mobile',
    '--era-ai',
  ])
    assert.equal(media[k], dark[k], k);
});
