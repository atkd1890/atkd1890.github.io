// E2E + accessibility on the built site (_site), served like GitHub Pages.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: { baseURL: 'http://localhost:8090' },
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  webServer: { command: 'node scripts/serve.js', url: 'http://localhost:8090', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    // Other engines run the smoke spec only.
    { name: 'safari-ios', testMatch: /smoke\.spec\.js/, use: { ...devices['iPhone 13'] } },
    {
      name: 'firefox',
      testMatch: /smoke\.spec\.js/,
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 900 } },
    },
  ],
});
