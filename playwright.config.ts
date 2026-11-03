import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const bun = join(process.env.HOME ?? '', '.bun/bin/bun');

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
  webServer: {
    command: `${bun} scripts/serve.ts`,
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
