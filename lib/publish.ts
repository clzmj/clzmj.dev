import type { SiteEvent, Writing } from './content';
import { loadProfile } from './profile';
import { canonical, type PageRoute } from './routes';
import { absoluteUrl, site } from './site';
import { formatLongDate, formatMonthYear } from './time';

function bullet(label: string, href: string, note?: string): string {
  return note ? `- [${label}](${href}): ${note}` : `- [${label}](${href})`;
}

export function homeMarkdown(writings: Writing[], events: SiteEvent[]): string {
  const profile = loadProfile();
  const lines = [
    `# ${site.name}`,
    '',
    profile.role,
    '',
    `I'm ${site.name}. I live in ${site.locationLabel}. The employers, logos, and community count on the site are placeholders.`,
    '',
    `You can reach me at [${site.email}](mailto:${site.email}), or see my code on [GitHub](${site.github}).`,
    '',
  ];
  if (writings.length > 0) {
    lines.push('## Writings', '');
    for (const post of writings) {
      const flag = post.demo ? ' Demo.' : '';
      lines.push(
        bullet(
          post.title,
          absoluteUrl(`/writings/${post.slug}.md`),
          `${post.date}.${flag} ${post.description}`,
        ),
      );
    }
    lines.push('');
  }
  if (events.length > 0) {
    lines.push('## Events', '');
    for (const event of events) {
      const flag = event.example ? ' Example.' : '';
      lines.push(
        bullet(
          event.title,
          absoluteUrl(`/events/${event.slug}.md`),
          `${event.start.slice(0, 10)}.${flag}`,
        ),
      );
    }
    lines.push('');
  }
  lines.push(
    '## For agents',
    '',
    `- [llms.txt](${absoluteUrl('/llms.txt')})`,
    `- [llms-full.txt](${absoluteUrl('/llms-full.txt')})`,
    `- [RSS](${absoluteUrl('/rss.xml')})`,
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function writingsIndexMarkdown(writings: Writing[]): string {
  const lines = [`# Writings`, '', `Notes by ${site.name}.`, ''];
  for (const post of writings) {
    lines.push(bullet(post.title, absoluteUrl(`/writings/${post.slug}.md`), post.date));
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function writingMarkdown(post: Writing): string {
  const banner = post.demo ? '\n\nThis post is a demo of the renderer.\n' : '';
  return `# ${post.title}\n\n${formatLongDate(post.date)}\n\n${post.description}${banner}\n\n${post.body}\n`;
}

export function eventsIndexMarkdown(events: SiteEvent[]): string {
  const lines = [
    '# Events',
    '',
    `Events ${site.name} is part of.`,
    '',
    'Each event is one Markdown file. The build writes a `.ics` file beside it.',
    'RSVPs are not collected yet. A later Worker route will store them in Cloudflare D1.',
    '',
  ];
  for (const event of events) {
    const tag = event.example ? ' Example.' : '';
    lines.push(
      bullet(
        event.title,
        absoluteUrl(`/events/${event.slug}.md`),
        `${event.start.slice(0, 10)} · ${event.location}.${tag}`,
      ),
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function eventMarkdown(event: SiteEvent): string {
  const tag = event.example ? '\n\nExample event.\n' : '';
  return `# ${event.title}\n\n${formatMonthYear(event.start)}\n\n${event.location}\n\n${event.start} – ${event.end} (${event.timezone})\n\n${event.url}${tag}\n\n${event.body}\n`;
}

export function llmsText(writings: Writing[], events: SiteEvent[]): string {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} writes from ${site.locationLabel}. Every page has a Markdown twin. The long form of the notes is in /llms-full.txt.`,
    '',
  ];
  if (writings.length > 0) {
    lines.push('## Writings', '');
    for (const post of writings) {
      lines.push(bullet(post.title, absoluteUrl(`/writings/${post.slug}.md`), post.description));
    }
    lines.push('');
  }
  if (events.length > 0) {
    lines.push('## Events', '');
    for (const event of events) {
      lines.push(bullet(event.title, absoluteUrl(`/events/${event.slug}.md`), event.location));
    }
    lines.push('');
  }
  lines.push(
    '## Optional',
    '',
    bullet(
      'All notes in Markdown',
      absoluteUrl('/llms-full.txt'),
      'every note, full text, one file.',
    ),
    bullet('RSS feed', absoluteUrl('/rss.xml'), 'the notes, newest first.'),
    bullet('GitHub', site.github, 'code.'),
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function llmsFullText(writings: Writing[]): string {
  if (writings.length === 0) {
    return `# ${site.name}\n\nNo notes yet.\n`;
  }
  return `${writings.map((post) => writingMarkdown(post).trim()).join('\n\n---\n\n')}\n`;
}

export function rssXml(writings: Writing[]): string {
  const items = writings
    .map((post) => {
      const link = absoluteUrl(`/writings/${post.slug}`);
      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${link}</link>`,
        `<guid>${link}</guid>`,
        `<pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.description)}</description>`,
        '</item>',
      ].join('');
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(site.name)}</title><link>${site.url}</link><description>${escapeXml(site.description)}</description>${items}</channel></rss>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function markdownFor(route: PageRoute, writings: Writing[], events: SiteEvent[]): string {
  if (route.kind === 'home') return homeMarkdown(writings, events);
  if (route.kind === 'writings') return writingsIndexMarkdown(writings);
  if (route.kind === 'events') return eventsIndexMarkdown(events);
  if (route.kind === 'writing') {
    const post = writings.find((item) => route.path.endsWith(`/${item.slug}`));
    if (!post) throw new Error(`Missing writing for ${route.path}`);
    return writingMarkdown(post);
  }
  const event = events.find((item) => route.path.endsWith(`/${item.slug}`));
  if (!event) throw new Error(`Missing event for ${route.path}`);
  return eventMarkdown(event);
}

export function pageCanonical(route: PageRoute): string {
  return canonical(route.path);
}
