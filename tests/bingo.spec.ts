import { expect, test } from '@playwright/test';

const name = "Bingo, Carlos's border collie";

for (const width of [393, 820, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`Bingo's visible pixels stay contained and clear the paragraph at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.goto('/');
      await page.locator('.identity').evaluate((element) => {
        for (const node of [element, element.nextElementSibling])
          for (const animation of node?.getAnimations() ?? []) animation.finish();
      });
      const bingo = page.getByRole('img', { name, exact: true });
      await expect(bingo).toBeVisible();
      await expect(bingo).not.toHaveAttribute('aria-hidden');
      const metrics = await bingo.evaluate((element) => {
        const slot = element.parentElement!;
        const style = getComputedStyle(element);
        const slotStyle = getComputedStyle(slot);
        const anchor = slot.getBoundingClientRect();
        const identity = slot.closest('.identity')!;
        const identityStyle = getComputedStyle(identity);
        return {
          frame: element.getBoundingClientRect().toJSON(),
          shrink: slotStyle.flexShrink,
          margins: [
            slotStyle.marginTop,
            slotStyle.marginRight,
            slotStyle.marginBottom,
            slotStyle.marginLeft,
          ],
          anchor: anchor.toJSON(),
          nameX: identity.querySelector('.site-name')!.getBoundingClientRect().x,
          margin: identityStyle.marginBottom,
          gap: identityStyle.gap,
          background: style.backgroundSize,
          rendering: style.imageRendering,
          radius: slotStyle.borderRadius,
          border: slotStyle.borderWidth,
          overflow: slotStyle.overflow,
        };
      });
      expect(metrics.anchor.width).toBe(54);
      expect(metrics.anchor.height).toBeCloseTo(81, 3);
      expect(metrics.nameX).toBeCloseTo(metrics.anchor.right + 16, 0);
      expect(metrics.margin).toBe('32px');
      expect(metrics.gap).toBe('16px');
      expect(metrics.frame.width).toBe(54);
      expect(metrics.frame.height).toBeCloseTo(81, 3);
      expect(metrics.frame.left).toBeCloseTo(metrics.anchor.left, 3);
      expect(metrics.frame.top).toBeCloseTo(metrics.anchor.top, 3);
      expect(metrics.shrink).toBe('0');
      expect(metrics.margins).toEqual(['0px', '0px', '0px', '0px']);
      expect(metrics.background).toBe('384px 192px');
      expect(metrics.rendering).toBe('pixelated');
      expect(metrics.radius).toBe('0px');
      expect(metrics.border).toBe('0px');
      expect(metrics.overflow).toBe('hidden');
      const measurements = [];
      for (const state of ['idle', 'running']) {
        if (state === 'running') await page.getByRole('button', { name, exact: true }).focus();
        await expect(bingo).toHaveAttribute('data-state', state);
        const frames = await bingo.evaluate(async (element) => {
          const animation = element.getAnimations()[0];
          animation.pause();
          const image = new Image();
          image.src = getComputedStyle(element).backgroundImage.match(/url\(["']?(.*?)["']?\)/)![1];
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 32;
          const context = canvas.getContext('2d')!;
          const row = element.getAttribute('data-state') === 'running' ? 1 : 0;
          const duration = Number(animation.effect!.getTiming().duration);
          return [0, 1, 2, 3].map((column) => {
            animation.currentTime = (column * duration) / 4;
            context.clearRect(0, 0, 32, 32);
            context.drawImage(image, column * 32, row * 32, 32, 32, 0, 0, 32, 32);
            const pixels = context.getImageData(0, 0, 32, 32).data;
            let left = 32,
              top = 32,
              right = 0,
              bottom = 0;
            for (let y = 0; y < 32; y += 1) {
              for (let x = 0; x < 32; x += 1) {
                if (pixels[(y * 32 + x) * 4 + 3] > 0) {
                  left = Math.min(left, x);
                  top = Math.min(top, y);
                  right = Math.max(right, x + 1);
                  bottom = Math.max(bottom, y + 1);
                }
              }
            }
            const frame = element.getBoundingClientRect();
            const identity = element.closest('.identity')!;
            const nameBlock = identity.querySelector('div')!.getBoundingClientRect();
            const contentLeft = identity.getBoundingClientRect().left;
            const style = getComputedStyle(element);
            const scale = Number.parseFloat(style.backgroundSize) / image.naturalWidth;
            const offsetX = Number.parseFloat(style.backgroundPositionX);
            const offsetY = Number.parseFloat(style.backgroundPositionY);
            const visible = {
              left: frame.left + offsetX + (column * 32 + left) * scale,
              right: frame.left + offsetX + (column * 32 + right) * scale,
              top: frame.top + offsetY + (row * 32 + top) * scale,
              bottom: frame.top + offsetY + (row * 32 + bottom) * scale,
            };
            return {
              column,
              containment: {
                left: visible.left - frame.left,
                right: frame.right - visible.right,
                top: visible.top - frame.top,
                bottom: frame.bottom - visible.bottom,
              },
              paragraphGap:
                identity.nextElementSibling!.getBoundingClientRect().top - visible.bottom,
              leftError: Math.abs(visible.left - contentLeft),
              centerError: Math.abs(
                (visible.top + visible.bottom) / 2 - (nameBlock.top + nameBlock.height / 2),
              ),
              scale,
            };
          });
        });
        for (const frame of frames) {
          expect(frame.scale).toBe(3);
          expect(frame.leftError).toBeLessThanOrEqual(0.1);
          expect(frame.centerError).toBeLessThanOrEqual(2);
          for (const distance of Object.values(frame.containment))
            expect(distance).toBeGreaterThanOrEqual(-0.01);
          expect(frame.paragraphGap).toBeGreaterThanOrEqual(32);
        }
        measurements.push({ state, frames });
      }
      await test.info().attach('bingo-geometry', {
        body: JSON.stringify({ width, theme, measurements }),
        contentType: 'application/json',
      });
      await expect(page.locator('footer .bingo, footer .bingo-slot')).toHaveCount(0);
    });
  }
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
    expect(frames).toEqual([-18, -120, -210, -312]);
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
    expect(run).toEqual({ row: '-109px', count: '1' });
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
    expect(frame).toEqual({ x: -18, y: -13, animations: 0 });
    await expect(bingo).toHaveAttribute('data-state', 'idle');
  }
});
