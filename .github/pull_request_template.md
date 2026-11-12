<!-- Blog posts: branch post/<slug>, label blog-draft, link the blog-idea issue (Closes #N). -->

## What

## Checklist

- [ ] `npm run check` passes (format, types, unit tests, leak guard self-test)
- [ ] `npm run build:live && npm run leak-guard:local` is clean
- [ ] Every number has a source (link to a commit, run, file, or "measured on …")
- [ ] Images are stripped of EXIF; screenshots come from `npm run screenshot`
- [ ] No private repo names, employers, clients or personal contact details
- [ ] Posts: frontmatter follows the content contract; `source: agent` posts have `agent_run`
- [ ] New owner-maintained items are in README → "Tùy chỉnh và bảo trì"
