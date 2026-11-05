import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { GeistSerif } from 'geist/font/serif/variable';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { site } from '../lib/site';
import { initScript } from '../lib/time';
import icon16 from './icon-16.png';
import icon32 from './icon-32.png';
import icon192 from './icon-192.png';
import icon512 from './icon-512.png';

import './globals.css';

const shareImageVersion = createHash('sha256')
  .update(readFileSync('public/opengraph-image.jpg'))
  .digest('hex')
  .slice(0, 8);
const shareImageUrl = `${site.url}/opengraph-image.jpg?v=${shareImageVersion}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  manifest: '/site.webmanifest',
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  icons: {
    icon: [
      { url: icon16.src, sizes: '16x16', type: 'image/png' },
      { url: icon32.src, sizes: '32x32', type: 'image/png' },
      { url: icon192.src, sizes: '192x192', type: 'image/png' },
      { url: icon512.src, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/manifest/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.siteName,
    title: site.title,
    description: site.description,
    images: [
      {
        url: shareImageUrl,
        width: 1200,
        height: 630,
        alt: 'Carlos Lezama, ML & Software Engineer: pixel-art Bingo next to a fan of four travel photos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    creator: '@clzmj',
    images: [
      {
        url: shareImageUrl,
        alt: 'Carlos Lezama, ML & Software Engineer: pixel-art Bingo next to a fan of four travel photos',
      },
    ],
  },
  other: {
    'twitter:image:width': '1200',
    'twitter:image:height': '630',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
