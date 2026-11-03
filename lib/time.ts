import { site } from './site';

export type CatState = 'awake' | 'asleep';

export function mexicoCityHour(date: Date): number {
  const value = new Intl.DateTimeFormat('en-GB', {
    timeZone: site.timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return Number(value) % 24;
}

export function catState(date: Date): CatState {
  const hour = mexicoCityHour(date);
  return hour >= 22 || hour < 7 ? 'asleep' : 'awake';
}

export function formatClock(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: site.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  const period = (parts.find((part) => part.type === 'dayPeriod')?.value ?? 'am')
    .toLowerCase()
    .replace(/\./g, '');
  return `${hour}:${minute}${period} in Mexico City, Mexico`;
}

export function placeLine(clock: string): string {
  return `${site.locationLabel} · ${site.latitudeLabel} ${site.longitudeLabel} · ${clock}`;
}

export function withMexicoOffset(value: string): string {
  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) return value;
  return `${value}-06:00`;
}

export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMonthYear(iso: string): string {
  const [year, month] = iso.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function monthDay(iso: string): { month: string; day: string } {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date),
    day: String(day),
  };
}

export function initScript(): string {
  return `(function(){try{var k="theme";var c=localStorage.getItem(k);if(c!=="light"&&c!=="dark"&&c!=="auto")c="auto";var dark=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.dataset.theme=dark?"dark":"light";root.dataset.themeChoice=c;root.style.colorScheme=dark?"dark":"light";var hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"America/Mexico_City",hour:"2-digit",hourCycle:"h23"}).format(new Date()))%24;root.dataset.cat=(hour>=22||hour<7)?"asleep":"awake";var theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute("content",dark?"#0f0f0f":"#fcfcfc");}catch(e){}})();`;
}
