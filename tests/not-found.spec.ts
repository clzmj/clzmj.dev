import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

for (const width of [393, 1280]) {
  test(`the exported 404 uses the shared shell and a running Bingo at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.install({ time: new Date('2026-06-15T23:30:00-06:00') });
    await page.goto('/');
    const homeWidth = await page
      .locator('.shell')
      .evaluate((element) => element.getBoundingClientRect().width);
    const response = await page.goto('/not-a-real-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    await expect(page.getByText('Nothing lives here.', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back home', exact: true })).toHaveAttribute(
      'href',
      '/',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    expect(
      await page.locator('.shell').evaluate((element) => element.getBoundingClientRect().width),
    ).toBe(homeWidth);
    expect(
      await page
        .locator('.not-found-code')
        .evaluate((element) => getComputedStyle(element).fontFamily),
    ).toMatch(/Geist.*Serif/i);
    await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'running');
    expect(
      await page
        .locator('#site-dog')
        .evaluate((element) => getComputedStyle(element).backgroundPositionY),
    ).toBe('-64px');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await page
        .locator('#site-dog')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    await page.clock.fastForward(60_000);
    await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'running');
    await expect(page.locator('footer .footer-time')).toContainText('23:31 in Mexico City');
    await page.getByRole('link', { name: 'Back home', exact: true }).click();
    await expect(page).toHaveURL('/');
  });
}

test('the static bundle and Worker configuration support the custom 404 without a 500 page', () => {
  expect(existsSync(join(process.cwd(), 'out', '404.html'))).toBe(true);
  expect(existsSync(join(process.cwd(), 'out', '500.html'))).toBe(false);
  const config = JSON.parse(
    readFileSync(join(process.cwd(), 'wrangler.jsonc'), 'utf8').replace(/,\s*([}\]])/g, '$1'),
  );
  expect(config.assets.not_found_handling).toBe('404-page');
});
