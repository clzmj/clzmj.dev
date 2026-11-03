import { expect, test } from '@playwright/test';
import { shotPages } from './viewports';

test('agent files, calendar, and the only public email', async ({ request }) => {
  const paths = [
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/rss.xml',
    '/index.md',
    '/writings.md',
    '/writings/markdown-demo.md',
    '/events.md',
    '/events/example-evening.md',
    '/events/example-evening.ics',
  ];
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('GPTBot');
  expect(robots).toContain('ClaudeBot');
  expect(robots).toContain('Google-Extended');
  expect(robots).toContain('Allow: /');
  const ics = await (await request.get('/events/example-evening.ics')).text();
  expect(ics).toContain('BEGIN:VCALENDAR');
  expect(ics).toContain('SUMMARY:Example evening');
  expect(ics).toContain('TZID:America/Mexico_City');
  for (const shotPage of shotPages) {
    const html = await (await request.get(shotPage.path)).text();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('https://clzmj.dev');
    if (
      shotPage.path === '/' ||
      shotPage.path.includes('markdown-demo') ||
      shotPage.path.includes('example')
    ) {
      expect(html).toContain('application/ld+json');
    }
    const emails = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    for (const email of emails) expect(email.toLowerCase()).toBe('hello@clzmj.dev');
    expect(html.toLowerCase()).not.toContain('actual engineering');
    const headings = html.match(/<h1[\s>]/g) ?? [];
    expect(headings).toHaveLength(1);
  }
});

test('the footer clock names Mexico City', async ({ page }) => {
  await page.goto('/');
  const line = page.locator('.footer-clock');
  await expect(line).toContainText('in Mexico City, Mexico');
  await expect(page.locator('.role')).toHaveText('ML & Software Engineer');
  await expect(page.getByRole('region', { name: 'Photos' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
});

test('the demo post renders the supported blocks', async ({ page }) => {
  await page.goto('/writings/markdown-demo');
  await expect(page.locator('h2 a.heading-anchor').first()).toBeAttached();
  await expect(page.locator('h3 a.heading-anchor').first()).toBeAttached();
  await expect(page.locator('input[type="checkbox"]').first()).toBeAttached();
  await expect(page.locator('pre').first()).toBeVisible();
  await expect(page.locator('blockquote')).toBeVisible();
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('.katex').first()).toBeAttached();
  await expect(page.locator('.diagram img')).toBeVisible();
  await expect(page.locator('.callout')).toBeVisible();
  await expect(
    page.locator('figcaption', { hasText: 'A caption under the figure.' }),
  ).toBeVisible();
  await expect(page.locator('sup a, a[href*="fn"]').first()).toBeAttached();
});
