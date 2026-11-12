import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// mise.toml (local) and .nvmrc (CI, setup-node) must pin the same Node version.
test("mise.toml and .nvmrc pin the same Node version", () => {
  const mise = readFileSync(new URL("../mise.toml", import.meta.url), "utf8").match(/^node\s*=\s*"([^"]+)"/m)?.[1];
  const nvmrc = readFileSync(new URL("../.nvmrc", import.meta.url), "utf8").trim();
  assert.ok(mise, "mise.toml has no node version");
  assert.equal(mise, nvmrc);
});
