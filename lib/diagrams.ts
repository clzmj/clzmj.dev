import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DiagramBlock = {
  alt: string;
  code: string;
};

export function diagramBlocks(source: string): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  for (const match of source.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    const raw = match[1] ?? '';
    const alt = raw.match(/^%%\s*alt:\s*(.+)$/m)?.[1]?.trim() || 'Diagram';
    const code = raw.replace(/^%%\s*alt:.*(?:\r?\n)?/m, '').trim();
    blocks.push({ alt, code });
  }
  return blocks;
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function diagramSize(publicPath: string): { width: number; height: number } {
  const file = join(process.cwd(), 'public', publicPath);
  if (!existsSync(file)) return { width: 720, height: 280 };
  const svg = readFileSync(file, 'utf8');
  const viewBox = svg.match(/viewBox="[0-9.]+ [0-9.]+ ([0-9.]+) ([0-9.]+)"/);
  if (!viewBox) return { width: 720, height: 280 };
  return {
    width: Math.max(1, Math.ceil(Number(viewBox[1]))),
    height: Math.max(1, Math.ceil(Number(viewBox[2]))),
  };
}

export function injectDiagrams(slug: string, source: string): string {
  let index = 0;
  return source.replace(/```mermaid\n[\s\S]*?```/g, (block) => {
    const current = diagramBlocks(block)[0];
    const alt = escapeAttribute(current?.alt ?? 'Diagram');
    const file = `/diagrams/${slug}-${index}.svg`;
    const size = diagramSize(file);
    index += 1;
    return `<figure className="diagram"><img src="${file}" alt="${alt}" width="${size.width}" height="${size.height}" /><figcaption>${alt}</figcaption></figure>`;
  });
}
