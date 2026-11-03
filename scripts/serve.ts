import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const port = Number(process.env.PORT ?? 3000);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.ics': 'text/calendar; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

function resolveFile(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname.split('?')[0] ?? '/');
  const trimmed = decoded.replace(/^\/+/, '');
  if (trimmed.includes('..')) return null;
  const candidates =
    trimmed.endsWith('/') || trimmed === ''
      ? [join(root, trimmed, 'index.html')]
      : [join(root, trimmed), join(root, `${trimmed}.html`), join(root, trimmed, 'index.html')];
  for (const candidate of candidates) {
    const normal = normalize(candidate);
    if (!normal.startsWith(root)) continue;
    if (!existsSync(normal) || statSync(normal).isDirectory()) continue;
    return normal;
  }
  return null;
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const file = resolveFile(url.pathname);
    if (file) {
      const body = Bun.file(file);
      return new Response(body, {
        headers: { 'content-type': types[extname(file)] ?? 'application/octet-stream' },
      });
    }
    const missing = join(root, '404.html');
    if (existsSync(missing)) {
      return new Response(Bun.file(missing), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
});

console.log(`Serving ${root} at http://127.0.0.1:${port}`);
