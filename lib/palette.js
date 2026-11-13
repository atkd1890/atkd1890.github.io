// Command palette entries, built at build time per language and embedded as JSON.
import { workUrl } from './work.js';

/**
 * @typedef {{groups: Record<string, string>, items: Record<string, string>}} PaletteStrings
 * @param {Array<{codename: string, featured: boolean, placeholder: boolean, order: number}>} showcase
 * @param {{hub: string, github: string, repo: string, email: string}} site
 * @param {PaletteStrings} t UI strings of the page's language
 * @param {string} [prefix] language URL prefix: '' (vi), '/en', '/ja'
 * @param {Array<{url: string, data: {codename: string, lang: string}}>} [studies] case studies; a codename with one opens it
 * @returns {import('../src/assets/js/core.js').Item[]}
 */
export function paletteItems(showcase, site, t, prefix = '', studies = []) {
  const home = `${prefix}/`;
  /** @type {Array<[string, string, string, string]>} id, anchor, hint, keywords (English, so typing English always works) */
  const sections = [
    ['home', '', 'g h', 'home top start'],
    ['trajectory', '#trajectory', '', 'trajectory eras timeline history'],
    ['work', '#work', 'g w', 'work projects codenames'],
    ['signals', '#signals', 'g s', 'signals stats heatmap languages contributions'],
    ['stream', '#stream', '', 'stream latest posts'],
  ];
  const go = sections.map(([id, anchor, hint, keywords]) => ({
    id: `go-${id}`,
    group: t.groups.go,
    label: t.items[id],
    href: `${home}${anchor}`,
    hint,
    keywords,
  }));

  /** @type {Array<[string, string, string]>} pages: id, hint, keywords */
  const pages = [
    ['blog', 'g b', 'blog posts til links archive'],
    ['tools', '', 'tools playground demos libraries'],
    ['lab', '', 'lab benchmark ai experiments os agents'],
    ['uses', '', 'uses setup stack editor hardware'],
    ['colophon', '', 'colophon how built stack pipeline adr license'],
  ];
  for (const [id, hint, keywords] of pages)
    go.push({ id: `go-${id}`, group: t.groups.go, label: t.items[id], href: `${home}${id}/`, hint, keywords });

  const work = showcase
    .filter((e) => e.featured && !e.placeholder)
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      id: `work-${e.codename}`,
      group: t.groups.work,
      label: e.codename,
      href: workUrl(studies, e.codename, prefix.slice(1) || 'vi') ?? `${home}#work-${e.codename}`,
    }));

  const actions = [
    {
      id: 'act-theme',
      group: t.groups.action,
      label: t.items.theme,
      action: 'theme',
      keywords: 'theme dark light mode',
    },
    { id: 'act-sound', group: t.groups.action, label: t.items.sound, action: 'sound', keywords: 'sound audio mute' },
    {
      id: 'act-help',
      group: t.groups.action,
      label: t.items.help,
      action: 'help',
      hint: '?',
      keywords: 'keys help shortcuts',
    },
  ];

  const links = [
    { id: 'out-hub', group: t.groups.link, label: 'atkd1890.me', href: site.hub, keywords: 'hub personas' },
    { id: 'out-github', group: t.groups.link, label: 'GitHub', href: site.github },
    {
      id: 'out-source',
      group: t.groups.link,
      label: t.items.source,
      href: `https://github.com/${site.repo}`,
      keywords: 'source repo code',
    },
    {
      id: 'out-mail',
      group: t.groups.link,
      label: site.email,
      href: `mailto:${site.email}`,
      keywords: 'email contact',
    },
  ];

  return [...go, ...work, ...actions, ...links];
}
