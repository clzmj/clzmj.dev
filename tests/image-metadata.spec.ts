import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import photos from '../lib/elsewhere.json';
import { bunExecutable } from '../lib/runtime';
import { imageMetadataChunks } from '../scripts/image-metadata';
import { photoQuality } from '../scripts/photo-output-policy';

function images(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? images(path)
      : /\.(?:png|jpe?g|webp|avif|gif|svg|tiff?|heic|heif|ico)$/i.test(entry.name)
        ? [path]
        : [];
  });
}

test('public outputs and sanitized Elsewhere sources contain no EXIF/GPS or other descriptive metadata', () => {
  const source = resolve(process.env.ELSEWHERE_SRC ?? 'assets/elsewhere');
  const paths = [...images('public'), ...images(source)];
  expect(paths.length).toBeGreaterThanOrEqual(36);
  for (const path of paths) expect(imageMetadataChunks(readFileSync(path)), path).toEqual([]);
});

test('public photos meet the 300 KB small / 600 KB large budgets; sources are not size-limited', () => {
  for (const path of images('public')) {
    const variant = photos
      .flatMap((photo) => photo.sizes)
      .find((size) => path.endsWith(`/elsewhere/${size.file}`));
    const cap = path.endsWith('/elsewhere/04-1937.webp')
      ? 850_000
      : variant && variant.width > 640
        ? 600_000
        : 300_000;
    expect(statSync(path).size, path).toBeLessThan(cap);
  }
});

test('the byte parser rejects EXIF/GPS in JPEG, PNG and WebP containers', () => {
  const payload = Buffer.from('Exif\0\0GPS latitude longitude');
  const length = Buffer.alloc(2);
  length.writeUInt16BE(payload.length + 2);
  const jpeg = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
    length,
    payload,
    Buffer.from([0xff, 0xd9]),
  ]);
  expect(imageMetadataChunks(jpeg)).toContain('APP1 (EXIF/XMP, including GPS)');
  const pngLength = Buffer.alloc(4);
  pngLength.writeUInt32BE(payload.length);
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngLength,
    Buffer.from('eXIf'),
    payload,
    Buffer.alloc(4),
  ]);
  expect(imageMetadataChunks(png)).toContain('eXIf');
  const webpLength = Buffer.alloc(4);
  webpLength.writeUInt32LE(payload.length);
  const webp = Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.alloc(4),
    Buffer.from('WEBPEXIF'),
    webpLength,
    payload,
    Buffer.alloc(payload.length % 2),
  ]);
  expect(imageMetadataChunks(webp)).toContain('EXIF');
});

test('variants keep real dimensions, never upscale, and omit unavailable requested sizes', () => {
  const source = resolve(process.env.ELSEWHERE_SRC ?? 'assets/elsewhere');
  const script = `const photos=await Bun.file('lib/elsewhere.json').json();const result=[];for(const photo of photos){const original=await new Bun.Image(${JSON.stringify(source)}+'/'+photo.id+'.jpg').metadata();const sizes=[];for(const size of photo.sizes)sizes.push(await new Bun.Image('public/elsewhere/'+size.file).metadata());result.push({original,sizes});}console.log(JSON.stringify(result));`;
  const sizes = JSON.parse(execFileSync(bunExecutable(), ['-e', script], { encoding: 'utf8' })) as {
    original: { width: number; height: number };
    sizes: { width: number; height: number }[];
  }[];
  for (const [index, photo] of photos.entries()) {
    expect(photo.sizes.length).toBeGreaterThan(0);
    for (const [n, size] of photo.sizes.entries()) {
      expect(sizes[index].sizes[n]).toMatchObject({ width: size.width, height: size.height });
      expect(size.width).toBeLessThanOrEqual(sizes[index].original.width);
      expect(size.height).toBeLessThanOrEqual(sizes[index].original.height);
      expect(
        Math.abs(
          size.height - (size.width * sizes[index].original.height) / sizes[index].original.width,
        ),
      ).toBeLessThanOrEqual(1);
    }
    expect(photo.sizes.at(-1)!.width).toBe(Math.min(sizes[index].original.width, 2400));
    for (const width of [640, 1080, 1600, 2400])
      if (width > sizes[index].original.width)
        expect(photo.sizes.some((size) => size.width === width)).toBe(false);
  }
});

test('missing and empty source directories fail prebuild clearly', () => {
  const empty = mkdtempSync(join(tmpdir(), 'elsewhere-empty-'));
  try {
    for (const source of [empty, join(empty, 'missing')]) {
      let message = '';
      try {
        execFileSync(bunExecutable(), ['scripts/build-photos.ts'], {
          env: { ...process.env, ELSEWHERE_SRC: source },
          stdio: 'pipe',
        });
      } catch (error) {
        message = String((error as { stderr: Buffer }).stderr);
      }
      expect(message).toMatch(/Elsewhere source folder is (missing|empty)/);
    }
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('ELSEWHERE_BASE_URL changes static URLs and rejects cross-origin bases', () => {
  const script = `import {loadSlides} from './lib/content';console.log(JSON.stringify(loadSlides().map(p=>({src:p.src,srcSet:p.srcSet}))));`;
  const result = JSON.parse(
    execFileSync(bunExecutable(), ['-e', script], {
      encoding: 'utf8',
      env: { ...process.env, ELSEWHERE_BASE_URL: '/r2-photos' },
    }),
  ) as { src: string; srcSet: string }[];
  expect(result).toHaveLength(17);
  for (const photo of result) {
    expect(photo.src).toMatch(/^\/r2-photos\//);
    expect(photo.srcSet).toMatch(/^\/r2-photos\//);
  }
  expect(() =>
    execFileSync(bunExecutable(), ['-e', script], {
      stdio: 'pipe',
      env: { ...process.env, ELSEWHERE_BASE_URL: 'https://example.com' },
    }),
  ).toThrow();
});

test('Elsewhere source and output image folders are never tracked by git', () => {
  const tracked = execFileSync(
    'git',
    ['ls-files', '-z', '--', 'assets/elsewhere/', 'public/elsewhere/'],
    { encoding: 'utf8' },
  );
  expect(tracked).toBe('');
});

test('only photo 02 at 2400px gets the q80 size exception', () => {
  for (const photo of photos)
    for (const width of [640, 1080, 1600, 2400]) {
      expect(photoQuality(photo.id, width)).toBe(photo.id === '02' && width === 2400 ? 80 : 85);
    }
});
