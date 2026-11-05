import { expect, test } from '@playwright/test';

import photos from '../lib/elsewhere.json';

test('every visible Elsewhere caption is at most five words and keeps a distinct descriptive alt', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#elsewhere-shuffle-style')).toHaveCount(0);
  for (const photo of photos) {
    const card = page.locator(`.fan-card[data-photo-id="${photo.id}"]`);
    await card.focus();
    const caption = page.locator('.fan-caption:visible');
    await expect(caption).toHaveText(photo.caption);
    expect((await caption.innerText()).trim().split(/\s+/).length).toBeLessThanOrEqual(5);
    expect(photo.alt).not.toBe(photo.caption);
    await expect(card.locator('img')).toHaveAttribute('alt', photo.alt);
  }
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('figcaption')).toHaveText(photos.at(-1)!.caption);
  await expect(dialog.locator('img')).toHaveAttribute('alt', photos.at(-1)!.alt);
});
