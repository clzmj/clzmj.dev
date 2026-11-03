import { execFileSync } from 'node:child_process';

import { expect, test } from '@playwright/test';

import { bunExecutable } from '../lib/runtime';

function list(flag: string): string {
  return execFileSync(bunExecutable(), ['scripts/visible-writings.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, SHOW_DEMO_POSTS: flag },
    encoding: 'utf8',
  });
}

test('the demo post hide flag removes demo posts and the built site shows them', async ({
  page,
}) => {
  const hidden = list('false');
  expect(hidden).toContain('count:0');
  expect(hidden).not.toContain('markdown-demo');
  const shown = list('true');
  expect(shown).toContain('markdown-demo');
  expect(shown).toContain('count:1');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'Writings' })).toBeVisible();
  await page.goto('/writings/markdown-demo');
  await expect(page.getByRole('heading', { level: 1, name: 'Markdown demo' })).toBeVisible();
});

test('the explicit demo build includes the example event and badge', async ({ page, request }) => {
  await page.goto('/events/example-evening');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Example evening');
  await expect(page.locator('h1 .badge')).toHaveText('Example');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/events/example-evening');
});

test('empty sentinel URLs return 404', async ({ request }) => {
  for (const path of [
    '/writings/empty',
    '/writings/empty.html',
    '/events/empty',
    '/events/empty.html',
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});
