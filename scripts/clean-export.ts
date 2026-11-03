import { rmSync } from 'node:fs';
import { join } from 'node:path';

import { loadEvents, visibleWritings } from '../lib/content';

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

// Empty collection index pages also contain notFound() HTML. Remove their
// static files so /writings and /events use the host's 404 response.
for (const [collection, items] of [
  ['writings', visibleWritings()],
  ['events', loadEvents()],
] as const) {
  if (items.length > 0) continue;
  for (const suffix of ['.html', '.txt']) {
    rmSync(join(process.cwd(), 'out', `${collection}${suffix}`), { force: true });
  }
}
