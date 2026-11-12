import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { validateShowcase } from "../lib/showcase-schema.js";

const good = () => ({
  codename: "demo-x", repo: null, public_repo: null, era: "ai", domain: "d", role: "r", stack: ["TS"],
  years: "2026", status: "wip", summary: "s", metrics: [], evidence: ["card"], media: [], demo_url: null,
  featured: false, placeholder: true, order: 1,
});

test("the committed showcase.yml is valid", () => {
  const data = load(readFileSync(new URL("../src/_data/showcase.yml", import.meta.url), "utf8"));
  assert.ok(validateShowcase(data).length > 0);
});

test("sorts by order", () => {
  const a = { ...good(), codename: "a", order: 2 };
  const b = { ...good(), codename: "b", order: 1 };
  assert.deepEqual(validateShowcase([a, b]).map((e) => e.codename), ["b", "a"]);
});

test("rejects a real repo name in `repo` (public repo must not hold private names)", () => {
  assert.throws(() => validateShowcase([{ ...good(), placeholder: false, repo: "someone/private-thing" }]), /repo must be null or "@secret"/);
});

test("accepts @secret for non-placeholder entries", () => {
  assert.doesNotThrow(() => validateShowcase([{ ...good(), placeholder: false, repo: "@secret" }]));
});

test("placeholder entries cannot pull stats", () => {
  assert.throws(() => validateShowcase([{ ...good(), repo: "@secret" }]), /placeholder entries must have repo: null/);
});

test("rejects unknown keys, bad era, bad codename, duplicates", () => {
  assert.throws(() => validateShowcase([{ ...good(), extra: 1 }]), /unknown key "extra"/);
  assert.throws(() => validateShowcase([{ ...good(), era: "web3" }]), /era must be one of/);
  assert.throws(() => validateShowcase([{ ...good(), codename: "Bad Name" }]), /kebab-case/);
  assert.throws(() => validateShowcase([good(), good()]), /duplicate codename/);
});

test("rejects empty evidence and non-https demo_url", () => {
  assert.throws(() => validateShowcase([{ ...good(), evidence: [] }]), /evidence/);
  assert.throws(() => validateShowcase([{ ...good(), demo_url: "http://x" }]), /demo_url/);
});
