// Visual regression. Baselines depend on the OS fonts, so this runs locally only (like the hub):
//   npm run test:visual            compare with tests/e2e/__screenshots__/
//   npm run test:visual -- -u      accept the current look as the new baseline
// Parts that change on every build (build date, test counts) are masked.
import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', full: false },
  { path: '/blog/', full: true },
  { path: '/blog/github-native-portfolio/', full: false },
  { path: '/colophon/', full: false },
  { path: '/lab/', full: true },
  { path: '/ja/', full: false },
];

for (const theme of /** @type {const} */ (['light', 'dark'])) {
  for (const { path, full } of PAGES) {
    const name = `${path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replaceAll('/', '-')}-${theme}.png`;
    test(`@visual ${name}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(name, {
        fullPage: full,
        mask: [page.locator('.site-footer .meta'), page.locator('#proof .value')],
      });
    });
  }
}
