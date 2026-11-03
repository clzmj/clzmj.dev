import { expect, test } from '@playwright/test';

test('a stored dark theme is applied before paint', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).toBe('rgb(15, 15, 15)');
});

test('the theme toggle persists across reload', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Theme:/ });
  await expect(toggle).toHaveAttribute('data-hydrated', 'true');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  expect(stored).toBe('light');
});

test('auto follows the system preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'auto');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme-choice', 'auto');
});

test('mobile themes have distinct 16px glyphs and a 44px tap target without growing the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.clock.install({ time: new Date('2026-06-15T11:59:00-06:00') });
  await page.goto('/');
  const toggle = page.locator('.theme-toggle');
  await expect(toggle).toHaveAttribute('data-hydrated', 'true');
  const glyphs = new Set<string>();
  for (const choice of ['auto', 'light', 'dark']) {
    await expect(toggle).toHaveAccessibleName(`Theme: ${choice}`);
    await expect(toggle.locator('.theme-label')).toBeHidden();
    await expect(toggle.locator('svg')).toHaveAttribute('data-theme-icon', choice);
    await toggle.scrollIntoViewIfNeeded();
    const metrics = await toggle.evaluate((button) => {
      const icon = button.querySelector('svg')!;
      const rect = button.getBoundingClientRect();
      const hit = getComputedStyle(button, '::before');
      const footer = button.closest('footer')!;
      return {
        glyph: icon.innerHTML,
        width: icon.getBoundingClientRect().width,
        height: icon.getBoundingClientRect().height,
        color: getComputedStyle(icon).color,
        linkColor: getComputedStyle(footer.querySelector('.footer-link')!).color,
        hitWidth: hit.width,
        hitHeight: hit.height,
        hitX: rect.right + 2 - 44 + 2,
        hitY: rect.y + rect.height / 2 - 20,
        footerHeight: footer.getBoundingClientRect().height,
        right: footer.querySelector('.footer-actions')!.getBoundingClientRect().right,
        edge: footer.getBoundingClientRect().right,
      };
    });
    glyphs.add(metrics.glyph);
    expect(metrics.width).toBe(16);
    expect(metrics.height).toBe(16);
    expect(metrics.color).toBe(metrics.linkColor);
    expect(metrics.hitWidth).toBe('44px');
    expect(metrics.hitHeight).toBe('44px');
    expect(metrics.footerHeight).toBeCloseTo(29, 0);
    expect(metrics.right).toBeLessThanOrEqual(metrics.edge + 1);
    await page.mouse.click(metrics.hitX, metrics.hitY);
  }
  expect(glyphs.size).toBe(3);
  await expect(toggle).toHaveAccessibleName('Theme: auto');
});

test('desktop theme controls retain text labels', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.theme-label')).toBeVisible();
  await expect(page.locator('.theme-icon')).toBeHidden();
});
