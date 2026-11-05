import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ContributionDay = {
  date: string;
  level: number;
  count?: number;
};

export type Contributions = {
  total: number;
  weeks: ContributionDay[][];
};

export function parseContributions(html: string): Contributions | null {
  const totalMatch = html.match(/([\d,]+)\s+contributions/i);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : 0;
  const counts = new Map<string, number>();
  for (const tip of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = tip[1].match(/for="([^"]+)"/)?.[1];
    const label = tip[2].replace(/<[^>]+>/g, '');
    const count = label.match(/([\d,]+) contributions?/i)?.[1];
    if (id && (count || /No contributions/i.test(label))) {
      counts.set(id, count ? Number(count.replace(/,/g, '')) : 0);
    }
  }
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)];
  const grid: ContributionDay[][] = [];
  for (const row of rows) {
    const days: ContributionDay[] = [];
    for (const cell of row[0].matchAll(/<td\b[^>]*>/g)) {
      const date = cell[0].match(/data-date="([^"]+)"/)?.[1];
      const level = cell[0].match(/data-level="(\d)"/)?.[1];
      const id = cell[0].match(/\bid="([^"]+)"/)?.[1];
      const rawCount = cell[0].match(/data-count="([\d,]+)"/)?.[1];
      const count = rawCount ? Number(rawCount.replace(/,/g, '')) : counts.get(id ?? '');
      if (date && level) {
        // Do not substitute intensity levels for counts in older snapshots.
        days.push({ date, level: Number(level), count: count ?? (level === '0' ? 0 : undefined) });
      }
    }
    if (days.length > 0) grid.push(days);
  }
  if (grid.length === 0) return null;
  const width = grid[0]?.length ?? 0;
  const weeks: ContributionDay[][] = [];
  for (let week = 0; week < width; week += 1) {
    const column: ContributionDay[] = [];
    for (const row of grid) {
      const day = row[week];
      if (day) column.push(day);
    }
    if (column.length > 0) weeks.push(column);
  }
  if (weeks.length < 40) return null;
  return { total, weeks };
}

export function loadContributions(): Contributions | null {
  const path = join(process.cwd(), 'content', 'contributions.json');
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Contributions;
  if (!parsed.weeks || parsed.weeks.length === 0) return null;
  return parsed;
}
