// Blog logic: frontmatter contract, language versions, index pages. Pure functions, unit-tested.
import { LANGS } from './i18n.js';

export const TYPES = /** @type {const} */ ([
  'til',
  'link',
  'log',
  'release',
  'note',
  'deep-dive',
  'case-study',
  'cross',
]);
/** Types rendered as full articles (ToC, reading time); the rest are compact. */
export const LONG_TYPES = new Set(['deep-dive', 'case-study', 'cross']);
export const INTERACTIVE = /** @type {const} */ (['leak-guard-demo']);

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEYS = [
  'title',
  'slug',
  'date',
  'type',
  'tags',
  'series',
  'lang',
  'summary',
  'url',
  'codenames',
  'source',
  'agent_run',
  'draft',
  'interactive',
];

/**
 * @typedef {{
 *   title: string, slug: string, date: Date, type: typeof TYPES[number], tags: string[], series: string|null,
 *   lang: 'vi'|'en'|'ja', summary: string, url: string|null, codenames: string[], source: 'human'|'agent',
 *   agent_run: string|null, draft: boolean, interactive?: string[]
 * }} PostData
 */

/** @param {unknown} d @returns {string} YYYY-MM-DD */
export const isoDay = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10));

/**
 * Validates one post's frontmatter against the content contract (README → "Hợp đồng nội dung").
 * `file` is the path relative to src/blog, e.g. "2026/2026-11-12-hello.md" or "2026/2026-11-12-hello.en.md".
 * @param {Record<string, unknown>} d @param {string} file @param {string[]} codenames known showcase codenames
 * @returns {string[]} problems
 */
