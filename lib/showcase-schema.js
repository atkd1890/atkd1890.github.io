// Schema validator for src/_data/showcase.yml. Hand-written, zero deps.
// Throws on the first file with problems, listing every problem found.

import { isTranslatable } from './i18n.js';

export const ERAS = /** @type {const} */ (['mobile', 'indie-game', 'system', 'ai']);
export const STATUSES = /** @type {const} */ (['shipped', 'live', 'archived', 'wip']);
export const EVIDENCE = /** @type {const} */ (['card', 'case-study', 'demo', 'open-source']);
export const SECRET_REPO = '@secret';

const CODENAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const KEYS = [
  'codename',
  'repo',
  'public_repo',
  'era',
  'domain',
  'role',
  'stack',
  'years',
  'status',
  'summary',
  'metrics',
  'evidence',
  'media',
  'demo_url',
  'featured',
  'placeholder',
  'order',
];

/**
 * @typedef {{label: string, value: string}} Metric
 * @typedef {{
 *   codename: string, repo: string|null, public_repo: string|null,
 *   era: typeof ERAS[number], domain: string|Record<string, string>, role: string|Record<string, string>, stack: string[], years: string,
 *   status: typeof STATUSES[number], summary: string|Record<string, string>, metrics: Metric[],
 *   evidence: Array<typeof EVIDENCE[number]>, media: string[], demo_url: string|null,
 *   featured: boolean, placeholder: boolean, order: number
 * }} ShowcaseEntry
 */

/** @param {unknown} v */
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
/** @param {unknown} v @returns {v is unknown[]} */
const isArr = (v) => Array.isArray(v);

/**
 * Validate parsed showcase data. Returns the entries sorted by `order`.
 * @param {unknown} data
 * @returns {ShowcaseEntry[]}
 */
export function validateShowcase(data) {
  /** @type {string[]} */
  const errors = [];
  if (!isArr(data)) throw new Error('showcase.yml: top level must be a list');
  const seen = new Set();

  data.forEach((raw, i) => {
    const e = /** @type {Record<string, unknown>} */ (raw ?? {});
    const at = `entry ${i} (${typeof e.codename === 'string' ? e.codename : '?'})`;
    const err = (/** @type {string} */ m) => errors.push(`${at}: ${m}`);

    for (const k of Object.keys(e)) if (!KEYS.includes(k)) err(`unknown key "${k}"`);
    for (const k of KEYS) if (!(k in e)) err(`missing key "${k}"`);

    if (!isStr(e.codename) || !CODENAME_RE.test(/** @type {string} */ (e.codename))) err('codename must be kebab-case');
    else if (seen.has(e.codename)) err('duplicate codename');
    else seen.add(e.codename);

    // The public repo must never hold a real private repo name.
    if (!(e.repo === null || e.repo === SECRET_REPO))
      err(`repo must be null or "${SECRET_REPO}" (real names live in the SHOWCASE_REPOS secret)`);
    if (!(e.public_repo === null || (typeof e.public_repo === 'string' && REPO_RE.test(e.public_repo))))
      err('public_repo must be null or owner/name');

    if (!ERAS.includes(/** @type {any} */ (e.era))) err(`era must be one of ${ERAS.join(', ')}`);
    if (!STATUSES.includes(/** @type {any} */ (e.status))) err(`status must be one of ${STATUSES.join(', ')}`);
    for (const k of ['domain', 'role', 'summary'])
      if (!isTranslatable(e[k])) err(`${k} must be a non-empty string or a {vi, en, ja} map with vi`);
    if (!isStr(e.years)) err('years must be a non-empty string');

    if (!isArr(e.stack) || !e.stack.every(isStr)) err('stack must be a list of strings');
    if (!isArr(e.media) || !e.media.every(isStr)) err('media must be a list of strings');
    if (
      !isArr(e.evidence) ||
      e.evidence.length === 0 ||
      !e.evidence.every((x) => EVIDENCE.includes(/** @type {any} */ (x)))
    )
      err(`evidence must be a non-empty list of ${EVIDENCE.join(', ')}`);
    if (
      !isArr(e.metrics) ||
      !e.metrics.every(
        (m) => m && isStr(/** @type {any} */ (m).label) && isStr(String(/** @type {any} */ (m).value ?? '')),
      )
    )
      err('metrics must be a list of {label, value}');

    if (!(e.demo_url === null || (typeof e.demo_url === 'string' && /^https:\/\//.test(e.demo_url))))
      err('demo_url must be null or https URL');
    if (typeof e.featured !== 'boolean') err('featured must be boolean');
    if (typeof e.placeholder !== 'boolean') err('placeholder must be boolean');
    if (typeof e.order !== 'number' || !Number.isFinite(e.order)) err('order must be a number');
    if (e.placeholder === true && e.repo !== null) err('placeholder entries must have repo: null');
  });

  if (errors.length) throw new Error(`showcase.yml is invalid:\n  - ${errors.join('\n  - ')}`);
  return /** @type {ShowcaseEntry[]} */ ([...data]).sort((a, b) => a.order - b.order);
}
