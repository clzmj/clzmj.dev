import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from 'playwright';

import photos from '../lib/elsewhere.json';

function dataUrl(path: string, type: string): string {
  return `data:${type};base64,${readFileSync(join(process.cwd(), path)).toString('base64')}`;
}

// The ImageResponse comparison emitted a 402,813-byte PNG (>300 KB).
// Mirrors the approved og.html. Chromium preserves its CSS font metrics,
// overlapping rotated crops, shadows, and nearest-neighbor sprite scaling.
// Keep generated photos and the final JPEG outside Git.
export async function renderShareCard(page: Page) {
  const sans = dataUrl('node_modules/geist/dist/fonts/geist-sans/Geist-Variable.ttf', 'font/ttf');
  const mono = dataUrl(
    'node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.ttf',
    'font/ttf',
  );
  const bingo = dataUrl('public/bingo.png', 'image/png');
  const cards = [
    { id: '04', left: 10, top: 90, rotation: -12, position: '50% 40%' },
    { id: '07', left: 130, top: 50, rotation: -4, position: '50% 50%' },
    { id: '02', left: 250, top: 60, rotation: 5, position: '72% 50%' },
    { id: '10', left: 330, top: 110, rotation: 13, position: '50% 50%' },
  ]
    .map(({ id, left, top, rotation, position }) => {
      const photo = photos.find((photo) => photo.id === id);
      if (!photo) throw new Error(`Missing share-card photo ${id}`);
      const src = dataUrl(`public/elsewhere/${photo.src}`, 'image/webp');
      return `<div class="c" style="left:${left}px;top:${top}px;transform:rotate(${rotation}deg)"><img src="${src}" style="object-position:${position}" alt=""></div>`;
    })
    .join('');
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:G;src:url('${sans}') format('truetype');font-weight:100 900}
@font-face{font-family:GM;src:url('${mono}') format('truetype');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fcfcfc;font-family:G;color:#171717;position:relative;overflow:hidden}
.l{position:absolute;left:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:560px}
.bingo{width:112px;height:112px;image-rendering:pixelated;margin-bottom:36px;flex-shrink:0;background-image:url('${bingo}');background-size:448px 224px;background-repeat:no-repeat}
h1{font-size:76px;font-weight:600;letter-spacing:-0.035em;line-height:1}
.role{font-size:32px;color:#525252;margin-top:18px;letter-spacing:-0.01em}
.foot{position:absolute;left:80px;bottom:56px;font-family:GM;font-size:22px;color:#737373;display:flex;gap:14px;align-items:center}
.fan{position:absolute;right:64px;top:50%;width:520px;height:420px;transform:translateY(-50%)}
.c{position:absolute;width:210px;height:262px;border-radius:14px;overflow:hidden;border:5px solid #fff;box-shadow:0 18px 40px rgba(0,0,0,.18),0 2px 6px rgba(0,0,0,.08)}
.c img{width:100%;height:100%;object-fit:cover}
</style></head><body>
<div class="l"><div class="bingo"></div><h1>Carlos Lezama</h1><div class="role">ML &amp; Software Engineer</div></div>
<div class="foot"><span>clzmj.dev</span><span>·</span><span>Mexico City</span></div>
<div class="fan">${cards}</div></body></html>`,
    { waitUntil: 'load' },
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => image.decode()));
    if (!document.fonts.check('600 76px G') || !document.fonts.check('22px GM'))
      throw new Error('Share-card fonts did not load');
  });
  const jpeg = await page.screenshot({ type: 'jpeg', quality: 85 });
  if (jpeg.byteLength >= 300_000)
    throw new Error(`Share card exceeds 300 KB: ${jpeg.byteLength} bytes`);
  writeFileSync(join(process.cwd(), 'public/opengraph-image.jpg'), jpeg);
  console.log(`Share card: 1200×630 JPEG, ${jpeg.byteLength} bytes (Chromium, quality 85)`);
}
