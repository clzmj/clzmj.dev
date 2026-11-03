import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DateChip, ItemRow } from '../../components/rows';
import { Shell } from '../../components/shell';
import { loadEvents } from '../../lib/content';
import { site } from '../../lib/site';
import { formatMonthYear, monthDay } from '../../lib/time';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Events Carlos Lezama is part of.',
  alternates: {
    canonical: `${site.url}/events`,
    types: { 'text/markdown': `${site.url}/events.md` },
  },
  openGraph: {
    title: 'Events',
    description: 'Events Carlos Lezama is part of.',
    url: `${site.url}/events`,
    images: [{ url: '/og/events.png', width: 1200, height: 630, alt: 'Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events',
    description: 'Events Carlos Lezama is part of.',
    images: ['/og/events.png'],
  },
};

export default function EventsPage() {
  const events = loadEvents();
  if (events.length === 0) notFound();
  return (
    <Shell markdownHref="/events.md">
      <a className="home-mark" href="/">
        <img
          className="avatar"
          src="/avatar.png"
          alt="Carlos Lezama, home"
          width={256}
          height={256}
        />
      </a>
      <h1 className="page-title">Events</h1>
      <p className="lede">
        One Markdown file per event. The build writes a calendar file for each one. RSVPs are not
        collected on this static site. A later Worker route will store them in Cloudflare D1.
      </p>
      <div className="stack">
        {events.map((event) => {
          const chip = monthDay(event.start);
          return (
            <ItemRow
              key={event.slug}
              href={`/events/${event.slug}`}
              icon={<DateChip month={chip.month} day={chip.day} />}
              title={event.title}
              meta={formatMonthYear(event.start)}
              badge={event.example ? 'Example' : undefined}
            />
          );
        })}
      </div>
    </Shell>
  );
}
