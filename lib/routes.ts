import { loadEvents, loadWritings, type SiteEvent, visibleWritings, type Writing } from './content';
import { absoluteUrl, site } from './site';

export type PageRoute = {
  path: string;
  title: string;
  description: string;
  markdownPath: string;
  ogImage: string;
  kind: 'home' | 'writings' | 'writing' | 'events' | 'event';
  date?: string;
};

export function pageRoutes(
  writings: Writing[] = visibleWritings(loadWritings()),
  events: SiteEvent[] = loadEvents(),
): PageRoute[] {
  const pages: PageRoute[] = [
    {
      path: '/',
      title: site.name,
      description: site.description,
      markdownPath: '/index.md',
      ogImage: '/og/home.png',
      kind: 'home',
    },
  ];
  if (writings.length > 0) {
    pages.push({
      path: '/writings',
      title: 'Writings',
      description: 'Notes by Carlos Lezama.',
      markdownPath: '/writings.md',
      ogImage: '/og/writings.png',
      kind: 'writings',
    });
    for (const post of writings) {
      pages.push({
        path: `/writings/${post.slug}`,
        title: post.title,
        description: post.description,
        markdownPath: `/writings/${post.slug}.md`,
        ogImage: `/og/writings-${post.slug}.png`,
        kind: 'writing',
        date: post.date,
      });
    }
  }
  if (events.length > 0) {
    pages.push({
      path: '/events',
      title: 'Events',
      description: 'Events Carlos Lezama is part of.',
      markdownPath: '/events.md',
      ogImage: '/og/events.png',
      kind: 'events',
    });
    for (const event of events) {
      pages.push({
        path: `/events/${event.slug}`,
        title: event.title,
        description: `${event.title} in ${event.location}.`,
        markdownPath: `/events/${event.slug}.md`,
        ogImage: `/og/events-${event.slug}.png`,
        kind: 'event',
        date: event.start.slice(0, 10),
      });
    }
  }
  return pages;
}

export function canonical(path: string): string {
  return path === '/' ? site.url : absoluteUrl(path);
}
