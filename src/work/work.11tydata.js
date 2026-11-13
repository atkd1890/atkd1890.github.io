// Directory data for case studies: layout, language context and URLs.
// VI at /work/<codename>/, EN at /en/work/<codename>/, JA at /ja/work/<codename>/.
const PREFIX = /** @type {Record<string, string>} */ ({ vi: '', en: '/en', ja: '/ja' });

export default {
  layout: 'layouts/work.njk',
  eleventyComputed: {
    L: (/** @type {any} */ data) =>
      data.i18n?.langs.find((/** @type {any} */ l) => l.code === data.lang) ?? data.i18n?.langs[0],
    // `slug` lets the language switcher and hreflang find the other versions (versionsOf).
    slug: (/** @type {any} */ data) => data.codename,
    workSlug: (/** @type {any} */ data) => data.codename,
    title: (/** @type {any} */ data) => data.codename,
    permalink: (/** @type {any} */ data) =>
      data.codename ? `${PREFIX[data.lang] ?? ''}/work/${data.codename}/` : data.permalink,
  },
};
