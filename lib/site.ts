export const site = {
  name: 'Carlos Lezama',
  title: 'Carlos Lezama · ML & Software Engineer',
  siteName: 'clzmj.dev',
  jobTitle: 'ML & Software Engineer',
  url: 'https://clzmj.dev',
  email: 'hello@clzmj.dev',
  description:
    'ML and software engineer at Zillow, based in Mexico City. Previously data and ML at DD360, RappiCard and DiDi Food.',
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
