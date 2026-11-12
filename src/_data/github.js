// Eleventy global data `github`. Default export ONLY: Eleventy v3 exposes the whole module
// when a data file has named exports. Logic lives in lib/github-load.js.
import { AssetCache } from "@11ty/eleventy-fetch";
import { load } from "../../lib/github-load.js";

/** @returns {Promise<import("../../lib/github-data.js").GithubPayload>} */
export default async function () {
  const cache = new AssetCache("atkd-github-data");
  if (cache.isCacheValid("1h")) return cache.getCachedValue();
  const data = await load();
  if (data.source === "live") await cache.save(data, "json");
  return data;
}
