import { expect, test } from '@playwright/test';

import { fetchContributions } from '../lib/contribution-fetch';
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

function validGitHubCalendar(now: Date): string {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const last = new Date(end);
  const start = new Date(end - 364 * 24 * 60 * 60 * 1000);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const cells: string[][] = Array.from({ length: 7 }, () => []);
  for (let week = 0; week < 53; week += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(start.getTime() + (week * 7 + weekday) * 24 * 60 * 60 * 1000);
      if (date > last) continue;
      const stamp = date.toISOString().slice(0, 10);
      const count = stamp === '2025-11-02' ? 2 : 0;
      cells[weekday].push(
        `<td id="day-${stamp}" data-date="${stamp}" data-level="${count ? 1 : 0}" data-count="${count}"></td>`,
      );
    }
  }
  return `<h2>2 contributions</h2>${cells.map((row) => `<tr>${row.join('')}</tr>`).join('')}`;
}

function mockFetcher(github: string | null, gitlab: string | null): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes('github.com') ? github : gitlab;
    return body === null ? new Response('', { status: 503 }) : new Response(body);
  }) as typeof fetch;
}

const fixedNow = new Date('2026-11-05T12:00:00.000Z');

test('GitHub and GitLab counts merge per date and preserve source counts', async () => {
  const data = await fetchContributions(
    mockFetcher(validGitHubCalendar(fixedNow), '{"2025-11-02":5,"2025-11-04":3,"2027-01-01":99}'),
    fixedNow,
  );
  const days = data?.weeks.flat();
  expect(data?.sources).toEqual(['github', 'gitlab']);
  expect(data?.total).toBe(10);
  expect(days).toHaveLength(369);
  expect(days?.find((day) => day.date === '2025-11-02')).toMatchObject({
    github: 2,
    gitlab: 5,
    count: 7,
    level: 3,
  });
  expect(days?.find((day) => day.date === '2025-11-03')).toMatchObject({
    github: 0,
    gitlab: 0,
    count: 0,
    level: 0,
  });
  expect(days?.some((day) => day.date === '2027-01-01')).toBe(false);
});

test('GitLab-only data fills a Sunday-aligned last-year grid and missing dates with zero', async () => {
  const data = await fetchContributions(
    mockFetcher(null, '{"2025-11-19":17,"2026-10-31":40}'),
    fixedNow,
  );
  const days = data?.weeks.flat();
  expect(data?.sources).toEqual(['gitlab']);
  expect(days?.[0]).toMatchObject({ date: '2025-11-02', gitlab: 0, count: 0 });
  expect(days?.at(-1)).toMatchObject({ date: '2026-11-05', gitlab: 0, count: 0 });
  expect(days?.find((day) => day.date === '2025-11-19')).toMatchObject({ gitlab: 17, count: 17 });
  expect(days?.some((day) => day.date > '2026-11-05')).toBe(false);
});

test('a failed source is omitted and both failed sources return no replacement snapshot', async () => {
  const githubOnly = await fetchContributions(
    mockFetcher(validGitHubCalendar(fixedNow), null),
    fixedNow,
  );
  expect(githubOnly?.sources).toEqual(['github']);
  expect(githubOnly?.weeks.flat()[0]).toMatchObject({ github: 2, count: 2 });
  await expect(fetchContributions(mockFetcher(null, null), fixedNow)).resolves.toBeNull();
});

test('invalid GitLab calendars are treated as a failed source', async () => {
  for (const calendar of [
    'not json',
    '{"2026-02-30":4}',
    '{"2026-10-31":-1}',
    '{"2026-10-31":1.5}',
  ]) {
    const data = await fetchContributions(mockFetcher(null, calendar), fixedNow);
    expect(data).toBeNull();
  }
});

test('network failures fall back without sending authentication to either public calendar', async () => {
  const requests: { url: string; options?: RequestInit }[] = [];
  const fetcher = (async (input: RequestInfo | URL, options?: RequestInit) => {
    const url = String(input);
    requests.push({ url, options });
    if (url.includes('github.com')) throw new Error('Network unavailable');
    return new Response('{"2026-11-05":1}');
  }) as typeof fetch;
  const data = await fetchContributions(fetcher, fixedNow);
  expect(data?.sources).toEqual(['gitlab']);
  expect(data?.total).toBe(1);
  expect(requests.map(({ url }) => url)).toEqual([
    'https://github.com/users/clzmj/contributions',
    'https://gitlab.com/users/clzmj/calendar.json',
  ]);
  for (const { options } of requests) {
    expect(options?.credentials).toBe('omit');
    expect(new Headers(options?.headers).has('authorization')).toBe(false);
  }
});
