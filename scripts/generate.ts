import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium, type Page } from 'playwright';
import { loadEvents, loadWritings, visibleWritings } from '../lib/content';
import { parseContributions } from '../lib/contributions';
import { diagramBlocks } from '../lib/diagrams';
import { eventToIcs } from '../lib/ics';
import { llmsFullText, llmsText, markdownFor, rssXml } from '../lib/publish';
import { pageRoutes } from '../lib/routes';
import { showDemoPosts, site } from '../lib/site';

function writePublic(relativePath: string, contents: string | Uint8Array) {
  const path = join(process.cwd(), 'public', relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function resetGenerated() {
  for (const relative of [
    'public/diagrams',
    'public/og',
    'public/rss.xml',
    'public/llms.txt',
    'public/llms-full.txt',
    'public/index.md',
    'public/writings.md',
    'public/events.md',
    'public/writings',
    'public/events',
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

async function renderDiagrams(page: Page) {
  const script = readFileSync(
    join(process.cwd(), 'node_modules/mermaid/dist/mermaid.min.js'),
    'utf8',
  );
  const posts = visibleWritings(loadWritings());
  for (const post of posts) {
    const blocks = diagramBlocks(post.body);
    for (const [index, block] of blocks.entries()) {
      await page.setContent('<!doctype html><html><body></body></html>');
      await page.addScriptTag({ content: script });
      const svg = await page.evaluate(async (code) => {
        const mermaidApi = (
          window as unknown as {
            mermaid: {
              initialize: (options: unknown) => void;
              render: (id: string, source: string) => Promise<{ svg: string }>;
            };
          }
        ).mermaid;
        mermaidApi.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
        const rendered = await mermaidApi.render(`diagram-${Date.now()}`, code);
        return rendered.svg;
      }, block.code);
      writePublic(`diagrams/${post.slug}-${index}.svg`, svg);
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
  for (const route of pageRoutes()) {
    await page.setContent(ogDocument(fontCss, route.title, route.description), {
      waitUntil: 'load',
    });
    const name = route.ogImage.replace(/^\//, '');
    const buffer = await page.screenshot({ type: 'png' });
    writePublic(name, buffer);
  }
}

function publishDemoImage(writings: { slug: string; demo: boolean }[]) {
  const source = join(process.cwd(), 'content', 'writings', 'demo-still.png');
  if (!showDemoPosts() || !writings.some((post) => post.demo) || !existsSync(source)) return;
  const target = join(process.cwd(), 'public', 'writings', 'demo-still.png');
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
}

async function main() {
  resetGenerated();
  await refreshContributions();
  const writings = visibleWritings(loadWritings());
  const events = loadEvents();
  publishDemoImage(writings);
  const routes = pageRoutes(writings, events);
  for (const route of routes) {
    const relative = route.markdownPath.replace(/^\//, '');
    writePublic(relative, markdownFor(route, writings, events));
  }
  for (const event of events) {
    writePublic(`events/${event.slug}.ics`, eventToIcs(event));
  }
  writePublic('llms.txt', llmsText(writings, events));
  writePublic('llms-full.txt', llmsFullText(writings));
  writePublic('rss.xml', rssXml(writings));
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await renderDiagrams(page);
    await renderOgImages(page);
  } finally {
    await browser.close();
  }
}

await main();
