// Yearly snapshots (/YYYY/): a build of the site moved under a path prefix. Pages use root-absolute URLs
// ("/assets/…", "/blog/…"), so the snapshot rewrites them once, after the build. Pure functions, tested.

/** "snapshot-2026" → "2026"; anything else → null. @param {string} tag */
export const snapshotYear = (tag) => String(tag).match(/^snapshot-(\d{4})$/)?.[1] ?? null;

/**
 * Rewrites one built file so it works under `/<year>/`.
 * HTML: href/src/action/content/data-home attributes, the palette JSON, and absolute site URLs.
 * CSS: url(/…). XML (feeds): absolute site URLs. Other files are returned unchanged.
 * @param {string} text @param {string} ext ".html" | ".css" | ".xml" | … @param {string} year @param {string} siteUrl
 */
export function rebase(text, ext, year, siteUrl) {
  const prefix = `/${year}`;
  const abs = (/** @type {string} */ s) => s.replaceAll(`${siteUrl}/`, `${siteUrl}${prefix}/`);
  if (ext === '.html')
    return abs(
      text
        .replace(/(\s(?:href|src|action|content|data-home)=")\/(?!\/)/g, `$1${prefix}/`)
        .replace(/("href":")\/(?!\/)/g, `$1${prefix}/`),
    );
  if (ext === '.css') return text.replace(/url\(\/(?!\/)/g, `url(${prefix}/`);
  if (ext === '.webmanifest') return text.replace(/(":\s*")\/(?!\/)/g, `$1${prefix}/`);
  if (ext === '.xml' || ext === '.txt') return abs(text);
  return text;
}

/** Files a snapshot leaves out: crawler and security files and the 404 belong to the live site root only. @param {string} rel */
export const skipInSnapshot = (rel) => /^(sitemap\.xml|robots\.txt|404\.html|\.well-known\/)/.test(rel);
