// /uses. "site" and "workflow" list what this repo really uses (package.json, mise.toml, workflows).
// "editor" and "hardware" wait for the owner: replace each TODO with {name, note} (ROADMAP, README).
export default [
  {
    id: 'site',
    items: [
      {
        name: 'Eleventy',
        url: 'https://www.11ty.dev/',
        note: {
          vi: 'Sinh site tĩnh, template Nunjucks.',
          en: 'Static site generator, Nunjucks templates.',
          ja: '静的サイトジェネレーター、Nunjucks テンプレート。',
        },
      },
      {
        name: 'CSS + Web Components',
        note: {
          vi: 'Không framework UI; CSS chỉ dùng token.',
          en: 'No UI framework; CSS uses tokens only.',
          ja: 'UI フレームワークなし。CSS はトークンのみ。',
        },
      },
      {
        name: 'Pagefind',
        url: 'https://pagefind.app/',
        note: {
          vi: 'Tìm kiếm toàn văn, index lúc build.',
          en: 'Full-text search, indexed at build time.',
          ja: '全文検索、ビルド時にインデックス。',
        },
      },
      {
        name: 'Mermaid',
        url: 'https://mermaid.js.org/',
        note: {
          vi: 'Sơ đồ, render sẵn thành SVG.',
          en: 'Diagrams, pre-rendered to SVG.',
          ja: '図、事前に SVG へ描画。',
        },
      },
      {
        name: 'Playwright + axe',
        url: 'https://playwright.dev/',
        note: {
          vi: 'E2E, accessibility, ảnh chụp và ảnh OG.',
          en: 'E2E, accessibility, screenshots and OG images.',
          ja: 'E2E、アクセシビリティ、スクリーンショット、OG 画像。',
        },
      },
      {
        name: 'GitHub Actions + Pages',
        note: {
          vi: 'CI, cron hằng ngày, hosting.',
          en: 'CI, daily cron, hosting.',
          ja: 'CI、毎日の cron、ホスティング。',
        },
      },
    ],
  },
  {
    id: 'workflow',
    items: [
      {
        name: 'Claude Code',
        url: 'https://claude.com/claude-code',
        note: {
          vi: 'Agent đề xuất và triển khai, người quyết định và review.',
          en: 'The agent proposes and implements; a human decides and reviews.',
          ja: 'エージェントが提案と実装、人が判断とレビュー。',
        },
      },
      {
        name: 'mise',
        url: 'https://mise.jdx.dev/',
        note: {
          vi: 'Ghim phiên bản Node cho mọi repo.',
          en: 'Pins the Node version across repos.',
          ja: 'リポジトリ間で Node のバージョンを固定。',
        },
      },
      {
        name: 'GitHub CLI',
        url: 'https://cli.github.com/',
        note: {
          vi: 'PR, secret, workflow từ terminal.',
          en: 'PRs, secrets and workflows from the terminal.',
          ja: 'PR、シークレット、ワークフローをターミナルから。',
        },
      },
      {
        name: 'Prettier + TypeScript checkJs',
        note: {
          vi: 'Format và kiểm tra kiểu cho JS thuần.',
          en: 'Formatting and type checks for plain JS.',
          ja: '素の JS の整形と型チェック。',
        },
      },
    ],
  },
  { id: 'editor', items: ['TODO'] },
  { id: 'hardware', items: ['TODO'] },
];
