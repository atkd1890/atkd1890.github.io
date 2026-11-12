// Command palette entries, built at build time and embedded as JSON.

/**
 * @param {Array<{codename: string, featured: boolean, placeholder: boolean, order: number}>} showcase
 * @param {{hub: string, github: string, repo: string, email: string}} site
 * @returns {import('../src/assets/js/core.js').Item[]}
 */
export function paletteItems(showcase, site) {
  const go = [
    ['home', 'Home', '/', 'g h', 'top start'],
    ['trajectory', 'Trajectory', '/#trajectory', '', 'eras timeline history'],
    ['work', 'Selected work', '/#work', 'g w', 'projects codenames'],
    ['signals', 'Signals', '/#signals', 'g s', 'stats heatmap languages contributions'],
    ['stream', 'Stream', '/#stream', 'g b', 'blog posts til links'],
    ['tools', 'Tools & playground', '/#tools', '', 'demos'],
    ['lab', 'Lab', '/#lab', '', 'benchmark ai experiments'],
  ].map(([id, label, href, hint, keywords]) => ({ id: `go-${id}`, group: 'Go', label, href, hint, keywords }));

  const work = showcase
    .filter((e) => e.featured && !e.placeholder)
    .sort((a, b) => a.order - b.order)
    .map((e) => ({ id: `work-${e.codename}`, group: 'Work', label: e.codename, href: `/#work-${e.codename}` }));

  const actions = [
    { id: 'act-theme', group: 'Action', label: 'Toggle theme', action: 'theme', keywords: 'dark light mode' },
    { id: 'act-sound', group: 'Action', label: 'Toggle sound', action: 'sound', keywords: 'audio mute' },
    { id: 'act-help', group: 'Action', label: 'Keyboard shortcuts', action: 'help', hint: '?', keywords: 'keys help' },
  ];

  const elsewhere = [
    { id: 'out-hub', group: 'Link', label: 'atkd1890.me', href: site.hub, keywords: 'hub personas' },
    { id: 'out-github', group: 'Link', label: 'GitHub', href: site.github },
    {
      id: 'out-source',
      group: 'Link',
      label: 'Source of this site',
      href: `https://github.com/${site.repo}`,
      keywords: 'repo code',
    },
    { id: 'out-mail', group: 'Link', label: site.email, href: `mailto:${site.email}`, keywords: 'email contact' },
  ];

  return [...go, ...work, ...actions, ...elsewhere];
}
