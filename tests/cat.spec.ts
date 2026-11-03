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

test('the cat is decorative', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.cat-anchor')).toHaveAttribute('aria-hidden', 'true');
});
