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
      height: expect.closeTo(20, 1),
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

test('company links keep trailing punctuation on the same mobile line', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto('/');
  const groups = page.locator('.company-link');
  await expect(groups).toHaveCount(5);
  for (const group of await groups.all()) {
    expect(await group.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe('nowrap');
  }
  for (const [name, punctuation] of [
    ['DD360', ','],
    ['RappiCard', ','],
    ['DiDi Food', '.'],
  ]) {
    const group = groups.filter({
      has: page.getByRole('link', { name: `${name} (opens in a new tab)`, exact: true }),
    });
    expect(
      await group.evaluate((element) => {
        const link = element.querySelector('a')!;
        const text = element.lastChild!;
        const range = document.createRange();
        range.selectNodeContents(text);
        return {
          punctuation: text.textContent,
          top: range.getBoundingClientRect().top,
          linkTop: link.getBoundingClientRect().top,
        };
      }),
    ).toEqual({ punctuation, top: expect.any(Number), linkTop: expect.any(Number) });
    const aligned = await group.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element.lastChild!);
      return Math.abs(
        range.getBoundingClientRect().top - element.querySelector('a')!.getBoundingClientRect().top,
      );
    });
    expect(aligned).toBeLessThan(2);
  }
});

test('logo hairlines use 10 percent in light and 20 percent in dark, including auto', async ({
  page,
}) => {
  await page.goto('/');
  for (const [theme, scheme, opacity] of [
    ['light', 'dark', '10%'],
    ['dark', 'light', '20%'],
    ['auto', 'dark', '20%'],
    ['auto', 'light', '10%'],
  ] as const) {
    await page.evaluate((theme) => localStorage.setItem('theme', theme), theme);
    await page.emulateMedia({ colorScheme: scheme });
    await page.reload();
    await expect(page.locator('.theme-toggle')).toHaveAttribute('data-hydrated', 'true');
    const styles = await page
      .locator('.mini-avatar')
      .first()
      .evaluate((link) => ({
        opacity: getComputedStyle(link).getPropertyValue('--logo-hairline-opacity').trim(),
        shadow: getComputedStyle(link, '::after').boxShadow,
      }));
    expect(styles.opacity).toBe(opacity);
    expect(styles.shadow).toContain('inset');
    expect(styles.shadow).toContain(opacity === '20%' ? '0.2' : '0.1');
  }
});
