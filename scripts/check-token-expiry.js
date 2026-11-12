#!/usr/bin/env node
// Checks SHOWCASE_TOKEN's expiry and writes the result for the workflow (never prints the token).
// Output (GITHUB_OUTPUT): state=ok|warn|expired|no-expiry|invalid|missing, days=<n>, expires=<YYYY-MM-DD>
import { appendFileSync } from 'node:fs';
import { parseExpiry, assess } from '../lib/token-expiry.js';

const token = process.env.SHOWCASE_TOKEN;
/** @param {Record<string, string>} kv */
const out = (kv) => {
  const lines = Object.entries(kv).map(([k, v]) => `${k}=${v}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
  console.log(`token-expiry: ${lines.join(' ')}`);
};

if (!token) {
  out({ state: 'missing', days: '', expires: '' });
} else {
  const res = await fetch('https://api.github.com/rate_limit', {
    headers: {
      authorization: `Bearer ${token}`,
      'user-agent': 'atkd-coding-site',
      accept: 'application/vnd.github+json',
    },
  });
  const expiry = parseExpiry(res.headers.get('github-authentication-token-expiration'));
  const { state, days } = assess({
    status: res.status,
    expiry,
    now: new Date(),
    warnDays: Number(process.env.WARN_DAYS || 14),
  });
  out({ state, days: days === null ? '' : String(days), expires: expiry ? expiry.toISOString().slice(0, 10) : '' });
}
