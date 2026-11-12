import { test, expect } from '@playwright/test';

// Runs on the draft-enabled build (DRAFTS=1): src/blog/2026/*blog-fixture* are drafts used only here.

test('blog index lists posts, filters by type, and every filter page exists', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('#blog-title')).toHaveText('Blog');
  await expect(page.locator('.stream-item')).toHaveCount(2);
  await page.locator('.chips a', { hasText: 'TIL' }).click();
  await expect(page).toHaveURL(/\/blog\/type\/til\/$/);
  await expect(page.locator('.stream-item')).toHaveCount(1);
  for (const path of [
    '/blog/tag/testing/',
    '/blog/series/fixture/',
    '/blog/2026/',
    '/ja/blog/',
    '/en/blog/type/deep-dive/',
  ])
    expect((await page.goto(path))?.status(), path).toBe(200);
});

test('long post: title, reading time, table of contents, diagram follows the theme', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  await expect(page.locator('#post-title')).toHaveText('Bài kiểm thử hạ tầng blog');
  await expect(page.locator('.post-meta')).toContainText('phút đọc');
  await expect(page.locator('.post-toc li')).toHaveCount(3);
  const svg = page.locator('.diagram svg');
  await expect(svg).toHaveAttribute('role', 'img');
  expect(await svg.evaluate((el) => el.outerHTML.includes('var(--accent)'))).toBe(true);
});

test('interactive components load only on posts that list them', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  await expect(page.locator('script[src="/assets/interactive/leak-guard-demo.js"]')).toHaveCount(1);
  const out = page.locator('leak-guard-demo .lg-out');
  await expect(out).toHaveAttribute('data-state', 'blocked');
  await page.locator('leak-guard-demo textarea').fill('Một câu bình thường');
  await expect(out).toHaveAttribute('data-state', 'ok');
  await page.goto('/blog/blog-fixture-two/');
  await expect(page.locator('script[src^="/assets/interactive/"]')).toHaveCount(0);
});

test('language versions: switcher, hreflang, "also in", AI-assisted badge', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(2);
  await expect(page.locator('.langs a[hreflang="ja"]')).toHaveAttribute('href', '/ja/blog/');
  await page.locator('.post-foot a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\/blog\/blog-fixture\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.post-head .badge', { hasText: 'AI-assisted' })).toBeVisible();
});

test('series navigation and home stream', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  await expect(page.locator('.series-nav a[rel="next"]')).toContainText('Bài kiểm thử thứ hai');
  await page.goto('/');
  await expect(page.locator('#stream .stream-item')).toHaveCount(2);
});

test('Atom feeds are well-formed and list posts', async ({ page, request }) => {
  const res = await request.get('/feed.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  await page.setContent('<p></p>');
  const parsed = await page.evaluate((x) => {
    const doc = new DOMParser().parseFromString(x, 'application/xml');
    return { error: !!doc.querySelector('parsererror'), entries: doc.querySelectorAll('entry').length };
  }, xml);
  expect(parsed).toEqual({ error: false, entries: 3 });
  expect((await request.get('/feed/til.xml')).status()).toBe(200);
});

test('g b opens the blog in the current language', async ({ page }) => {
  await page.goto('/ja/');
  await expect(page.locator('.controls')).toBeVisible();
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await expect(page).toHaveURL(/\/ja\/blog\/$/);
});
