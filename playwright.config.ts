import { defineConfig, devices } from '@playwright/test';

import { bunExecutable } from './lib/runtime';

const port = Number(process.env.PORT ?? 3106);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    {
      name: 'webkit-iphone15',
      use: {
        ...devices['iPhone 15'],
        browserName: 'webkit',
        viewport: { width: 393, height: 852 },
      },
    },
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
  },
  webServer: {
    command: `${bunExecutable()} scripts/serve.ts`,
    url: baseURL,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
