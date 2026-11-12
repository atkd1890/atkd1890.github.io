// Small template filters that need tests.

/**
 * Items whose value at `path` ('type' or 'data.type') equals `value`.
 * @param {any[]} list @param {string} path @param {unknown} value
 */
export function where(list, path, value) {
  const keys = path.split('.');
  return (list ?? []).filter((x) => keys.reduce((o, k) => o?.[k], x) === value);
}

/**
 * Titlebar path for a page (artboards Blog, CaseStudy): "/en/blog/x/" → "/blog", "/work/atkd-ui/" → "/work/atkd-ui",
 * home → "". The language prefix is dropped; only /work keeps its second segment.
 * @param {string} url @param {string} prefix language prefix ('' | '/en' | '/ja')
 */
export function shellPath(url, prefix) {
  const parts = String(url ?? '/')
    .slice(prefix.length)
    .replace(/\.html$/, '')
    .split('/')
    .filter(Boolean);
  if (!parts.length) return '';
  return parts[0] === 'work' ? `/${parts.slice(0, 2).join('/')}` : `/${parts[0]}`;
}
