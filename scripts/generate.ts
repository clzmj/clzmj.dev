import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { chromium } from 'playwright';

import { parseContributions } from '../lib/contributions';
import { homeMarkdown, llmsText } from '../lib/publish';
import { site } from '../lib/site';
import { renderShareCard } from './share-card';

function writePublic(relativePath: string, contents: string | Uint8Array) {
  const path = join(process.cwd(), 'public', relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function resetGenerated() {
  // Remove the obsolete plain card from earlier local builds.
  rmSync(join(process.cwd(), 'public/og'), { recursive: true, force: true });
  for (const relative of ['public/llms.txt', 'public/llms-full.txt', 'public/index.md']) {
    rmSync(join(process.cwd(), relative), { recursive: true, force: true });
  }
}

async function refreshContributions() {
  const refresh =
    process.env.REFRESH_CONTRIBUTIONS === 'true' || Boolean(process.env.CONTRIBUTIONS_TOKEN);
  if (!refresh) return;
  const target = join(process.cwd(), 'content', 'contributions.json');
  try {
    const response = await fetch('https://github.com/users/clzmj/contributions', {
      headers: { 'user-agent': 'clzmj-dev-build' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`GitHub contributions returned ${response.status}`);
    const parsed = parseContributions(await response.text());
    if (!parsed) throw new Error('Could not read the contribution graph');
    writeFileSync(target, JSON.stringify(parsed));
  } catch (error) {
    try {
      readFileSync(target, 'utf8');
      console.error('Using the saved contribution graph.');
    } catch {
      throw error;
    }
  }
}

async function main() {
  resetGenerated();
  await refreshContributions();
  writePublic('index.md', homeMarkdown());
  writePublic('llms.txt', llmsText());
  writePublic('llms-full.txt', homeMarkdown());
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await renderShareCard(page);
  } finally {
    await browser.close();
  }
  for (const size of [180, 192, 512]) {
    const output = await new Bun.Image('public/avatar.png')
      .resize(size, size, { fit: 'fill' })
      .png()
      .bytes();
    writePublic(size === 180 ? 'manifest/apple-touch-icon.png' : `pwa-${size}.png`, output);
  }
  writePublic(
    'site.webmanifest',
    JSON.stringify({
      id: '/',
      name: site.title,
      short_name: site.siteName,
      start_url: '/',
      display: 'browser',
      background_color: '#fcfcfc',
      theme_color: '#fcfcfc',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/manifest/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    }),
  );
}

await main();
