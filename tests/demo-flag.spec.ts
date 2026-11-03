import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const bun = join(process.env.HOME ?? '', '.bun/bin/bun');

function list(flag: string): string {
  return execFileSync(bun, ['scripts/visible-writings.ts'], {
    cwd: process.cwd(),
    env: { ...process.env, SHOW_DEMO_POSTS: flag },
    encoding: 'utf8',
  });
}

test('the demo post hide flag removes demo posts and the built site shows them', async ({
  page,
}) => {
  const hidden = list('false');
  expect(hidden).toContain('count:0');
  expect(hidden).not.toContain('markdown-demo');
  const shown = list('true');
  expect(shown).toContain('markdown-demo');
  expect(shown).toContain('count:1');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'Writings' })).toBeVisible();
  await page.goto('/writings/markdown-demo');
  await expect(page.getByRole('heading', { level: 1, name: 'Markdown demo' })).toBeVisible();
});
