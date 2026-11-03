import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ElsewherePhoto } from './elsewhere';

export type Slide = ElsewherePhoto & { srcSet: string };

export function loadSlides(): Slide[] {
  const base = (process.env.ELSEWHERE_BASE_URL ?? '/elsewhere').replace(/\/$/, '');
  if (!base.startsWith('/') || base.startsWith('//') || /[?#\\]|\.\./.test(base)) {
    throw new Error('ELSEWHERE_BASE_URL must be a same-origin path, such as /elsewhere');
  }
  const photos = JSON.parse(
    readFileSync(join(process.cwd(), 'lib', 'elsewhere.json'), 'utf8'),
  ) as ElsewherePhoto[];
  return photos.map((photo) => ({
    ...photo,
    src: `${base}/${photo.src}`,
    srcSet: photo.sizes.map((size) => `${base}/${size.file} ${size.width}w`).join(', '),
  }));
}
