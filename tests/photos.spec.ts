import { expect, test } from '@playwright/test';

import photos from '../lib/elsewhere.json';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999;
  });
});

test('a fan photo opens by itself', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: photos[0].caption, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: photos[0].caption, exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('alt', photos[0].caption);
  await expect(dialog.locator('figcaption')).toHaveText(photos[0].caption);
  await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /photo \d/ })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close photo' }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
});

test('seventeen wrapped fan cards animate from the selected card and back on Escape', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('.fan-card');
  await expect(cards).toHaveCount(17);
  const card = page.locator('.fan-card').nth(10);
  await card.click();
  const frame = page.locator('.photo-frame');
  const opening = await frame.evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    return {
      duration: animation.effect!.getTiming().duration,
      rect: element.getBoundingClientRect().toJSON(),
    };
  });
  const source = await card.boundingBox();
  expect(opening.duration).toBeGreaterThan(0);
  expect(opening.rect.x + opening.rect.width / 2).toBeCloseTo(source!.x + source!.width / 2, 0);
  expect(opening.rect.y + opening.rect.height / 2).toBeCloseTo(source!.y + source!.height / 2, 0);
  await frame.evaluate((element) => element.getAnimations()[0].finish());
  await page.keyboard.press('Escape');
  const closing = await frame.evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = Number(animation.effect!.getTiming().duration);
    return element.getBoundingClientRect().toJSON();
  });
  const destination = await card.boundingBox();
  expect(closing.x + closing.width / 2).toBeCloseTo(destination!.x + destination!.width / 2, 0);
  expect(closing.y + closing.height / 2).toBeCloseTo(destination!.y + destination!.height / 2, 0);
  await frame.evaluate((element) => element.getAnimations()[0].finish());
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeVisible();
  await expect(card).toBeFocused();
});

test('reduced motion opens and closes immediately without a shared-element animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const card = page.getByRole('button', { name: photos[6].caption, exact: true });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(
    await page.locator('.photo-frame').evaluate((element) => element.getAnimations().length),
  ).toBe(0);
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => getComputedStyle(element, '::backdrop').transitionDuration),
  ).toBe('0s');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(card).toBeFocused();
});

test('the backdrop fades with the card and keeps the dialog mounted until transitionend', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: photos[10].caption, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('.photo-frame').evaluate((element) => element.getAnimations()[0].finish());
  await dialog.getByRole('button', { name: 'Close photo' }).focus();
  await page.keyboard.press('Enter');
  const timing = await dialog.evaluate((element) => {
    const fade = element
      .getAnimations({ subtree: true })
      .find(
        (animation) =>
          animation instanceof CSSTransition && animation.transitionProperty === 'opacity',
      )!;
    const card = element.querySelector('.photo-frame')!.getAnimations()[0];
    fade.pause();
    card.pause();
    fade.currentTime = 160;
    card.currentTime = 160;
    return {
      fadeDuration: fade.effect!.getTiming().duration,
      cardDuration: card.effect!.getTiming().duration,
      fadeEasing: fade.effect!.getTiming().easing,
      cardEasing: card.effect!.getTiming().easing,
      opacity: Number(getComputedStyle(element, '::backdrop').opacity),
    };
  });
  expect(timing.fadeDuration).toBe(320);
  expect(timing.fadeDuration).toBe(timing.cardDuration);
  expect(timing.fadeEasing).toBe(timing.cardEasing);
  expect(timing.opacity).toBeGreaterThan(0);
  expect(timing.opacity).toBeLessThan(1);
  await dialog.locator('.photo-frame').evaluate((element) => element.getAnimations()[0].finish());
  await expect(dialog).toBeVisible();
  await dialog.evaluate((element) => {
    element
      .getAnimations({ subtree: true })
      .find(
        (animation) =>
          animation instanceof CSSTransition && animation.transitionProperty === 'opacity',
      )!
      .finish();
  });
  await expect(dialog).toHaveCount(0);
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
    await expect(image).toHaveAttribute('alt', photo.caption);
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

test('keyboard focus reaches every visible Mono caption in order', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.fan-card');
  await cards.first().focus();
  for (const [index, photo] of photos.entries()) {
    if (index) await page.keyboard.press('Tab');
    await expect(cards.nth(index)).toBeFocused();
    const caption = page
      .locator('.photo-fan-row')
      .nth(Math.floor(index / 7))
      .locator('.fan-caption');
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
    await page.goto('/');
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
