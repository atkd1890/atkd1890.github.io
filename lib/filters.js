// Small template filters that need tests.

/**
 * Items whose value at `path` ('type' or 'data.type') equals `value`.
 * @param {any[]} list @param {string} path @param {unknown} value
 */
export function where(list, path, value) {
  const keys = path.split('.');
  return (list ?? []).filter((x) => keys.reduce((o, k) => o?.[k], x) === value);
}
