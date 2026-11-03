import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { GeistSerifSquare } from 'geist/font/serif/square';
import { GeistSerif } from 'geist/font/serif/variable';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { site } from '../lib/site';
import { catState, initScript } from '../lib/time';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f2' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-cat={catState(new Date())}
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable} ${GeistSerifSquare.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
