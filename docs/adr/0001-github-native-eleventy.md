# ADR 0001 — GitHub-native site on Eleventy

- Status: accepted
- Date: 2026-11-12

## Context

The site has to show a lead engineer's range while most of the work behind it is private. It also has to run with almost no upkeep, and agents should be able to publish to it without holding the site's secrets.

## Decision

GitHub does every job. The repo is the CMS (issues hold ideas, PRs hold drafts, a merge publishes). The GraphQL API is the data source. Actions is the CI. Pages is the host. The generator is Eleventy v3 (ESM) with Nunjucks, with no UI framework. Client JS is vanilla or Web Components, loaded only where a page needs it.

## Consequences

- No server, no database and no CMS login. Every content change is a reviewable diff.
- The repo is public, so it is part of the showcase. That makes leak prevention a build-time concern (see ADR 0002 and ADR 0003).
- Editing happens in GitHub's web or mobile editor, or locally. There's no WYSIWYG.
- Eleventy ships no TypeScript types, so the config is typed loosely (`any`).
