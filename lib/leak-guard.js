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
 * Private infrastructure repos of the atkd1890 system that docs may name on purpose.
 * Project repos (work, clients, showcase) never go here: they only appear as codenames.
 */
export const ALLOWED_REPO_NAMES = new Set(['atkd.world-ops']);

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
    const short = full.includes('/') ? full.split('/').pop() : full;
    if (short && ALLOWED_REPO_NAMES.has(short)) continue;
    names.add(full);
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

/* ---------- PII patterns: emails outside allowed domains, VN and JP phone numbers ---------- */

/** Files where people write prose (not minified JS/CSS or SVG geometry, where digit runs are noise). */
const PII_EXT = new Set(['.html', '.htm', '.xml', '.md', '.txt', '.webmanifest', '.yml', '.yaml', '.njk']);
/** @param {string} p */
export const isProse = (p) => PII_EXT.has(extOf(p));

/** The only addresses the site may show or carry. */
export const ALLOWED_EMAIL =
  /@(atkd1890\.me|users\.noreply\.github\.com|noreply\.github\.com|example\.(com|org|net)|anthropic\.com)$/i;

// Not glued to letters, digits, dots, #, /, + or hyphens: skips colors, ids, versions and paths.
const START = String.raw`(?<![\w.#/+-])`;
const END = String.raw`(?![\w-])`;
/** @type {Array<{re: RegExp, ok: (m: RegExpMatchArray) => boolean}>} */
const PHONES = [
  // VN mobile: 09xxxxxxxx, +849xxxxxxxx
  { re: /(?<![\d.#-])(?:\+84|0)[35789]\d{8}(?!\d)/g, ok: () => true },
  // JP mobile and IP phone: 090-xxxx-xxxx, 090xxxxxxxx (also 080, 070, 050)
  { re: new RegExp(`${START}0[5789]0-?\\d{4}-?\\d{4}${END}`, 'g'), ok: () => true },
  // JP landline with hyphens: area + subscriber code are always 6 digits, so dates like 03-11-2026 do not match
  { re: new RegExp(`${START}(0\\d{1,4})-(\\d{1,4})-\\d{4}${END}`, 'g'), ok: (m) => m[1].length + m[2].length === 6 },
  // JP landline without hyphens: 03xxxxxxxx
  { re: new RegExp(`${START}0[1-9]\\d{8}${END}`, 'g'), ok: () => true },
  // JP international: +81 90 xxxx xxxx, +81-3-xxxx-xxxx, +81 (0)90-xxxx-xxxx
  {
    re: new RegExp(String.raw`(?<![\w+])\+81[- ]?(?:\(0\)[- ]?)?([1-9]\d{0,3})[- ]?(\d{1,4})[- ]?\d{4}${END}`, 'g'),
    ok: (m) => [5, 6].includes(m[1].length + m[2].length),
  },
];

/** Example numbers in docs and demos (…1234-5678, all one digit) are not anyone's phone. @param {string} phone */
export const isExamplePhone = (phone) => {
  const d = phone.replace(/\D/g, '').replace(/^(84|81)/, '0');
  return d.includes('12345678') || /^0?(\d)\1+$/.test(d.slice(1)) || /^0\d{1,2}0{7,8}$/.test(d);
};

/** Phone numbers in a line of text. @param {string} line @returns {string[]} */
export function findPhones(line) {
  /** @type {Map<number, string>} */
  const found = new Map();
  for (const { re, ok } of PHONES) {
    re.lastIndex = 0;
    for (const m of line.matchAll(re))
      if (ok(m) && !found.has(/** @type {number} */ (m.index))) found.set(/** @type {number} */ (m.index), m[0]);
  }
  return [...found.values()].filter((p) => !isExamplePhone(p));
}

/**
 * Emails outside the allowed domains and phone numbers. Findings carry the line, never the value.
 * @param {string} file @param {string} text @returns {Finding[]}
 */
export function scanPii(file, text) {
  /** @type {Finding[]} */
  const out = [];
  text.split('\n').forEach((line, i) => {
    for (const [m] of line.matchAll(/[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi)) {
      if (!ALLOWED_EMAIL.test(m.replace(/\.+$/, ''))) out.push({ file, line: i + 1, kind: 'email', index: 0 });
    }
    if (findPhones(line).length) out.push({ file, line: i + 1, kind: 'phone', index: 0 });
  });
  return out;
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
          : f.kind === 'email'
            ? 'email outside allowed domains'
            : f.kind === 'phone'
              ? 'phone number'
              : f.kind;
  return `${f.file}:${f.line}  ${what}`;
}

/** Emails allowed in commit metadata: GitHub noreply addresses only. */
const ALLOWED_COMMIT_EMAIL = /(^|\+)[^@\s]*@users\.noreply\.github\.com$|^noreply@github\.com$/i;

/**
 * Checks author/committer of commits. Input lines: "sha\tauthorName\tauthorEmail\tcommitterName\tcommitterEmail".
 * Findings name the commit and the field, never the value.
 * @param {string[]} lines @param {Rule[]} rules
 * @returns {string[]}
 */
export function checkCommitMeta(lines, rules) {
  /** @type {string[]} */
  const out = [];
  for (const line of lines) {
    const [sha, an, ae, cn, ce] = line.split('\t');
    if (!sha) continue;
    const short = sha.slice(0, 7);
    for (const [field, email] of [
      ['author', ae],
      ['committer', ce],
    ]) {
      if (email && !ALLOWED_COMMIT_EMAIL.test(email))
        out.push(`commit ${short}: ${field} email is not a GitHub noreply address`);
    }
    for (const f of scanText(`commit ${short}`, [an, ae, cn, ce].join(' '), rules))
      out.push(`commit ${short}: author/committer matches ${describe(f).split('  ')[1]}`);
  }
  return out;
}
