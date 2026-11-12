import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageAssets, staticImports, blockingFonts } from '../lib/budget.js';

test('pageAssets finds local scripts and stylesheets only', () => {
  const html = `<link rel="stylesheet" href="/a.css"><link rel="preload" href="/f.woff2"><script type="module" src="/x.js"></script><script src="https://cdn/y.js"></script>`;
  assert.deepEqual(pageAssets(html), { scripts: ['/x.js'], styles: ['/a.css'] });
});

test('staticImports reads relative module imports', () => {
  assert.deepEqual(
    staticImports(`import { a } from './core.js';\nimport x from "pkg";\nconst y = 'import z from "./no.js"';`),
    ['./core.js'],
  );
});

test('blockingFonts counts @font-face without a non-blocking font-display', () => {
  assert.equal(blockingFonts('@font-face{font-family:a;font-display:swap;} @font-face{font-family:b;}'), 1);
});
