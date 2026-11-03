# clzmj.dev

Personal site for Carlos Lezama. Static Next.js app, built with Bun, published as Cloudflare Workers static assets.

## Develop

```bash
bun install
# Put sanitized 01.jpg–17.jpg in assets/elsewhere/ (gitignored)
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

- Elsewhere: place the 17 sanitized source JPGs in gitignored `assets/elsewhere/`, or set `ELSEWHERE_SRC` to their directory. `scripts/build-photos.ts` runs before build/dev and uses Bun.Image (Bun >= 1.3.14) to encode WebPs, retaining the source aspect ratio and never enlarging them. Missing/empty sources fail the build clearly. Output is gitignored `public/elsewhere/`; only `lib/elsewhere.json` (captions, focal points, dominant colors, real dimensions and available file sizes) is committed. A git guard bans tracked files in both Elsewhere directories while preserving existing UI artwork. No image generation happens at runtime.
- Image URLs use the same-origin `ELSEWHERE_BASE_URL` path (default `/elsewhere` for preview; production can mount the R2 bucket at that path). The build attempts 640/1080/1600/2400px widths plus native width capped at 2400, without enlargement. It tries q85/q80/q75 per width (photo 02 at 2400 starts at q80). All 640px-and-smaller outputs stay below 300 KB; larger outputs stay below 600 KB, with no cap exceptions. A width that cannot fit at q75 is not emitted; the manifest records its attempts and only lists real files. A 1920px-wide alternative is tried when a larger file is rejected. Every photo retains an HD long edge of at least 1920px, or its original size when the source is smaller. The whole set is validated before publishing outputs. The static page uses srcset/sizes. 4:5 CSS frames use the manifest object-position, lazy loading, dominant-color placeholders, and a 150ms load fade (disabled for reduced motion). The 17 photos form three fans of 7, 7 and 3, preserving the reference card look. Captions appear on hover/focus and in the tap-opened dialog. Keyboard and sr-only next/previous controls in the viewer follow the shuffled photo sequence.
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

Ted’s supplied Bingo favicon set is stored unchanged in `app/` and linked through Next metadata. `icon.png` and `apple-icon.png` are byte-identical aliases for the supplied 32px and 180px files.

Type, color, and Bingo are described in `docs/design.md`.
