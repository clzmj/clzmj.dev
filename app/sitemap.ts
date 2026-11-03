import type { MetadataRoute } from 'next';

import { site } from '../lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: '2026-11-02', changeFrequency: 'weekly', priority: 1 }];
}
