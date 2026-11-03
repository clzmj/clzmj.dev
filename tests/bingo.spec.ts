import { expect, test } from '@playwright/test';

const name = "Bingo, Carlos's border collie";

for (const width of [393, 820, 1440]) {
  test(`Bingo occupies the original profile slot at ${width}px without clipping`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const bingo = page.getByRole('img', { name, exact: true });
    await expect(bingo).toBeVisible();
    await expect(bingo).not.toHaveAttribute('aria-hidden');
    await expect(bingo).toHaveAttribute('data-state', 'idle');
    const metrics = await bingo.evaluate((element) => {
      const slot = element.parentElement!;
      const style = getComputedStyle(element);
      const slotStyle = getComputedStyle(slot);
      const frame = element.getBoundingClientRect();
      const anchor = slot.getBoundingClientRect();
      const identity = slot.closest('.identity')!;
      return {
        frame: frame.toJSON(),
        anchor: anchor.toJSON(),
        header: identity.getBoundingClientRect().toJSON(),
        nameX: identity.querySelector('.site-name')!.getBoundingClientRect().x,
        background: style.backgroundSize,
        rendering: style.imageRendering,
        radius: slotStyle.borderRadius,
        border: slotStyle.borderWidth,
        overflow: slotStyle.overflow,
      };
    });
    expect(metrics.anchor.width).toBe(44);
    expect(metrics.anchor.height).toBeCloseTo(44, 3);
    expect(metrics.header.height).toBeCloseTo(44, 3);
    expect(metrics.anchor.x).toBeCloseTo(metrics.header.x, 0);
    expect(metrics.nameX).toBeCloseTo(metrics.anchor.right + 12, 0);
    expect(metrics.frame.width).toBe(96);
    expect(metrics.frame.height).toBeCloseTo(96, 3);
    expect(metrics.frame.x + 48).toBeCloseTo(metrics.anchor.x + 22, 0);
    expect(metrics.frame.y + 48).toBeCloseTo(metrics.anchor.y + 22, 0);
    expect(metrics.background).toBe('384px 192px');
    expect(metrics.rendering).toBe('pixelated');
    expect(metrics.radius).toBe('0px');
    expect(metrics.border).toBe('0px');
    expect(metrics.overflow).toBe('visible');
    await expect(page.locator('footer .bingo, footer .bingo-slot')).toHaveCount(0);
  });
}

for (const theme of ['light', 'dark']) {
  test(`Bingo uses the final ${theme} sheet at exact integer frame offsets`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/');
    const bingo = page.getByRole('img', { name, exact: true });
    expect(await bingo.evaluate((element) => getComputedStyle(element).backgroundImage)).toContain(
      theme === 'light' ? '/bingo.png' : '/bingo-dark.png',
    );
    const frames = await bingo.evaluate((element) => {
      const animation = element.getAnimations()[0];
      animation.pause();
      return [0, 225, 450, 675].map((time) => {
        animation.currentTime = time;
        return Number.parseFloat(getComputedStyle(element).backgroundPositionX);
      });
    });
    expect(frames).toEqual([0, -96, -192, -288]);
  });
}

for (const interaction of ['hover', 'focus']) {
  test(`${interaction} plays one run-toward-you cycle then restores wagging`, async ({ page }) => {
    await page.goto('/');
    const control = page.getByRole('button', { name, exact: true });
    const bingo = page.getByRole('img', { name, exact: true });
    if (interaction === 'hover') await control.hover();
    else await control.focus();
    await expect(bingo).toHaveAttribute('data-state', 'running');
    const run = await bingo.evaluate((element) => {
      const style = getComputedStyle(element);
      return { row: style.backgroundPositionY, count: style.animationIterationCount };
    });
    expect(run).toEqual({ row: '-96px', count: '1' });
    await bingo.evaluate((element) => element.getAnimations()[0].finish());
    await expect(bingo).toHaveAttribute('data-state', 'idle');
    expect(await bingo.evaluate((element) => getComputedStyle(element).animationName)).toBe(
      'bingo-idle',
    );
    if (interaction === 'focus') await expect(control).toBeFocused();
  });
}

test.describe('touch', () => {
  test.use({ hasTouch: true });
  test('a tap plays a run cycle then returns to the wag loop', async ({ page }) => {
    await page.goto('/');
    const bingo = page.getByRole('img', { name, exact: true });
    await page.getByRole('button', { name, exact: true }).tap();
    await expect(bingo).toHaveAttribute('data-state', 'running');
    await bingo.evaluate((element) => element.getAnimations()[0].finish());
    await expect(bingo).toHaveAttribute('data-state', 'idle');
  });
});

test('reduced motion holds static frame zero through every interaction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const bingo = page.getByRole('img', { name, exact: true });
  const control = page.getByRole('button', { name, exact: true });
  for (const action of ['initial', 'hover', 'focus', 'click']) {
    if (action === 'hover') await control.hover();
    if (action === 'focus') await control.focus();
    if (action === 'click') await control.click();
    const frame = await bingo.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        x: Number.parseFloat(style.backgroundPositionX),
        y: Number.parseFloat(style.backgroundPositionY),
        animations: element.getAnimations().length,
      };
    });
    expect(frame).toEqual({ x: 0, y: 0, animations: 0 });
    await expect(bingo).toHaveAttribute('data-state', 'idle');
  }
});
