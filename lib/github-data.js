// Pure transforms from raw GitHub API data to the public, whitelisted payload.
// Nothing outside the shapes below may reach templates. Private repo names never appear:
// per-repo data is keyed by codename before it leaves this module.

/**
 * @typedef {{name: string, pct: number}} LangShare
 * @typedef {{date: string, count: number}} Day
 * @typedef {{commitsByYear: Record<string, number>, languages: LangShare[], pushedAt: string|null}} CodenameStats
 * @typedef {{name: string, url: string, homepage: string|null, description: string|null, createdAt: string, topics: string[], builtWith: string|null}} Tool
 * @typedef {{repo: string, name: string, tag: string, url: string, publishedAt: string, body: string}} Release
 * @typedef {{repo: string, url: string, description: string|null, language: string|null, stars: number, starredAt: string}} Star
 * @typedef {{
 *   generatedAt: string, source: "live"|"snapshot", demo: boolean,
 *   signals: {
 *     commitsByYear: Record<string, number>, totalCommits: number, languages: LangShare[],
 *     heatmap: Day[], reposByEra: Record<string, number>, activeCodenames: number,
 *     latest: {codename: string, pushedAt: string}|null
 *   },
 *   codenames: Record<string, CodenameStats>,
 *   tools: Tool[], releases: Release[], stars: Star[]
 * }} GithubPayload
 *
 * Raw shapes (only the fields we read):
 * @typedef {{createdAt: string, pushedAt: string, languages: {edges: Array<{size: number, node: {name: string}}>}, commitsByYear: Record<string, number>}} RawRepo
 * @typedef {{name: string, url: string, homepageUrl: string|null, description: string|null, createdAt: string, isPrivate: boolean, repositoryTopics: {nodes: Array<{topic: {name: string}}>}, releases?: {nodes: RawRelease[]}}} RawToolRepo
 * @typedef {{name: string|null, tagName: string, url: string, publishedAt: string, description: string|null}} RawRelease
 * @typedef {{starredAt: string, node: {nameWithOwner: string, url: string, description: string|null, isPrivate: boolean, owner: {login: string}, primaryLanguage: {name: string}|null, stargazerCount: number}}} RawStar
 */

/** @param {Record<string, number>} bytes @returns {LangShare[]} */
export function toShares(bytes) {
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  if (!total) return [];
  return Object.entries(bytes)
    .map(([name, n]) => ({ name, pct: Math.round((n / total) * 1000) / 10 }))
    .sort((a, b) => b.pct - a.pct);
}

/** @param {RawRepo} r @returns {CodenameStats} */
export function codenameStats(r) {
  /** @type {Record<string, number>} */
  const bytes = {};
  for (const e of r.languages?.edges ?? []) bytes[e.node.name] = (bytes[e.node.name] ?? 0) + e.size;
  return { commitsByYear: { ...r.commitsByYear }, languages: toShares(bytes), pushedAt: r.pushedAt ?? null };
}

/**
 * @param {Record<string, RawRepo>} byCodename raw repo data keyed by CODENAME (never by repo name)
 * @param {Array<{codename: string, era: string, placeholder: boolean}>} showcase
 * @param {Day[]} heatmap
 */
export function buildSignals(byCodename, showcase, heatmap) {
  /** @type {Record<string, CodenameStats>} */
  const codenames = {};
  /** @type {Record<string, number>} */
  const commitsByYear = {};
  /** @type {Record<string, number>} */
  const langBytes = {};
  /** @type {{codename: string, pushedAt: string}|null} */
  let latest = null;

  for (const [codename, raw] of Object.entries(byCodename)) {
    codenames[codename] = codenameStats(raw);
    for (const [y, n] of Object.entries(raw.commitsByYear ?? {})) commitsByYear[y] = (commitsByYear[y] ?? 0) + n;
    for (const e of raw.languages?.edges ?? []) langBytes[e.node.name] = (langBytes[e.node.name] ?? 0) + e.size;
    if (raw.pushedAt && (!latest || raw.pushedAt > latest.pushedAt)) latest = { codename, pushedAt: raw.pushedAt };
  }

  /** @type {Record<string, number>} */
  const reposByEra = {};
  for (const e of showcase) if (!e.placeholder) reposByEra[e.era] = (reposByEra[e.era] ?? 0) + 1;

  return {
    codenames,
    signals: {
      commitsByYear,
      totalCommits: Object.values(commitsByYear).reduce((a, b) => a + b, 0),
      languages: toShares(langBytes),
      heatmap: heatmap.map((d) => ({ date: d.date, count: d.count })),
      reposByEra,
      activeCodenames: Object.keys(codenames).length,
      latest,
    },
  };
}

