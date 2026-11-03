import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '../../../components/json-ld';
import { Shell } from '../../../components/shell';
import { loadEvents } from '../../../lib/content';
import { renderMdx } from '../../../lib/mdx';
import { site } from '../../../lib/site';
import { staticParams } from '../../../lib/static-params';
import { formatLongDate, withMexicoOffset } from '../../../lib/time';

export function generateStaticParams() {
  return staticParams(loadEvents().map((event) => event.slug));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = loadEvents().find((item) => item.slug === slug);
  if (!event) return {};
  const url = `${site.url}/events/${event.slug}`;
  const description = `${event.title} in ${event.location}.`;
  const image = `/og/events-${event.slug}.png`;
  return {
    title: event.title,
    description,
    alternates: {
      canonical: url,
      types: { 'text/markdown': `${url}.md` },
    },
    openGraph: {
      title: event.title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [image],
    },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = loadEvents().find((item) => item.slug === slug);
  if (!event) notFound();
  const content = event.body ? await renderMdx(event.body) : null;
  const url = `${site.url}/events/${event.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: withMexicoOffset(event.start),
    endDate: withMexicoOffset(event.end),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    organizer: { '@type': 'Person', name: site.name, url: site.url },
    url: event.url,
    description: event.body || event.title,
    image: `${site.url}/og/events-${event.slug}.png`,
  };
  return (
    <Shell markdownHref={`/events/${event.slug}.md`}>
      <JsonLd data={jsonLd} />
      <p className="page-kicker">
        <a href="/events">Events</a>
      </p>
      <article>
        <h1 className="page-title">
          {event.title}
          {event.example ? <span className="badge badge-muted">Example</span> : null}
        </h1>
        <div className="event-facts">
          <p>{formatLongDate(event.start)}</p>
          <p>{event.location}</p>
          <p>
            {event.start.slice(11, 16)}–{event.end.slice(11, 16)} {event.timezone}
          </p>
        </div>
        <div className="actions">
          <a className="inline-action" href={`/events/${event.slug}.ics`}>
            Add to calendar
          </a>
          {event.url !== url ? (
            <a className="inline-action" href={event.url} rel="noreferrer" target="_blank">
              Event link
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
        </div>
        {content ? <div className="prose">{content}</div> : null}
      </article>
    </Shell>
  );
}
