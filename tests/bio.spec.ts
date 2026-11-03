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

test('official company logos keep their order, links, full-bleed circles and overlap', async ({
  page,
}) => {
  await page.goto('/');
  const logos = page.locator('.bio .mini-avatar');
  expect(
    await logos.evaluateAll((links) => links.map((link) => link.getAttribute('aria-label'))),
  ).toEqual(companies.slice(1).map(([name]) => name));
  for (const [index, [name, href]] of companies.slice(1).entries()) {
    const logo = logos.nth(index);
    await expect(logo).toHaveAttribute('href', href);
    await expect(logo).toHaveAttribute('title', name);
    await expect(logo).toHaveAttribute('target', '_blank');
    await expect(logo).toHaveAttribute('rel', 'noopener');
    const metrics = await logo.evaluate((link) => {
      const css = getComputedStyle(link);
      const img = link.querySelector('img')!;
      return {
        width: link.getBoundingClientRect().width,
        height: link.getBoundingClientRect().height,
        margin: css.marginLeft,
        z: css.zIndex,
        fit: getComputedStyle(img).objectFit,
        loaded: img.complete && img.naturalWidth === 64 && img.naturalHeight === 64,
      };
    });
    expect(metrics).toEqual({
      width: 20,
      height: 20,
      margin: index ? '-6px' : '0px',
      z: String(4 - index),
      fit: 'cover',
      loaded: true,
    });
  }
  expect(
    await page
      .locator('.bio p')
      .nth(1)
      .evaluate((p) => p.firstChild?.textContent),
  ).toBe('Before that, ');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await logos.first().evaluate((link) => getComputedStyle(link).transitionDuration)).toBe(
    '0s',
  );
});
