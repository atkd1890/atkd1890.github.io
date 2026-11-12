// Reads the expiry of a fine-grained PAT from GitHub's response header and decides whether to warn.
// GitHub sends `github-authentication-token-expiration: 2027-11-11 00:00:00 UTC` on authenticated REST calls.

/** @param {string|null|undefined} header @returns {Date|null} */
export function parseExpiry(header) {
  if (!header) return null;
  const m = header.trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\s*(UTC|[+-]\d{4}))?$/);
  if (!m) return null;
  const zone = !m[3] || m[3] === 'UTC' ? 'Z' : `${m[3].slice(0, 3)}:${m[3].slice(3)}`;
  const d = new Date(`${m[1]}T${m[2]}${zone}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {{status: number, expiry: Date|null, now: Date, warnDays?: number}} p
 * @returns {{state: 'ok'|'warn'|'expired'|'no-expiry'|'invalid', days: number|null}}
 */
export function assess({ status, expiry, now, warnDays = 14 }) {
  if (status === 401) return { state: 'invalid', days: null };
  if (!expiry) return { state: 'no-expiry', days: null };
  const days = Math.floor((expiry.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return { state: 'expired', days };
  return { state: days <= warnDays ? 'warn' : 'ok', days };
}
