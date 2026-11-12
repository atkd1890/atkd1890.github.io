---
title: 'Building a GitHub-native portfolio when most of my work is private'
slug: github-native-portfolio
date: 2026-11-12
type: deep-dive
tags: [github, eleventy, privacy, ci, design]
series: null
lang: en
summary: 'Most of what I build lives in private repos and under NDA. This is how I built a portfolio on GitHub that still shows all four eras of my work without leaking anything that must stay private.'
url: null
codenames: []
source: agent
agent_run: claude-code/2026-11-12
draft: false
interactive: [leak-guard-demo]
---

My work has gone through four eras: mobile, indie games, systems, and now AI. Yet if you open my GitHub account, you will find almost nothing. Most of the work sits in private repos, company repos, or under contracts that keep it private.

The usual portfolio is a list of public repos with a few lines each. That doesn't work for me. So the question from day one was: **how do you show what you can do when most of the evidence can't be shown?**

This site, [atkd1890.github.io](https://atkd1890.github.io), is the answer. This post explains how it is designed.

## TL;DR

- **GitHub plays every role**: the repo is the CMS, the API is the data source, Actions is the CI, Pages is the host. No server, no database.
- **Private by design**: the site shows only what is declared; private projects appear under codenames; real repo names live in a secret; every build passes a "leak guard" before it goes live.
- **Evidence in tiers**, from aggregate numbers up to real code, instead of a list of repos.
- **Built like a team**: 3 workflows, 6 architecture decision records (ADRs), 57 unit tests, 64 end-to-end runs, and accessibility and performance-budget checks that gate every merge.
- The home page ships about **3.7 KB of JavaScript**, in 3 languages, light and dark, with a ⌘K command palette.

{% shot "/blog/2026/github-native-portfolio/home-en", "The atkd1890.github.io home page on desktop", 1280, 800 %}

## Four principles

Before writing any code, I settled on four principles. Every later decision traces back to them.

1. **Show only what is declared.** The site never lists repos on its own. A project appears only when it is added to a single declaration file, `showcase.yml`.
2. **Private projects get codenames.** Real repo names never appear on the site, in this public repo, or in CI logs.
3. **Private repos contribute numbers only.** Not a single line of code leaves a private repo.
4. **Real code is new code.** The code people can read is work that was public from the start: extracted libraries, small tools, and the repo of this site.

## Evidence in tiers

Instead of a list of repos, each project is presented at an "evidence tier", from weakest to strongest:

| Tier                   | Form                                                              | Reveals             |
| ---------------------- | ----------------------------------------------------------------- | ------------------- |
| Signals                | Languages, contributions per year, a heatmap                      | Numbers only        |
| Project cards          | Codename, era, domain, role, stack, years                         | Approved metadata   |
| Case study, postmortem | Context, constraints, architecture, decisions, results in numbers | Thinking, not code  |
| Excerpts               | Short code rewritten to show a pattern                            | Skill, not IP       |
| Demos                  | Videos, playable builds                                           | Product, not source |
| Open source, tools     | Extracted libraries, single-file HTML tools                       | Real code           |

A freelance project for a client might stop at the card tier: domain, scale, role. A design system shared across all my repos can go as far as a case study. Each tier reveals a little more, and I choose the tier per project.

## GitHub plays every role

The whole site runs on things GitHub already provides. There is nothing to operate.

{% diagram "blog/2026/github-native-portfolio/architecture.en", "Architecture: issues and PRs are the CMS, Actions checks and builds, the API supplies numbers, Pages serves the site" %}

- **The CMS is the repo.** A post idea is an issue. A draft is a pull request. Merging publishes. Every content change is a reviewable diff.
- **The data source is the GitHub API.** Once a day, Actions reads the numbers over GraphQL and rebuilds the site, so the home page stays current without anyone pressing a button.
- **The CI is Actions.** Every pull request has to pass every gate: formatting, types, unit tests, end-to-end tests, accessibility, the performance budget, a secret scan, and the leak guard.
- **The host is Pages**, deployed from Actions rather than a `gh-pages` branch.

The generator is [Eleventy](https://www.11ty.dev/) with Nunjucks and plain CSS. There is no UI framework; JavaScript exists only where something is interactive, and loads only on the pages that use it.

## Private by design

This is the most important part of the system. Data from private repos passes through several layers before it reaches any HTML:

{% diagram "blog/2026/github-native-portfolio/privacy.en", "How private data flows: metadata only, keyed by codename, through a whitelist and the leak guard before deploy" %}

### Codenames, with real names in a secret

The project declaration file lives in a public repo. If it held real repo names, it would itself be the leak. So the `repo` field accepts only two values:

```yaml
- codename: signal-desk
  repo: '@secret' # or null. Never a real name.
  era: ai
  domain: Signal bot for personal finance
  evidence: [card, case-study]
```

The table that maps codenames to real repos lives in a GitHub secret. The schema validator rejects anything else, so a real name typed by mistake fails the build immediately.

### A metadata-only token

To read numbers from private repos, the site needs a token. That token has only **Metadata: read-only**: it sees repo names, languages, creation and last-push dates, but **cannot read a single line of code**. Contributions per year come from the public contribution calendar, which already counts private work as plain numbers.

The trade-off is that the site can't count commits per project. I accept it: if the token ever leaked, the loss would be a list of names, not source code.

### A whitelist before any template

All API data goes through a `whitelist()` function that rebuilds the payload from allowed fields only, and every number is keyed by codename before a template sees it. An unexpected field in an API response cannot travel any further.

### The leak guard

The last layer runs on the output itself: the whole built HTML, the Markdown files a pull request changes, and even commit author metadata. It blocks:

- **private repo names**, matched as whole tokens, so an ordinary word in prose is never blocked by mistake;
- **a denylist** (employers, clients, personal contact details), matched case-insensitively and **diacritic-insensitively**, so "Nguyễn" and "nguyen" count as the same;
- **EXIF** in images, because a photo can carry GPS coordinates;
- **commit author emails** that are not GitHub noreply addresses.

The denylist lives in a secret, and when the guard blocks something it prints only the file, the line and the rule number, **never the matched value**, because anyone can read the CI logs of a public repo. On every CI run it also plants a "canary" string in a throwaway build to prove it still catches it.

You can try it right here, with a fake denylist:

<leak-guard-demo deny="Acme Holdings|Nguyễn Văn A|090-1234-5678" repos="secret-billing-api" value="A project for Acme Holdings, contact Nguyen Van A." label="Type a sentence to test" ok="Clean: this would deploy." blocked="Blocked:" deny-name="denylist entry" repo-name="private repo name" rules="Fake rules">This widget needs JavaScript.</leak-guard-demo>

Try dropping the accents, changing the case, or putting `secret-billing-api` in the middle of a sentence: the result stays the same.

## Numbers without leaking anything

The "Signals" section of the home page shows only numbers: contributions over the last 12 months, active days, the language split across showcased projects, and a 52-week heatmap. Every chart has a text description for screen readers.

When there is no token (for example, a pull request from a fork), the build uses a snapshot of aggregate numbers only, and the page says "demo data". The site never crashes for lack of data.

## Craft

An engineer's portfolio should be built with the care of a product. A few details:

- **A "Terminal" design**, kept in sync at the token level with the Coding persona of the [atkd1890.me](https://atkd1890.me) hub: colors, the JetBrains Mono font, square corners, and every content block opening with a command line.
- **A ⌘K command palette** to go anywhere, plus `g h`, `g b` and `?` shortcuts. There are game-style sounds too, off by default.
- **Three languages**: Vietnamese by default, English at `/en/`, Japanese at `/ja/`. The language switch goes to the same page in the other language, even with JavaScript turned off.
- **Accessibility, checked automatically**: axe runs on every page in light and dark, and a test reads the color tokens to make sure every text/background pair meets WCAG AA contrast.
- **Light**: about 3.7 KB of JavaScript and under 6 KB of CSS on the home page after compression, with one self-hosted webfont. CI enforces this budget.

{% shot "/blog/2026/github-native-portfolio/home-mobile-en", "The home page on a phone, 390px wide", 390, 844 %}

## Built like a team, by one person

This site exists to show that one person can cover every role, not just writing code. So every task on the roadmap is tagged with a role (design, engineering, DevOps, QA, security, marketing, PM), and each role has its own definition of done.

In practice, `main` is protected: every change goes through a pull request and merges only when all checks are green. Every decision with lasting impact is written down as an ADR: why GitHub-native, why repo names live in a secret, why the leak guard is mandatory, why the token reads metadata only, the privacy level, and the three languages. The repo is public, so all of it is here for anyone to read.

## Working with AI

Most of the code and docs of this site were built together with Claude Code, with a clear split of roles: the agent proposes and implements, a human decides and reviews. Decisions about privacy, about what gets shown, and about tone always stay with the human.

The boundary is written down as a rule: the site never calls an AI model and holds no agent secrets. The future blog-writing agent will live in a separate private repo and will only be allowed to open pull requests, passing through exactly the same gates as every other change. Any post drafted by an agent, like this one, carries an "AI-assisted" badge at the top.

## What's next

- **The first case study**, following the frame of context, constraints, architecture, decisions, results and lessons.
- **A blog agent** for TILs, links and weekly build logs, each post a pull request waiting for review.
- **A benchmark series**: every new AI model builds the same small game prototype from one fixed spec and is scored against the same rubric.

All the source code, decisions and configuration are at [github.com/atkd1890/atkd1890.github.io](https://github.com/atkd1890/atkd1890.github.io). To follow along, the feed is at [/feed.xml](/feed.xml).
