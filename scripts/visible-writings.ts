import { loadWritings, visibleWritings } from '../lib/content';

const posts = visibleWritings(loadWritings());
process.stdout.write(`${posts.map((post) => post.slug).join('\n')}\n`);
process.stdout.write(`count:${posts.length}\n`);
