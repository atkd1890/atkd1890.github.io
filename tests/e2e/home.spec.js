import { test, expect } from '@playwright/test';

const SECTIONS = ['trajectory', 'work', 'signals', 'stream', 'tools', 'lab'];

test('home renders every section on one-line title, no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveText('ATKD Coding');
  const h = await page.locator('#hero-title').boundingBox();
  expect(h?.height).toBeLessThan(80); // one line
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator('.card')).not.toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('unknown paths serve the 404 page', async ({ page }) => {
  const res = await page.goto('/nope/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('404');
});

test('controls stay hidden without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8090/');
  await expect(page.locator('.controls')).toBeHidden();
  await expect(page.locator('#hero-title')).toBeVisible();
  await ctx.close();
});
