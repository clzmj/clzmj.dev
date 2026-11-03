import { expect, test } from '@playwright/test';

import photos from '../lib/elsewhere.json';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
});

test.use({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true });

test('a separate dialog photo opens with caption and sr-only controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: photos[0].caption, exact: true }).tap();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName(photos[0].caption);
  await expect(dialog.locator('img')).toHaveAttribute('alt', photos[0].alt);
  for (const name of ['Close photo', 'Previous photo', 'Next photo'])
    await expect(dialog.getByRole('button', { name })).toHaveClass('sr-only');
  await dialog.getByRole('button', { name: 'Close photo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
});

test('the dialog shares its photo id while grid cards keep their original boxes and styles', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForTimeout(1600);
  await page.locator('.fan-card').nth(10).scrollIntoViewIfNeeded();
  const before = await page.locator('.fan-card').evaluateAll((cards) =>
    cards.map((card) => ({
      id: card.getAttribute('data-photo-id'),
      rect: card.getBoundingClientRect().toJSON(),
      style: card.getAttribute('style'),
    })),
  );
  const card = page.locator('.fan-card').nth(10);
  const id = await card.getAttribute('data-photo-id');
  await card.tap();
  await expect(page.getByRole('dialog').locator('.photo-frame')).toHaveAttribute(
    'data-shared-photo',
    id!,
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
  const after = await page.locator('.fan-card').evaluateAll((cards) =>
    cards.map((card) => ({
      id: card.getAttribute('data-photo-id'),
      rect: card.getBoundingClientRect().toJSON(),
      style: card.getAttribute('style'),
    })),
  );
  for (const [i, entry] of after.entries()) {
    expect(entry.style).toBe(before[i].style);
    for (const axis of ['x', 'y', 'width', 'height'] as const)
      expect(entry.rect[axis]).toBeCloseTo(before[i].rect[axis], 1);
  }
  await expect(card).toBeFocused();
});

test('reduced motion uses a plain fade without shared projection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.getByRole('button', { name: photos[6].caption, exact: true });
  await card.tap();
  const frame = page.getByRole('dialog').locator('.photo-frame');
  await expect(frame).toHaveCSS('transform', 'none');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
  await expect(card).toBeFocused();
});

test('the backdrop fades and is fully unmounted after the photo closes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: photos[10].caption, exact: true }).tap();
  await page.waitForTimeout(450);
  await page.touchscreen.tap(8, 8);
  await expect
    .poll(async () => {
      const overlay = page.locator('[data-slot="dialog-overlay"]');
      if (!(await overlay.count())) return false;
      const opacity = await overlay.evaluate((element) =>
        Number(getComputedStyle(element).opacity),
      );
      return opacity > 0 && opacity < 1;
    })
    .toBe(true);
  await expect(page.locator('[data-slot="dialog-portal"]')).toHaveCount(0);
});

test('all 17 photos retain order, caption alt text, dimensions, lazy loading, and 4:5 frames', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('.fan-card');
  await expect(cards).toHaveCount(17);
  expect(
    await page
      .locator('.photo-piste')
      .evaluateAll((rows) => rows.map((row) => row.querySelectorAll('.fan-card').length)),
  ).toEqual([7, 7, 3]);
  for (const [index, photo] of photos.entries()) {
    const card = cards.nth(index);
    const image = card.locator('img');
    await expect(card).toHaveAccessibleName(photo.caption);
    await expect(image).toHaveAttribute('alt', photo.alt);
    await expect(image).toHaveAttribute('width', String(photo.width));
    await expect(image).toHaveAttribute('height', String(photo.height));
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(image).toHaveAttribute(
      'srcset',
      photo.sizes.map((s) => `/elsewhere/${s.file} ${s.width}w`).join(', '),
    );
    expect(await image.evaluate((img) => getComputedStyle(img).objectPosition)).toBe(
      photo.objectPosition,
    );
    expect(
      await card.locator('.photo-image').evaluate((frame) => getComputedStyle(frame).aspectRatio),
    ).toBe('4 / 5');
  }
});

test('keyboard focus reaches every visible Mono caption in order', async ({
  page,
  browserName,
}) => {
  await page.goto('/');
  const cards = page.locator('.fan-card');
  await cards.first().focus();
  for (const [index, photo] of photos.entries()) {
    if (index) await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    await expect(cards.nth(index)).toBeFocused();
    const caption = page
      .locator('.photo-fan-row')
      .nth(Math.floor(index / 7))
      .locator('.fan-caption:visible');
    await expect(caption).toHaveText(photo.caption);
    expect(await caption.evaluate((element) => getComputedStyle(element).fontFamily)).toMatch(
      /Geist.*Mono/i,
    );
    expect(await caption.evaluate((element) => getComputedStyle(element).fontSize)).toBe('12px');
  }
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').locator('figcaption')).toHaveText(photos[16].caption);
});

test('phones choose the small static variant and the placeholder fades without resizing the frame', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/elsewhere/*.webp', async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const frame = page.locator('.fan-card .photo-image').first();
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toHaveAttribute('data-loaded', 'false');
    expect(await frame.locator('img').evaluate((image) => getComputedStyle(image).opacity)).toBe(
      '0',
    );
    expect(await frame.evaluate((element) => getComputedStyle(element).backgroundColor)).toMatch(
      /^rgb\(/,
    );
    const size = await frame.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));
    release();
    await expect(frame).toHaveAttribute('data-loaded', 'true');
    await expect(frame.locator('img')).toHaveCSS('opacity', '1');
    expect(
      await frame.locator('img').evaluate((image) => (image as HTMLImageElement).currentSrc),
    ).toContain(`/${photos[0].sizes[0].file}`);
    expect(
      await frame.locator('img').evaluate((image) => getComputedStyle(image).transitionDuration),
    ).toBe('0.15s');
    expect(
      await frame.evaluate((element) => ({
        width: element.clientWidth,
        height: element.clientHeight,
      })),
    ).toEqual(size);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await frame.locator('img').evaluate((image) => getComputedStyle(image).transitionDuration),
    ).toBe('0s');
  } finally {
    release();
  }
});

test.describe('retina photo sizing', () => {
  test.use({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 });
  test('the open viewer requests a larger existing variant on a 2x phone', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: photos[0].caption, exact: true }).click();
    const image = page.getByRole('dialog').locator('img');
    await expect
      .poll(() => image.evaluate((img) => (img as HTMLImageElement).currentSrc))
      .toContain(photos[0].src);
    expect(photos[0].width).toBeGreaterThan(640);
  });
});
