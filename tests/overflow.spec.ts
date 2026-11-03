import { expect, test } from '@playwright/test';
import { shotPages, viewports } from './viewports';

for (const shotPage of shotPages) {
  for (const viewport of viewports) {
    test(`${shotPage.name} has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(shotPage.path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}
