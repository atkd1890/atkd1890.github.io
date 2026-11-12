import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpiry, assess } from '../lib/token-expiry.js';

test('parseExpiry reads the GitHub header formats', () => {
  assert.equal(parseExpiry('2027-11-11 00:00:00 UTC')?.toISOString(), '2027-11-11T00:00:00.000Z');
  assert.equal(parseExpiry('2027-11-11 09:00:00 +0900')?.toISOString(), '2027-11-11T00:00:00.000Z');
  assert.equal(parseExpiry('2027-11-11 00:00:00')?.toISOString(), '2027-11-11T00:00:00.000Z');
  assert.equal(parseExpiry(null), null);
  assert.equal(parseExpiry('soon'), null);
});

test('assess warns inside the window and flags expired or invalid tokens', () => {
  const now = new Date('2027-11-01T00:00:00Z');
  const at = (d) => new Date(`${d}T00:00:00Z`);
  assert.deepEqual(assess({ status: 200, expiry: at('2028-01-01'), now }), { state: 'ok', days: 61 });
  assert.deepEqual(assess({ status: 200, expiry: at('2027-11-15'), now }), { state: 'warn', days: 14 });
  assert.deepEqual(assess({ status: 200, expiry: at('2027-10-30'), now }), { state: 'expired', days: -2 });
  assert.deepEqual(assess({ status: 401, expiry: null, now }), { state: 'invalid', days: null });
  assert.deepEqual(assess({ status: 200, expiry: null, now }), { state: 'no-expiry', days: null });
  assert.equal(assess({ status: 200, expiry: at('2027-11-20'), now, warnDays: 30 }).state, 'warn');
});
