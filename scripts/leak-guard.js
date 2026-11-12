#!/usr/bin/env node
// Leak guard CLI. Exit 1 on any finding.
//
//   node scripts/leak-guard.js _site [more paths/files...]
//   node scripts/leak-guard.js --self-test
//   flags: --require-denylist   fail if no denylist is configured (use on main)
//          --fetch-private      also list private repo names via SHOWCASE_TOKEN
//
// Inputs (never committed): LEAK_DENYLIST (newline list) or LEAK_DENYLIST_FILE,
// SHOWCASE_REPOS / SHOWCASE_REPOS_FILE (repo names), LEAK_REPO_NAMES (newline list).
import { readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildRules, scanText, hasExif, isText, isImage, describe, CANARY } from '../lib/leak-guard.js';
import { gql } from '../lib/github-api.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const paths = args.filter((a) => !a.startsWith('--'));

/** @param {string} p @returns {string[]} */
function walk(p) {
  const st = statSync(p, { throwIfNoEntry: false });
  if (!st) return [];
  if (st.isFile()) return [p];
  return readdirSync(p).flatMap((n) => (n === 'node_modules' || n === '.git' ? [] : walk(join(p, n))));
}

/** @param {string|undefined} v */
const lines = (v) =>
  v
    ? v
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

async function loadLists() {
  const denylist = [
    ...lines(process.env.LEAK_DENYLIST),
    ...(process.env.LEAK_DENYLIST_FILE ? lines(readFileSync(process.env.LEAK_DENYLIST_FILE, 'utf8')) : []),
  ];
  const mapRaw =
    process.env.SHOWCASE_REPOS ||
    (process.env.SHOWCASE_REPOS_FILE ? readFileSync(process.env.SHOWCASE_REPOS_FILE, 'utf8') : '');
  const repoNames = [...lines(process.env.LEAK_REPO_NAMES)];
  if (mapRaw) {
    try {
      repoNames.push(
        ...Object.entries(JSON.parse(mapRaw))
          .filter(([k]) => !k.startsWith('_'))
          .map(([, v]) => v)
          .flat()
          .map(String),
      );
    } catch {
      console.warn('leak-guard: SHOWCASE_REPOS is not valid JSON');
    }
  }
  if (flags.has('--fetch-private') && process.env.SHOWCASE_TOKEN) {
    try {
      const d = await gql(
        process.env.SHOWCASE_TOKEN,
        `{ viewer { repositories(first:100, privacy:PRIVATE, ownerAffiliations:[OWNER, COLLABORATOR, ORGANIZATION_MEMBER]){ nodes{ nameWithOwner } } } }`,
      );
      repoNames.push(...d.viewer.repositories.nodes.map((/** @type {any} */ n) => n.nameWithOwner));
    } catch (e) {
      console.warn(`leak-guard: could not list private repos (${/** @type {Error} */ (e).message})`);
    }
  }
  return { denylist, repoNames };
}

/** @param {string[]} files @param {import("../lib/leak-guard.js").Rule[]} rules */
function scan(files, rules) {
  /** @type {string[]} */
  const hits = [];
  for (const f of files) {
    if (isText(f)) for (const x of scanText(f, readFileSync(f, 'utf8'), rules)) hits.push(describe(x));
    else if (isImage(f) && hasExif(readFileSync(f), f)) hits.push(`${f}  image metadata (EXIF), strip it`);
  }
  return hits;
}

function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'leak-guard-'));
  try {
    writeFileSync(join(dir, 'dirty.html'), `<p>ok</p>\n<p>${CANARY}</p>\n<p>see acme-secret-repo here</p>`);
    writeFileSync(join(dir, 'clean.html'), '<p>nothing to see</p>');
    // Minimal JPEG: SOI + APP1 Exif segment + SOS.
    writeFileSync(
      join(dir, 'photo.jpg'),
      Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xff, 0xda, 0, 0]),
    );
    const rules = buildRules({ repoNames: ['someone/acme-secret-repo'], denylist: [] });
    const hits = scan(walk(dir), rules);
    const ok =
      hits.some((h) => h.includes('canary')) &&
      hits.some((h) => h.includes('private repo name')) &&
      hits.some((h) => h.includes('EXIF')) &&
      !hits.some((h) => h.includes('clean.html'));
    console.log(
      ok
        ? 'leak-guard self-test: OK (canary, repo name and EXIF detected)'
        : `leak-guard self-test: FAILED\n${hits.join('\n')}`,
    );
    return ok;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  if (flags.has('--self-test')) process.exit(selfTest() ? 0 : 1);
  if (!paths.length) {
    console.error('usage: leak-guard <paths...> | --self-test');
    process.exit(2);
  }
  const lists = await loadLists();
  if (!lists.denylist.length) {
    const msg = 'leak-guard: no denylist configured (set LEAK_DENYLIST)';
    if (flags.has('--require-denylist')) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(`${msg}; checking repo names, canary and EXIF only`);
  }
  const files = paths.flatMap(walk);
  const hits = scan(files, buildRules(lists));
  console.log(
    `leak-guard: ${files.length} files, ${lists.repoNames.length} repo names, ${lists.denylist.length} denylist entries`,
  );
  if (hits.length) {
    console.error(`leak-guard: ${hits.length} finding(s)\n  ${hits.join('\n  ')}`);
    process.exit(1);
  }
  console.log('leak-guard: clean');
}

main();
