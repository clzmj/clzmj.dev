# clzmj.dev infrastructure

Terraform manages the clzmj.dev zone edge. Wrangler deploys the site.

## What Terraform owns

- DNS that was already on the zone: `www` AAAA, Google MX, SPF, site verification, DMARC, and the Google DKIM TXT record.
- The existing `http_request_dynamic_redirect` ruleset (`www` to the apex).
- Free zone settings: Always Use HTTPS, minimum TLS 1.2, and HSTS.
- A free cache rule for static file extensions on the apex.
- The Workers custom domain that routes `clzmj.dev` to the Worker `clzmj-dev`.

Terraform does not create the zone, and it does not define the Worker script, versions, or assets. The root `wrangler.jsonc` is the only Worker config. The apex DNS record created by the custom domain is left to that resource.

## Secrets

Doppler is the source of truth. It syncs two GitHub environments that use the same secret names. Edit secrets in Doppler, never in GitHub.

| GitHub environment | Tokens | Branch limit |
| --- | --- | --- |
| `ci` | Read-only Cloudflare and read-only R2 state | None |
| `production` | Write Cloudflare and write R2 state | `main` only |

There are no repository-level secrets. Both environments provide `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `TF_STATE_BUCKET`, `TF_STATE_R2_ACCESS_KEY_ID`, and `TF_STATE_R2_SECRET_ACCESS_KEY`.

Pull requests declare `environment: ci` and run `terraform plan -lock=false`. The read-only R2 token cannot write the lock object. Pushes to `main`, the daily rebuild, and `workflow_dispatch` declare `environment: production`.

State is the S3 backend in `backend.tf` (R2 bucket `clzmj-dev-tfstate`, native lockfile). Credentials are the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, mapped from the R2 secrets in CI. They are not in the Terraform files.

## Workflows

| Workflow | When | What |
| --- | --- | --- |
| `pull-request.yml` | Pull request | Build the site. `terraform fmt -check`, `validate`, and `plan -lock=false`. Update one PR comment with the plan. |
| `deploy.yml` | Push to `main` | Build, `wrangler deploy`, then `terraform apply`. A concurrency group keeps applies from overlapping. |
| `deploy.yml` | Daily 08:00 UTC, and `workflow_dispatch` | Build and `wrangler deploy` only. The contributions graph is rendered at build time. |

The build fails if `package.json` or a Bun lockfile is missing, or if `bun run build` does not write `out/`. Production deploy also fails if `wrangler.jsonc` is missing. Build steps do not receive Cloudflare or R2 credentials.

Deploy uses `bunx wrangler@4.156.2 deploy` from the repository root. The `cf` CLI is not used: it does not read `wrangler.jsonc`.

On `main`, Wrangler runs before `terraform apply`, so the custom domain is attached only after the Worker exists.

## Local checks

These do not need Cloudflare credentials:

```sh
terraform -chdir=infra fmt -check
terraform -chdir=infra init -backend=false
terraform -chdir=infra validate
tflint --chdir=infra --init
tflint --chdir=infra
```

A real plan runs in the pull request workflow.
