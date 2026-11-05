import { expect, test } from '@playwright/test';

test('the contribution graph opens on the newest weeks', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const scroll = page.locator('.contrib-scroll');
  const first = page.locator('.contrib-grid .contrib-cell').first();
  const last = page.locator('.contrib-grid .contrib-cell').last();
  const port = await scroll.boundingBox();
  const oldest = await first.boundingBox();
  const newest = await last.boundingBox();
  expect(port).not.toBeNull();
  expect(oldest).not.toBeNull();
  expect(newest).not.toBeNull();
  if (!port || !oldest || !newest) return;
  expect(newest.x).toBeGreaterThanOrEqual(port.x - 1);
  expect(newest.x + newest.width).toBeLessThanOrEqual(port.x + port.width + 1);
  expect(oldest.x + oldest.width).toBeLessThan(port.x);
});

for (const kind of ['zero', 'one', 'positive']) {
  test(`the ${kind} contribution tooltip shows the actual count and short date`, async ({
    page,
  }) => {
    await page.goto('/');
    const cell = page
      .locator(
        kind === 'zero'
          ? '.contrib-grid [data-count="0"]'
          : kind === 'one'
            ? '.contrib-grid [data-count="1"]'
            : '.contrib-grid [data-count]:not([data-count="0"]):not([data-count="1"])',
      )
      .last();
    await cell.scrollIntoViewIfNeeded();
    const date = await cell.getAttribute('data-date');
    const count = Number(await cell.getAttribute('data-count'));
    const label = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));
    await cell.hover();
    await expect(page.locator('[data-slot="contribution-tip"]')).toHaveText(
      `${count === 0 ? 'No' : count} ${count === 1 ? 'contribution' : 'contributions'} on ${label}`,
    );
  });
}

test('the mobile legend stays beside the contribution summary', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  const summary = await page.locator('.contrib-head > p').first().boundingBox();
  const legend = await page.locator('.contrib-legend').boundingBox();
  expect(summary).not.toBeNull();
  expect(legend).not.toBeNull();
  expect(legend!.x).toBeGreaterThanOrEqual(summary!.x + summary!.width);
  expect(legend!.y + legend!.height / 2).toBeCloseTo(summary!.y + summary!.height / 2, 0);
});
