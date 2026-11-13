<!-- Blog posts: branch post/<slug>, label blog-draft, link the blog-idea issue (Closes #N). -->

## What

## Checklist (CLAUDE.md → Definition of done)

- [ ] `npm run check` passes (format, lint, types, unit tests, leak guard self-test)
- [ ] `npm run test:e2e`, `npm run budget`, `npm run validate:html`, `npm run links`, `npm run lighthouse` pass
- [ ] UI changed: `npm run test:visual` passes, or baselines updated on purpose
- [ ] `npm run build:live && npm run leak-guard:local` is clean
- [ ] Every number has a source (link to a commit, run, file, or "measured on …")
- [ ] Images are stripped of EXIF; screenshots come from `npm run screenshot`
- [ ] No private repo names, employers, clients or personal contact details
- [ ] Posts and case studies follow docs/content.md; `source: agent` has `agent_run`
- [ ] New UI text in `src/_data/i18n.js` for vi, en and ja
- [ ] New owner-maintained items are in README → "Tùy chỉnh và bảo trì"; ROADMAP, CHANGELOG, ADR updated
