// Loads GitHub data for templates. Live when tokens are present, otherwise the committed snapshot.
// Never crashes the build: any failure falls back to the snapshot and logs a warning.
//
// Env (see README → "Secrets"):
//   SHOWCASE_TOKEN   fine-grained PAT, all repos, Metadata: read-only ONLY (no code access) → languages, dates (ADR 0004)
//   GITHUB_TOKEN     any token (Actions provides one) → public data: heatmap, contributions/year, tools, releases, stars
//   SHOWCASE_REPOS   JSON {codename: "owner/repo" | ["owner/a", "owner/b"]}; or SHOWCASE_REPOS_FILE pointing to such a JSON file
//   STARS_EXCLUDE_OWNERS  comma list of owners to drop from the stars feed
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import showcaseData from '../src/_data/showcase.js';
import { fetchUser, fetchRepo, fetchTools, fetchReleases, fetchStars } from './github-api.js';
import { buildSignals, toTools, toReleases, toStars, whitelist, mergeRaw, repoList } from './github-data.js';

const LOGIN = process.env.GH_LOGIN || 'atkd1890';
const snapshotFile = fileURLToPath(new URL('../src/_data/snapshot/github.json', import.meta.url));

/** @returns {import("./github-data.js").GithubPayload} */
function snapshot() {
  return JSON.parse(readFileSync(snapshotFile, 'utf8'));
}

/** @returns {Record<string, unknown>} */
export function repoMap() {
  const raw =
    process.env.SHOWCASE_REPOS ||
    (process.env.SHOWCASE_REPOS_FILE ? readFileSync(process.env.SHOWCASE_REPOS_FILE, 'utf8') : '');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.warn('[github] SHOWCASE_REPOS is not valid JSON, ignoring');
    return {};
  }
}

/** Problems of the current load, for scripts/check-data.js. Messages hold codenames and error types only. */
/** @type {string[]} */
let problems = [];
/** @param {string} msg */
const warn = (msg) => {
  problems.push(msg);
  console.warn(`[github] ${msg}`);
};

/**
 * Writes .cache/github-status.json: where the data came from and what failed. Never repo names.
 * @param {object} status
 */
function writeStatus(status) {
  try {
    mkdirSync('.cache', { recursive: true });
    writeFileSync('.cache/github-status.json', JSON.stringify({ ...status, problems }));
  } catch {
    // Read-only checkout: the check script will report a missing status.
  }
}

/** @returns {Promise<import("./github-data.js").GithubPayload>} */
export async function load() {
  problems = [];
  const publicToken = process.env.GITHUB_TOKEN || process.env.SHOWCASE_TOKEN;
  const privateToken = process.env.SHOWCASE_TOKEN;
  const base = snapshot();
  if (!publicToken) {
    warn('no token, using snapshot');
    writeStatus({ source: 'snapshot', privateToken: false, expected: 0, fetched: 0 });
    return base;
  }

  const showcase = showcaseData();
  const map = repoMap();
  const out = { ...base, source: /** @type {"live"} */ ('live'), demo: false, generatedAt: new Date().toISOString() };

  try {
    const user = await fetchUser(publicToken, LOGIN);
    /** @type {Record<string, import("./github-data.js").RawRepo>} */
    const byCodename = {};
    if (privateToken) {
      for (const e of showcase) {
        if (e.repo !== '@secret') continue;
        const repos = repoList(map[e.codename]);
        if (!repos.length) {
          warn(`no mapping for codename ${e.codename}`);
          continue;
        }
        try {
          byCodename[e.codename] = mergeRaw(await Promise.all(repos.map((r) => fetchRepo(privateToken, r))));
        } catch (err) {
          warn(`stats for ${e.codename} failed: ${/** @type {Error} */ (err).message}`);
        }
      }
    } else warn('no SHOWCASE_TOKEN, private stats skipped');
    Object.assign(out, buildSignals(byCodename, showcase, user));
  } catch (err) {
    warn(`signals failed, keeping snapshot: ${/** @type {Error} */ (err).message}`);
    Object.assign(out, { signals: base.signals, codenames: base.codenames, demo: base.demo });
  }

  try {
    const tools = await fetchTools(publicToken, LOGIN);
    out.tools = toTools(tools);
    const extra = showcase.map((e) => e.public_repo).filter((r) => typeof r === 'string');
    const relSources = [
      ...tools.map((t) => ({ repo: `${LOGIN}/${t.name}`, isPrivate: t.isPrivate, releases: t.releases?.nodes ?? [] })),
      ...(await fetchReleases(publicToken, /** @type {string[]} */ (extra))),
    ];
    out.releases = toReleases(relSources);
  } catch (err) {
    warn(`tools/releases failed: ${/** @type {Error} */ (err).message}`);
  }

  try {
    const exclude = (process.env.STARS_EXCLUDE_OWNERS || '').split(',');
    out.stars = toStars(await fetchStars(publicToken, LOGIN), exclude);
  } catch (err) {
    warn(`stars failed: ${/** @type {Error} */ (err).message}`);
  }

  writeStatus({
    source: out.source,
    privateToken: Boolean(privateToken),
    expected: showcase.filter((e) => e.repo === '@secret').length,
    fetched: Object.keys(out.codenames ?? {}).length,
  });
  return whitelist(out);
}
