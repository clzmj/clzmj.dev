import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { showDemoPosts } from './site';

export type Writing = {
  slug: string;
  title: string;
  description: string;
  date: string;
  demo: boolean;
  body: string;
};

export type SiteEvent = {
  slug: string;
  title: string;
  start: string;
  end: string;
  timezone: string;
  location: string;
  url: string;
  status: 'upcoming' | 'past';
  example: boolean;
  body: string;
};

export type Slide = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

function contentPath(...parts: string[]): string {
  return join(process.cwd(), 'content', ...parts);
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${file} is missing ${key}`);
  }
  return value;
}

export function loadWritings(): Writing[] {
  const dir = contentPath('writings');
  const files = readdirSync(dir).filter((file) => file.endsWith('.mdx'));
  return files
    .map((file) => {
      const raw = readFileSync(join(dir, file), 'utf8');
      const parsed = matter(raw);
      const data = parsed.data as Record<string, unknown>;
      const date = data.date;
      const dateValue =
        date instanceof Date ? date.toISOString().slice(0, 10) : requireString(data, 'date', file);
      return {
        slug: file.replace(/\.mdx$/, ''),
        title: requireString(data, 'title', file),
        description: requireString(data, 'description', file),
        date: dateValue.slice(0, 10),
        demo: data.demo === true,
        body: parsed.content.trim(),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function visibleWritings(posts: Writing[] = loadWritings()): Writing[] {
  const showDemos = showDemoPosts();
  return posts.filter((post) => showDemos || !post.demo);
}

export function loadEvents(): SiteEvent[] {
  const dir = contentPath('events');
  const files = readdirSync(dir).filter((file) => file.endsWith('.md'));
  const events = files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf8');
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;
    const statusValue = requireString(data, 'status', file);
    if (statusValue !== 'upcoming' && statusValue !== 'past') {
      throw new Error(`${file} has an unknown status`);
    }
    const status: 'upcoming' | 'past' = statusValue;
    return {
      slug: file.replace(/\.md$/, ''),
      title: requireString(data, 'title', file),
      start: requireString(data, 'start', file),
      end: requireString(data, 'end', file),
      timezone: requireString(data, 'timezone', file),
      location: requireString(data, 'location', file),
      url: requireString(data, 'url', file),
      status,
      example: data.example === true,
      body: parsed.content.trim(),
    };
  });
  return events.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1;
    if (a.status === 'upcoming') return a.start.localeCompare(b.start);
    return b.start.localeCompare(a.start);
  });
}

export function loadSlides(): Slide[] {
  const raw = readFileSync(contentPath('carousel.json'), 'utf8');
  const parsed = JSON.parse(raw) as Slide[];
  return parsed.map((slide) => ({
    ...slide,
    src: slide.src.startsWith('/') ? slide.src : `/carousel/${slide.src}`,
  }));
}
