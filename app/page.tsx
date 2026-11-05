import type { Metadata } from 'next';

import { Bingo } from '../components/bingo';
import { Bio, roleLine } from '../components/bio';
import { ContributionGraph } from '../components/contribution-graph';
import { JsonLd } from '../components/json-ld';
import { PhotoFan } from '../components/photo-fan';
import { Shell } from '../components/shell';
import { loadSlides } from '../lib/content';
import { site } from '../lib/site';

export const metadata: Metadata = {
  alternates: {
    canonical: site.url,
    types: {
      'text/markdown': `${site.url}/index.md`,
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
  const photos = loadSlides();
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
      <div className="main-stack gap-10">
        <div className="profile-section">
          <header
            className="identity animate-enter animate-enter-individual"
            style={{ ['--stagger' as string]: 0 }}
          >
            <Bingo />
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
        </div>
        <ContributionGraph />
        <section
          className="section section-elsewhere animate-enter animate-enter-individual"
          style={{ ['--stagger' as string]: 3 }}
          aria-labelledby="elsewhere-title"
        >
          <h2 id="elsewhere-title" className="section-title">
            Elsewhere
          </h2>
          <PhotoFan photos={photos} />
        </section>
      </div>
    </Shell>
  );
}
