export const emptySlug = 'empty';

export function staticParams(slugs: string[]): { slug: string }[] {
  if (slugs.length === 0) return [{ slug: emptySlug }];
  return slugs.map((slug) => ({ slug }));
}
