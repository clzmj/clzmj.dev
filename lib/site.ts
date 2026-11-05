export const site = {
  name: 'Carlos Lezama',
  url: 'https://clzmj.dev',
  email: 'hello@clzmj.dev',
  description: 'Carlos Lezama, ML & Software Engineer in Mexico City.',
  github: 'https://github.com/clzmj',
  locale: 'en_US',
  timezone: 'America/Mexico_City',
  locationLabel: 'Mexico City',
  latitudeLabel: '19.43°N',
  longitudeLabel: '99.13°W',
  latitude: 19.43,
  longitude: -99.13,
  zoneAbbrev: 'CST',
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${site.url}${suffix}`;
}
