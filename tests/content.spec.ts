import { expect, test } from '@playwright/test';

import { shotPages } from './viewports';

test('agent files and the only public email', async ({ request }) => {
  const paths = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/index.md'];
  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), path).toBeTruthy();
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('GPTBot');
  expect(robots).toContain('ClaudeBot');
  expect(robots).toContain('Google-Extended');
  expect(robots).toContain('Allow: /');
  for (const shotPage of shotPages) {
    const html = await (await request.get(shotPage.path)).text();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('https://clzmj.dev');
    expect(html).toContain('application/ld+json');
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
  await expect(line).toContainText('in Mexico City');
  await expect(page.locator('.role')).toHaveText('ML & Software Engineer');
  await expect(page.getByRole('region', { name: 'Photos' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
});

for (const theme of ['auto', 'light', 'dark']) {
  test(`the 393px footer time line stays intact beneath the icons in ${theme} mode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.clock.install({ time: new Date('2026-06-15T11:59:00-06:00') });
    await page.addInitScript((choice) => localStorage.setItem('theme', choice), theme);
    await page.goto('/');
    await expect(page.locator('.footer-time')).toContainText('11:59');
    const metrics = await page.locator('.footer').evaluate((footer) => {
      const time = footer.querySelector('.footer-time')!;
      const range = document.createRange();
      range.selectNodeContents(time);
      const rect = footer.getBoundingClientRect();
      return {
        height: footer.querySelector('.footer-clock')!.getBoundingClientRect().height,
        lines: range.getClientRects().length,
        right: footer.querySelector('.footer-actions')!.getBoundingClientRect().right,
        edge: rect.right,
      };
    });
    expect(metrics.lines).toBe(1);
    expect(metrics.height).toBeCloseTo(19.25, 1);
    expect(metrics.right).toBeLessThanOrEqual(metrics.edge + 1);
    await expect(page.getByRole('button', { name: /Theme:/ })).toBeVisible();
  });
}

test('inline avatars keep every bio line at 26px', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  const heights = await page
    .locator('.bio p')
    .evaluateAll((paragraphs) => paragraphs.map((p) => p.getBoundingClientRect().height));
  for (const height of heights) expect(height / 26).toBeCloseTo(Math.round(height / 26), 2);
});

for (const time of ['00:00', '09:05', '22:12']) {
  test(`the footer displays ${time} in 24-hour time`, async ({ page }) => {
    await page.clock.install({ time: new Date(`2026-06-15T${time}:00-06:00`) });
    await page.goto('/');
    await expect(page.locator('.footer-time')).toHaveText(`${time}:00 in Mexico City`);
    await expect(page.locator('.footer-time')).not.toContainText(/am|pm/i);
  });
}

test('location labels use Mexico City without a country suffix', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.footer-time')).toContainText('in Mexico City');
  await expect(page.locator('body')).not.toContainText('Mexico City, Mexico');
  for (const path of ['/', '/index.md', '/llms.txt', '/llms-full.txt']) {
    expect(await (await request.get(path)).text()).not.toContain('Mexico City, Mexico');
  }
});

test('the footer uses Geist Mono and tabular digits for its complete clock label', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-06-15T22:12:00-06:00') });
  await page.goto('/');
  await expect(page.locator('.footer-time')).toHaveText('22:12:00 in Mexico City');
  const font = await page.locator('.footer-time').evaluate((element) => {
    const style = getComputedStyle(element);
    return { family: style.fontFamily, numerals: style.fontVariantNumeric };
  });
  expect(font.family).toMatch(/Geist.*Mono/i);
  expect(font.numerals).toContain('tabular-nums');
  await expect(page.locator('.news-pill')).toHaveCount(0);
});
