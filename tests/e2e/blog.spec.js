import { test, expect } from '@playwright/test';

// Runs on the draft-enabled build (DRAFTS=1): src/blog/2026/*blog-fixture* are drafts used only here.

test('blog index lists posts, filters by type, and every filter page exists', async ({ page }) => {
  await page.goto('/blog/');
  await expect(page.locator('#blog-title')).toHaveText('Blog');
  // Fixtures are drafts; real posts may exist too, so assert on the fixtures, not on totals.
  await expect(page.locator('.stream-title', { hasText: 'Bài kiểm thử hạ tầng blog' })).toBeVisible();
  await expect(page.locator('.stream-title', { hasText: 'Bài kiểm thử thứ hai' })).toBeVisible();
  await page.locator('.chips a', { hasText: 'TIL' }).click();
  await expect(page).toHaveURL(/\/blog\/type\/til\/$/);
  await expect(page.locator('.stream-item').filter({ hasText: 'Bài kiểm thử thứ hai' })).toHaveCount(1);
  await expect(page.locator('.stream-item').filter({ hasText: 'Bài kiểm thử hạ tầng blog' })).toHaveCount(0);
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
  await expect(page.locator('#stream .stream-title', { hasText: 'Bài kiểm thử thứ hai' })).toBeVisible();
});

test('Atom feeds are well-formed and list posts', async ({ page, request }) => {
  const res = await request.get('/feed.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  await page.setContent('<p></p>');
  const parsed = await page.evaluate((x) => {
    const doc = new DOMParser().parseFromString(x, 'application/xml');
    return {
      error: !!doc.querySelector('parsererror'),
      titles: [...doc.querySelectorAll('entry > title')].map((t) => t.textContent),
    };
  }, xml);
  expect(parsed.error).toBe(false);
  expect(parsed.titles).toEqual(expect.arrayContaining(['Bài kiểm thử hạ tầng blog', 'Bài kiểm thử thứ hai']));
  expect((await request.get('/feed/til.xml')).status()).toBe(200);
});

test('g b opens the blog in the current language', async ({ page }) => {
  await page.goto('/ja/');
  await expect(page.locator('.controls')).toBeVisible();
  await page.keyboard.press('g');
  await page.keyboard.press('b');
  await expect(page).toHaveURL(/\/ja\/blog\/$/);
});

test('breadcrumb on inner pages leads home and to the blog; none on home', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  const crumbs = page.locator('nav.breadcrumb');
  await expect(crumbs.locator('li')).toHaveCount(3);
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Bài kiểm thử hạ tầng blog');
  await crumbs.locator('a', { hasText: 'blog' }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator('nav.breadcrumb [aria-current="page"]')).toHaveText('blog');
  await page.locator('nav.breadcrumb a').first().click();
  await expect(page).toHaveURL(/:8090\/$/);
  await expect(page.locator('nav.breadcrumb')).toHaveCount(0);

  await page.goto('/ja/blog/type/til/');
  await expect(page.locator('nav.breadcrumb [aria-current="page"]')).toHaveText('TIL');
  await page.locator('nav.breadcrumb a').first().click();
  await expect(page).toHaveURL(/\/ja\/$/);
});

test('the titlebar label links home in the current language', async ({ page }) => {
  await page.goto('/en/blog/');
  await page.locator('.titlebar-label').click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('the first post exists in all three languages and links them', async ({ page }) => {
  for (const [path, lang] of [
    ['/blog/github-native-portfolio/', 'vi'],
    ['/en/blog/github-native-portfolio/', 'en'],
    ['/ja/blog/github-native-portfolio/', 'ja'],
  ]) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(3);
    await expect(page.locator('.post-toc li')).toHaveCount(10);
  }
});
