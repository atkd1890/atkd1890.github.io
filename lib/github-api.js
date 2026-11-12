// Thin GraphQL client. Returns RAW data; lib/github-data.js turns it into the public payload.
// Error messages never include repo names or tokens.

const ENDPOINT = "https://api.github.com/graphql";

/**
 * @param {string} token
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 * @returns {Promise<any>}
 */
export async function gql(token, query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "atkd-coding-site" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`GitHub GraphQL error: ${json.errors.map((/** @type {any} */ e) => e.type ?? "ERROR").join(", ")}`);
  return json.data;
}

/** @param {string} token @param {string} login */
export async function fetchUser(token, login) {
  const d = await gql(token, `query($login:String!){ user(login:$login){ id
    contributionsCollection{ contributionCalendar{ weeks{ contributionDays{ date contributionCount } } } } } }`, { login });
  const days = d.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((/** @type {any} */ w) => w.contributionDays)
    .map((/** @type {any} */ x) => ({ date: x.date, count: x.contributionCount }));
  return { id: /** @type {string} */ (d.user.id), heatmap: days };
}

/**
 * Raw stats for one private repo, commits counted per year for one author.
 * @param {string} token @param {string} nameWithOwner @param {string} authorId
 * @returns {Promise<import("./github-data.js").RawRepo>}
 */
export async function fetchRepo(token, nameWithOwner, authorId) {
  const [owner, name] = nameWithOwner.split("/");
  const base = await gql(token, `query($o:String!,$n:String!){ repository(owner:$o,name:$n){ createdAt pushedAt
    languages(first:20, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } } } }`, { o: owner, n: name });
  const r = base.repository;
  const first = new Date(r.createdAt).getUTCFullYear();
  const now = new Date().getUTCFullYear();
  const years = Array.from({ length: now - first + 1 }, (_, i) => first + i);
  const fields = years.map((y) => `y${y}: history(author:{id:$a}, since:"${y}-01-01T00:00:00Z", until:"${y + 1}-01-01T00:00:00Z"){ totalCount }`).join("\n");
  const h = await gql(token, `query($o:String!,$n:String!,$a:ID!){ repository(owner:$o,name:$n){ defaultBranchRef{ target{ ... on Commit { ${fields} } } } } }`, { o: owner, n: name, a: authorId });
  const target = h.repository.defaultBranchRef?.target ?? {};
  /** @type {Record<string, number>} */
  const commitsByYear = {};
  for (const y of years) { const n = target[`y${y}`]?.totalCount ?? 0; if (n) commitsByYear[String(y)] = n; }
  return { createdAt: r.createdAt, pushedAt: r.pushedAt, languages: r.languages, commitsByYear };
}

/** Public repos tagged as tools, with their releases. @param {string} token @param {string} login */
export async function fetchTools(token, login) {
  const d = await gql(token, `query($q:String!){ search(query:$q, type:REPOSITORY, first:50){ nodes{ ... on Repository {
    name url homepageUrl description createdAt isPrivate
    repositoryTopics(first:20){ nodes{ topic{ name } } }
    releases(first:10, orderBy:{field:CREATED_AT, direction:DESC}){ nodes{ name tagName url publishedAt description } } } } } }`,
    { q: `user:${login} topic:atkd-tool is:public` });
  return /** @type {import("./github-data.js").RawToolRepo[]} */ (d.search.nodes);
}

/** Releases of explicitly listed public repos. @param {string} token @param {string[]} repos */
export async function fetchReleases(token, repos) {
  const out = [];
  for (const full of repos) {
    const [o, n] = full.split("/");
    const d = await gql(token, `query($o:String!,$n:String!){ repository(owner:$o,name:$n){ isPrivate
      releases(first:10, orderBy:{field:CREATED_AT, direction:DESC}){ nodes{ name tagName url publishedAt description } } } }`, { o, n });
    out.push({ repo: full, isPrivate: d.repository.isPrivate, releases: d.repository.releases.nodes });
  }
  return out;
}

/** @param {string} token @param {string} login @param {number} [first] */
export async function fetchStars(token, login, first = 50) {
  const d = await gql(token, `query($login:String!,$first:Int!){ user(login:$login){ starredRepositories(first:$first, orderBy:{field:STARRED_AT, direction:DESC}){
    edges{ starredAt node{ nameWithOwner url description isPrivate owner{ login } primaryLanguage{ name } stargazerCount } } } } }`, { login, first });
  return /** @type {import("./github-data.js").RawStar[]} */ (d.user.starredRepositories.edges);
}
