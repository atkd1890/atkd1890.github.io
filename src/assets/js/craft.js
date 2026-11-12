// Craft layer: theme toggle, sound toggle, ⌘K command palette, keyboard shortcuts.
// Progressive enhancement: every control is hidden until this module runs.
import { filterItems, step, createSequencer, nextTheme, searchItems, SEARCH_MIN } from './core.js';

const root = document.documentElement;
const media = matchMedia('(prefers-color-scheme: dark)');

/** @param {string} key @param {string|null} [value] */
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode): settings just don't persist.
  }
  return null;
}

/* ---------- theme ---------- */
const currentTheme = () => /** @type {'light'|'dark'} */ (root.dataset.theme || (media.matches ? 'dark' : 'light'));

function syncThemeButton() {
  const next = nextTheme(currentTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
    // Labels come from the markup, in the page's language.
    const label = b.getAttribute(`data-label-${next}`);
    if (label) b.setAttribute('aria-label', label);
  });
}

function toggleTheme() {
  const next = nextTheme(currentTheme());
  root.dataset.theme = next;
  store('theme', next);
  syncThemeButton();
}
media.addEventListener('change', syncThemeButton);

/* ---------- sound (off by default) ---------- */
/** @type {AudioContext|null} */
let audio = null;
let soundOn = store('sound') === 'on';

/** Short square-wave tick, game-UI style. @param {number} [freq] */
function tick(freq = 880) {
  if (!soundOn) return;
  audio ??= new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.04, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.05);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.05);
}

function syncSoundButton() {
  document.querySelectorAll('[data-sound-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(soundOn));
    b.querySelector('[data-sound-on]')?.toggleAttribute('hidden', !soundOn);
    b.querySelector('[data-sound-off]')?.toggleAttribute('hidden', soundOn);
  });
}

function toggleSound() {
  soundOn = !soundOn;
  store('sound', soundOn ? 'on' : null);
  syncSoundButton();
  tick(soundOn ? 1320 : 440);
}

/* ---------- command palette ---------- */
const palette = /** @type {HTMLDialogElement|null} */ (document.getElementById('palette'));
const help = /** @type {HTMLDialogElement|null} */ (document.getElementById('shortcuts'));
const input = /** @type {HTMLInputElement|null} */ (palette?.querySelector('input'));
const list = palette?.querySelector('[role="listbox"]');
/** @type {import('./core.js').Item[]} */
const items = JSON.parse(document.getElementById('palette-items')?.textContent || '[]');
/** @type {import('./core.js').Item[]} */
let shown = [];
/** @type {import('./core.js').Item[]} full-text results for the current query */
let found = [];
let active = -1;

/** @param {boolean} [keepActive] keep the selection when async search results arrive */
function render(keepActive = false) {
  if (!list || !input) return;
  const before = active;
  shown = [...filterItems(items, input.value), ...found];
  active = shown.length ? (keepActive ? Math.min(Math.max(before, 0), shown.length - 1) : 0) : -1;
  list.replaceChildren(
    ...shown.map((item, i) => {
      const li = document.createElement('li');
      li.id = `pal-${item.id}`;
      li.setAttribute('role', 'option');
      li.dataset.index = String(i);
      const group = document.createElement('span');
      group.className = 'pal-group';
      group.textContent = item.group;
      const label = document.createElement('span');
      label.className = 'pal-label';
      label.textContent = item.label;
      li.append(group, label);
      if (item.detail) {
        const detail = document.createElement('span');
        detail.className = 'pal-detail';
        detail.textContent = item.detail;
        label.append(detail);
      }
      if (item.hint) {
        const hint = document.createElement('kbd');
        hint.textContent = item.hint;
        li.append(hint);
      }
      return li;
    }),
  );
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'pal-empty';
    li.textContent = list.getAttribute('data-no-match') || '';
    list.append(li);
  }
  highlight();
}

