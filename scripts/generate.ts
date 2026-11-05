import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { chromium, type Page } from 'playwright';

import { parseContributions } from '../lib/contributions';
import { homeMarkdown, llmsText } from '../lib/publish';
import { site } from '../lib/site';

function writePublic(relativePath: string, contents: string | Uint8Array) {
  const path = join(process.cwd(), 'public', relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function resetGenerated() {
  for (const relative of [
    'public/og',
    'public/llms.txt',
    'public/llms-full.txt',
    'public/index.md',
  ]) {
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

function ogDocument(fontCss: string, title: string, description: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}html,body{margin:0;width:1200px;height:630px;background:#f4f4f2;color:#1c1c1c}body{box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;padding:72px;font-family:Geist,sans-serif}p{margin:0}.kicker{font-size:22px;letter-spacing:.08em;text-transform:uppercase;color:#4a4a4a}h1{margin:18px 0 0;max-width:980px;font-family:Serif,Georgia,serif;font-weight:400;font-size:76px;line-height:1.05} .sub{max-width:860px;font-size:28px;line-height:1.35;color:#4a4a4a}.foot{font-size:24px;color:#4a4a4a}</style></head><body><div><p class="kicker">clzmj.dev</p><h1>${escapeHtml(title)}</h1></div><p class="sub">${escapeHtml(description)}</p><p class="foot">${escapeHtml(site.name)} · Mexico City</p></body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderOgImages(page: Page) {
  const sans = readFileSync(
    join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2'),
  ).toString('base64');
  const serif = readFileSync(
    join(process.cwd(), 'node_modules/geist/dist/fonts/geist-serif/GeistSerif-Regular.woff2'),
  ).toString('base64');
  const fontCss = `@font-face{font-family:Geist;src:url(data:font/woff2;base64,${sans}) format("woff2");font-weight:100 900}@font-face{font-family:Serif;src:url(data:font/woff2;base64,${serif}) format("woff2");font-weight:400}`;
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogDocument(fontCss, site.name, site.description), { waitUntil: 'load' });
  writePublic('og/home.png', await page.screenshot({ type: 'png' }));
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
    await renderOgImages(page);
  } finally {
    await browser.close();
  }
}

await main();
