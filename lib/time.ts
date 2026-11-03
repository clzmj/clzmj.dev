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
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: site.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return `${time} in Mexico City`;
}

export function initScript(): string {
  return `(function(){try{var k="theme";var c=localStorage.getItem(k);if(c!=="light"&&c!=="dark"&&c!=="auto")c="auto";var dark=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.dataset.theme=dark?"dark":"light";root.dataset.themeChoice=c;root.style.colorScheme=dark?"dark":"light";var hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"America/Mexico_City",hour:"2-digit",hourCycle:"h23"}).format(new Date()))%24;root.dataset.cat=(hour>=22||hour<7)?"asleep":"awake";var theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute("content",dark?"#0f0f0f":"#fcfcfc");}catch(e){}})();`;
}
