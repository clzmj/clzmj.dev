import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../../components/json-ld';
import { Shell } from '../../../components/shell';
import { visibleWritings } from '../../../lib/content';
import { renderMdx } from '../../../lib/mdx';
import { site } from '../../../lib/site';
import { formatLongDate } from '../../../lib/time';

export function generateStaticParams() {
  return visibleWritings().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = visibleWritings().find((item) => item.slug === slug);
  if (!post) return {};
  const url = `${site.url}/writings/${post.slug}`;
  const image = `/og/writings-${post.slug}.png`;
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
      types: { 'text/markdown': `${url}.md` },
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}

export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = visibleWritings().find((item) => item.slug === slug);
  if (!post) notFound();
  const content = await renderMdx(post.body, post.slug);
  const url = `${site.url}/writings/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['BlogPosting', 'Article'],
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: site.name, url: site.url },
    mainEntityOfPage: url,
    url,
    image: `${site.url}/og/writings-${post.slug}.png`,
  };
  return (
    <Shell markdownHref={`/writings/${post.slug}.md`}>
      <JsonLd data={jsonLd} />
      <p className="page-kicker">
        <a href="/writings">Writings</a>
      </p>
      <article>
        <h1 className="page-title">{post.title}</h1>
        <p className="meta-line">
          {formatLongDate(post.date)}
          {post.demo ? ' · Demo' : ''}
        </p>
        <div className="prose">{content}</div>
      </article>
    </Shell>
  );
}
