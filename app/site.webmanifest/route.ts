import { site } from '../../lib/site';
import icon192 from '../icon-192.png';
import icon512 from '../icon-512.png';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    {
      id: '/',
      name: site.title,
      short_name: site.siteName,
      start_url: '/',
      display: 'browser',
      background_color: '#fcfcfc',
      theme_color: '#fcfcfc',
      icons: [
        { src: icon192.src, sizes: '192x192', type: 'image/png' },
        { src: icon512.src, sizes: '512x512', type: 'image/png' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}
