import { expect, test } from '@playwright/test';

for (const path of ['/', '/writings']) {
  test(`${path} fits the two-word writing title and short date at 393px`, async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto(path);
    const row = page.locator('.row[href="/writings/markdown-demo"]');
    await expect(row.locator('.writing-date-short')).toBeVisible();
    await expect(row.locator('.writing-date-short')).toHaveText('Nov 2026');
    await expect(row.locator('.writing-date-full')).toBeHidden();
    await expect(row.locator('.row-title')).toHaveText('Markdown demo');
    const fits = await row
      .locator('.row-title')
      .evaluate((element) => element.scrollWidth <= element.clientWidth);
    expect(fits).toBe(true);
    const badgeWidth = await row
      .locator('.badge')
      .evaluate((element) => element.getBoundingClientRect().width);
    await row
      .locator('.row-title')
      .evaluate(
        (element) =>
          (element.textContent = 'A much longer writing title that must truncate gracefully'),
      );
    expect(
      await row
        .locator('.row-title')
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true);
    expect(
      await row.locator('.badge').evaluate((element) => element.getBoundingClientRect().width),
    ).toBe(badgeWidth);
  });
}

test('writing dates keep their full format from 480px', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 852 });
  await page.goto('/');
  const row = page.locator('.row[href="/writings/markdown-demo"]');
  await expect(row.locator('.writing-date-full')).toBeVisible();
  await expect(row.locator('.writing-date-full')).toHaveText('November 2026');
  await expect(row.locator('.writing-date-short')).toBeHidden();
});
