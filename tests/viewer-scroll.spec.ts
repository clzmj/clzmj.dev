import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
});

async function snapshot(page: Page) {
  return page.evaluate(() => ({
    body: document.body.style.cssText,
    html: document.documentElement.style.cssText,
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    x: scrollX,
    y: scrollY,
    cards: [...document.querySelectorAll('.fan-card')].map((card) => ({
      style: card.getAttribute('style'),
      rect: card.getBoundingClientRect().toJSON(),
      inert: card.getAttribute('inert'),
      hidden: card.getAttribute('aria-hidden'),
    })),
  }));
}
async function open(page: Page) {
  const card = page.locator('.fan-card').first();
  await card.scrollIntoViewIfNeeded();
  const before = await snapshot(page);
  await card.tap();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return { before, card, dialog };
}
async function restored(page: Page, before: Awaited<ReturnType<typeof snapshot>>) {
  await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect
    .poll(async () => {
      const state = await snapshot(page);
      return {
        body: state.body,
        html: state.html,
        bodyOverflow: state.bodyOverflow,
        htmlOverflow: state.htmlOverflow,
        x: state.x,
        y: state.y,
      };
    })
    .toEqual({
      body: before.body,
      html: before.html,
      bodyOverflow: before.bodyOverflow,
      htmlOverflow: before.htmlOverflow,
      x: before.x,
      y: before.y,
    });
  const after = await snapshot(page);
  for (const [index, card] of after.cards.entries()) {
    expect(card.style).toBe(before.cards[index].style);
    expect(card.inert).toBe(before.cards[index].inert);
    expect(card.hidden).toBe(before.cards[index].hidden);
    for (const axis of ['x', 'y', 'width', 'height'] as const)
      expect(card.rect[axis]).toBeCloseTo(before.cards[index].rect[axis], 1);
  }
  expect(
    await page.evaluate(() => {
      const element = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      return (
        !!element &&
        !element.closest(
          '[data-slot="dialog-portal"], [role="dialog"], [data-slot="dialog-overlay"]',
        )
      );
    }),
  ).toBe(true);
  await expect
    .poll(() =>
      page
        .locator('.photo-shared')
        .evaluateAll((photos) =>
          photos.every(
            (photo) =>
              !(photo as HTMLElement).style.transform ||
              (photo as HTMLElement).style.transform === 'none',
          ),
        ),
    )
    .toBe(true);
  await expect(page.locator('.shell')).not.toHaveAttribute('inert');
  await expect(page.locator('.shell')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.fan-card').first()).toBeFocused();
  await expect.poll(() => page.evaluate(() => history.state?.photoViewer)).toBeFalsy();
  await page.evaluate(() => scrollBy(0, 400));
  await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(before.y);
}

for (const method of ['sr-only', 'backdrop', 'Escape', 'back', 'swipe']) {
  test(`${method} closes fully and restores the page and every tile`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(1600);
    const { before, dialog } = await open(page);
    if (method === 'sr-only') {
      const close = dialog.getByRole('button', { name: 'Close photo' });
      await expect(close).toHaveClass('sr-only');
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
    await restored(page, before);
  });
}

test('outside-close, scroll, and tapping another photo works three consecutive times', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(1600);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => scrollTo(0, 0));
    const card = page.locator('.fan-card').nth(i);
    await card.scrollIntoViewIfNeeded();
    const before = await snapshot(page);
    await card.tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').locator('.photo-image').tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    const box = await page.getByRole('dialog').locator('.photo-frame').boundingBox();
    expect(box!.width).toBeLessThanOrEqual(393 * 0.9 + 1);
    expect(box!.height).toBeLessThanOrEqual(852 * 0.85 + 1);
    await page.touchscreen.tap(8, 8);
    await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
    const after = await snapshot(page);
    expect(after.body).toBe(before.body);
    expect(after.html).toBe(before.html);
    expect(after.bodyOverflow).toBe(before.bodyOverflow);
    expect(after.htmlOverflow).toBe(before.htmlOverflow);
    expect(after.y).toBe(before.y);
    for (const [n, entry] of after.cards.entries())
      for (const axis of ['x', 'y', 'width', 'height'] as const)
        expect(entry.rect[axis]).toBeCloseTo(before.cards[n].rect[axis], 1);
    expect(
      await page.evaluate(
        () =>
          !document
            .elementFromPoint(innerWidth / 2, innerHeight / 2)
            ?.closest('[data-slot="dialog-portal"]'),
      ),
    ).toBe(true);
    await page.evaluate(() => scrollBy(0, 400));
    await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(before.y);
  }
});
