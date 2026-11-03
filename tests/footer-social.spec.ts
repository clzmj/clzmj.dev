import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const profiles = [
  { name: 'X (@clzmj)', href: 'https://x.com/clzmj' },
  { name: 'Instagram (@clzmj)', href: 'https://www.instagram.com/clzmj/' },
  { name: 'LinkedIn (clzmj)', href: 'https://www.linkedin.com/in/clzmj/' },
];

test('cards and assets are gone and Contributions flows directly into Elsewhere', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.social-card, .social-cards, img[src^="/social/"]')).toHaveCount(0);
  for (const directory of ['public/social', 'out/social']) {
    expect(existsSync(join(process.cwd(), directory))).toBe(false);
  }
  expect(
    await page
      .locator('[aria-labelledby="contributions-title"]')
      .evaluate((element) => element.nextElementSibling?.getAttribute('aria-labelledby')),
  ).toBe('elsewhere-title');
});

for (const width of [393, 744, 1280]) {
  test(`footer social links keep their labels, targets, order, and layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const footer = page.locator('footer');
    const links = footer.locator('.footer-social-link');
    await expect(links).toHaveCount(3);
    for (const [index, profile] of profiles.entries()) {
      const link = links.nth(index);
      await expect(link).toHaveAccessibleName(profile.name);
      await expect(link).toHaveAttribute('title', profile.name);
      await expect(link).toHaveAttribute('href', profile.href);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener');
      await expect(link.locator('svg')).toHaveAttribute('width', '16');
      await expect(link.locator('svg')).toHaveAttribute('height', '16');
      const target = await link.evaluate((element) => {
        const hit = getComputedStyle(element, '::before');
        return { width: hit.width, height: hit.height };
      });
      expect(target).toEqual({ width: '44px', height: '44px' });
    }
    expect(
      await footer
        .locator('.footer-actions > *')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('aria-label'))),
    ).toEqual([...profiles.map((profile) => profile.name), 'Theme: auto']);
    const layout = await footer.evaluate((element) => {
      const icons = element.querySelector('.footer-actions')!.getBoundingClientRect();
      const time = element.querySelector('.footer-clock')!.getBoundingClientRect();
      const text = element.querySelector('.footer-time')!.getBoundingClientRect();
      const markdown = element.querySelector('.footer-link')!.getBoundingClientRect();
      const controls = [...element.querySelectorAll('.footer-icon-control')].map((control) =>
        control.getBoundingClientRect(),
      );
      const range = document.createRange();
      range.selectNodeContents(element.querySelector('.footer-time')!);
      return {
        icons: icons.toJSON(),
        time: time.toJSON(),
        text: text.toJSON(),
        markdown: markdown.toJSON(),
        controlGaps: controls.slice(1).map((control, index) => control.x - controls[index].x),
        lines: range.getClientRects().length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(layout.lines).toBe(1);
    expect(layout.overflow).toBeLessThanOrEqual(1);
    for (const gap of layout.controlGaps) expect(gap).toBeGreaterThanOrEqual(44);
    if (width === 393) {
      expect(layout.icons.bottom).toBeLessThan(layout.time.top);
      expect(layout.icons.x).toBeCloseTo(layout.text.x, 0);
      expect(layout.markdown.top).toBeCloseTo(layout.text.top, 0);
    } else {
      expect(layout.icons.top).toBeGreaterThanOrEqual(layout.time.top);
      expect(layout.icons.bottom).toBeLessThanOrEqual(layout.time.bottom + 1);
      expect(layout.markdown.top).toBeCloseTo(layout.text.top, 0);
    }
  });
}

for (const theme of ['light', 'dark']) {
  test(`footer social glyphs use muted color and link color on hover/focus in ${theme} mode`, async ({
    page,
  }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/');
    for (const profile of profiles) {
      const link = page.getByRole('link', { name: profile.name, exact: true });
      await link.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const colors = await link.evaluate((element) => ({
        glyph: getComputedStyle(element.querySelector('svg')!).color,
        muted: getComputedStyle(element.parentElement!).color,
        link: getComputedStyle(document.querySelector('.bio a')!).color,
      }));
      expect(colors.glyph).toBe(colors.muted);
      await link.hover();
      expect(await link.evaluate((element) => getComputedStyle(element).color)).toBe(colors.link);
      await page.mouse.move(0, 0);
      await page.keyboard.press('Tab');
      await link.focus();
      expect(await link.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
      expect(await link.evaluate((element) => getComputedStyle(element).color)).toBe(colors.link);
      await link.blur();
    }
  });
}
