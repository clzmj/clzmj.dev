import { expect, test } from '@playwright/test';

test('the cat is awake during the day', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T15:00:00-06:00') });
  await page.goto('/');
  const cat = page.locator('#site-cat');
  await expect(cat).toHaveAttribute('data-state', 'awake');
  await expect(page.locator('html')).toHaveAttribute('data-cat', 'awake');
  const position = await cat.evaluate((element) => getComputedStyle(element).backgroundPositionY);
  expect(position === '0px' || position === '0%').toBeTruthy();
  const opacity = await page
    .locator('.cat-z')
    .first()
    .evaluate((element) => getComputedStyle(element).opacity);
  expect(opacity).toBe('0');
});

test('the cat sleeps late at night', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T23:30:00-06:00') });
  await page.goto('/');
  const cat = page.locator('#site-cat');
  await expect(cat).toHaveAttribute('data-state', 'asleep');
  await expect(page.locator('html')).toHaveAttribute('data-cat', 'asleep');
  const position = await cat.evaluate((element) => getComputedStyle(element).backgroundPositionY);
  expect(position).toBe('-64px');
});

test('reduced motion holds the first frame and keeps the z marks still', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T02:15:00-06:00') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cat = page.locator('#site-cat');
  await expect(cat).toHaveAttribute('data-state', 'asleep');
  const catAnimation = await cat.evaluate((element) => getComputedStyle(element).animationName);
  expect(catAnimation).toBe('none');
  const position = await cat.evaluate((element) => getComputedStyle(element).backgroundPositionX);
  expect(position === '0px' || position === '0%').toBeTruthy();
  const zed = page.locator('.cat-z').first();
  await expect(zed).toBeVisible();
  const zAnimation = await zed.evaluate((element) => getComputedStyle(element).animationName);
  expect(zAnimation).toBe('none');
  const opacity = await zed.evaluate((element) => getComputedStyle(element).opacity);
  expect(opacity).toBe('1');
});

test('a page left open switches when the hour crosses into sleep', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T21:30:00-06:00') });
  await page.goto('/');
  const cat = page.locator('#site-cat');
  await expect(cat).toHaveAttribute('data-state', 'awake');
  await page.clock.fastForward(60 * 60 * 1000);
  await expect(cat).toHaveAttribute('data-state', 'asleep');
  await expect(page.locator('html')).toHaveAttribute('data-cat', 'asleep');
});

test('the cat is decorative', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cat-anchor')).toHaveAttribute('aria-hidden', 'true');
});

for (const [hour, state] of [
  ['06:59', 'asleep'],
  ['07:00', 'awake'],
  ['21:59', 'awake'],
  ['22:00', 'asleep'],
]) {
  test(`the cat is ${state} at ${hour} Mexico City time`, async ({ page }) => {
    await page.clock.install({ time: new Date(`2026-06-15T${hour}:00-06:00`) });
    await page.goto('/');
    await expect(page.locator('#site-cat')).toHaveAttribute('data-state', state);
    await expect(page.locator('html')).toHaveAttribute('data-cat', state);
  });
}

test('the sprite uses whole 2x frames and offsets in both themes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
    const sprite = await page.locator('#site-cat').evaluate((element) => {
      const style = getComputedStyle(element);
      const frames = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .find(
          (rule) => rule instanceof CSSKeyframesRule && rule.name === 'cat-frames',
        ) as CSSKeyframesRule;
      return {
        size: style.backgroundSize,
        width: style.width,
        height: style.height,
        image: style.backgroundImage,
        rendering: style.imageRendering,
        last: frames.cssRules[1].cssText,
      };
    });
    expect(sprite.size).toBe('256px 128px');
    expect(sprite.width).toBe('64px');
    expect(sprite.height).toBe('64px');
    expect(sprite.image).toContain(theme === 'light' ? '/cat.png' : '/cat-dark.png');
    expect(sprite.rendering).toBe('pixelated');
    expect(sprite.last).toContain('-256px');
  }
});
