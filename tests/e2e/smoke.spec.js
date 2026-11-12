// Cross-browser smoke: the paths every visitor takes, on Firefox, Safari iOS (WebKit) and Chrome Android.
// The full suite runs on Chromium only (playwright.config.js → projects).
import { test, expect } from '@playwright/test';

test('home renders, controls appear, theme toggles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('ATKD Coding');
  await expect(page.locator('.controls')).toBeVisible();
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator('[data-theme-toggle]').click();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(before);
});

test('palette opens from the button and searches posts', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('[data-palette-open]').click();
  await expect(page.locator('#palette')).toBeVisible();
  await page.locator('#pal-q').fill('fixture');
  await expect(page.locator('#pal-list [role="option"]', { hasText: 'Blog infrastructure fixture' })).toBeVisible();
});

test('a post renders with its diagram and language switch', async ({ page }) => {
  await page.goto('/blog/github-native-portfolio/');
  await expect(page.locator('figure.diagram svg').first()).toBeVisible();
  await page.locator('.langs a[hreflang="ja"]').click();
  await expect(page).toHaveURL(/\/ja\/blog\/github-native-portfolio\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
});

test('no horizontal scroll on the page body', async ({ page }) => {
  for (const path of ['/', '/blog/', '/colophon/']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), path).toBe(true);
  }
});
