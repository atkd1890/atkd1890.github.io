# ADR 0002 — Private repo names live in secrets, not in showcase.yml

- Status: accepted
- Date: 2026-11-12

## Context

The first schema for `showcase.yml` had a `repo: owner/private-repo` field, there only so stats could be fetched. This repo is public, though, so committing that field would publish every private repo name. That breaks the rule that private names never leave private.

## Decision

- In `showcase.yml`, `repo` may only be `null` or `"@secret"`. The validator rejects anything else, so a real name fails the build.
- The codename → repo mapping lives in the `SHOWCASE_REPOS` secret as JSON. Locally it comes from a file outside the repo (`SHOWCASE_REPOS_FILE`).
- `lib/github-data.js` keys every per-repo result by codename, and a final `whitelist()` rebuilds the payload from allowed keys only.
- The committed fallback (`src/_data/snapshot/github.json`) holds aggregates only.

## Consequences

- Adding a project takes two steps: an entry in `showcase.yml` and a key in the secret.
- The leak guard gets its list of repo names from the same secret, so the mapping also drives detection.
- Fork PRs don't see the secret. They build from the snapshot and get the reduced leak check.
