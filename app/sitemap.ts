import type { MetadataRoute } from 'next';
import { canonical, pageRoutes } from '../lib/routes';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return pageRoutes().map((route) => ({
    url: canonical(route.path),
    lastModified: route.date ?? '2026-11-02',
    changeFrequency: route.kind === 'home' ? 'weekly' : 'monthly',
    priority: route.kind === 'home' ? 1 : 0.7,
  }));
}
