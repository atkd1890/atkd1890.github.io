import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSignals, toShares, toStars, toTools, toReleases, whitelist } from "../lib/github-data.js";

const raw = (pushedAt, years, langs) => ({
  createdAt: "2026-01-01T00:00:00Z", pushedAt, commitsByYear: years,
  languages: { edges: Object.entries(langs).map(([name, size]) => ({ size, node: { name } })) },
});

test("toShares turns bytes into rounded percentages, largest first", () => {
  assert.deepEqual(toShares({ TS: 300, CSS: 100 }), [{ name: "TS", pct: 75 }, { name: "CSS", pct: 25 }]);
  assert.deepEqual(toShares({}), []);
});

test("buildSignals aggregates by codename and never sees repo names", () => {
  const { signals, codenames } = buildSignals(
    { "atkd-os": raw("2026-10-01T00:00:00Z", { 2026: 30 }, { TS: 900 }), "signal-desk": raw("2026-11-01T00:00:00Z", { 2026: 10, 2025: 2 }, { Python: 100 }) },
    [{ codename: "atkd-os", era: "ai", placeholder: false }, { codename: "demo", era: "mobile", placeholder: true }],
    [{ date: "2026-11-01", count: 3 }],
  );
  assert.deepEqual(signals.commitsByYear, { 2026: 40, 2025: 2 });
  assert.equal(signals.totalCommits, 42);
  assert.deepEqual(signals.latest, { codename: "signal-desk", pushedAt: "2026-11-01T00:00:00Z" });
  assert.deepEqual(signals.reposByEra, { ai: 1 }, "placeholders are not counted");
  assert.deepEqual(Object.keys(codenames), ["atkd-os", "signal-desk"]);
});

const star = (login, name, isPrivate) => ({ starredAt: "2026-11-01T00:00:00Z", node: { nameWithOwner: `${login}/${name}`, url: `https://github.com/${login}/${name}`, description: null, isPrivate, owner: { login }, primaryLanguage: null, stargazerCount: 1 } });

test("toStars drops private repos and excluded owners (case-insensitive)", () => {
  const out = toStars([star("me", "secret", true), star("WorkOrg", "x", false), star("oss", "lib", false)], ["workorg", " "]);
  assert.deepEqual(out.map((s) => s.repo), ["oss/lib"]);
});

test("toTools drops private repos and reads built-with-* topic", () => {
  const out = toTools([
    { name: "tool-a", url: "u", homepageUrl: "", description: null, createdAt: "2026-01-01", isPrivate: false, repositoryTopics: { nodes: [{ topic: { name: "atkd-tool" } }, { topic: { name: "built-with-claude" } }] } },
    { name: "tool-b", url: "u", homepageUrl: null, description: null, createdAt: "2026-02-01", isPrivate: true, repositoryTopics: { nodes: [] } },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].builtWith, "claude");
  assert.equal(out[0].homepage, null);
});

test("toReleases skips private sources and sorts newest first", () => {
  const rel = (tag, at) => ({ name: null, tagName: tag, url: "u", publishedAt: at, description: null });
  const out = toReleases([{ repo: "a/x", isPrivate: false, releases: [rel("v1", "2026-01-01"), rel("v2", "2026-03-01")] }, { repo: "a/p", isPrivate: true, releases: [rel("v9", "2026-05-01")] }]);
  assert.deepEqual(out.map((r) => r.tag), ["v2", "v1"]);
  assert.equal(out[0].name, "v2");
});

test("whitelist strips unknown keys at every level", () => {
  const p = /** @type {any} */ ({ generatedAt: "t", source: "live", demo: false, signals: {}, tools: [], releases: [], stars: [],
    codenames: { a: { commitsByYear: {}, languages: [], pushedAt: null, repo: "someone/private" } }, token: "x", repoMap: { a: "someone/private" } });
  const out = whitelist(p);
  assert.equal("token" in out, false);
  assert.equal("repoMap" in out, false);
  assert.equal(JSON.stringify(out).includes("someone/private"), false);
});

import { mergeRaw, repoList } from "../lib/github-data.js";

test("mergeRaw sums commits and bytes, keeps earliest createdAt and latest pushedAt", () => {
  const a = { createdAt: "2026-02-01", pushedAt: "2026-05-01", commitsByYear: { 2026: 3 }, languages: { edges: [{ size: 10, node: { name: "Py" } }] } };
  const b = { createdAt: "2026-01-01", pushedAt: "2026-04-01", commitsByYear: { 2026: 2, 2025: 1 }, languages: { edges: [{ size: 5, node: { name: "Py" } }] } };
  const m = mergeRaw([a, b]);
  assert.deepEqual(m.commitsByYear, { 2026: 5, 2025: 1 });
  assert.equal(m.createdAt, "2026-01-01");
  assert.equal(m.pushedAt, "2026-05-01");
  assert.deepEqual(m.languages.edges, [{ size: 15, node: { name: "Py" } }]);
});

test("repoList accepts a string or a list", () => {
  assert.deepEqual(repoList("a/b"), ["a/b"]);
  assert.deepEqual(repoList(["a/b", 3, "c/d"]), ["a/b", "c/d"]);
  assert.deepEqual(repoList(undefined), []);
});
