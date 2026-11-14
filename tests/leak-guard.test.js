import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRules, scanText, hasExif, describe, fold, CANARY } from '../lib/leak-guard.js';

test('canary is always detected', () => {
  assert.equal(scanText('a.html', `x ${CANARY} y`, buildRules({})).length, 1);
});

test('repo names match as whole tokens only', () => {
  const rules = buildRules({ repoNames: ['someone/widget-kit'] });
  assert.equal(scanText('a', 'uses widget-kit tokens', rules).length, 1);
  assert.ok(scanText('a', 'someone/widget-kit', rules).length >= 1);
  assert.equal(scanText('a', 'a widget kit for all', rules).length, 0, 'prose is not a hit');
  assert.equal(scanText('a', 'my-widget-kits', rules).length, 0, 'longer identifiers are not hits');
});

test('allowed infrastructure repos are not hits, project repos still are', () => {
  const rules = buildRules({ repoNames: ['someone/atkd.world-ops', 'someone/widget-kit'] });
  assert.equal(scanText('a', 'agent lives in atkd.world-ops', rules).length, 0);
  assert.equal(scanText('a', 'someone/atkd.world-ops', rules).length, 0);
  assert.equal(scanText('a', 'uses widget-kit', rules).length, 1);
});

test('denylist matches case- and diacritic-insensitively', () => {
  const rules = buildRules({ denylist: ['Nguyễn Văn Test', 'secret@example.com'] });
  assert.equal(scanText('a', 'by NGUYEN VAN TEST', rules).length, 1);
  assert.equal(scanText('a', 'mail: Secret@Example.com', rules).length, 1);
  assert.equal(fold('Đỗ'), 'do');
});

test('short and commented denylist entries are ignored', () => {
  assert.equal(buildRules({ denylist: ['ab', '# comment'] }).length, 1, 'only the canary rule');
});

test('findings never contain the secret value', () => {
  const rules = buildRules({ repoNames: ['x/hidden-repo'], denylist: ['hidden person'] });
  const msgs = scanText('f.html', 'hidden-repo\nhidden person', rules).map(describe);
  assert.equal(msgs.length, 2);
  for (const m of msgs) assert.equal(/hidden/.test(m), false, m);
});

test('EXIF detection for JPEG, PNG and WebP', () => {
  const jpgExif = Uint8Array.from([0xff, 0xd8, 0xff, 0xe1, 0, 8, 0x45, 0x78, 0x69, 0x66, 0, 0, 0xff, 0xda, 0, 0]);
  const jpgClean = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xda, 0, 0]);
  assert.equal(hasExif(jpgExif, 'a.jpg'), true);
  assert.equal(hasExif(jpgClean, 'a.jpeg'), false);

  const chunk = (type, len) => [0, 0, 0, len, ...Buffer.from(type), ...new Array(len).fill(0), 0, 0, 0, 0];
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  assert.equal(
    hasExif(Uint8Array.from([...sig, ...chunk('IHDR', 13), ...chunk('eXIf', 4), ...chunk('IEND', 0)]), 'a.png'),
    true,
  );
  assert.equal(hasExif(Uint8Array.from([...sig, ...chunk('IHDR', 13), ...chunk('IEND', 0)]), 'a.png'), false);

  const webp = (type) =>
    Uint8Array.from([
      ...Buffer.from('RIFF'),
      0,
      0,
      0,
      0,
      ...Buffer.from('WEBP'),
      ...Buffer.from(type),
      2,
      0,
      0,
      0,
      0,
      0,
    ]);
  assert.equal(hasExif(webp('EXIF'), 'a.webp'), true);
  assert.equal(hasExif(webp('VP8 '), 'a.webp'), false);
});

import { checkCommitMeta } from '../lib/leak-guard.js';

test('commit metadata: only noreply emails pass, denylisted names fail, values never printed', () => {
  const rules = buildRules({ denylist: ['Real Person'] });
  const ok = 'a'.repeat(40) + '\tatkd1890\t1+atkd1890@users.noreply.github.com\tGitHub\tnoreply@github.com';
  const badMail = 'b'.repeat(40) + '\tatkd1890\tme@gmail.com\tatkd1890\t1+atkd1890@users.noreply.github.com';
  const badName =
    'c'.repeat(40) +
    '\tReal Person\t1+atkd1890@users.noreply.github.com\tatkd1890\t1+atkd1890@users.noreply.github.com';
  assert.deepEqual(checkCommitMeta([ok], rules), []);
  const out = checkCommitMeta([badMail, badName], rules);
  assert.equal(out.length, 2);
  assert.match(out[0], /^commit bbbbbbb: author email is not a GitHub noreply address$/);
  assert.match(out[1], /^commit ccccccc: author\/committer matches denylist entry #0$/);
  for (const m of out) assert.equal(/gmail|Real Person/i.test(m), false);
});

test('PII: phone numbers in VN and JP formats, never dates, versions or examples', async () => {
  const { findPhones, scanPii, describe } = await import('../lib/leak-guard.js');
  for (const p of [
    '0912345670',
    '+84912345670',
    '090-4821-7730',
    '09048217730',
    '03-4821-7730',
    '045-482-7730',
    '+81 90 4821 7730',
    '+81-3-4821-7730',
  ])
    assert.equal(findPhones(`call ${p} now`).length, 1, p);
  for (const p of [
    '2026-11-12',
    '03-11-2026',
    'v1.0912345670',
    '#0912345670',
    'id-0912345670',
    '090-1234-5678',
    '090-0000-0000',
    '0123456789',
  ])
    assert.equal(findPhones(`x ${p} y`).length, 0, p);
  const findings = scanPii(
    'a.html',
    'ok hi@atkd1890.me\nme@gmail.com\n2776097+atkd1890@users.noreply.github.com\ncall 090-4821-7730',
  );
  assert.deepEqual(
    findings.map((f) => describe(f)),
    ['a.html:2  email outside allowed domains', 'a.html:4  phone number'],
  );
  assert.ok(
    !findings
      .map((f) => describe(f))
      .join()
      .includes('gmail'),
    'never prints the value',
  );
});
