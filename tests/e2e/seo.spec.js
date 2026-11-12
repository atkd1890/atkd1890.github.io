import { test, expect } from '@playwright/test';

// CSP violations are recorded before any page script runs, so nothing slips through.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    /** @type {any} */ (window).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) =>
      /** @type {any} */ (window).__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
    );
  });
});

for (const path of ['/', '/ja/', '/blog/', '/blog/blog-fixture/']) {
  test(`CSP: ${path} loads without violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('.controls')).toBeVisible();
    await page.locator('[data-palette-open]').click();
    await page.locator('#pal-q').fill('leak');
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => /** @type {any} */ (window).__csp)).toEqual([]);
  });
}

test('palette finds posts by full text, in the page language', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('ControlOrMeta+k');
  await page.locator('#pal-q').fill('fixture');
  const hit = page.locator('#pal-list [role="option"]', { hasText: 'Blog infrastructure fixture' }).first();
  await expect(hit).toBeVisible();
  await expect(hit.locator('.pal-group')).toHaveText('Blog');
  await hit.click();
  await expect(page).toHaveURL(/\/en\/blog\/blog-fixture\/$/);
});

test('share metadata: OG tags and valid JSON-LD on a post', async ({ page }) => {
  await page.goto('/blog/blog-fixture/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/blog\/blog-fixture\.png$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '');
  expect(ld['@type']).toBe('BlogPosting');
  expect(ld.author.name).toBe('ATKD Coding');
});

test('robots, sitemap and security.txt are served', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/en/blog/');
  expect(sitemap).not.toContain('404');
  const sec = await (await request.get('/.well-known/security.txt')).text();
  expect(sec).toMatch(/^Contact: mailto:hi@atkd1890\.me$/m);
  expect(new Date(sec.match(/^Expires: (.+)$/m)?.[1] ?? 0).getTime()).toBeGreaterThan(Date.now());
});
