// Lighthouse thresholds (CLAUDE.md: Lighthouse ≥ 95 in every category).
export const MIN_SCORE = 0.95;
export const CATEGORIES = /** @type {const} */ (['performance', 'accessibility', 'best-practices', 'seo']);

/**
 * Failures for one page, as "url category score<min". Missing categories count as failures.
 * @param {string} url @param {Record<string, {score: number|null}>} categories @param {number} [min]
 * @returns {string[]}
 */
export function scoreFailures(url, categories, min = MIN_SCORE) {
  return CATEGORIES.filter((c) => (categories[c]?.score ?? 0) < min).map(
    (c) => `${url} ${c} ${Math.round((categories[c]?.score ?? 0) * 100)} < ${Math.round(min * 100)}`,
  );
}
