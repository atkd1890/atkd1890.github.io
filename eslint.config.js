// ESLint (flat config). Style is Prettier's job; this catches bugs.
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['_site/', '.cache/', 'lighthouse/', 'node_modules/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }] },
  },
  {
    // Shipped to visitors: browser only, no Node globals.
    files: ['src/assets/js/**/*.js', 'src/_includes/interactive/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    // Code passed to page.evaluate / addInitScript runs in the browser.
    files: ['tests/e2e/**/*.js', 'scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
