import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { bunExecutable } from '../lib/runtime';
import { shotPages, viewports } from '../tests/viewports';

const port = 4173;

const server = Bun.spawn([bunExecutable(), 'scripts/serve.ts'], {
  env: { ...process.env, PORT: String(port) },
  stdout: 'inherit',
  stderr: 'inherit',
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  throw new Error('The static server did not start');
}

async function main() {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    for (const theme of ['light', 'dark'] as const) {
      const context = await browser.newContext({
        colorScheme: theme,
      });
      await context.addInitScript((choice) => {
        localStorage.setItem('theme', choice);
      }, theme);
      const page = await context.newPage();
      for (const shotPage of shotPages) {
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(`http://127.0.0.1:${port}${shotPage.path}`, { waitUntil: 'load' });
          const directory = join('shots', shotPage.name, theme);
          mkdirSync(directory, { recursive: true });
          await page.screenshot({
            path: join(directory, `${viewport.name}.png`),
            fullPage: true,
          });
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
}

await main();
