import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkStatus } from '../lib/data-check.js';

test('permission errors fail the deploy, other data problems only warn', () => {
  assert.deepEqual(checkStatus({ source: 'live', privateToken: true, expected: 2, fetched: 2, problems: [] }), {
    errors: [],
    warnings: [],
  });
  const forbidden = checkStatus({
    source: 'live',
    privateToken: true,
    expected: 2,
    fetched: 1,
    problems: ['stats for atkd-ui failed: GitHub GraphQL error: FORBIDDEN'],
  });
  assert.equal(forbidden.errors.length, 1);
  assert.match(forbidden.warnings.join(), /1 of 2 codenames/);
  const expired = checkStatus({
    source: 'snapshot',
    privateToken: true,
    expected: 2,
    fetched: 0,
    problems: ['signals failed, keeping snapshot: GitHub GraphQL HTTP 401'],
  });
  assert.deepEqual(expired.errors, [], 'an expired token is the token-expiry job’s job');
  assert.ok(expired.warnings.some((w) => w.includes('snapshot')));
  assert.equal(checkStatus(null).errors.length, 1);
});
