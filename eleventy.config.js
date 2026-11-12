// Eleventy v3 config (ESM). See CLAUDE.md for conventions.
import { readFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';
import markdownItAnchor from 'markdown-it-anchor';
import { rssPlugin } from '@11ty/eleventy-plugin-rss';
import { heatmap, topLanguages, eraSummary, selectedWork } from './lib/home.js';
import { paletteItems } from './lib/palette.js';
import { where } from './lib/filters.js';
import { tr, fmt } from './lib/i18n.js';
import { fold } from './lib/leak-guard.js';
import { ogPath, jsonLd, inlineJson, cspHash } from './lib/seo.js';
import {
  validatePost,
  duplicateVersions,
  blogPages,
  pickVersions,
  versionsOf,
  seriesNav,
  readingTime,
  toc,
  isoDay,
  LONG_TYPES,
  releaseEntries,
  releaseUrl,
} from './lib/blog.js';

/** Heading ids: VI/EN become ASCII ("Bài toán chính" → "bai-toan-chinh"), Japanese letters are kept ("要点"). @param {string} s */
export const slugify = (s) =>
  fold(String(s))
    .normalize('NFC') // re-compose Japanese kana after fold's NFD
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/** The post's own frontmatter (not the merged data cascade). @param {string} file */
const readFrontmatter = (file) => {
  const m = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = /** @type {Record<string, unknown>} */ (m ? (parseYaml(m[1]) ?? {}) : {});
  // js-yaml 4 keeps YYYY-MM-DD as a string; Eleventy reads it as a UTC date. Match Eleventy.
  if (typeof fm.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fm.date)) fm.date = new Date(`${fm.date}T00:00:00Z`);
  return fm;
};

