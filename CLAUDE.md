# CLAUDE.md

Instructions for AI agents working in this repo. The overview is in [README.md](README.md) and the phases are in [ROADMAP.md](ROADMAP.md). Read both before starting a phase.

## What this repo is

The public home of the **ATKD Coding** persona, built on Eleventy and deployed to GitHub Pages through Actions. The hub site atkd1890.me lives in a **different repo** and only links here via `/coding`. **Never touch that repo.**

## Hard rules (persona and privacy)

ATKD Coding is an anonymous persona. These rules override convenience, every time.

1. **No identity leaks.** Never write the owner's real name, any past or current employer, client names, the personal Gmail address, phone, home address, or local machine paths into any file that gets committed or rendered. Contact is `hi@atkd1890.me` only.
2. **Private repo names never reach output or the repo.** Not in HTML, feeds, JSON, OG images, commit messages, PR bodies, docs or `showcase.yml`. Use codenames. The codename → repo mapping lives only in the `SHOWCASE_REPOS` secret (ADR 0002).
3. **Opt-in only.** Render only what `showcase.yml` declares. Never auto-list private repos.
4. **Private repos contribute numbers, not code.** Never commit data, code or text copied from a private repo.
5. **Client and employer work is abstract.** Domain, scale and role. No names, no identifiable details.
6. **THN boundary.** THN is a separate org outside this account. Its Vietnam–Japan niche tools and projects stay out unless the owner approves each one. Repos owned by `atkd1890` are not THN.
7. **Codenames are readable kebab-case** (e.g. `signal-desk`) and must never equal or closely resemble a private repo name. The leak guard should match private repo names as whole tokens, because some are generic words.
8. **Demo data is labelled.** Placeholder showcase entries carry `placeholder: true` and render a visible "demo data" label.
9. **Never fabricate.** No invented links, numbers, quotes or project details. If a value is unknown, write `TODO` (or labelled demo data, see rule 8) and list it at the end of the phase report.
10. **The site never calls an LLM** and holds no agent secrets. Blog-writing agents live in a separate repo (`atkd-stack`). This repo only defines the content contract and the CI gate.

## Git rules

- **Don't push or force-push** until the owner approves the Phase 0 history plan. After that, push only when asked.
- **Commit identity:** the repo-local identity is `ATKD Coding <2776097+atkd1890@users.noreply.github.com>`. Check `git config user.email` before committing. Never commit with the personal Gmail address.
- Keep commits small, one phase or sub-step each. Messages must not include private repo names.
- The new default branch is `main`, an orphan branch. The old `master` history is archived locally as a bundle and is never pushed again.

## Architecture conventions

- Eleventy v3, ESM (`eleventy.config.js`), Nunjucks templates.
- Layout: `src/_data`, `src/_includes`, `src/work`, `src/blog`, `src/lab`, `src/tools`, `src/assets`.
- Plain CSS. Design tokens on `:root`, dark mode via `prefers-color-scheme` plus a manual toggle (`data-theme`). **[docs/design/DESIGN.md](docs/design/DESIGN.md) is the design source of truth.** It stays in sync at core level with the atkd1890.me hub design (persona "Coding — Terminal"). Use tokens only; no ad-hoc colors, fonts or radii.
- Client JS: vanilla or Web Components, loaded only on pages that need it. Interactive explainer components live in `src/_includes/interactive/`.
- Mermaid renders to SVG at build time. No client-side Mermaid.
- Pagefind indexes at build time.
- `src/_data/github.js`:
  - GraphQL via `@11ty/eleventy-fetch` with a cache;
  - reads `SHOWCASE_TOKEN` (fine-grained PAT, read-only, scoped to the showcase repos);
  - **exports whitelisted fields only**, and maps private repo activity to codenames before export;
  - with no token, falls back to a committed snapshot of **aggregates only**. Never crash.
- `showcase.yml` allows `repo: null` for projects that aren't on GitHub and for demo data.
- Tools catalog = public repos with topic `atkd-tool`. Adding a tool needs no site change.
- Every page links "edit on GitHub" to its source file.

## Content contract

The frontmatter schema and the PR flow are in README → "Content contract". Validation runs at build time and invalid frontmatter must fail the build. `source: agent` posts show an "AI-assisted" badge.

### showcase.yml schema

```yaml
- codename: TODO
  repo: "@secret"           # or null. NEVER a real name: the mapping lives in the SHOWCASE_REPOS secret (ADR 0002)
  public_repo: null
  era: mobile | indie-game | system | ai
  domain: TODO
  role: TODO
  stack: []
  years: "2019–2021"
  status: shipped | live | archived | wip
  summary: "TODO"
  metrics: []               # [{label, value}], only numbers the owner approved
  evidence: [card]          # card | case-study | demo | open-source
  media: []
  demo_url: null
  featured: false
  placeholder: false        # true = demo data, rendered with a "demo data" label; requires repo: null
  order: 0
```

## Leak guard

The leak guard is required in CI, for the build and for PRs:

- Scan `_site/` and the changed `.md` files for private repo names (from the API at build time) and the denylist (from a secret).
- Check EXIF on all images.
- Filter the stars → `link` feed: no private repos, no work-related orgs (list in a secret).
- Never write the denylist or private repo names to disk inside the repo, not even in logs that become artifacts.

## Owner-maintained items

Anything the owner must fill in or keep updated later (a secret, private config, `TODO` copy, an expiring token, a setting in some UI) MUST be added in the same change to README → "Tùy chỉnh và bảo trì": where it lives, when to update it, how. If it holds private data, also add a fake-data template under `config/examples/`. Real private files live next to the repo in `../.config/atkd-coding/` (the parent folder is not a git repo) and are pushed with `npm run secrets:push`. Never commit them.

## Definition of done (every role)

The site has to prove one person can do every role. A task is done only when it holds up from each angle that applies. Roadmap tasks are tagged `[design]`, `[eng]`, `[ops]`, `[qa]`, `[sec]`, `[mkt]` or `[pm]`.

- **Design:** uses tokens only (no hard-coded colors or sizes), works in light and dark, at 375px and 1280px, and meets WCAG AA contrast.
- **Engineering:** type-checks, stays inside the performance budget, and loads no JS on pages that don't need it.
- **DevOps:** CI is green, actions are pinned, and no new secret is added without a scope note in README.
- **Testing:** new logic has a unit test, UI behavior has an e2e test, and axe reports no serious or critical issue.
- **Security:** the leak guard passes, and no private name or identity detail appears in output, commits or PR text.
- **Marketing:** every public page has a title, summary and OG image, and copy follows the style guide (numbers before adjectives).
- **Lead/PM:** a decision with lasting impact gets an ADR in `docs/adr/`, and the change is noted in the changelog.

## Voice and craft

- Show off, with numbers. Prefer numbers and diagrams over adjectives.
- Mobile-first, checked at 375px. Lighthouse ≥ 95.
- ⌘K / Ctrl+K command palette (navigation, Pagefind search, theme). Shortcuts: `g h`, `g b`, `/`, `?`.
- Sound toggle, **off by default**. Respect `prefers-reduced-motion`.
- Micro-interactions must never slow the page or block reading.

## License

Content is CC BY 4.0. Code is MIT. State this in README, the footer and `/colophon`.
