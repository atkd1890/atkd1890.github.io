// Case studies (/work/<codename>/): frontmatter contract, navigation, media. Pure functions, unit-tested.
// Facts (role, domain, stack, years, metrics, media) live in showcase.yml so every number has one source;
// the case study file only holds the story.
import { LANGS } from './i18n.js';

export const WORK_KEYS = ['codename', 'lang', 'summary', 'date', 'source', 'agent_run', 'draft'];

/**
 * @param {Record<string, unknown>} d frontmatter
 * @param {string} file path relative to src/work, e.g. "atkd-ui.md", "atkd-ui.ja.md"
 * @param {Array<{codename: string, evidence: string[], placeholder: boolean}>} showcase
 * @returns {string[]} problems
 */
export function validateCaseStudy(d, file, showcase) {
  /** @type {string[]} */
  const errs = [];
  const err = (/** @type {string} */ m) => errs.push(`${file}: ${m}`);
  for (const k of Object.keys(d)) if (!WORK_KEYS.includes(k)) err(`unknown frontmatter key "${k}"`);
  for (const k of WORK_KEYS) if (!(k in d)) err(`missing "${k}"`);

  const entry = showcase.find((e) => e.codename === d.codename);
  if (!entry) err(`codename "${String(d.codename)}" is not in showcase.yml`);
  else {
    if (entry.placeholder) err('codename is demo data (placeholder: true), it cannot have a case study');
    if (!entry.evidence.includes('case-study')) err('add "case-study" to evidence of this codename in showcase.yml');
  }
  if (!LANGS.includes(/** @type {any} */ (d.lang))) err(`lang must be one of ${LANGS.join(', ')}`);
  const m = file.match(/^([a-z0-9-]+)(?:\.(en|ja))?\.md$/);
  if (!m) err('file name must be <codename>.md, <codename>.en.md or <codename>.ja.md');
  else {
    if (m[1] !== d.codename) err('file name must match codename');
    if ((m[2] ?? 'vi') !== d.lang) err('file suffix must match lang (.en.md, .ja.md, none for vi)');
  }
  if (typeof d.summary !== 'string' || !d.summary.trim()) err('summary must be a non-empty string');
  if (!(d.date instanceof Date) || Number.isNaN(+d.date)) err('date must be YYYY-MM-DD');
  if (d.source !== 'human' && d.source !== 'agent') err('source must be human or agent');
  if (d.source === 'agent' && (typeof d.agent_run !== 'string' || !d.agent_run)) err('agent posts need agent_run');
  if (typeof d.draft !== 'boolean') err('draft must be true or false');
  return errs;
}

/**
 * Previous/next case study in showcase order, in the reader's language when available (else VI).
 * @template {{url: string, data: {codename: string, lang: string}}} T
 * @param {T[]} studies @param {string} codename @param {string} lang @param {string[]} order codenames in showcase order
 */
export function workNav(studies, codename, lang, order) {
  /** @type {Map<string, T>} */
  const best = new Map();
  const rank = (/** @type {string} */ l) => (l === lang ? 0 : l === 'vi' ? 1 : 2);
  for (const s of studies) {
    const cur = best.get(s.data.codename);
    if (!cur || rank(s.data.lang) < rank(cur.data.lang)) best.set(s.data.codename, s);
  }
  const list = order.filter((c) => best.has(c)).map((c) => /** @type {T} */ (best.get(c)));
  const i = list.findIndex((s) => s.data.codename === codename);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

/**
 * URL of a codename's case study for a language: that language, else VI, else null.
 * @param {Array<{url: string, data: {codename: string, lang: string}}>} studies @param {string} codename @param {string} lang
 */
export function workUrl(studies, codename, lang) {
  const all = (studies ?? []).filter((s) => s.data.codename === codename);
  return (all.find((s) => s.data.lang === lang) ?? all.find((s) => s.data.lang === 'vi'))?.url ?? null;
}

/**
 * How to render a `media` entry of showcase.yml (a path under src/ without extension):
 * "diagram" when <path>.svg exists (Mermaid, npm run diagrams), "shot" when <path>-light.png exists
 * (npm run screenshot), else null (not rendered; nothing is ever substituted).
 * @param {string} path @param {(p: string) => boolean} exists
 * @returns {'diagram'|'shot'|null}
 */
export function mediaKind(path, exists) {
  if (exists(`src/${path}.svg`)) return 'diagram';
  if (exists(`src/${path}-light.png`) && exists(`src/${path}-dark.png`)) return 'shot';
  return null;
}
