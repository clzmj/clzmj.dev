import { expect, test, type Page } from '@playwright/test';

import photos from '../lib/elsewhere.json';

async function visualOrder(page: Page) {
  return page.locator('.photo-eventail').evaluate((root) => {
    const top = root.getBoundingClientRect().top;
    const pistes = root.querySelectorAll('.photo-piste');
    const pitch = pistes[1].getBoundingClientRect().top - pistes[0].getBoundingClientRect().top;
    return [...root.querySelectorAll('.fan-card')]
      .map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          id: card.getAttribute('data-photo-id'),
          row: Math.floor((rect.top + rect.height / 2 - top) / pitch),
          x: rect.left + rect.width / 2,
        };
      })
      .sort((a, b) => a.row - b.row || a.x - b.x)
      .map((photo) => photo.id);
  });
}

test('inline Fisher–Yates changes visual positions, not React DOM, and taps keep the matching photo', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (/hydrat|did not match|server rendered/i.test(message.text())) warnings.push(message.text());
  });
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const expected = [...photos.slice(1), photos[0]].map((photo) => photo.id);
  expect(await visualOrder(page)).toEqual(expected);
  expect(
    await page
      .locator('.fan-card')
      .evaluateAll((cards) => cards.map((card) => card.getAttribute('data-photo-id'))),
  ).toEqual(photos.map((photo) => photo.id));
  for (const photo of photos) {
    const card = page.locator(`.fan-card[data-photo-id="${photo.id}"]`);
    await expect(card).toHaveAccessibleName(photo.caption);
    await expect(card.locator('img')).toHaveAttribute('alt', photo.caption);
    expect(
      await card.locator('img').evaluate((image) => getComputedStyle(image).objectPosition),
    ).toBe(photo.objectPosition);
    await expect(card.locator('img')).toHaveAttribute('loading', 'lazy');
  }
  const tapped = photos[1];
  await page.locator(`.fan-card[data-photo-id="${tapped.id}"]`).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName(tapped.caption);
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute('alt', tapped.caption);
  expect(warnings).toEqual([]);
});

test('two page loads with different random seeds get different visual orders', async ({
  browser,
}) => {
  const orders = [];
  for (const value of [0, 0.999999]) {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    try {
      await page.addInitScript((random) => {
        Math.random = () => random;
      }, value);
      await page.goto('http://127.0.0.1:3000');
      orders.push(await visualOrder(page));
    } finally {
      await page.close();
    }
  }
  expect(orders[0]).not.toEqual(orders[1]);
  expect(orders[1]).toEqual(photos.map((photo) => photo.id));
});

test('without JavaScript the fan keeps its manifest order', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto('http://127.0.0.1:3000');
    expect(await visualOrder(page)).toEqual(photos.map((photo) => photo.id));
  } finally {
    await page.close();
  }
});
