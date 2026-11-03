import { expect, test } from '@playwright/test';

test('carousel moves with the keyboard and shows focus', async ({ page }) => {
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Photos' });
  const slide = carousel.locator('[aria-hidden="false"] img');
  const first = await slide.getAttribute('alt');
  await carousel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slide).not.toHaveAttribute('alt', first ?? '');
  await page.keyboard.press('ArrowLeft');
  await expect(slide).toHaveAttribute('alt', first ?? '');
  const next = page.getByRole('button', { name: 'Next photo' });
  await next.focus();
  const outline = await next.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe('none');
});

test('carousel does not autoplay under reduced motion', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-06-15T15:00:00-06:00') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Photos' });
  await expect(carousel).toHaveAttribute('data-autoplay', 'off');
  const slide = carousel.locator('[aria-hidden="false"] img');
  const alt = await slide.getAttribute('alt');
  await page.clock.fastForward(20000);
  await expect(slide).toHaveAttribute('alt', alt ?? '');
});
