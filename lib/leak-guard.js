// Leak guard core: finds private repo names, denylisted strings and image metadata.
// Findings never contain the matched secret value, only its kind and list index,
// because CI logs and artifacts are public.

/** Built-in canary. Always on the list; the self-test plants it to prove the guard fires. */
export const CANARY = 'ATKD-LEAK-CANARY-0d9f';

const TEXT_EXT = new Set([
  '.html',
  '.htm',
  '.xml',
  '.json',
  '.js',
  '.mjs',
  '.css',
  '.txt',
  '.md',
  '.svg',
  '.webmanifest',
  '.yml',
  '.yaml',
  '.njk',
]);
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/** @param {string} p */
export const extOf = (p) => (p.match(/\.[^./\\]+$/)?.[0] ?? '').toLowerCase();
/** @param {string} p */
export const isText = (p) => TEXT_EXT.has(extOf(p));
/** @param {string} p */
export const isImage = (p) => IMAGE_EXT.has(extOf(p));

/** Lowercase, Unicode-normalize and strip Vietnamese/Latin diacritics, so "Nguyễn" matches "nguyen". @param {string} s */
export function fold(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

/** @param {string} s */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @typedef {{kind: "repo"|"deny"|"canary", index: number, re: RegExp}} Rule
 * @typedef {{file: string, line: number, kind: string, index: number}} Finding
 */

/**
 * @param {{repoNames?: string[], denylist?: string[]}} lists
 * @returns {Rule[]}
 */
export function buildRules({ repoNames = [], denylist = [] }) {
  /** @type {Rule[]} */
  const rules = [{ kind: 'canary', index: 0, re: new RegExp(escapeRe(fold(CANARY)), 'g') }];
  const names = new Set();
  for (const r of repoNames) {
    const full = r.trim();
    if (!full) continue;
    names.add(full);
    const short = full.includes('/') ? full.split('/').pop() : full;
    if (short) names.add(short);
  }
  [...names].forEach((n, i) => {
    // Whole-token match: a repo name inside a longer identifier is not a hit.
    rules.push({ kind: 'repo', index: i, re: new RegExp(`(?<![a-z0-9_.-])${escapeRe(fold(n))}(?![a-z0-9_-])`, 'g') });
  });
  denylist
    .map((d) => d.trim())
    .filter((d) => d.length >= 3 && !d.startsWith('#'))
    .forEach((d, i) => {
      rules.push({ kind: 'deny', index: i, re: new RegExp(escapeRe(fold(d)), 'g') });
    });
  return rules;
}

/**
 * @param {string} file @param {string} text @param {Rule[]} rules
 * @returns {Finding[]}
 */
export function scanText(file, text, rules) {
  /** @type {Finding[]} */
  const out = [];
  const lines = fold(text).split('\n');
  lines.forEach((line, i) => {
    for (const r of rules) {
      r.re.lastIndex = 0;
      if (r.re.test(line)) out.push({ file, line: i + 1, kind: r.kind, index: r.index });
    }
  });
  return out;
}

/**
 * Detects EXIF (and so possible GPS, camera serials) in JPEG, PNG and WebP.
 * @param {Uint8Array} buf @param {string} file
 * @returns {boolean}
 */
export function hasExif(buf, file) {
  const ext = extOf(file);
  const ascii = (/** @type {number} */ at, /** @type {number} */ len) =>
    String.fromCharCode(...buf.subarray(at, at + len));
  if (ext === '.jpg' || ext === '.jpeg') {
    for (let i = 2; i + 10 < buf.length && i < 1 << 20;) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      const len = (buf[i + 2] << 8) | buf[i + 3];
      if (marker === 0xe1 && ascii(i + 4, 6) === 'Exif\0\0') return true;
      if (marker === 0xda) break; // start of scan, no more metadata
      i += 2 + len;
    }
    return false;
  }
  if (ext === '.png') {
    for (let i = 8; i + 8 <= buf.length;) {
      const len = ((buf[i] << 24) | (buf[i + 1] << 16) | (buf[i + 2] << 8) | buf[i + 3]) >>> 0;
      const type = ascii(i + 4, 4);
      if (type === 'eXIf') return true;
      if (type === 'IEND') break;
      i += 12 + len;
    }
    return false;
  }
  if (ext === '.webp') {
    if (ascii(0, 4) !== 'RIFF') return false;
    for (let i = 12; i + 8 <= buf.length;) {
      const type = ascii(i, 4);
      const len = buf[i + 4] | (buf[i + 5] << 8) | (buf[i + 6] << 16) | (buf[i + 7] << 24);
      if (type === 'EXIF') return true;
      i += 8 + len + (len & 1);
    }
    return false;
  }
  return false;
}

/** @param {Finding} f */
export function describe(f) {
  const what =
    f.kind === 'repo'
      ? `private repo name #${f.index}`
      : f.kind === 'deny'
        ? `denylist entry #${f.index}`
        : f.kind === 'canary'
          ? 'canary'
          : f.kind;
  return `${f.file}:${f.line}  ${what}`;
}
