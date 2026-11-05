import { expect, test } from '@playwright/test';

for (const width of [390, 393, 1440]) {
  test(`section gaps stay 40px and label gaps stay 12px at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const metrics = await page.locator('.main-stack').evaluate((stack) => {
      const bio = stack.querySelector('.bio p:last-child')!;
      const contributions = stack.querySelector('[aria-labelledby="contributions-title"]')!;
      const elsewhere = stack.querySelector('[aria-labelledby="elsewhere-title"]')!;
      return {
        gap: getComputedStyle(stack).rowGap,
        bioGap: contributions.getBoundingClientRect().top - bio.getBoundingClientRect().bottom,
        elsewhereGap:
          elsewhere.getBoundingClientRect().top - contributions.getBoundingClientRect().bottom,
        sections: [contributions, elsewhere].map((section) => {
          const label = section.querySelector('h2')!;
          const content = section.querySelector('.contrib-outer, .photo-eventail')!;
          return {
            margin: getComputedStyle(section).margin,
            padding: getComputedStyle(section).padding,
            labelGap: content.getBoundingClientRect().top - label.getBoundingClientRect().bottom,
          };
        }),
      };
    });
    expect(metrics.gap).toBe('40px');
    expect(metrics.bioGap).toBeCloseTo(40, 1);
    expect(metrics.elsewhereGap).toBeCloseTo(40, 1);
    for (const section of metrics.sections) {
      expect(section.margin).toBe('0px');
      expect(section.padding).toBe('0px');
      expect(section.labelGap).toBeCloseTo(12, 1);
    }
  });
}
