import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

test('the home export has no removed publishing routes, assets, or links', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /^(Writings|Events)$/ })).toHaveCount(0);
  await expect(page.locator('a[href*="/writings"], a[href*="/events"], .news-pill')).toHaveCount(0);
  for (const path of [
    '/writings',
    '/events',
    '/writings/markdown-demo',
    '/events/example-evening',
    '/writings.md',
    '/events.md',
    '/rss.xml',
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  for (const name of [
    'writings',
    'events',
    'writings.html',
    'events.html',
    'writings.txt',
    'events.txt',
    'rss.xml',
    'diagrams',
  ]) {
    expect(existsSync(join(process.cwd(), 'out', name)), name).toBe(false);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(1);
  expect(sitemap).toContain('<loc>https://clzmj.dev</loc>');
  expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}T/);
  for (const path of ['/index.md', '/llms.txt', '/llms-full.txt']) {
    const text = await (await request.get(path)).text();
    expect(text).not.toMatch(/writings|events|markdown-demo|rss\.xml/i);
  }
});
