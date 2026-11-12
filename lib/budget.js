// Performance budget per page, in gzipped bytes. ROADMAP Phase 3: JS ≤ 30 KB, CSS ≤ 20 KB.
export const BUDGET = { js: 30 * 1024, css: 20 * 1024, html: 40 * 1024 };

/**
 * Local assets a page loads: module/classic scripts (with their static imports) and stylesheets.
 * @param {string} html
 */
export function pageAssets(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="(\/[^"]+\.js)"/g)].map((m) => m[1]);
  const styles = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)].map((m) => m[1]);
  return { scripts, styles };
}

/** Static `import ... from './x.js'` specifiers of a module. @param {string} js */
export function staticImports(js) {
  return [...js.matchAll(/^\s*import\s[^'"]*['"](\.[^'"]+)['"]/gm)].map((m) => m[1]);
}

/** Fonts must not block rendering. @param {string} css */
export function blockingFonts(css) {
  return [...css.matchAll(/@font-face\s*{([^}]*)}/g)].filter(
    (m) => !/font-display:\s*(swap|optional|fallback)/.test(m[1]),
  ).length;
}
