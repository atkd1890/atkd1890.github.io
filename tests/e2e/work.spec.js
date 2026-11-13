import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// src/work/atkd-ui.md is a draft (built only with DRAFTS=1, as in e2e and PR previews).
test('case study shows facts from showcase.yml and the framework sections', async ({ page }) => {
  await page.goto('/work/atkd-ui/');
  await expect(page.locator('h1')).toHaveText('atkd-ui');
  await expect(page.locator('.facts')).toContainText('Design system');
  await expect(page.locator('.case-nav li')).toHaveCount(7);
  await expect(page.locator('.breadcrumb')).toContainText('work');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '');
  expect(ld['@type']).toBe('Article');
});

test('home card and palette lead to the case study', async ({ page }) => {
  await page.goto('/');
  await page.locator('#work-atkd-ui-title a').click();
  await expect(page).toHaveURL(/\/work\/atkd-ui\/$/);
  await page.keyboard.press('ControlOrMeta+k');
  await page.locator('#pal-q').fill('atkd-ui');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/atkd-ui\/$/);
});

for (const scheme of /** @type {const} */ (['light', 'dark'])) {
  test(`axe: case study in ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/work/atkd-ui/');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
