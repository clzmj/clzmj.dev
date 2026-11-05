import { expect, test } from '@playwright/test';

import { loadContributions, parseContributions } from '../lib/contributions';

function calendar(mode: 'tooltip' | 'attribute' | 'legacy'): string {
  return `<h2>1,234 contributions</h2><tr>${Array.from(
    { length: 53 },
    (_, index) =>
      `<td id="day-${index}" data-date="2026-01-${index + 1}" data-level="1"${mode === 'attribute' ? ' data-count="12"' : ''}></td>${mode === 'tooltip' ? `<tool-tip for="day-${index}">12 contributions on January 1st.</tool-tip>` : ''}`,
  ).join('')}</tr>`;
}

for (const mode of ['tooltip', 'attribute'] as const) {
  test(`GitHub ${mode} counts are kept separately from intensity`, () => {
    const data = parseContributions(calendar(mode));
    expect(data?.total).toBe(1234);
    expect(data?.weeks.flat()).toHaveLength(53);
    expect(data?.weeks.flat().every((day) => day.level === 1 && day.count === 12)).toBe(true);
  });
}

test('legacy levels remain readable without inventing counts', () => {
  const data = parseContributions(calendar('legacy'));
  expect(data?.weeks.flat()).toHaveLength(53);
  expect(data?.weeks[0][0]).toEqual({ date: '2026-01-1', level: 1, count: undefined });
});

test('every saved day has its actual contribution count', () => {
  const days = loadContributions()?.weeks.flat();
  expect(days?.length).toBeGreaterThan(350);
  expect(days?.every((day) => Number.isInteger(day.count) && day.count! >= 0)).toBe(true);
  expect(days?.some((day) => day.count! > day.level)).toBe(true);
});
