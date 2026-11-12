// Command palette entries, built at build time per language and embedded as JSON.

/**
 * @typedef {{groups: Record<string, string>, items: Record<string, string>}} PaletteStrings
 * @param {Array<{codename: string, featured: boolean, placeholder: boolean, order: number}>} showcase
 * @param {{hub: string, github: string, repo: string, email: string}} site
 * @param {PaletteStrings} t UI strings of the page's language
 * @param {string} [prefix] language URL prefix: '' (vi), '/en', '/ja'
 * @returns {import('../src/assets/js/core.js').Item[]}
 */
export function paletteItems(showcase, site, t, prefix = '') {
  const home = `${prefix}/`;
  /** @type {Array<[string, string, string, string]>} id, anchor, hint, keywords (English, so typing English always works) */
  const sections = [
    ['home', '', 'g h', 'home top start'],
    ['trajectory', '#trajectory', '', 'trajectory eras timeline history'],
    ['work', '#work', 'g w', 'work projects codenames'],
    ['signals', '#signals', 'g s', 'signals stats heatmap languages contributions'],
    ['stream', '#stream', 'g b', 'stream blog posts til links'],
    ['tools', '#tools', '', 'tools playground demos'],
    ['lab', '#lab', '', 'lab benchmark ai experiments'],
  ];
  const go = sections.map(([id, anchor, hint, keywords]) => ({
    id: `go-${id}`,
    group: t.groups.go,
    label: t.items[id],
    href: `${home}${anchor}`,
    hint,
    keywords,
  }));

  const work = showcase
    .filter((e) => e.featured && !e.placeholder)
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      id: `work-${e.codename}`,
      group: t.groups.work,
      label: e.codename,
      href: `${home}#work-${e.codename}`,
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
