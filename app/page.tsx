import type { Metadata } from 'next';
import { Carousel } from '../components/carousel';
import { Clock } from '../components/clock';
import { ContributionGraph } from '../components/contribution-graph';
import { JsonLd } from '../components/json-ld';
import { DateChip, ItemRow, NoteIcon } from '../components/rows';
import { Shell } from '../components/shell';
import { loadEvents, loadSlides, visibleWritings } from '../lib/content';
import { site } from '../lib/site';
import { formatClock, formatMonthYear, monthDay } from '../lib/time';

export const metadata: Metadata = {
  alternates: {
    canonical: site.url,
    types: {
      'text/markdown': `${site.url}/index.md`,
      'application/rss+xml': `${site.url}/rss.xml`,
    },
  },
  openGraph: {
    url: site.url,
    title: site.name,
    description: site.description,
    images: [{ url: '/og/home.png', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: ['/og/home.png'],
  },
};

export default function HomePage() {
  const writings = visibleWritings();
  const events = loadEvents();
  const slides = loadSlides();
  const latest = writings[0];
  const now = new Date();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${site.url}/#person`,
        name: site.name,
        url: site.url,
        email: site.email,
        homeLocation: {
          '@type': 'Place',
          name: site.locationLabel,
          latitude: site.latitude,
          longitude: site.longitude,
        },
        sameAs: [site.github],
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { '@id': `${site.url}/#person` },
      },
    ],
  };
  return (
    <Shell markdownHref="/index.md" pill>
      <JsonLd data={jsonLd} />
      {latest ? (
        <div className="news-pill">
          <a href={`/writings/${latest.slug}`}>
            <span className="badge">New</span>
            <span className="pill-title">{latest.title}</span>
          </a>
        </div>
      ) : null}
      <header className="identity">
        <img className="avatar" src="/avatar.png" alt={site.name} width={256} height={256} />
        <div>
          <h1 className="site-name">{site.name}</h1>
          <p className="place">
            {site.locationLabel} · {site.latitudeLabel} {site.longitudeLabel} ·{' '}
            <Clock initial={formatClock(now)} initialIso={now.toISOString()} />
          </p>
        </div>
      </header>
      <div className="bio">
        <p>
          I'm {site.name}. I live in {site.locationLabel}.
        </p>
        <p>This is a quiet home for notes, events, and a few pictures.</p>
        <p>
          You can reach me at <a href={`mailto:${site.email}`}>{site.email}</a>, or see my code on{' '}
          <a href={site.github} rel="noreferrer" target="_blank">
            GitHub
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </div>
      <ContributionGraph />
      {writings.length > 0 ? (
        <section className="section" aria-labelledby="writings-title">
          <h2 id="writings-title" className="section-title">
            Writings
          </h2>
          <div className="stack">
            {writings.map((post) => (
              <ItemRow
                key={post.slug}
                href={`/writings/${post.slug}`}
                icon={<NoteIcon />}
                title={post.title}
                meta={formatMonthYear(post.date)}
                badge={post.demo ? 'Demo' : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}
      {events.length > 0 ? (
        <section className="section" aria-labelledby="events-title">
          <h2 id="events-title" className="section-title">
            Events
          </h2>
          <p className="lede">
            RSVPs will be stored in Cloudflare D1 behind a Worker route. That part is not built yet.
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
        </section>
      ) : null}
      <section className="section" aria-labelledby="elsewhere-title">
        <h2 id="elsewhere-title" className="section-title">
          Elsewhere
        </h2>
        <Carousel slides={slides} />
      </section>
    </Shell>
  );
}
