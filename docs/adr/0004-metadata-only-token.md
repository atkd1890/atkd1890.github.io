# ADR 0004 — SHOWCASE_TOKEN: all repositories, Metadata read-only

- Status: accepted
- Date: 2026-11-12
- Supersedes: the scoped "Contents + Metadata on selected repos" token first described in the README

## Context

The first plan gave the token Contents read on a hand-picked list of repos, so it could count commits per repo per year. That had two costs. Every new showcase repo meant editing the token. And the leak guard only learned the names of the listed repos, so any other private repo had to be added to the denylist by hand. The owner wanted no upkeep.

## Options

| Option | Upkeep | Can read code | Leak guard knows all private names | Per-codename commit counts |
|---|---|---|---|---|
| Selected repos, Contents + Metadata | edit token per showcase repo | yes, listed repos | no | yes |
| All repos, Contents + Metadata | none | **yes, every repo** | yes | yes |
| **All repos, Metadata only** | none | **no** | yes | no |

## Decision

All repositories, **Metadata: read-only** only. Yearly totals come from the public contribution calendar instead. The owner turned on "Include private contributions", so private work shows up there as anonymous counts. Any token can read those counts, including Actions' `GITHUB_TOKEN`.

## Consequences

- No token edits when repos are added. The leak guard lists every private repo name automatically.
- A leaked token exposes repo names, languages and dates, never code.
- Per-codename numbers are limited to languages, created and last-pushed dates. Signals report contributions per year, not commits, and the copy must say "contributions".
- Contributions only count when the commit email is linked to the account. Old work under unlinked emails doesn't appear.
