import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

import { expect, test } from '@playwright/test';

import { bunExecutable } from '../lib/runtime';
import { staticParams } from '../lib/static-params';

const skipped = new Set([
  'node_modules',
  '.next',
  'out',
  'shots',
  '.git',
  'test-results',
  'playwright-report',
  'blob-report',
]);

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(path));
    else found.push(path);
  }
  return found;
}

test('an empty collection still yields one static param', () => {
  expect(staticParams([])).toEqual([{ slug: 'empty' }]);
  expect(staticParams(['example-evening'])).toEqual([{ slug: 'example-evening' }]);
});

test('next build with demos hidden succeeds and omits the demo', () => {
  test.setTimeout(180_000);
  const root = process.cwd();
  const dir = mkdtempSync(join(root, '.hidden-build-'));
  try {
    for (const entry of readdirSync(root)) {
      if (skipped.has(entry) || entry.startsWith('.hidden-build-')) continue;
      cpSync(join(root, entry), join(dir, entry), { recursive: true });
    }
    execFileSync('cp', ['-al', join(root, 'node_modules'), join(dir, 'node_modules')]);
    const env = { ...process.env };
    delete env.SHOW_DEMO_POSTS;
    delete env.REFRESH_CONTRIBUTIONS;
    delete env.CONTRIBUTIONS_TOKEN;
    execFileSync(bunExecutable(), ['run', 'build'], {
      cwd: dir,
      env,
      stdio: 'inherit',
    });
    const out = join(dir, 'out');
    expect(existsSync(join(out, 'index.html'))).toBe(true);
    for (const collection of ['writings', 'events']) {
      for (const suffix of ['.html', '.txt']) {
        expect(existsSync(join(out, `${collection}${suffix}`))).toBe(false);
      }
    }
    expect(existsSync(join(out, 'writings', 'markdown-demo.html'))).toBe(false);
    expect(existsSync(join(out, 'writings', 'markdown-demo.md'))).toBe(false);
    expect(existsSync(join(out, 'writings', 'demo-still.png'))).toBe(false);
    expect(existsSync(join(out, 'diagrams', 'markdown-demo-0.svg'))).toBe(false);
    for (const name of [
      'example-evening.html',
      'example-evening.md',
      'example-evening.ics',
      'empty.html',
    ]) {
      expect(existsSync(join(out, 'events', name))).toBe(false);
    }
    expect(existsSync(join(out, 'writings', 'empty.html'))).toBe(false);
    expect(readFileSync(join(out, 'index.html'), 'utf8')).not.toContain('Example evening');
    const names = walk(out).map((file) => relative(out, file));
    expect(names.some((name) => name.includes('markdown-demo'))).toBe(false);
    for (const file of ['sitemap.xml', 'llms.txt', 'llms-full.txt', 'rss.xml']) {
      const text = readFileSync(join(out, file), 'utf8');
      expect(text).not.toContain('markdown-demo');
      expect(text).not.toContain('example-evening');
      expect(text).not.toContain('/empty');
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
