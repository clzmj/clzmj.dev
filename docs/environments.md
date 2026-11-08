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

## Runtime Doppler access

Doppler is the source of truth. GitHub stores one `DOPPLER_TOKEN` environment
secret per credential context. Each token is a read-only service token scoped to
exactly one project/config; deployment credentials remain in Doppler.

| Doppler project/config | GitHub environment | Runtime use                                 |
| ---------------------- | ------------------ | ------------------------------------------- |
| `clzmj-dev/dev`        | None               | Local media upload credentials              |
| `clzmj-dev/ci`         | `ci`               | Read-only media fetch and Terraform plan    |
| `clzmj-dev/prd`        | `production`       | Media fetch, Worker deploy, Terraform apply |

The production GitHub environment must allow only `main`; deploy has an explicit
`refs/heads/main` guard and apply additionally requires a push. PR plans run only
for same-repository PRs. No staging deployment is defined.

Only secret-consuming steps receive `DOPPLER_TOKEN`. They invoke
`bun scripts/with-doppler.ts ci|prd -- <command>` (from `infra/`, use
`../scripts/with-doppler.ts`). The helper fetches JSON directly over HTTPS,
validates the reserved project/config values, registers downloaded values for
GitHub log masking, then injects only the required allowlisted secrets into the
child process. It removes `DOPPLER_TOKEN` before starting that child. It writes no
secret files or GitHub environment/output files and has no CLI fallback.

Dependency installation, builds, tests, and unrelated quality checks receive no
Doppler service token. `GITHUB_TOKEN` remains supplied by GitHub for the existing
build and PR comment permissions.

## Runtime secret allowlist

Both configs must provide these nine names. They are downloaded at runtime;
GitHub environments store only `DOPPLER_TOKEN`, not copies of these values.

| Name                            | Use                                               | Access                                       |
| ------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`          | Terraform; production Wrangler                    | Read-only in `ci`; scoped writes in `prd`    |
| `CLOUDFLARE_ACCOUNT_ID`         | R2 endpoint, Wrangler, Terraform account selector | Identifier                                   |
| `CLOUDFLARE_ZONE_ID`            | Terraform `clzmj.dev` zone selector               | Identifier                                   |
| `TF_STATE_BUCKET`               | Must equal `clzmj-dev-tfstate`                    | Bucket selector                              |
| `TF_STATE_R2_ACCESS_KEY_ID`     | Terraform backend                                 | State read-only in `ci`; read/write in `prd` |
| `TF_STATE_R2_SECRET_ACCESS_KEY` | Paired state secret                               | Same bucket scope                            |
| `MEDIA_R2_BUCKET`               | Photo source bucket `clzmj-dev-media`             | Bucket selector                              |
| `MEDIA_R2_ACCESS_KEY_ID`        | Photo downloads                                   | Read-only media access                       |
| `MEDIA_R2_SECRET_ACCESS_KEY`    | Paired media secret                               | Read-only media access                       |

Consuming child shells map R2 credentials to `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` and account/zone selectors to
`TF_VAR_cloudflare_account_id` / `TF_VAR_cloudflare_zone_id`. CI cannot write state
locks, so PR plans use `terraform plan -lock=false`.

Rotate an application credential in its Doppler config; the next consuming step
fetches the new value without a GitHub sync. Rotate a service token by issuing a
replacement read-only token for the same project/config, replacing that
GitHub environment's `DOPPLER_TOKEN`, verifying consuming jobs, then revoking the
old token. Keep `ci` and `prd` tokens separate. Integration configuration and
actual token policies require external verification.

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
