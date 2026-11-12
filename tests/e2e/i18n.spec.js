import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', lang: 'vi', heading: 'Hành trình' },
  { path: '/en/', lang: 'en', heading: 'Trajectory' },
  { path: '/ja/', lang: 'ja', heading: 'これまでの歩み' },
];

for (const p of PAGES) {
  test(`${p.lang}: page language, headings, hreflang and current switcher item`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.locator('html')).toHaveAttribute('lang', p.lang);
    await expect(page.locator('#trajectory-title')).toHaveText(p.heading);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(4);
    await expect(page.locator(`.langs a[aria-current="page"]`)).toHaveAttribute('hreflang', p.lang);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('the switcher links to the same page in the other language, without JavaScript too', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8090/');
  await page.locator('.langs a[hreflang="ja"]').click();
  await expect(page).toHaveURL(/\/ja\/$/);
  await page.locator('.langs a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.locator('.langs a[hreflang="vi"]').click();
  await expect(page).toHaveURL(/:8090\/$/);
  await ctx.close();
});

test('palette and g h stay inside the current language', async ({ page }) => {
  await page.goto('/ja/');
  await expect(page.locator('.controls')).toBeVisible();
  await page.keyboard.press('/');
  await expect(page.locator('#pal-list [role="option"]').first()).toContainText('ホーム');
  await page.keyboard.type('desk');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/ja\/#work-signal-desk$/);
  await page.keyboard.press('g');
  await page.keyboard.press('h');
  await expect(page).toHaveURL(/\/ja\/$/);
});

test('Japanese keeps JetBrains Mono for codenames and system fonts for body text', async ({ page }) => {
  await page.goto('/ja/');
  const h3 = await page
    .locator('.card h3')
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  const body = await page
    .locator('.card p')
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h3).toMatch(/^"?JetBrains Mono/);
  expect(body).toMatch(/Hiragino Sans/);
});
