import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ContributionDay = {
  date: string;
  level: number;
};

export type Contributions = {
  total: number;
  weeks: ContributionDay[][];
};

export function parseContributions(html: string): Contributions | null {
  const totalMatch = html.match(/([\d,]+)\s+contributions/i);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : 0;
  const rows = [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)];
  const grid: ContributionDay[][] = [];
  for (const row of rows) {
    const days: ContributionDay[] = [];
    for (const cell of row[0].matchAll(/<td\b[^>]*>/g)) {
      const date = cell[0].match(/data-date="([^"]+)"/)?.[1];
      const level = cell[0].match(/data-level="(\d)"/)?.[1];
      if (date && level) days.push({ date, level: Number(level) });
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
