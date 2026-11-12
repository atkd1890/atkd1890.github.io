import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/colophon/', '/uses/', '/tools/', '/lab/', '/ja/colophon/', '/en/lab/'];

for (const scheme of /** @type {const} */ (['light', 'dark'])) {
  for (const path of PAGES) {
    test(`axe: ${path} in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
}

test('colophon shows numbers read from the repo, and links to ADRs', async ({ page }) => {
  await page.goto('/colophon/');
  const values = await page.locator('#proof .tile .value').allTextContents();
  expect(values.length === 6 || values.length === 8).toBe(true);
  for (const v of values) expect(v).toMatch(/^\d+(\.\d)?( KB| s)?$/);
  await expect(page.locator('#decisions a').first()).toHaveAttribute('href', /docs\/adr\/0001-/);
  await expect(page.locator('#pipeline table tbody tr')).not.toHaveCount(0);
});

test('uses keeps TODO rows visible until the owner fills them', async ({ page }) => {
  await page.goto('/uses/');
  await expect(page.locator('#site li')).not.toHaveCount(0);
  await expect(page.locator('#hardware li.todo')).toHaveText(/TODO/);
});

test('footer links to uses and colophon in the page language', async ({ page }) => {
  await page.goto('/ja/');
  await expect(page.locator('.site-footer a[href="/ja/colophon/"]')).toBeVisible();
  await expect(page.locator('.site-footer a[href="/ja/uses/"]')).toBeVisible();
});

test('palette goes to the new pages', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('ControlOrMeta+k');
  await page.locator('#pal-q').fill('colophon');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/en\/colophon\/$/);
});
