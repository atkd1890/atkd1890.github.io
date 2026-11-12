// Directory data for posts: layout, language context and URLs.
// VI posts live at /blog/<slug>/, EN at /en/blog/<slug>/, JA at /ja/blog/<slug>/.
const PREFIX = /** @type {Record<string, string>} */ ({ vi: '', en: '/en', ja: '/ja' });

export default {
  layout: 'layouts/post.njk',
  eleventyComputed: {
    L: (/** @type {any} */ data) =>
      data.i18n?.langs.find((/** @type {any} */ l) => l.code === data.lang) ?? data.i18n?.langs[0],
    postSlug: (/** @type {any} */ data) => data.slug,
    permalink: (/** @type {any} */ data) =>
      data.slug ? `${PREFIX[data.lang] ?? ''}/blog/${data.slug}/` : data.permalink,
  },
};
