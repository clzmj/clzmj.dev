import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

test('Next metadata serves all supplied Bingo icon sizes and the multi-size ICO', async ({
  page,
  request,
}) => {
  await page.goto('/');
  for (const size of [16, 32, 192, 512]) {
    const link = page.locator(`head link[rel="icon"][sizes="${size}x${size}"][type="image/png"]`);
    await expect(link).toHaveCount(1);
    const response = await request.get((await link.getAttribute('href'))!);
    expect(response.ok()).toBe(true);
    const png = await response.body();
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
    expect(png.equals(readFileSync(`app/icon-${size}.png`))).toBe(true);
  }
  const apple = page.locator('head link[rel="apple-touch-icon"][sizes="180x180"]');
  await expect(apple).toHaveCount(1);
  const applePng = await (await request.get((await apple.getAttribute('href'))!)).body();
  expect(applePng.equals(readFileSync('app/apple-touch-icon.png'))).toBe(true);
  expect(applePng[25]).toBe(2); // RGB: the supplied cream canvas is opaque for iOS.
  const ico = await (await request.get('/favicon.ico')).body();
  expect(ico.equals(readFileSync('app/favicon.ico'))).toBe(true);
  expect(ico.readUInt16LE(4)).toBe(3);
  expect([0, 1, 2].map((i) => ico[6 + i * 16] || 256)).toEqual([16, 32, 48]);
});

test('conventional icon aliases preserve the supplied exact pixels', async ({ request }) => {
  for (const [route, supplied] of [
    ['/icon.png', 'app/icon-32.png'],
    ['/apple-icon.png', 'app/apple-touch-icon.png'],
  ]) {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    expect((await response.body()).equals(readFileSync(supplied))).toBe(true);
  }
});
