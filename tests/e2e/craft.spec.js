import { test, expect } from '@playwright/test';

const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.controls')).toBeVisible();
});

test('⌘K palette filters, navigates with keys and closes', async ({ page }) => {
  await page.keyboard.press(`${mod}+k`);
  const dialog = page.locator('#palette');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#pal-q')).toBeFocused();
  await page.keyboard.type('desk');
  await expect(page.locator('#pal-list [role="option"]').first()).toHaveText(/signal-desk/);
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#work-signal-desk$/);
});

test('"/" opens the palette and Escape closes it', async ({ page }) => {
  await page.keyboard.press('/');
  await expect(page.locator('#palette')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#palette')).toBeHidden();
});

test('shortcuts: ? opens help, g s jumps to Signals, ignored while typing', async ({ page }) => {
  await page.keyboard.press('?');
  await expect(page.locator('#shortcuts')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('g');
  await page.keyboard.press('s');
  await expect(page).toHaveURL(/#signals$/);

  await page.keyboard.press('/');
  await page.keyboard.type('g s ?');
  await expect(page.locator('#shortcuts')).toBeHidden();
  await expect(page.locator('#pal-q')).toHaveValue('g s ?');
});

test('theme toggle persists across reloads without a flash', async ({ page }) => {
  const before = await page.evaluate(() => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  await page.locator('[data-theme-toggle]').click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  await page.reload();
  // Applied by the inline head script, before the module runs.
  const atLoad = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(atLoad).toBe(after);
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-label', `Switch to ${before} theme`);
});

test('sound is off by default and its state is announced', async ({ page }) => {
  const btn = page.locator('[data-sound-toggle]');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('sound'))).toBeNull();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
});
