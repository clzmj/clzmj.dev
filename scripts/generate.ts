import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { chromium } from 'playwright';

import { fetchContributions } from '../lib/contribution-fetch';
import { loadContributions } from '../lib/contributions';
import { homeMarkdown, llmsText } from '../lib/publish';
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
  const target = join(process.cwd(), 'content', 'contributions.json');
  const parsed = await fetchContributions();
  if (parsed) {
    writeFileSync(target, JSON.stringify(parsed));
    if (parsed.sources?.length === 1) {
      console.warn(
        `Only ${parsed.sources[0]} contributions are available; the other source was skipped.`,
      );
    }
  } else if (loadContributions()) {
    console.error('Both contribution sources failed; using the saved contribution graph.');
  } else {
    console.error('Both contribution sources failed and no saved contribution graph is available.');
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
}

await main();
