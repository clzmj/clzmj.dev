# clzmj.dev

Personal site for Carlos Lezama. Static Next.js app, built with Bun, published as Cloudflare Workers static assets.

## Develop

```bash
bun install
bunx playwright install chromium
bun run dev
```

`bun run dev` generates profile Markdown and the Open Graph image, then starts Next. The build needs Playwright's Chromium.

## Build

```bash
bun run build
```

The static site is written to `out/`. That directory is the Worker asset bundle. `bun run build` runs `scripts/generate.ts` first (the `prebuild` hook), then `next build` with `output: 'export'`.

Generation renders the Open Graph image in Chromium. The contribution snapshot in `content/contributions.json` is reused as-is. Set `REFRESH_CONTRIBUTIONS=true` or `CONTRIBUTIONS_TOKEN` when that file should be fetched again.

Check the result locally:

```bash
bun run start
```

That serves `out/` on port 3000.

## Worker

`wrangler.jsonc` is the only Worker config. The Worker name is `clzmj-dev` and `assets.directory` is `./out`. It does not set routes, a custom domain, or any zone settings. Terraform in `infra/` owns the apex domain, DNS, and redirects. On merge, CI deploys with `wrangler deploy` first and applies Terraform after that. Workflows and `infra/` are owned outside this app.

## Content

Footer social URLs and labels live in `lib/social.ts`. X and Instagram use `@clzmj`; LinkedIn links to the `clzmj` profile. All three icons stay in the footer.

- Photos: drop a file in `public/photos/` and point `content/photos.json` at it (`src`, `alt`, `caption`, `width`, `height`). They render as the tilted fan. A click opens that one photo. There are no previous, next, or autoplay controls.
- Cat: replace `public/cat.png` and `public/cat-dark.png` with sheets of the same size, 128×64 pixels, 4 columns by 2 rows of 32×32 frames. Row 0 is awake, row 1 is asleep. The CSS in `app/globals.css` does not need to change if the grid stays the same.

## Checks

```bash
bun run lint
bun run format:check
bun run test
bun run shots
```

`bun run lint` is oxlint, and warnings fail the run. `bun run format` writes oxfmt changes. `bun run format:check` checks them.

`bun run test` expects `out/` from `bun run build`. `bun run shots` writes light and dark home-page screenshots to the gitignored `shots/` directory.

Type, color, and the cat are described in `docs/design.md`.
