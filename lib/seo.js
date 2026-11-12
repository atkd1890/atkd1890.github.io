// SEO and share helpers: OG image paths, JSON-LD, sitemap, CSP hashes. Pure functions, tested.
import { createHash } from 'node:crypto';

/** Persona, never a real name (ADR 0005). */
const PERSONA = 'ATKD Coding';

/**
 * OG image path for a page URL: "/" → "/og/index.png", "/en/blog/x/" → "/og/en/blog/x.png".
 * @param {string} url
 */
export function ogPath(url) {
  const trimmed = String(url ?? '/')
    .replace(/\.html$/, '')
    .replace(/^\/+|\/+$/g, '');
  return `/og/${trimmed || 'index'}.png`;
}

/** Inverse of ogPath, for the OG renderer: "/og/en/blog/x.png" → "en/blog/x". @param {string} path */
export const ogName = (path) => path.replace(/^\/og\//, '').replace(/\.png$/, '');

/**
 * Person node for the persona.
 * @param {{url: string, hub: string, github: string}} site
 */
const person = (site) => ({ '@type': 'Person', name: PERSONA, url: site.url, sameAs: [site.hub, site.github] });

/**
 * JSON-LD for a page. Home: WebSite + Person. Post: BlogPosting. Case study: Article. Tool list: ItemList of SoftwareApplication.
 * @param {{kind: 'home'|'post'|'article'|'tools', url: string, title?: string, description?: string, lang?: string,
 *   date?: Date|string, image?: string, tools?: Array<{name: string, url: string, homepage: string|null, description: string|null}>}} page
 * @param {{url: string, hub: string, github: string}} site
 */
export function jsonLd(page, site) {
  const url = site.url + page.url;
  if (page.kind === 'home')
    return {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: PERSONA, url, inLanguage: page.lang, description: page.description },
        person(site),
      ],
    };
  if (page.kind === 'post' || page.kind === 'article')
    return {
      '@context': 'https://schema.org',
      '@type': page.kind === 'post' ? 'BlogPosting' : 'Article',
      headline: page.title,
      description: page.description,
      inLanguage: page.lang,
      datePublished: page.date ? new Date(page.date).toISOString().slice(0, 10) : undefined,
      url,
      mainEntityOfPage: url,
      image: page.image,
      author: person(site),
      publisher: person(site),
    };
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url,
    itemListElement: (page.tools ?? []).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: t.name,
        url: t.homepage || t.url,
        description: t.description ?? undefined,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        author: person(site),
      },
    })),
  };
}

/** JSON for an inline <script type="application/ld+json">: "<" escaped so content cannot close the tag. @param {unknown} data */
export const inlineJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/** CSP source for an inline script: 'sha256-…'. @param {string} code */
export const cspHash = (code) => `'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`;

/** @param {string} s */
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Which built pages belong in the sitemap: HTML pages, minus 404 and pages marked noindex.
 * @param {string} rel path relative to the output dir, e.g. "en/blog/x/index.html"
 * @param {string} html
 */
export function sitemapUrl(rel, html) {
  if (!rel.endsWith('.html') || rel === '404.html') return null;
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) return null;
  return `/${rel.replace(/(^|\/)index\.html$/, '$1')}`;
}

/** @param {string} base site URL without trailing slash @param {string[]} urls */
export function sitemapXml(base, urls) {
  const body = [...new Set(urls)]
    .sort()
    .map((u) => `  <url><loc>${xmlEscape(base + u)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
