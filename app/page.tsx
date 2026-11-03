import type { Metadata } from 'next';

import { Bio, roleLine } from '../components/bio';
import { ContributionGraph } from '../components/contribution-graph';
import { JsonLd } from '../components/json-ld';
import { NewsPill } from '../components/news-pill';
import { PhotoFan } from '../components/photo-fan';
import { RowList } from '../components/row-list';
import { DateChip, ItemRow, NoteIcon, WritingDate } from '../components/rows';
import { Shell } from '../components/shell';
import { loadEvents, loadSlides, visibleWritings } from '../lib/content';
import { site } from '../lib/site';
import { formatMonthYear, monthDay } from '../lib/time';

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
  const photos = loadSlides();
  const latest = writings[0];
  const role = roleLine();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${site.url}/#person`,
        name: site.name,
        url: site.url,
        email: site.email,
        jobTitle: role,
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
    <Shell markdownHref="/index.md">
      <JsonLd data={jsonLd} />
      {latest ? <NewsPill href={`/writings/${latest.slug}`} title={latest.title} /> : null}
      <header
        className="identity animate-enter animate-enter-individual"
        style={{ ['--stagger' as string]: 0 }}
      >
        <img className="avatar" src="/avatar.png" alt={site.name} width={256} height={256} />
        <div>
          <h1 className="site-name">{site.name}</h1>
          <p className="role">{role}</p>
        </div>
      </header>
      <div
        className="animate-enter animate-enter-individual"
        style={{ ['--stagger' as string]: 1 }}
      >
        <Bio />
      </div>
      <ContributionGraph />
      {writings.length > 0 ? (
        <section
          className="section animate-enter animate-enter-individual"
          style={{ ['--stagger' as string]: 3 }}
          aria-labelledby="writings-title"
        >
          <h2 id="writings-title" className="section-title">
            Writings
          </h2>
          <RowList>
            {writings.map((post, index) => (
              <ItemRow
                key={post.slug}
                href={`/writings/${post.slug}`}
                icon={<NoteIcon />}
                title={post.title}
                meta={<WritingDate date={post.date} />}
                badge={post.demo ? 'Demo' : index === 0 ? 'New' : undefined}
              />
            ))}
          </RowList>
        </section>
      ) : null}
      {events.length > 0 ? (
        <section
          className="section animate-enter animate-enter-individual"
          style={{ ['--stagger' as string]: 4 }}
          aria-labelledby="events-title"
        >
          <h2 id="events-title" className="section-title">
            Events
          </h2>
          <RowList>
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
          </RowList>
        </section>
      ) : null}
      <section
        className="section section-elsewhere animate-enter animate-enter-individual"
        style={{ ['--stagger' as string]: 5 }}
        aria-labelledby="elsewhere-title"
      >
        <h2 id="elsewhere-title" className="section-title">
          Elsewhere
        </h2>
        <PhotoFan photos={photos} />
      </section>
    </Shell>
  );
}
