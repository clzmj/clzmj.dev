import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { Callout } from '../components/callout';
import { injectDiagrams } from './diagrams';

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function linear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function readable(hex: string, background: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex) || contrast(hex, background) >= 4.5) return hex;
  const toward = luminance(background) > 0.5 ? [0, 0, 0] : [255, 255, 255];
  let red = Number.parseInt(hex.slice(1, 3), 16);
  let green = Number.parseInt(hex.slice(3, 5), 16);
  let blue = Number.parseInt(hex.slice(5, 7), 16);
  for (let step = 0; step < 24; step += 1) {
    red = Math.round(red + (toward[0] - red) * 0.15);
    green = Math.round(green + (toward[1] - green) * 0.15);
    blue = Math.round(blue + (toward[2] - blue) * 0.15);
    const next = `#${[red, green, blue].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
    if (contrast(next, background) >= 4.5) return next;
  }
  return luminance(background) > 0.5 ? '#1c1c1c' : '#f2f2f0';
}

function walk(
  node: HastNode,
  visit: (node: HastNode, parent?: HastNode) => void,
  parent?: HastNode,
) {
  visit(node, parent);
  for (const child of node.children ?? []) walk(child, visit, node);
}

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  if (node.tagName === 'input') return '';
  return (node.children ?? []).map(textOf).join('');
}

function accessibleCode() {
  return (tree: HastNode) => {
    walk(tree, (node, parent) => {
      if (node.tagName === 'input' && node.properties?.type === 'checkbox' && parent) {
        const label = textOf(parent).replace(/\s+/g, ' ').trim();
        const done = node.properties.checked !== undefined && node.properties.checked !== false;
        node.properties.ariaLabel = `${done ? 'Completed' : 'Not completed'}${label ? `: ${label}` : ''}`;
      }
      const style = node.properties?.style;
      if (typeof style !== 'string' || !style.includes('--shiki-')) return;
      node.properties = node.properties ?? {};
      node.properties.style = style.replace(
        /--shiki-(light|dark):(#(?:[0-9a-fA-F]{6}))/g,
        (_match, mode: string, hex: string) => {
          const background = mode === 'light' ? '#ffffff' : '#1b1b1b';
          return `--shiki-${mode}:${readable(hex, background)}`;
        },
      );
    });
  };
}

export async function renderMdx(source: string, slug?: string) {
  const prepared = slug ? injectDiagrams(slug, source) : source;
  const { content } = await compileMDX({
    source: prepared,
    components: { Callout },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeKatex,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              test: ['h2', 'h3'],
              properties: {
                className: ['heading-anchor'],
                ariaLabel: 'Link to this section',
              },
              content: { type: 'text', value: '#' },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: {
                light: 'github-light',
                dark: 'github-dark',
              },
              keepBackground: false,
            },
          ],
          accessibleCode,
        ],
      },
    },
  });
  return content;
}
