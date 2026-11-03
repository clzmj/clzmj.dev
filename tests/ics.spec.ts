import { expect, test } from '@playwright/test';
import type { SiteEvent } from '../lib/content';
import { eventToIcs } from '../lib/ics';

const event: SiteEvent = {
  slug: 'reunion',
  title: 'Reunión de diseño',
  start: '2026-12-04T19:00:00',
  end: '2026-12-04T21:00:00',
  timezone: 'America/Mexico_City',
  location: 'Ciudad de México',
  url: 'https://clzmj.dev/events/reunion',
  status: 'upcoming',
  example: false,
  body: `${'Reunión de diseño en México. '.repeat(8)}Música, café y compañeros.`,
};

test('calendar lines fold at 75 octets and keep accented Spanish', () => {
  const ics = eventToIcs(event, new Date('2026-11-02T12:00:00Z'));
  const lines = ics.split('\r\n').filter((line) => line.length > 0);
  for (const line of lines) {
    expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
  }
  expect(lines.some((line) => line.startsWith(' '))).toBe(true);
  const unfolded = ics.replace(/\r\n[ \t]/g, '');
  expect(unfolded).toContain('Reunión de diseño en México');
  expect(unfolded).toContain('Música\\, café y compañeros');
});
