import { expect, test } from '@playwright/test';

for (const width of [393, 744, 1280]) {
  test(`social cards use local assets and the expected layout at ${width}px`, async ({ page }) => {
    const remoteRequests: string[] = [];
    page.on('request', (request) => {
      if (/https?:\/\/(?:www\.)?(?:x\.com|instagram\.com|pbs\.twimg\.com)/.test(request.url()))
        remoteRequests.push(request.url());
    });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const cards = page.locator('.social-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toHaveAttribute('href', 'https://x.com/clzmj');
    await expect(cards.first().locator('.social-handle')).toHaveText('@clzmj');
    await expect(cards.last().locator('.social-handle')).toHaveText('@TODO');
    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute('target', '_blank');
      await expect(card).toHaveAttribute('rel', 'noopener');
      await expect(card.locator('a')).toHaveCount(0);
      const metrics = await card.evaluate((element) => {
        const banner = element.querySelector('.social-banner')!.getBoundingClientRect();
        const avatar = element.querySelector('.social-avatar')!.getBoundingClientRect();
        const reference = getComputedStyle(document.querySelector('.contrib')!);
        return {
          ratio: banner.width / banner.height,
          overlap: avatar.top < banner.bottom && avatar.bottom > banner.bottom,
          radius: getComputedStyle(element).borderRadius,
          referenceRadius: reference.borderRadius,
          border: getComputedStyle(element).borderTopColor,
          referenceBorder: reference.borderTopColor,
          local: [...element.querySelectorAll('img')].every((img) =>
            img.getAttribute('src')?.startsWith('/social/'),
          ),
        };
      });
      expect(metrics.ratio).toBeCloseTo(3, 1);
      expect(metrics.overlap).toBe(true);
      expect(metrics.radius).toBe(metrics.referenceRadius);
      expect(metrics.border).toBe(metrics.referenceBorder);
      expect(metrics.local).toBe(true);
    }
    const first = await cards.first().boundingBox();
    const last = await cards.last().boundingBox();
    if (width < 640) expect(last!.y).toBeGreaterThan(first!.y + first!.height);
    else {
      expect(last!.y).toBeCloseTo(first!.y, 0);
      expect(last!.x).toBeGreaterThan(first!.x + first!.width);
    }
    const ordering = await page.evaluate(() => ({
      contributions: document.querySelector('.contrib-outer')!.getBoundingClientRect().bottom,
      social: document.querySelector('.social-cards')!.getBoundingClientRect(),
      elsewhere: document
        .querySelector('[aria-labelledby="elsewhere-title"]')!
        .getBoundingClientRect().top,
    }));
    expect(ordering.social.top).toBeGreaterThan(ordering.contributions);
    expect(ordering.elsewhere).toBeGreaterThan(ordering.social.bottom);
    expect(remoteRequests).toEqual([]);
  });
}

test('missing banners and avatars retain neutral, usable cards', async ({ page }) => {
  await page.route('**/social/*', (route) => route.fulfill({ status: 404, body: '' }));
  await page.setViewportSize({ width: 393, height: 1000 });
  await page.goto('/');
  for (const card of await page.locator('.social-card').all()) {
    await expect(card.locator('.social-banner')).toHaveAttribute('data-fallback', 'true');
    await expect(card.locator('img')).toHaveCount(0);
    await expect(card.locator('.social-avatar')).toHaveText('CL');
    await expect(card.locator('.social-name')).toHaveText('Carlos Lezama');
    const banner = await card.locator('.social-banner').boundingBox();
    expect(banner!.width / banner!.height).toBeCloseTo(3, 1);
    expect(
      await card
        .locator('.social-banner')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
  }
});
