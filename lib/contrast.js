// WCAG 2.x contrast helpers, used to test the design tokens in main.css.

/** @param {string} hex #rgb or #rrggbb */
export function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (/** @type {number} */ c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** @param {string} a @param {string} b */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Custom properties of the blocks matching `selectors` (later ones override earlier ones),
 * with var() references resolved after merging, so dark overrides re-resolve aliases.
 * @param {string} css @param {string[]} selectors
 * @returns {Record<string, string>}
 */
export function tokens(css, selectors) {
  /** @type {Record<string, string>} */
  const raw = {};
  for (const selector of selectors) {
    const at = css.indexOf(`${selector} {`);
    if (at < 0) continue;
    const block = css.slice(at, css.indexOf('}', at));
    for (const [, name, value] of block.matchAll(/(--[\w-]+):\s*([^;]+);/g)) raw[name] = value.trim();
  }
  /** @type {(v: string, depth?: number) => string} */
  const resolve = (v, depth = 0) =>
    depth > 5 ? v : v.replace(/var\((--[\w-]+)\)/g, (_, /** @type {string} */ n) => resolve(raw[n] ?? '', depth + 1));
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolve(v)]));
}
