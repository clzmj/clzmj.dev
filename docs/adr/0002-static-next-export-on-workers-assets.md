# ADR 0002: Serve a static Next.js export from Workers assets

Choose the site's build and runtime delivery model.

## Context

Next.js is configured with `output: 'export'`, and the build writes `out/`. Wrangler publishes that
directory as Worker static assets (`next.config.ts`, `wrangler.jsonc`,
`.github/workflows/deploy.yml`).

## Decision

Build the site as a static export and serve `out/` through Cloudflare Workers assets. Continue using
Wrangler for deploys (`next.config.ts`, `wrangler.jsonc`).

## Alternatives considered

- Run a Next.js server at request time: that would require a server runtime and deployment path beyond the configured static export.
- Deploy assets through a different platform: the existing workflow and Wrangler configuration already publish these assets (`.github/workflows/deploy.yml`, `wrangler.jsonc`).

## Consequences

The site is delivered as static files at the edge. Features that require request-time server
rendering are outside this delivery model. Build-time generated content is included in the exported
files.
