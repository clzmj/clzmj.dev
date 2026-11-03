import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
});

test.use({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true });

async function snapshot(page: Page) {
  return page.evaluate(() => ({
    body: document.body.getAttribute('style'),
    html: document.documentElement.getAttribute('style'),
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    x: scrollX,
    y: scrollY,
  }));
}
async function open(page: Page) {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const card = page.locator('.fan-card').first();
  await card.scrollIntoViewIfNeeded();
  const before = await snapshot(page);
  await card.tap();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  return { before, card, dialog };
}
async function restored(page: Page, before: Awaited<ReturnType<typeof snapshot>>) {
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect.poll(() => snapshot(page)).toEqual(before);
  await expect(page.locator('.fan-card').first()).toBeFocused();
  await expect.poll(() => page.evaluate(() => history.state?.photoViewer)).toBeFalsy();
  await page.evaluate(() => window.scrollBy(0, 400));
  await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(before.y);
}

for (const method of ['sr-only', 'backdrop', 'Escape', 'back', 'swipe', 'native']) {
  test(`${method} close restores inline styles, computed overflow, position and scrolling`, async ({
    page,
  }) => {
    const { before, dialog } = await open(page);
    if (method === 'sr-only') {
      const close = dialog.getByRole('button', { name: 'Close photo' });
      await expect(close).toHaveClass('sr-only');
      expect(await close.evaluate((element) => getComputedStyle(element).clip)).not.toBe('auto');
      await close.focus();
      await page.keyboard.press('Enter');
    }
    if (method === 'backdrop') await page.touchscreen.tap(8, 8);
    if (method === 'Escape') await page.keyboard.press('Escape');
    if (method === 'back') {
      await page.goBack();
      await expect(page).toHaveURL('http://127.0.0.1:3000/');
    }
    if (method === 'swipe') {
      const image = dialog.locator('.photo-image');
      await image.dispatchEvent('pointerdown', {
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        clientX: 190,
        clientY: 250,
      });
      await image.dispatchEvent('pointerup', {
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        clientX: 195,
        clientY: 410,
      });
    }
    if (method === 'native')
      await dialog.evaluate((element) => (element as HTMLDialogElement).close());
    await restored(page, before);
  });
}

test('the capped photo leaves backdrop, image taps do not close, and the hidden close remains keyboard accessible', async ({
  page,
}) => {
  const { before, dialog } = await open(page);
  const image = dialog.locator('.photo-image');
  const rect = await image.boundingBox();
  expect(rect!.width).toBeLessThanOrEqual(393 * 0.9 + 1);
  expect(rect!.height).toBeLessThanOrEqual(852 * 0.85 + 1);
  await expect(dialog).toHaveCSS('overscroll-behavior', 'contain');
  await image.tap();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close photo' }).focus();
  await page.keyboard.press('Enter');
  await restored(page, before);
});

test('closing preserves nonempty html/body styles including overflow priority', async ({
  page,
}) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    document.documentElement.style.setProperty('overflow', 'auto', 'important');
    document.body.style.setProperty('touch-action', 'pan-y');
    document.body.style.setProperty('position', 'relative');
  });
  const card = page.locator('.fan-card').first();
  await card.scrollIntoViewIfNeeded();
  const before = await snapshot(page);
  await card.tap();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await restored(page, before);
});
