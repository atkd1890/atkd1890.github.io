// Public site metadata. Only persona-safe values belong here (see CLAUDE.md).
export default {
  title: 'ATKD Coding',
  // Placeholder until the owner picks one in docs/positioning.md.
  tagline: {
    vi: 'Lead engineer. Mobile → game indie → hệ thống → AI.',
    en: 'Lead engineer. Mobile → indie games → systems → AI.',
    ja: 'リードエンジニア。モバイル → インディーゲーム → システム → AI。',
  },
  url: 'https://atkd1890.github.io',
  lang: 'vi',
  repo: 'atkd1890/atkd1890.github.io',
  branch: 'main',
  email: 'hi@atkd1890.me',
  hub: 'https://atkd1890.me',
  github: 'https://github.com/atkd1890',
  buildTime: new Date(),
  // Set only by the Snapshot workflow (tag snapshot-YYYY): the build is frozen under /YYYY/.
  snapshot: process.env.SNAPSHOT_YEAR || null,
};
