import { expect, test } from '@playwright/test';

test('the contribution graph opens on the newest weeks', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const scroll = page.locator('.contrib-scroll');
  const first = page.locator('.contrib-grid .contrib-cell').first();
  const last = page.locator('.contrib-grid .contrib-cell').last();
  const port = await scroll.boundingBox();
  const oldest = await first.boundingBox();
  const newest = await last.boundingBox();
  expect(port).not.toBeNull();
  expect(oldest).not.toBeNull();
  expect(newest).not.toBeNull();
  if (!port || !oldest || !newest) return;
  expect(newest.x).toBeGreaterThanOrEqual(port.x - 1);
  expect(newest.x + newest.width).toBeLessThanOrEqual(port.x + port.width + 1);
  expect(oldest.x + oldest.width).toBeLessThan(port.x);
});