export function validatePost(d, file, codenames) {
  /** @type {string[]} */
  const errs = [];
  const err = (/** @type {string} */ m) => errs.push(`${file}: ${m}`);
  for (const k of Object.keys(d)) if (!KEYS.includes(k)) err(`unknown frontmatter key "${k}"`);
  for (const k of KEYS) if (k !== 'interactive' && !(k in d)) err(`missing "${k}"`);

  if (typeof d.title !== 'string' || !d.title.trim()) err('title must be a non-empty string');
  if (typeof d.summary !== 'string' || !d.summary.trim()) err('summary must be a non-empty string');
  if (typeof d.slug !== 'string' || !KEBAB.test(d.slug)) err('slug must be kebab-case');
  if (!(d.date instanceof Date) || Number.isNaN(d.date.getTime())) err('date must be a YYYY-MM-DD date');
  if (!TYPES.includes(/** @type {any} */ (d.type))) err(`type must be one of ${TYPES.join(', ')}`);
  if (!LANGS.includes(/** @type {any} */ (d.lang))) err(`lang must be one of ${LANGS.join(', ')}`);
  if (!Array.isArray(d.tags) || !d.tags.every((t) => typeof t === 'string' && KEBAB.test(t)))
    err('tags must be a list of kebab-case strings');
  if (!(d.series === null || (typeof d.series === 'string' && KEBAB.test(d.series))))
    err('series must be null or kebab-case');
  if (d.type === 'link' && !(typeof d.url === 'string' && /^https:\/\//.test(d.url)))
    err('type link needs an https url');
  if (d.type !== 'link' && d.url !== null) err('url is only for type link (use null)');
  if (!Array.isArray(d.codenames) || !d.codenames.every((c) => codenames.includes(/** @type {string} */ (c))))
    err('codenames must be a list of codenames from showcase.yml');
  if (!['human', 'agent'].includes(/** @type {string} */ (d.source))) err('source must be human or agent');
  if (d.source === 'agent' && !(typeof d.agent_run === 'string' && d.agent_run.trim()))
    err('agent posts need agent_run');
  if (d.source === 'human' && d.agent_run !== null) err('agent_run must be null for human posts');
  if (typeof d.draft !== 'boolean') err('draft must be boolean');
  if (
    'interactive' in d &&
    !(Array.isArray(d.interactive) && d.interactive.every((c) => INTERACTIVE.includes(/** @type {any} */ (c))))
  )
    err(`interactive must list known components: ${INTERACTIVE.join(', ')}`);

  // File name: <year>/<YYYY-MM-DD>-<slug>[.<lang>].md, VI files have no language suffix.
  const m = file.match(/^(\d{4})\/(\d{4}-\d{2}-\d{2})-([a-z0-9-]+?)(?:\.(en|ja))?\.md$/);
  if (!m) err('file must be <year>/<YYYY-MM-DD>-<slug>[.en|.ja].md');
  else {
    const [, year, day, slug, langSuffix] = m;
    if (d.date instanceof Date && isoDay(d.date) !== day) err(`date ${isoDay(d.date)} does not match file name ${day}`);
    if (year !== day.slice(0, 4)) err('folder year does not match the date');
    if (slug !== d.slug) err(`slug "${d.slug}" does not match file name "${slug}"`);
    if ((langSuffix ?? 'vi') !== d.lang) err(`lang "${d.lang}" does not match the file name suffix`);
  }
  return errs;
}

/**
 * @template {{data: {slug: string, lang: string}}} T
 * @param {T[]} posts @returns {string[]} problems: duplicate (slug, lang) pairs
 */
export function duplicateVersions(posts) {
  const seen = new Set();
  return posts.flatMap((p) => {
    const key = `${p.data.slug}/${p.data.lang}`;
    if (seen.has(key)) return [`duplicate post ${key}`];
    seen.add(key);
    return [];
  });
}

/**
 * One entry per slug, in the reader's language when available, else VI, else any. Newest first.
 * @template {{data: {slug: string, lang: string, date: Date}}} T
 * @param {T[]} posts @param {string} lang @returns {T[]}
 */
export function pickVersions(posts, lang) {
  /** @type {Map<string, T>} */
  const best = new Map();
  const rank = (/** @type {string} */ l) => (l === lang ? 0 : l === 'vi' ? 1 : 2);
  for (const p of posts) {
    const cur = best.get(p.data.slug);
    if (!cur || rank(p.data.lang) < rank(cur.data.lang)) best.set(p.data.slug, p);
  }
  return [...best.values()].sort((a, b) => +b.data.date - +a.data.date || a.data.slug.localeCompare(b.data.slug));
}

/**
 * Language versions of one slug: {lang: url}.
 * @param {Array<{url: string, data: {slug: string, lang: string}}>} posts @param {string} slug
 * @returns {Record<string, string>}
 */
export function versionsOf(posts, slug) {
  return Object.fromEntries(posts.filter((p) => p.data.slug === slug).map((p) => [p.data.lang, p.url]));
}

/**
 * Static index pages for every language: all posts, by type, by tag, by series, by year.
 * @template {{data: {slug: string, lang: string, date: Date, type: string, tags: string[], series: string|null}}} T
 * @param {T[]} posts @param {Array<{code: string, prefix: string}>} langs
 * @returns {Array<{lang: string, prefix: string, kind: 'all'|'type'|'tag'|'series'|'year', value: string, url: string, path: string, posts: T[]}>}
 */
export function blogPages(posts, langs) {
  /** @type {Array<{lang: string, prefix: string, kind: 'all'|'type'|'tag'|'series'|'year', value: string, url: string, path: string, posts: T[]}>} */
  const out = [];
  for (const l of langs) {
    const list = pickVersions(posts, l.code);
    /** @param {'all'|'type'|'tag'|'series'|'year'} kind @param {string} value @param {string} path @param {T[]} items */
    const add = (kind, value, path, items) =>
      out.push({ lang: l.code, prefix: l.prefix, kind, value, path, url: `${l.prefix}${path}`, posts: items });
    add('all', '', '/blog/', list);
    for (const type of TYPES) {
      const items = list.filter((p) => p.data.type === type);
      if (items.length) add('type', type, `/blog/type/${type}/`, items);
    }
    for (const tag of [...new Set(list.flatMap((p) => p.data.tags))].sort())
      add(
        'tag',
        tag,
        `/blog/tag/${tag}/`,
        list.filter((p) => p.data.tags.includes(tag)),
      );
    for (const series of [...new Set(list.map((p) => p.data.series).filter((s) => s !== null))].sort())
      add(
        'series',
        /** @type {string} */ (series),
        `/blog/series/${series}/`,
        [...list.filter((p) => p.data.series === series)].reverse(),
      );
    for (const year of [...new Set(list.map((p) => String(p.data.date.getUTCFullYear())))].sort().reverse())
      add(
        'year',
        year,
        `/blog/${year}/`,
        list.filter((p) => String(p.data.date.getUTCFullYear()) === year),
      );
  }
  return out;
}

/** Previous/next post in the same series and language version set. @template {{url: string, data: {slug: string, lang: string, date: Date, series: string|null}}} T @param {T[]} posts @param {T} post */
export function seriesNav(posts, post) {
  if (!post.data.series) return { prev: null, next: null };
  const list = pickVersions(
    posts.filter((p) => p.data.series === post.data.series),
    post.data.lang,
  ).reverse();
  const i = list.findIndex((p) => p.data.slug === post.data.slug);
  return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null };
}

/** Minutes to read: ~220 words/min for Latin scripts, ~500 chars/min for Japanese. @param {string} html @param {string} lang */
export function readingTime(html, lang) {
  const text = String(html ?? '')
    .replace(/<(pre|svg|style|script)\b[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const n = lang === 'ja' ? text.replace(/\s/g, '').length / 500 : text.split(/\s+/).filter(Boolean).length / 220;
  return Math.max(1, Math.round(n));
}

/** h2 headings with ids, for a table of contents. @param {string} html @returns {Array<{id: string, text: string}>} */
export function toc(html) {
  return [...String(html ?? '').matchAll(/<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  }));
}

/** URL-safe slug: "atkd1890/tool" → "atkd1890-tool", "v1.2.0" → "v1-2-0". @param {string} s */
export const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Page URL of a GitHub release. @param {{repo: string, tag: string}} rel */
export const releaseUrl = (rel) => `/blog/release/${slug(rel.repo)}-${slug(rel.tag)}/`;

/**
 * GitHub releases (public tool repos) as list entries shaped like posts, so the blog index, feeds
 * and home stream can mix them in. Release notes are usually English, so they are tagged `en`.
 * @param {Array<{repo: string, name: string, tag: string, url: string, publishedAt: string, body: string}>} releases
 */
export function releaseEntries(releases) {
  return (releases ?? []).map((r) => {
    const date = new Date(r.publishedAt);
    const firstLine = (r.body ?? '').split(/\r?\n/).find((l) => l.trim()) ?? '';
    return {
      url: releaseUrl(r),
      date,
      content: '',
      data: {
        slug: `release-${slug(r.repo)}-${slug(r.tag)}`,
        lang: 'en',
        date,
        type: 'release',
        tags: /** @type {string[]} */ ([]),
        series: /** @type {string|null} */ (null),
        title: `${r.repo} ${r.name || r.tag}`,
        summary: firstLine.replace(/^#+\s*/, '').slice(0, 200),
        source: 'human',
      },
    };
  });
}
