import { parseContributions, type ContributionDay, type Contributions } from './contributions';

const GITHUB_URL = 'https://github.com/users/clzmj/contributions';
const GITLAB_URL = 'https://gitlab.com/users/clzmj/calendar.json';
const REQUEST_TIMEOUT_MS = 15_000;
const DAY_MS = 24 * 60 * 60 * 1000;

type Fetcher = typeof fetch;

function isoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseGitLabCalendar(text: string): Map<string, number> | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const counts = new Map<string, number>();
  for (const [date, count] of Object.entries(value)) {
    if (!isoDate(date) || !Number.isInteger(count) || (count as number) < 0) return null;
    counts.set(date, count as number);
  }
  return counts;
}

function dayStamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fallbackWindow(now: Date): [Date, Date] {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - 364 * DAY_MS);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return [start, end];
}

function toWeeks(
  githubDays: Map<string, number>,
  gitlabDays: Map<string, number>,
  sources: ('github' | 'gitlab')[],
  start: Date,
  end: Date,
): Contributions {
  const dates: string[] = [];
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    dates.push(dayStamp(new Date(time)));
  }
  const days: ContributionDay[] = dates.map((date) => {
    const github = sources.includes('github') ? (githubDays.get(date) ?? 0) : undefined;
    const gitlab = sources.includes('gitlab') ? (gitlabDays.get(date) ?? 0) : undefined;
    const knownCounts = [github, gitlab].filter((count): count is number => count !== undefined);
    const count = knownCounts.length
      ? knownCounts.reduce((sum, value) => sum + value, 0)
      : undefined;
    return { date, github, gitlab, count, level: 0 };
  });

  // Apply the same count thresholds to both sources so combined activity has one scale.
  for (const day of days) {
    day.level =
      day.count === undefined || day.count === 0
        ? 0
        : day.count <= 2
          ? 1
          : day.count <= 5
            ? 2
            : day.count <= 10
              ? 3
              : 4;
  }

  const weeks: ContributionDay[][] = [];
  for (let offset = 0; offset < days.length; offset += 7)
    weeks.push(days.slice(offset, offset + 7));
  return {
    total: days.reduce((sum, day) => sum + (day.count ?? 0), 0),
    weeks,
    sources,
  };
}

async function readSource(
  fetcher: Fetcher,
  url: string,
  headers?: HeadersInit,
): Promise<string | null> {
  try {
    const response = await fetcher(url, {
      ...(headers ? { headers } : {}),
      credentials: 'omit',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return response.ok ? await response.text() : null;
  } catch {
    return null;
  }
}

export async function fetchContributions(
  fetcher: Fetcher = fetch,
  now: Date = new Date(),
): Promise<Contributions | null> {
  const [githubText, gitlabText] = await Promise.all([
    readSource(fetcher, GITHUB_URL, { 'user-agent': 'clzmj-dev-build' }),
    readSource(fetcher, GITLAB_URL),
  ]);

  const githubParsed = githubText ? parseContributions(githubText) : null;
  const githubEntries = githubParsed?.weeks.flat().filter((day) => isoDate(day.date)) ?? [];
  const githubDays = new Map<string, number>();
  for (const day of githubEntries) if (day.count !== undefined) githubDays.set(day.date, day.count);
  const hasGithub =
    new Set(githubEntries.map((day) => day.date)).size >= 350 &&
    githubEntries.every((day) => day.count !== undefined);
  const gitlabDays = gitlabText ? parseGitLabCalendar(gitlabText) : null;
  const hasGitlab = gitlabDays !== null;
  if (!hasGithub && !hasGitlab) return null;

  const sources: ('github' | 'gitlab')[] = [];
  if (hasGithub) sources.push('github');
  if (hasGitlab) sources.push('gitlab');

  let start: Date;
  let end: Date;
  if (hasGithub) {
    const dates = githubEntries.map((day) => new Date(`${day.date}T00:00:00.000Z`).getTime());
    start = new Date(Math.min(...dates));
    end = new Date(
      Math.min(
        Math.max(...dates),
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      ),
    );
  } else {
    [start, end] = fallbackWindow(now);
  }
  if (hasGitlab) {
    const inWindow = [...gitlabDays!].filter(
      ([date]) => date >= dayStamp(start) && date <= dayStamp(end),
    );
    gitlabDays!.clear();
    for (const [date, count] of inWindow) gitlabDays!.set(date, count);
  }
  return toWeeks(githubDays, gitlabDays ?? new Map(), sources, start, end);
}
