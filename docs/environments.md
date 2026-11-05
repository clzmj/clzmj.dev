# Environments and secrets

Choose credentials by operation; local preview and production are the only site environments.

## Capabilities

| Context                                              | Read                                                              | Write                                                        | Deploy                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `local` (Mac)                                        | Local content and photo sources; R2 when credentials are supplied | Local assets/export; media uploads with dev upload keys      | Local preview via `bun run dev` or `bun run start`               |
| `ci` (GitHub environment)                            | Cloudflare, R2 state, private media                               | PR plan comment via job-scoped `GITHUB_TOKEN`; no state lock | None                                                             |
| `prd` (production context; GitHub name `production`) | Cloudflare, R2 state, private media                               | Worker/assets, Terraform resources and state                 | `clzmj.dev`; production environment is documented as `main` only |

Sources: `package.json`, `scripts/serve.ts`, `.github/workflows/pull-request.yml`,
`.github/workflows/deploy.yml`, `.github/workflows/checks.yml`, `infra/README.md`. `ci` is a
validation credential context, not a deployed preview.

The reusable site checks use `ci` on PRs and before production deploys. The Terraform, Workflows and
Secrets checks declare no environment and receive no explicit environment secrets
(`.github/workflows/checks.yml`).

## Doppler configs and GitHub sync

| Doppler config  | GitHub environment                                                                  | Repository evidence                        |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `clzmj-dev/dev` | No sync target documented                                                           | Local media upload pair; `infra/README.md` |
| `ci`            | `ci` consumes Doppler-synced secrets; source config mapping is not recorded         | `.github/workflows/pull-request.yml`       |
| `prd`           | `production` consumes Doppler-synced secrets; source config mapping is not recorded | `.github/workflows/deploy.yml`             |
| `stg`           | No workflow reference or sync mapping recorded                                      | Neither workflow selects staging           |

The repository does not contain Doppler integration configuration. Verify the source config in
Doppler before rotation; the workflows only identify the destination GitHub environment. No staging
deployment is defined in `.github/workflows/` or `wrangler.jsonc`.

## Every secret read by workflows

Doppler is the source of truth for the environment secrets; update it and let its GitHub sync
propagate changes (`infra/README.md`). `GITHUB_TOKEN` is supplied by GitHub Actions. Identifiers
below select resources; they grant no access by themselves.

| Name                            | Where it lives / used                                                          | Scope and access                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`          | Doppler → GitHub `ci`, `production`; Terraform and production Wrangler         | `ci`: read-only, including Workers R2 Storage Read; production: write, including Workers R2 Storage Write |
| `CLOUDFLARE_ACCOUNT_ID`         | Doppler → both environments; media fetch, Wrangler, Terraform                  | Account selector; mapped to `TF_VAR_cloudflare_account_id` for Terraform                                  |
| `CLOUDFLARE_ZONE_ID`            | Doppler → both environments; Terraform                                         | Zone selector; mapped to `TF_VAR_cloudflare_zone_id`; `infra/zone.tf` checks `clzmj.dev`                  |
| `TF_STATE_BUCKET`               | Doppler → both environments; Terraform                                         | Bucket selector; must equal `clzmj-dev-tfstate`                                                           |
| `TF_STATE_R2_ACCESS_KEY_ID`     | Doppler → both environments; Terraform as `AWS_ACCESS_KEY_ID`                  | State bucket: read-only in `ci`; read/write in production                                                 |
| `TF_STATE_R2_SECRET_ACCESS_KEY` | Doppler → both environments; Terraform as `AWS_SECRET_ACCESS_KEY`              | Paired state credential; same scope as preceding row                                                      |
| `MEDIA_R2_BUCKET`               | Doppler → both environments; photo fetch                                       | Media bucket selector (`clzmj-dev-media`)                                                                 |
| `MEDIA_R2_ACCESS_KEY_ID`        | Doppler → both environments; fetch as `AWS_ACCESS_KEY_ID`                      | Read-only, scoped to media bucket                                                                         |
| `MEDIA_R2_SECRET_ACCESS_KEY`    | Doppler → both environments; fetch as `AWS_SECRET_ACCESS_KEY`                  | Paired read-only media credential                                                                         |
| `GITHUB_TOKEN`                  | GitHub Actions; Build/Test build steps, production build and PR comment action | Check jobs and deploy: `contents: read`; PR plan additionally `pull-requests: write`                      |

Sources: `.github/workflows/checks.yml`, `.github/workflows/pull-request.yml`,
`.github/workflows/deploy.yml`, `infra/backend.tf`, `infra/variables.tf`, `infra/README.md`. Actual
token policies and Doppler integration settings are not versioned here.

## Local-only credentials and build switches

| Name                                                                 | Where / purpose                                                                       | Access                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------- |
| `MEDIA_R2_UPLOAD_ACCESS_KEY_ID`, `MEDIA_R2_UPLOAD_SECRET_ACCESS_KEY` | Doppler `clzmj-dev/dev`; upload sanitized sources (`infra/README.md`)                 | Media write; not consumed by workflows |
| `ELSEWHERE_SRC`, `ELSEWHERE_BASE_URL`                                | Source directory / same-origin URL path (`scripts/build-photos.ts`, `lib/content.ts`) | Not secrets                            |

Production does not fetch R2 at request time: CI packages the photos into `out/`
(`.github/workflows/deploy.yml`, `wrangler.jsonc`).

Contribution generation fetches the public GitHub calendar and
`https://gitlab.com/users/clzmj/calendar.json` on every build without authentication.
Never configure a GitLab token for this feature. An unavailable or private GitLab calendar is
skipped; either available source can supply the graph, with the saved snapshot as a final fallback.

Static response headers are defined in `public/_headers`, copied to `out/_headers` by the export; HSTS and nosniff remain in `infra/settings.tf`.
