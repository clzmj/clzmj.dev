import { expect, test } from '@playwright/test';

test('a fan photo opens by itself', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Window' }).click();
  const dialog = page.getByRole('dialog', { name: 'Window' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('alt', /pale window/);
  await expect(dialog.locator('figcaption')).toHaveText('Window');
  await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /photo \d/ })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close photo' }).click();
  await expect(dialog).toHaveCount(0);
});
