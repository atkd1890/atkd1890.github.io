import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** @param {import('@playwright/test').Page} page */
async function audit(page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

for (const scheme of /** @type {const} */ (['light', 'dark'])) {
  test(`axe: home in ${scheme} has no serious issues`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    await expect(page.locator('.controls')).toBeVisible();
    await audit(page);
  });

  test(`axe: palette and help dialogs in ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    await page.locator('[data-palette-open]').click();
    await expect(page.locator('#palette')).toBeVisible();
    await audit(page);
    await page.keyboard.press('Escape');
    await page.locator('[data-help-open]').click();
    await expect(page.locator('#shortcuts')).toBeVisible();
    await audit(page);
  });
}

test('axe: 404 page', async ({ page }) => {
  await page.goto('/nope/');
  await audit(page);
});

test('reduced motion stops the cursor blink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const anim = await page.locator('.cursor').evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
});
