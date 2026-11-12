// Link checking for the built site: internal links (files and #anchors) offline, external links over HTTP.

/** href/src values in an HTML page, ignoring inline SVG internals and data/mailto/tel/javascript URLs. @param {string} html */
export function extractLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/<(?:a|link|img|script|source)\b[^>]*?\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (/^(mailto|tel|data|javascript):/i.test(url)) continue;
    out.add(url);
  }
  return [...out];
}

/** Element ids of a page, for checking #fragments. @param {string} html */
export const pageIds = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

/**
 * Splits a link into an internal target or an external URL.
 * @param {string} url as written in the page
 * @param {string} pagePath URL path of the page it is on, e.g. "/blog/a/"
 * @param {string} siteUrl e.g. "https://atkd1890.github.io"
 * @returns {{kind: 'internal', path: string, hash: string} | {kind: 'external', url: string} | null}
 */
export function classify(url, pagePath, siteUrl) {
  if (url.startsWith(siteUrl)) url = url.slice(siteUrl.length) || '/';
  if (/^https?:\/\//i.test(url) || url.startsWith('//'))
    return { kind: 'external', url: url.replace(/^\/\//, 'https://') };
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  const abs = new URL(url, `http://x${pagePath}`);
  return { kind: 'internal', path: decodeURIComponent(abs.pathname), hash: decodeURIComponent(abs.hash.slice(1)) };
}

/** Output file for a URL path: "/blog/" → "blog/index.html", "/feed.xml" → "feed.xml". @param {string} path */
export const fileFor = (path) => (path.endsWith('/') ? `${path.slice(1)}index.html` : path.slice(1));

/**
 * HTTP status → verdict. Bot walls (401/403/429) are reported but do not fail the check.
 * @param {number} status 0 = network error or timeout
 * @returns {'ok'|'blocked'|'broken'}
 */
export function verdict(status) {
  if (status >= 200 && status < 400) return 'ok';
  if (status === 401 || status === 403 || status === 429) return 'blocked';
  return 'broken';
}