function highlight() {
  list?.querySelectorAll('[role="option"]').forEach((el, i) => el.setAttribute('aria-selected', String(i === active)));
  const current = active >= 0 ? shown[active] : null;
  if (current) {
    input?.setAttribute('aria-activedescendant', `pal-${current.id}`);
    document.getElementById(`pal-${current.id}`)?.scrollIntoView({ block: 'nearest' });
  } else input?.removeAttribute('aria-activedescendant');
}

/** @param {import('./core.js').Item} item */
function run(item) {
  palette?.close();
  tick(1100);
  if (item.action === 'theme') toggleTheme();
  else if (item.action === 'sound') toggleSound();
  else if (item.action === 'help') help?.showModal();
  else if (item.href) {
    if (item.href.startsWith('http')) window.open(item.href, '_blank', 'noopener');
    else location.href = item.href;
  }
}

/* ---------- full-text search: Pagefind index built at deploy, loaded on the first real query ---------- */
/** @type {Promise<any>|null} */
let pagefind = null;
let searchSeq = 0;

async function search() {
  const seq = ++searchSeq;
  const q = input?.value.trim() ?? '';
  if (q.length < SEARCH_MIN) return;
  try {
    const url = '/pagefind/pagefind.js'; // variable, so bundlers and the budget check leave it alone
    pagefind ??= import(url);
    const pf = await pagefind;
    const res = await pf.debouncedSearch(q, {}, 150);
    if (!res || seq !== searchSeq) return; // a newer query took over
    const hits = await Promise.all(res.results.slice(0, 5).map((/** @type {any} */ r) => r.data()));
    if (seq !== searchSeq) return;
    found = searchItems(hits, list?.getAttribute('data-search-group') || 'search');
    render(true);
  } catch {
    // No index (local `npm start`) or offline: the palette keeps working without full-text results.
  }
}

function onInput() {
  found = [];
  render();
  search();
}

function openPalette() {
  if (!palette || !input) return;
  help?.close();
  input.value = '';
  found = [];
  render();
  palette.showModal();
  input.focus();
  tick(660);
}

input?.addEventListener('input', onInput);
input?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    active = step(active, e.key === 'ArrowDown' ? 1 : -1, shown.length);
    highlight();
    tick(990);
  } else if (e.key === 'Enter' && active >= 0) {
    e.preventDefault();
    run(shown[active]);
  }
});
list?.addEventListener('click', (e) => {
  const li = /** @type {HTMLElement} */ (e.target).closest('[role="option"]');
  if (li instanceof HTMLElement) run(shown[Number(li.dataset.index)]);
});
// Click on the backdrop closes the dialog.
for (const d of [palette, help]) {
  d?.addEventListener('click', (e) => {
    if (e.target === d) d.close();
  });
}

/* ---------- keyboard shortcuts ---------- */
const sequencer = createSequencer({
  'g h': 'home',
  'g w': 'work',
  'g s': 'signals',
  'g b': 'blog',
  '/': 'search',
  '?': 'help',
});

/** @param {EventTarget|null} t */
const isTyping = (t) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (palette?.open) palette.close();
    else openPalette();
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || palette?.open || help?.open) return;
  const action = sequencer(e.key, e.timeStamp);
  if (!action) return;
  e.preventDefault();
  const home = root.dataset.home || '/';
  const onHome = location.pathname === home;
  /** @type {Record<string, () => void>} */
  const actions = {
    home: () => (location.href = home),
    work: () => (location.href = onHome ? '#work' : `${home}#work`),
    signals: () => (location.href = onHome ? '#signals' : `${home}#signals`),
    blog: () => (location.href = `${home}blog/`),
    search: openPalette,
    help: () => help?.showModal(),
  };
  actions[action]?.();
});

/* ---------- wire up ---------- */
document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
document.querySelectorAll('[data-sound-toggle]').forEach((b) => b.addEventListener('click', toggleSound));
document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', openPalette));
document.querySelectorAll('[data-help-open]').forEach((b) => b.addEventListener('click', () => help?.showModal()));
document.addEventListener('click', (e) => {
  if (/** @type {HTMLElement} */ (e.target).closest?.('a, button')) tick();
});
syncThemeButton();
syncSoundButton();
document.querySelectorAll('[data-js]').forEach((el) => el.removeAttribute('hidden'));
