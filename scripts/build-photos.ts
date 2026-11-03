import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

import type { ElsewherePhoto } from '../lib/elsewhere';
import { imageMetadataChunks } from './image-metadata';
import { photoQuality } from './photo-output-policy';

const source = resolve(process.env.ELSEWHERE_SRC ?? 'assets/elsewhere');
const output = join(process.cwd(), 'public', 'elsewhere');
const manifestPath = join(process.cwd(), 'lib', 'elsewhere.json');

function dominantColor(png: Uint8Array): string {
  const data = Buffer.from(png);
  if (data[24] !== 8 || ![2, 6].includes(data[25]))
    throw new Error('Expected a true-color 1×1 PNG');
  const chunks: Buffer[] = [];
  for (let offset = 8; offset + 12 <= data.length;) {
    const length = data.readUInt32BE(offset);
    if (data.toString('ascii', offset + 4, offset + 8) === 'IDAT')
      chunks.push(data.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  // In the first pixel all PNG filter predictors are zero.
  const pixel = inflateSync(Buffer.concat(chunks));
  return `#${pixel.subarray(1, 4).toString('hex')}`;
}

async function main() {
  if (typeof Bun.Image !== 'function')
    throw new Error(
      'Bun.Image is required; use Bun >= 1.3.14. No fallback image processor is used.',
    );
  let files: string[];
  try {
    files = readdirSync(source);
  } catch {
    throw new Error(
      `Elsewhere source folder is missing: ${source}. Populate assets/elsewhere/ with the 17 sanitized JPGs, or set ELSEWHERE_SRC.`,
    );
  }
  if (!files.some((file) => file.endsWith('.jpg')))
    throw new Error(
      `Elsewhere source folder is empty: ${source}. Supply the 17 sanitized JPGs before building.`,
    );
  const photos = JSON.parse(readFileSync(manifestPath, 'utf8')) as ElsewherePhoto[];
  if (photos.length !== 17)
    throw new Error('The Elsewhere manifest must contain 17 photos in order');
  for (const photo of photos) {
    const file = join(source, `${photo.id}.jpg`);
    if (!files.includes(`${photo.id}.jpg`)) throw new Error(`Missing sanitized source: ${file}`);
    const tags = imageMetadataChunks(readFileSync(file));
    if (tags.length) throw new Error(`${file} contains metadata: ${tags.join(', ')}`);
    if (![photo.focal.x, photo.focal.y].every((n) => Number.isFinite(n) && n >= 0 && n <= 1))
      throw new Error(`Invalid focal point: ${photo.id}`);
  }
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  let total = 0;
  let largest = { file: '', bytes: 0 };
  for (const photo of photos) {
    const file = join(source, `${photo.id}.jpg`);
    const original = await new Bun.Image(file).metadata();
    const widths = [
      ...new Set([
        ...[640, 1080, 1600, 2400].filter((width) => width <= original.width),
        Math.min(original.width, 2400),
      ]),
    ].sort((a, b) => a - b);
    photo.sizes = [];
    for (const width of widths) {
      const height = Math.round((original.height * width) / original.width);
      // Preserve the native Paris/q85 output; this one measured file needs 811,572 bytes.
      const budget =
        photo.id === '04' && width === 1937 ? 850_000 : width <= 640 ? 300_000 : 600_000;
      const quality = photoQuality(photo.id, width);
      const bytes = await new Bun.Image(file)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .bytes();
      if (bytes.byteLength > budget)
        throw new Error(
          `Photo ${photo.id} at ${width}px/q${quality} is ${bytes.byteLength} bytes, exceeding its ${budget}-byte cap`,
        );
      const tags = imageMetadataChunks(bytes);
      if (tags.length)
        throw new Error(`Bun.Image output unexpectedly retains metadata: ${tags.join(', ')}`);
      const actual = await new Bun.Image(bytes).metadata();
      const name = `${photo.id}-${actual.width}.webp`;
      writeFileSync(join(output, name), bytes);
      photo.sizes.push({ file: name, width: actual.width, height: actual.height });
      total += bytes.byteLength;
      if (bytes.byteLength > largest.bytes) largest = { file: name, bytes: bytes.byteLength };
    }
    const full = photo.sizes.at(-1)!;
    photo.src = full.file;
    photo.width = full.width;
    photo.height = full.height;
    photo.objectPosition = `${photo.focal.x * 100}% ${photo.focal.y * 100}%`;
    photo.color = dominantColor(
      await new Bun.Image(file).resize(1, 1, { fit: 'fill' }).png().bytes(),
    );
  }
  writeFileSync(manifestPath, `${JSON.stringify(photos, null, 2)}\n`);
  console.log(
    `Elsewhere: Bun ${Bun.version}, ${photos.flatMap((p) => p.sizes).length} WebPs, ${total} bytes total; largest ${largest.file}: ${largest.bytes} bytes`,
  );
}

await main();
