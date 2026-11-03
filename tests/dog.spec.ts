import { expect, test } from '@playwright/test';

test('Bingo renders a decorative, pixelated idle loop in the existing footer anchor', async ({
  page,
}) => {
  await page.goto('/');
  const dog = page.locator('#site-dog');
  await expect(dog).toHaveAttribute('aria-hidden', 'true');
  await expect(dog).toHaveAttribute('data-state', 'idle');
  const sprite = await dog.evaluate((element) => {
    const style = getComputedStyle(element);
    const anchor = getComputedStyle(element.parentElement!);
    return {
      size: style.backgroundSize,
      width: style.width,
      height: style.height,
      left: style.left,
      bottom: style.bottom,
      rendering: style.imageRendering,
      anchorWidth: anchor.width,
      anchorHeight: anchor.height,
      animation: style.animationName,
    };
  });
  expect(sprite).toEqual({
    size: '256px 128px',
    width: '64px',
    height: '64px',
    left: '-12px',
    bottom: '0px',
    rendering: 'pixelated',
    anchorWidth: '40px',
    anchorHeight: '24px',
    animation: 'dog-frames',
  });
  const frames = await dog.evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    return [0, 225, 450, 675].map((time) => {
      animation.currentTime = time;
      return Number.parseFloat(getComputedStyle(element).backgroundPositionX);
    });
  });
  expect(frames).toEqual([0, -64, -128, -192]);
});

for (const theme of ['light', 'dark']) {
  test(`Bingo uses the ${theme} sprite sheet`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
    await page.goto('/');
    const image = await page
      .locator('#site-dog')
      .evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(image).toContain(theme === 'light' ? '/dog.png' : '/dog-dark.png');
    const dimensions = await page.evaluate(
      async (src) => {
        const image = new Image();
        image.src = src;
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
      },
      theme === 'light' ? '/dog.png' : '/dog-dark.png',
    );
    expect(dimensions).toEqual({ width: 128, height: 64 });
  });
}

test('hover runs the lower row and leaving restores idle', async ({ page }) => {
  await page.goto('/');
  const dog = page.locator('#site-dog');
  await page.getByRole('button', { name: 'Play with Bingo' }).hover();
  await expect(dog).toHaveAttribute('data-state', 'running');
  const running = await dog.evaluate((element) => {
    const style = getComputedStyle(element);
    return { row: style.backgroundPositionY, duration: style.animationDuration };
  });
  expect(running).toEqual({ row: '-64px', duration: '0.6s' });
  await page.mouse.move(0, 0);
  await expect(dog).toHaveAttribute('data-state', 'idle');
});

test('keyboard focus runs Bingo until focus leaves', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Play with Bingo' }).focus();
  await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'running');
  await page.locator('.footer-link').focus();
  await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'idle');
});

test.describe('touch interaction', () => {
  test.use({ hasTouch: true });
  test('a tap focuses Bingo and plays the run cycle', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    const control = page.getByRole('button', { name: 'Play with Bingo' });
    await control.tap();
    await expect(control).toBeFocused();
    await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'running');
    await page.locator('.footer-link').focus();
    await expect(page.locator('#site-dog')).toHaveAttribute('data-state', 'idle');
  });
});

for (const path of ['/', '/not-a-real-page']) {
  test(`reduced motion holds frame zero on ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const dog = page.locator('#site-dog');
    for (const focused of [false, true]) {
      if (focused) await page.getByRole('button', { name: 'Play with Bingo' }).focus();
      const frame = await dog.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          animation: style.animationName,
          x: Number.parseFloat(style.backgroundPositionX),
          animations: element.getAnimations().length,
        };
      });
      expect(frame).toEqual({ animation: 'none', x: 0, animations: 0 });
    }
  });
}
