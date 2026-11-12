// Minimal types for @11ty/eleventy-plugin-rss (the parts this repo uses).
declare module '@11ty/eleventy-plugin-rss' {
  export const rssPlugin: (eleventyConfig: unknown, options?: Record<string, unknown>) => void;
}
