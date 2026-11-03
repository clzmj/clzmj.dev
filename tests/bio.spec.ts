import { expect, test } from '@playwright/test';
const paragraphs = [
  "I'm Carlos Lezama. I live in Mexico City and work at Zillow as a software engineer.",
  "Before that, I scraped half of Mexico's real estate for Monopolio at DD360, wrangled credit card data at RappiCard, and crunched food delivery numbers at DiDi Food.",
  'You can reach me at hello@clzmj.dev, or see my code on GitHub.',
];
const companies = [
  ['Zillow', 'https://www.zillow.com/'],
  ['Monopolio', 'https://monopolio.com.mx/'],
  ['DD360', 'https://dd360.mx/'],
  ['RappiCard', 'https://rappicard.mx/'],
  ['DiDi Food', 'https://www.didi-food.com/es-MX/'],
];
test('the approved three-paragraph bio and company text links are exact', async ({
  page,
  request,
}) => {
  await page.goto('/');
  expect(
    await page.locator('.bio p').evaluateAll((elements) =>
      elements.map((p) => {
        const copy = p.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('.visually-hidden').forEach((node) => node.remove());
        return copy.textContent!.replace(/\s+/g, ' ').trim();
      }),
    ),
  ).toEqual(paragraphs);
  for (const [label, href] of companies)
    await expect(page.locator('.bio .bio-text-link').filter({ hasText: label })).toHaveAttribute(
      'href',
      href,
    );
  await expect(page.locator('.bio a[href="mailto:hello@clzmj.dev"]')).toHaveText('hello@clzmj.dev');
  await expect(page.locator('.bio a[href="https://github.com/clzmj"]')).toContainText('GitHub');
  await expect(page.locator('.bio')).not.toContainText(
    /Northwind|Lumen|Harbor|1,200\+|placeholder community/,
  );
  const markdown = await (await request.get('/index.md')).text();
  for (const [, href] of companies) expect(markdown).toContain(href);
  expect(markdown).not.toContain('placeholders');
});
