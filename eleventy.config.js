// Eleventy v3 config (ESM). See CLAUDE.md for conventions.
/** @param {any} eleventyConfig Eleventy UserConfig (no published types) */
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/.nojekyll': '.nojekyll' });
  // Self-hosted JetBrains Mono (OFL-1.1), latin + vietnamese subsets only. See docs/design/DESIGN.md.
  for (const sub of ['latin', 'vietnamese']) {
    for (const w of [400, 700]) {
      const f = `jetbrains-mono-${sub}-${w}-normal.woff2`;
      eleventyConfig.addPassthroughCopy({
        [`node_modules/@fontsource/jetbrains-mono/files/${f}`]: `assets/fonts/${f}`,
      });
    }
  }

  eleventyConfig.addFilter('isoDate', (/** @type {string|number|Date} */ d) => new Date(d).toISOString());
  eleventyConfig.addFilter('year', (/** @type {string|number|Date} */ d) => new Date(d).getUTCFullYear());

  return {
    dir: { input: 'src', includes: '_includes', data: '_data', output: '_site' },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
