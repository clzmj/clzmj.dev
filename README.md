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
- Bingo: `public/bingo.png` and `public/bingo-dark.png` contain 128×64 pixel sheets with four 32×32 frames per row. She replaces the profile picture: her visible frame occupies an explicit 54×81px box at exactly 3× scale. Background offsets remove transparent padding, keeping the entire dog inside the box with no circular crop. The top row wags/pants continuously; hover, tap, or focus plays one run-toward-you cycle before returning to idle. Reduced motion holds static frame 0. The footer and 404 contain no animal.

## Checks

```bash
bun run lint
bun run format:check
bun run test
bun run shots
```

`bun run lint` is oxlint, and warnings fail the run. `bun run format` writes oxfmt changes. `bun run format:check` checks them.

`bun run test` expects `out/` from `bun run build`. `bun run shots` writes light and dark home-page screenshots to the gitignored `shots/` directory.

Type, color, and Bingo are described in `docs/design.md`.
