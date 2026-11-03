import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { RowList } from '../../components/row-list';
import { ItemRow, NoteIcon, WritingDate } from '../../components/rows';
import { Shell } from '../../components/shell';
import { visibleWritings } from '../../lib/content';
import { site } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Writings',
  description: 'Notes by Carlos Lezama.',
  alternates: {
    canonical: `${site.url}/writings`,
    types: { 'text/markdown': `${site.url}/writings.md` },
  },
  openGraph: {
    title: 'Writings',
    description: 'Notes by Carlos Lezama.',
    url: `${site.url}/writings`,
    images: [{ url: '/og/writings.png', width: 1200, height: 630, alt: 'Writings' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writings',
    description: 'Notes by Carlos Lezama.',
    images: ['/og/writings.png'],
  },
};

export default function WritingsPage() {
  const posts = visibleWritings();
  if (posts.length === 0) notFound();
  return (
    <Shell markdownHref="/writings.md">
      <a className="home-mark" href="/">
        <img
          className="avatar"
          src="/avatar.png"
          alt="Carlos Lezama, home"
          width={256}
          height={256}
        />
      </a>
      <h1 className="page-title">Writings</h1>
      <RowList>
        {posts.map((post) => (
          <ItemRow
            key={post.slug}
            href={`/writings/${post.slug}`}
            icon={<NoteIcon />}
            title={post.title}
            meta={<WritingDate date={post.date} detailed />}
            badge={post.demo ? 'Demo' : undefined}
          />
        ))}
      </RowList>
    </Shell>
  );
}
