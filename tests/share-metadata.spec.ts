import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const title = 'Carlos Lezama · ML & Software Engineer';
const description =
  'ML and software engineer at Zillow, based in Mexico City. Previously data and ML at DD360, RappiCard and DiDi Food.';
const imageVersion = createHash('sha256')
  .update(readFileSync('out/opengraph-image.jpg'))
  .digest('hex')
  .slice(0, 8);
const imageUrl = `https://clzmj.dev/opengraph-image.jpg?v=${imageVersion}`;
const imageAlt =
  'Carlos Lezama, ML & Software Engineer: pixel-art Bingo next to a fan of four travel photos';

test('homepage exposes the expected social and canonical metadata', async ({ page }) => {
  await page.goto('/');
  const meta = async (selector: string, attribute: 'content' | 'href' = 'content') =>
    page.locator(selector).getAttribute(attribute);

  await expect(page).toHaveTitle(title);
  expect(await meta('meta[name="description"]')).toBe(description);
  expect(await meta('meta[property="og:description"]')).toBe(description);
  expect(await meta('meta[name="twitter:description"]')).toBe(description);

  expect(await meta('meta[property="og:type"]')).toBe('website');
  expect(await meta('meta[property="og:site_name"]')).toBe('clzmj.dev');
  expect(await meta('meta[property="og:locale"]')).toBe('en_US');
  expect(await meta('meta[property="og:url"]')).toBe('https://clzmj.dev');
  expect(await meta('link[rel="canonical"]', 'href')).toBe('https://clzmj.dev');

  expect(await meta('meta[property="og:title"]')).toBe(title);
  expect(await meta('meta[name="twitter:title"]')).toBe(title);
  expect(await meta('meta[property="og:image"]')).toBe(imageUrl);
  expect(await meta('meta[property="og:image:width"]')).toBe('1200');
  expect(await meta('meta[property="og:image:height"]')).toBe('630');
  expect(await meta('meta[property="og:image:alt"]')).toBe(imageAlt);
  expect(await meta('meta[name="twitter:image"]')).toBe(imageUrl);
  expect(await meta('meta[name="twitter:image:alt"]')).toBe(imageAlt);
  expect(await meta('meta[name="twitter:image:width"]')).toBe('1200');
  expect(await meta('meta[name="twitter:image:height"]')).toBe('630');
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
  expect(await meta('meta[name="twitter:creator"]')).toBe('@clzmj');

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .evaluate((node) => JSON.parse(node.textContent ?? '{}'));
  const person = jsonLd['@graph'].find((entry: { '@type': string }) => entry['@type'] === 'Person');
  expect(person).toMatchObject({
    '@type': 'Person',
    jobTitle: 'ML & Software Engineer',
    url: 'https://clzmj.dev',
    sameAs: [
      'https://x.com/clzmj',
      'https://www.instagram.com/clzmj/',
      'https://www.linkedin.com/in/clzmj/',
      'https://github.com/clzmj',
    ],
  });

  const imageResponse = await page.request.get(`/opengraph-image.jpg?v=${imageVersion}`);
  expect(imageResponse.ok()).toBe(true);
  expect(imageResponse.headers()['content-type']).toContain('image/jpeg');
  const imageBytes = await imageResponse.body();
  expect(imageBytes.byteLength).toBeLessThan(300_000);

  const dimensions = await page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, '/opengraph-image.jpg');
  expect(dimensions).toEqual({ width: 1200, height: 630 });

  const legacyImage = await page.request.get('/og/home.png');
  expect(legacyImage.status()).toBe(404);
});
