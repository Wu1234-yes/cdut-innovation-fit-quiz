import { defineConfig, devices } from '@playwright/test'

const browserChannel = process.env.CI
  ? undefined
  : process.env.PLAYWRIGHT_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined)

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4180',
    browserName: 'chromium',
    channel: browserChannel,
  },
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 4180',
    url: 'http://127.0.0.1:4180',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'mobile-390x844',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'tablet-768x1024',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1024x768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
    {
      name: 'desktop-1280x720',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'desktop-1440x900',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
})
