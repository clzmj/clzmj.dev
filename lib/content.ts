import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Slide = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export function loadSlides(): Slide[] {
  const raw = readFileSync(join(process.cwd(), 'content', 'photos.json'), 'utf8');
  const parsed = JSON.parse(raw) as Slide[];
  return parsed.map((slide) => ({
    ...slide,
    src: slide.src.startsWith('/') ? slide.src : `/photos/${slide.src}`,
  }));
}
