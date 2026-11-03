import { rmSync } from 'node:fs';
import { join } from 'node:path';

// Next's static export needs a sentinel parameter for empty dynamic collections.
// Its notFound() HTML would be served with HTTP 200 by a static host; remove the
// generated sentinel files so hosts use the real 404 response instead.
for (const collection of ['writings', 'events']) {
  for (const suffix of ['.html', '.txt', '.rsc', '']) {
    rmSync(join(process.cwd(), 'out', collection, `empty${suffix}`), {
      force: true,
      recursive: true,
    });
  }
}