/** @param {RawToolRepo[]} repos @returns {Tool[]} */
export function toTools(repos) {
  return repos
    .filter((r) => !r.isPrivate)
    .map((r) => {
      const topics = r.repositoryTopics?.nodes.map((n) => n.topic.name) ?? [];
      const bw = topics.find((t) => t.startsWith("built-with-"));
      return {
        name: r.name, url: r.url, homepage: r.homepageUrl || null, description: r.description,
        createdAt: r.createdAt, topics, builtWith: bw ? bw.slice("built-with-".length) : null,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** @param {Array<{repo: string, isPrivate: boolean, releases: RawRelease[]}>} sources @returns {Release[]} */
export function toReleases(sources) {
  return sources
    .filter((s) => !s.isPrivate)
    .flatMap((s) => s.releases.map((r) => ({
      repo: s.repo, name: r.name || r.tagName, tag: r.tagName, url: r.url, publishedAt: r.publishedAt, body: r.description ?? "",
    })))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Stars feed for `link` posts. Drops private repos and any owner on the exclude list
 * (work-related orgs, kept in a secret), case-insensitive.
 * @param {RawStar[]} edges @param {string[]} excludeOwners @returns {Star[]}
 */
export function toStars(edges, excludeOwners) {
  const ex = new Set(excludeOwners.map((o) => o.trim().toLowerCase()).filter(Boolean));
  return edges
    .filter((e) => !e.node.isPrivate && !ex.has(e.node.owner.login.toLowerCase()))
    .map((e) => ({
      repo: e.node.nameWithOwner, url: e.node.url, description: e.node.description,
      language: e.node.primaryLanguage?.name ?? null, stars: e.node.stargazerCount, starredAt: e.starredAt,
    }));
}

const PAYLOAD_KEYS = ["generatedAt", "source", "demo", "signals", "codenames", "tools", "releases", "stars"];

/**
 * Final gate: rebuilds the payload from whitelisted keys only, so stray fields can't leak.
 * @param {GithubPayload} p @returns {GithubPayload}
 */
export function whitelist(p) {
  const out = /** @type {GithubPayload} */ (Object.fromEntries(PAYLOAD_KEYS.map((k) => [k, /** @type {any} */ (p)[k]])));
  out.codenames = Object.fromEntries(Object.entries(p.codenames ?? {}).map(([k, v]) => [k, {
    commitsByYear: v.commitsByYear, languages: v.languages, pushedAt: v.pushedAt,
  }]));
  return out;
}

/**
 * Merge several raw repos that share one codename (e.g. a fleet of bots).
 * @param {RawRepo[]} raws @returns {RawRepo}
 */
export function mergeRaw(raws) {
  /** @type {Record<string, number>} */
  const commitsByYear = {};
  /** @type {Record<string, number>} */
  const bytes = {};
  let createdAt = raws[0]?.createdAt ?? "", pushedAt = raws[0]?.pushedAt ?? "";
  for (const r of raws) {
    for (const [y, n] of Object.entries(r.commitsByYear)) commitsByYear[y] = (commitsByYear[y] ?? 0) + n;
    for (const e of r.languages?.edges ?? []) bytes[e.node.name] = (bytes[e.node.name] ?? 0) + e.size;
    if (r.createdAt < createdAt) createdAt = r.createdAt;
    if (r.pushedAt > pushedAt) pushedAt = r.pushedAt;
  }
  return { createdAt, pushedAt, commitsByYear, languages: { edges: Object.entries(bytes).map(([name, size]) => ({ size, node: { name } })) } };
}

/**
 * Normalize SHOWCASE_REPOS values: a string or a list of "owner/repo".
 * @param {unknown} v @returns {string[]}
 */
export function repoList(v) {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  return [];
}