const LOCALE = /** @type {Record<string, string>} */ ({ vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' });

/** @param {any} eleventyConfig Eleventy UserConfig (no published types) */
export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/.nojekyll': '.nojekyll' });
  // Interactive components for posts: loaded only on pages that list them in `interactive`.
  eleventyConfig.addPassthroughCopy({ 'src/_includes/interactive/*.js': 'assets/interactive' });
  // Post images live next to the post: src/blog/YYYY/<slug>/...
  eleventyConfig.addPassthroughCopy('src/blog/**/*.{png,jpg,jpeg,webp,gif}');
  // Self-hosted JetBrains Mono (OFL-1.1), latin + vietnamese subsets only. See docs/design.md.
  for (const sub of ['latin', 'vietnamese']) {
    for (const w of [400, 700]) {
      const f = `jetbrains-mono-${sub}-${w}-normal.woff2`;
      eleventyConfig.addPassthroughCopy({
        [`node_modules/@fontsource/jetbrains-mono/files/${f}`]: `assets/fonts/${f}`,
      });
    }
  }

  eleventyConfig.amendLibrary('md', (/** @type {any} */ md) => {
    md.use(markdownItAnchor, { slugify, tabIndex: false, level: [2, 3] });
    // Code blocks can scroll sideways, so keyboard users must be able to focus them (axe: scrollable-region-focusable).
    const fence = md.renderer.rules.fence;
    md.renderer.rules.fence = (/** @type {any[]} */ ...args) => fence(...args).replace('<pre', '<pre tabindex="0"');
  });

  // Drafts are built only when DRAFTS=1 (local preview, PR preview artifact).
  eleventyConfig.addPreprocessor('drafts', '*', (/** @type {any} */ data) => {
    if (data.draft && process.env.DRAFTS !== '1') return false;
  });

  eleventyConfig.addCollection('posts', (/** @type {any} */ api) => {
    const posts = api.getFilteredByGlob('src/blog/*/*.md');
    const codenames = (posts[0]?.data.showcase ?? []).map((/** @type {any} */ e) => e.codename);
    const problems = [
      ...posts.flatMap((/** @type {any} */ p) =>
        validatePost(readFrontmatter(p.inputPath), p.inputPath.replace(/^\.\/src\/blog\//, ''), codenames),
      ),
      ...duplicateVersions(posts),
    ];
    if (problems.length) throw new Error(`Blog frontmatter is invalid:\n  - ${problems.join('\n  - ')}`);
    return posts.sort((/** @type {any} */ a, /** @type {any} */ b) => b.date - a.date);
  });

  // Posts plus GitHub releases of public tools, newest first: blog index, feeds and the home stream.
  const stream = (/** @type {any} */ api) =>
    [...api.getFilteredByGlob('src/blog/*/*.md'), ...releaseEntries(api.getAll()[0]?.data.github?.releases ?? [])].sort(
      (a, b) => b.date - a.date,
    );
  eleventyConfig.addCollection('stream', stream);

  eleventyConfig.addCollection('blogPages', (/** @type {any} */ api) => {
    // Languages come from global data, so /blog/ exists in every language even before the first post.
    const langs = api.getAll()[0]?.data.i18n.langs ?? [{ code: 'vi', prefix: '' }];
    return blogPages(stream(api), langs);
  });

  eleventyConfig.addFilter('isoDate', (/** @type {string|number|Date} */ d) => new Date(d).toISOString());
  eleventyConfig.addFilter('isoDay', isoDay);
  eleventyConfig.addFilter('postDate', (/** @type {Date} */ d, /** @type {string} */ lang) =>
    new Intl.DateTimeFormat(LOCALE[lang] ?? 'vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(d),
  );
  eleventyConfig.addFilter('releaseUrl', releaseUrl);
  eleventyConfig.addFilter('ogPath', ogPath);
  eleventyConfig.addFilter('jsonLd', (/** @type {any} */ page, /** @type {any} */ site) =>
    inlineJson(jsonLd(page, site)),
  );
  eleventyConfig.addFilter('cspHash', cspHash);
  // security.txt Expires: 180 days after the build (RFC 9116 asks for less than a year).
  eleventyConfig.addFilter('securityExpires', (/** @type {Date} */ d) =>
    new Date(new Date(d).getTime() + 180 * 864e5).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  );
  eleventyConfig.addFilter('heatmap', heatmap);
  eleventyConfig.addFilter('topLanguages', topLanguages);
  eleventyConfig.addFilter('eraSummary', eraSummary);
  eleventyConfig.addFilter('selectedWork', selectedWork);
  eleventyConfig.addFilter('paletteItems', paletteItems);
  eleventyConfig.addFilter('tr', tr);
  eleventyConfig.addFilter('fmt', fmt);
  eleventyConfig.addFilter('year', (/** @type {string|number|Date} */ d) => new Date(d).getUTCFullYear());
  eleventyConfig.addFilter('pickVersions', pickVersions);
  eleventyConfig.addFilter('versionsOf', versionsOf);
  eleventyConfig.addFilter('seriesNav', seriesNav);
  eleventyConfig.addFilter('readingTime', readingTime);
  eleventyConfig.addFilter('toc', toc);
  eleventyConfig.addFilter('isLong', (/** @type {string} */ type) => LONG_TYPES.has(type));
  eleventyConfig.addFilter('selectByUrl', (/** @type {any[]} */ list, /** @type {string} */ url) =>
    (list ?? []).find((p) => p.url === url),
  );
  // Nunjucks' selectattr only tests truthiness; `where` filters by equality. Keys may be paths: 'data.type'.
  eleventyConfig.addFilter('where', where);
  eleventyConfig.addFilter('limit', (/** @type {unknown[]} */ list, /** @type {number} */ n) =>
    (list ?? []).slice(0, n),
  );

  // {% diagram "blog/2026/<slug>/architecture", "Mô tả" %} inlines a pre-rendered Mermaid SVG
  // (scripts/render-diagrams.js) whose colors are CSS variables, so it follows the theme toggle.
  eleventyConfig.addShortcode('diagram', (/** @type {string} */ path, /** @type {string} */ alt) => {
    const svg = readFileSync(`src/${path}.svg`, 'utf8').replace(
      /<svg\b/,
      `<svg role="img" aria-label="${alt.replace(/"/g, '&quot;')}"`,
    );
    return `<figure class="diagram" tabindex="0">${svg}<figcaption>${alt}</figcaption></figure>`;
  });
  // {% shot "/blog/2026/<slug>/home", "Alt", 1280, 900 %}: real screenshots, light + dark, swapped by theme.
  eleventyConfig.addShortcode(
    'shot',
    (/** @type {string} */ src, /** @type {string} */ alt, /** @type {number} */ w, /** @type {number} */ h) =>
      `<figure class="shot"><img class="only-light" src="${src}-light.png" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async"><img class="only-dark" src="${src}-dark.png" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async"><figcaption>${alt}</figcaption></figure>`,
  );

  return {
    dir: { input: 'src', includes: '_includes', data: '_data', output: '_site' },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
