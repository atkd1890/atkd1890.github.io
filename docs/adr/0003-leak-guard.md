# ADR 0003 — Leak guard as a required build step

- Status: accepted
- Date: 2026-11-12

## Context

The site is built from private sources and drafted partly by agents. A single slip (a real name, an employer, a private repo name, GPS in a photo) would undo the persona. Human review alone doesn't scale to daily agent posts.

## Decision

`scripts/leak-guard.js` runs on the built `_site/` and on the Markdown files a PR changes. It fails on:

- **private repo names**, matched as whole tokens, from `SHOWCASE_REPOS` plus every private repo the all-repositories token can list (ADR 0004);
- **denylist entries**, matched case- and diacritic-insensitively, from the `LEAK_DENYLIST` secret (names, employers, clients, emails, phones, addresses, local paths);
- **EXIF** in JPEG, PNG and WebP images;
- **a built-in canary**. A self-test plants it on every CI run to prove the guard still fires.

The output names the file, the line and the rule index, never the matched value, because CI logs are public. Deploys on `main` also fail when no denylist is configured.

## Consequences

- A false positive blocks a deploy. The fix is to reword the content, never to weaken the rule.
- Generic repo names match only as exact tokens, so ordinary prose that shares their words passes.
- The guard can't catch what isn't listed. The denylist has to be kept current.
