// <leak-guard-demo>: type a sentence, see whether the leak guard would block it.
// Mirrors the real rules in lib/leak-guard.js (diacritic- and case-insensitive substring match for the
// denylist, whole-token match for repo names) on a FAKE denylist. Progressive enhancement: the element's
// fallback text is shown until this module defines it.

const fold = (/** @type {string} */ s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const esc = (/** @type {string} */ s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const html = (/** @type {string} */ s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

class LeakGuardDemo extends HTMLElement {
  connectedCallback() {
    const deny = (this.getAttribute('deny') || '').split('|').filter(Boolean);
    const repos = (this.getAttribute('repos') || '').split('|').filter(Boolean);
    const t = {
      label: this.getAttribute('label') || 'Text',
      ok: this.getAttribute('ok') || 'Clean: this would deploy.',
      blocked: this.getAttribute('blocked') || 'Blocked:',
      denyName: this.getAttribute('deny-name') || 'denylist entry',
      repoName: this.getAttribute('repo-name') || 'private repo name',
      rules: this.getAttribute('rules') || 'Fake rules',
    };
    const rules = [
      ...deny.map((d, i) => ({ re: new RegExp(esc(fold(d)), 'g'), name: `${t.denyName} #${i}`, show: d })),
      ...repos.map((r, i) => ({
        re: new RegExp(`(?<![a-z0-9_.-])${esc(fold(r))}(?![a-z0-9_-])`, 'g'),
        name: `${t.repoName} #${i}`,
        show: r,
      })),
    ];
    const id = `lg-${Math.random().toString(36).slice(2, 8)}`;
    this.innerHTML = `
      <div class="lg">
        <label for="${id}" class="comment">${html(t.label)}</label>
        <textarea id="${id}" rows="3" spellcheck="false">${html(this.getAttribute('value') || '')}</textarea>
        <p class="lg-out" role="status" aria-live="polite"></p>
        <p class="lg-rules comment">${html(t.rules)}: ${rules.map((r) => `<code>${html(r.show)}</code>`).join(' ')}</p>
      </div>`;
    const input = /** @type {HTMLTextAreaElement} */ (this.querySelector('textarea'));
    const out = /** @type {HTMLElement} */ (this.querySelector('.lg-out'));
    const check = () => {
      const text = fold(input.value);
      const hits = rules.filter((r) => {
        r.re.lastIndex = 0;
        return r.re.test(text);
      });
      out.dataset.state = hits.length ? 'blocked' : 'ok';
      out.textContent = hits.length ? `${t.blocked} ${hits.map((h) => h.name).join(', ')}` : t.ok;
    };
    input.addEventListener('input', check);
    check();
  }
}
customElements.define('leak-guard-demo', LeakGuardDemo);
