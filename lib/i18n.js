// Helpers for translated content. A translatable value is a plain string (same in every language)
// or a map {vi, en, ja} where `vi` is required; missing languages fall back to VI.

export const LANGS = /** @type {const} */ (['vi', 'en', 'ja']);

/** @param {unknown} value @param {string} lang @returns {string} */
export function tr(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const map = /** @type {Record<string, string>} */ (value);
  return map[lang] ?? map.vi ?? '';
}

/** True when `value` is a non-empty string or a map with a non-empty `vi`. @param {unknown} value */
export function isTranslatable(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const map = /** @type {Record<string, unknown>} */ (value);
  return (
    typeof map.vi === 'string' &&
    map.vi.trim().length > 0 &&
    Object.keys(map).every((k) => /** @type {readonly string[]} */ (LANGS).includes(k) && typeof map[k] === 'string')
  );
}

/** Fill `{name}` placeholders. @param {string} str @param {Record<string, unknown>} vars */
export function fmt(str, vars) {
  return String(str ?? '').replace(/\{(\w+)\}/g, (_, k) => String(vars?.[k] ?? `{${k}}`));
}
