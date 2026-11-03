import { expect, test } from '@playwright/test';

test('a fan photo opens by itself', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Window', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Window', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('alt', /pale window/);
  await expect(dialog.locator('figcaption')).toHaveText('Window');
  await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /photo \d/ })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close photo' }).click();
  await expect(dialog).toHaveCount(0);
});

test('seven fan cards animate from the selected card and back on Escape', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.fan-card');
  await expect(cards).toHaveCount(7);
  const card = page.locator('.fan-card[aria-label="Plant"]');
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
  const card = page.getByRole('button', { name: 'Sky', exact: true });
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
  await page.getByRole('button', { name: 'Plant', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.locator('.photo-frame').evaluate((element) => element.getAnimations()[0].finish());
  await dialog.getByRole('button', { name: 'Close photo' }).click();
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
