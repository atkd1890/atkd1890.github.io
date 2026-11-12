// Pure helpers that shape data for the home page. Templates call them as Nunjucks filters.

/**
 * @typedef {{date: string, count: number}} Day
 * @typedef {{date: string, count: number, level: number}} Cell
 */

/**
 * Last `weeks` weeks of the contribution calendar as columns of 7 days (Sunday first),
 * with an intensity level 0–4 relative to the busiest day.
 * @param {Day[]} days @param {number} [weeks]
 */
export function heatmap(days, weeks = 52) {
  const sorted = [...(days ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  // Align the first column to a Sunday so rows are weekdays.
  const firstSunday = sorted.findIndex((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0);
  const aligned = firstSunday < 0 ? [] : sorted.slice(firstSunday);
  /** @type {Day[][]} */
  const cols = [];
  for (let i = 0; i < aligned.length; i += 7) cols.push(aligned.slice(i, i + 7));
  const last = cols.slice(-weeks);
  const flat = last.flat();
  const max = Math.max(0, ...flat.map((d) => d.count));
  const level = (/** @type {number} */ n) => (n <= 0 || max === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  return {
    weeks: last.map((col) => col.map((d) => ({ date: d.date, count: d.count, level: level(d.count) }))),
    total: flat.reduce((a, d) => a + d.count, 0),
    activeDays: flat.filter((d) => d.count > 0).length,
    max,
  };
}

/**
 * Top `n` languages, the rest folded into "Other". Shares stay in percent.
 * @param {Array<{name: string, pct: number}>} langs @param {number} [n]
 */
export function topLanguages(langs, n = 5) {
  const list = [...(langs ?? [])].sort((a, b) => b.pct - a.pct);
  const top = list.slice(0, n);
  const rest = Math.round(list.slice(n).reduce((a, l) => a + l.pct, 0) * 10) / 10;
  return rest > 0 ? [...top, { name: 'Other', pct: rest }] : top;
}

/**
 * @typedef {{id: string, label: string, years: string, stack: string[], did: string}} Era
 * @typedef {{codename: string, era: string, featured: boolean, placeholder: boolean, order: number}} Entry
 */

/**
 * Join era definitions with showcase entries: real project count and a flagship per era.
 * The flagship prefers real featured projects, then real ones, then demo data.
 * @param {Era[]} eras @param {Entry[]} showcase
 */
export function eraSummary(eras, showcase) {
  return eras.map((era) => {
    const inEra = showcase.filter((e) => e.era === era.id).sort((a, b) => a.order - b.order);
    const real = inEra.filter((e) => !e.placeholder);
    const flagship = real.find((e) => e.featured) ?? real[0] ?? inEra[0] ?? null;
    return { ...era, projects: real.length, flagship, demoOnly: real.length === 0 && inEra.length > 0 };
  });
}

/**
 * Cards for "Selected work": featured real projects first, at most `n`.
 * @template {Entry} T @param {T[]} showcase @param {number} [n]
 * @returns {T[]}
 */
export function selectedWork(showcase, n = 6) {
  return showcase
    .filter((e) => e.featured && !e.placeholder)
    .sort((a, b) => a.order - b.order)
    .slice(0, n);
}
