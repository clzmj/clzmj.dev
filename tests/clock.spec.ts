import { expect, test } from '@playwright/test';

for (const zone of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
  test.describe(zone, () => {
    test.use({ timezoneId: zone });
    test('seconds follow Mexico City and align to the next boundary', async ({ page }) => {
      await page.clock.install({ time: new Date('2026-11-03T04:12:33Z') });
      await page.clock.pauseAt(new Date('2026-11-03T04:12:34.250Z'));
      await page.goto('/');
      const clock = page.locator('time.footer-time');
      await expect(clock).toHaveText('22:12:34 in Mexico City');
      await expect(clock).not.toHaveAttribute('aria-live');
      await page.clock.runFor(749);
      await expect(clock).toHaveText('22:12:34 in Mexico City');
      await page.clock.runFor(1);
      await expect(clock).toHaveText('22:12:35 in Mexico City');
      await page.clock.runFor(1000);
      await expect(clock).toHaveText('22:12:36 in Mexico City');
      expect(
        await clock.evaluate((element) => getComputedStyle(element).fontVariantNumeric),
      ).toContain('tabular-nums');
    });
  });
}

test('the clock pauses while hidden and immediately resyncs when visible', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T04:12:33Z') });
  await page.clock.pauseAt(new Date('2026-11-03T04:12:34.250Z'));
  await page.goto('/');
  const clock = page.locator('time.footer-time');
  await expect(clock).toHaveText('22:12:34 in Mexico City');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.runFor(5000);
  await expect(clock).toHaveText('22:12:34 in Mexico City');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(clock).toHaveText('22:12:39 in Mexico City');
  await page.clock.runFor(750);
  await expect(clock).toHaveText('22:12:40 in Mexico City');
});

test('static HTML exposes a stable eight-character placeholder without aria-live', async ({
  browser,
}) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto('http://127.0.0.1:3000');
    await expect(page.locator('time.footer-time')).toHaveText('--:--:-- in Mexico City');
    await expect(page.locator('time.footer-time')).not.toHaveAttribute('aria-live');
  } finally {
    await page.close();
  }
});
