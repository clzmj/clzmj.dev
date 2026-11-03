import type { SiteEvent } from './content';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function stamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function wall(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) throw new Error(`Cannot format ${value} for a calendar file`);
  return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}00`;
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function fold(line: string): string {
  const encoder = new TextEncoder();
  const characters = Array.from(line);
  const parts: string[] = [];
  let current = '';
  let used = 0;
  let limit = 75;
  for (const character of characters) {
    const size = encoder.encode(character).length;
    if (used + size > limit && current.length > 0) {
      parts.push(current);
      current = character;
      used = size;
      limit = 74;
    } else {
      current += character;
      used += size;
    }
  }
  if (current.length > 0) parts.push(current);
  return parts.map((part, index) => (index === 0 ? part : ` ${part}`)).join('\r\n');
}

export function eventToIcs(event: SiteEvent, publishedAt: Date = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//clzmj.dev//events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${event.timezone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:-0600',
    'TZOFFSETTO:-0600',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${event.slug}@clzmj.dev`,
    `DTSTAMP:${stamp(publishedAt)}`,
    `DTSTART;TZID=${event.timezone}:${wall(event.start)}`,
    `DTEND;TZID=${event.timezone}:${wall(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${event.url}`,
    `DESCRIPTION:${escapeText(event.body || event.title)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
