# clzmj.dev

Personal site for Carlos Lezama. Static Next.js app, built with Bun, published as Cloudflare Workers static assets.

## Develop

```bash
bun install
bunx playwright install chromium
bun run dev
```

`bun run dev` sets `SHOW_DEMO_POSTS=true`, generates diagrams, calendar files, feeds, and Open Graph images, then starts Next. The build step needs Playwright's Chromium (`bunx playwright install chromium`). That browser install is part of the app build, not the GitHub Actions workflow.

## Build

```bash
bun run build
SHOW_DEMO_POSTS=true bun run build
```

The static site is written to `out/`. That directory is the Worker asset bundle. `bun run build` runs `scripts/generate.ts` first (the `prebuild` hook), then `next build` with `output: 'export'`.

Demo posts are hidden unless `SHOW_DEMO_POSTS=true`. A production build leaves them out of the HTML, sitemap, feeds, Open Graph images, diagrams, and the demo figure. `bun run dev` turns them on.

Generation renders Mermaid and Open Graph images in Chromium, so `bunx playwright install chromium` has to have been run first. The contribution snapshot in `content/contributions.json` is reused as-is. Set `REFRESH_CONTRIBUTIONS=true` or `CONTRIBUTIONS_TOKEN` when that file should be fetched again.

Check the result locally:

```bash
bun run start
```

That serves `out/` on port 3000.

## Worker

`wrangler.jsonc` is the only Worker config. The Worker name is `clzmj-dev` and `assets.directory` is `./out`. It does not set routes, a custom domain, or any zone settings. Terraform in `infra/` owns the apex domain, DNS, and redirects. On merge, CI deploys with `wrangler deploy` first and applies Terraform after that. Workflows and `infra/` are owned outside this app.

## Content

- Notes: `content/writings/*.mdx`. A post with `demo: true` is omitted unless `SHOW_DEMO_POSTS=true`. With no visible posts, the Writings section and `/writings` are omitted, and the build still succeeds.
- Events: `content/events/*.md`. See `docs/events.md`.
- Photos: drop a file in `public/carousel/` and point `content/carousel.json` at it (`src`, `alt`, `caption`, `width`, `height`).
- Cat: replace `public/cat.png` and `public/cat-dark.png` with sheets of the same size, 128×64 pixels, 4 columns by 2 rows of 32×32 frames. Row 0 is awake, row 1 is asleep. The CSS in `app/globals.css` does not need to change if the grid stays the same.

## Checks

```bash
bun run lint
bun run test
bun run shots
```

`bun run test` expects `out/` from `SHOW_DEMO_POSTS=true bun run build`, because those tests open the demo post. `bun run shots` writes light and dark full-page screenshots to `shots/`, which is gitignored.

Type, color, and the cat are described in `docs/design.md`.
