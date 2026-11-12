// Pure logic for the command palette and keyboard shortcuts. No DOM: unit-tested with node:test.

/**
 * @typedef {{id: string, group: string, label: string, hint?: string, href?: string, action?: string, keywords?: string}} Item
 */

/**
 * Score how well `query` matches `text`: 0 = no match. Contiguous and word-start matches win;
 * otherwise every query character must appear in order (fuzzy).
 * @param {string} text @param {string} query
 */
export function score(text, query) {
  const t = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const at = t.indexOf(q);
  if (at === 0) return 100;
  if (at > 0) return /[\s/._-]/.test(t[at - 1]) ? 80 : 60;
  let i = 0;
  for (const ch of t) if (ch === q[i]) i++;
  return i === q.length ? 20 : 0;
}

/**
 * Filter and rank palette items. Ties keep their original order.
 * @param {Item[]} items @param {string} query @returns {Item[]}
 */
export function filterItems(items, query) {
  return items
    .map((item, i) => ({ item, i, s: Math.max(score(item.label, query), score(item.keywords ?? '', query) * 0.9) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.item);
}

/** Move a selection index with wrap-around. @param {number} i @param {number} delta @param {number} n */
export function step(i, delta, n) {
  return n === 0 ? -1 : (((i + delta) % n) + n) % n;
}

/**
 * Two-key sequences ("g h") and single keys ("/", "?"). Feed keys one by one;
 * returns the bound action or null. A sequence expires after `timeout` ms.
 * @param {Record<string, string>} bindings e.g. {"g h": "home", "/": "search"}
 * @param {number} [timeout]
 */
export function createSequencer(bindings, timeout = 1000) {
  /** @type {string|null} */
  let pending = null;
  let at = 0;
  const prefixes = new Set(
    Object.keys(bindings)
      .filter((k) => k.includes(' '))
      .map((k) => k.split(' ')[0]),
  );
  /** @param {string} key @param {number} now */
  return (key, now) => {
    if (pending && now - at <= timeout) {
      const action = bindings[`${pending} ${key}`];
      pending = null;
      if (action) return action;
    }
    pending = null;
    if (bindings[key]) return bindings[key];
    if (prefixes.has(key)) {
      pending = key;
      at = now;
    }
    return null;
  };
}

/** Theme cycle stored in localStorage: system → explicit opposite → system. @param {'light'|'dark'} current */
export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}
