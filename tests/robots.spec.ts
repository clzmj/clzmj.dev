import { expect, test } from '@playwright/test';

for (const path of ['/404.html', '/not-a-real-page', '/writings/empty', '/events/empty']) {
  test(`${path} only carries a noindex robots directive`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(path === '/404.html' ? 200 : 404);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
}

test('the home page remains indexable by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});
