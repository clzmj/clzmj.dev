# ADR 0001: Wrangler and Terraform ownership

Define the boundary between Worker deployment and Cloudflare zone infrastructure.

## Context

The repository deploys a Worker from the root Wrangler configuration and manages zone resources in
Terraform (`wrangler.jsonc`, `infra/`).

The Cloudflare custom domain requires the Worker to exist before it can be attached
(`infra/custom_domain.tf`, `.github/workflows/deploy.yml`).

## Decision

Wrangler owns the Worker script, versions, and static asset settings. Terraform owns the existing
`www` DNS record, redirect ruleset, zone settings, and apex Workers custom domain. Terraform reads
the zone rather than creating it.

The custom-domain resource owns the apex DNS record. Google Workspace and verification records
remain unmanaged (`infra/zone.tf`, `infra/dns.tf`, `infra/imports.tf`, `infra/redirects.tf`,
`infra/settings.tf`, `infra/custom_domain.tf`).

Deploy the site with `bunx wrangler@4.156.2 deploy` from the repository root. On a push to `main`,
Wrangler deploy completes before Terraform apply (`.github/workflows/deploy.yml`).

## Alternatives considered

- Manage the Worker script and assets in Terraform: this duplicates settings already declared in `wrangler.jsonc`.
- Attach the custom domain before deploying the Worker: the domain resource requires an existing Worker.
- Use the `cf` CLI: the workflow uses Wrangler and the repository has no `cloudflare.config.ts` (`.github/workflows/deploy.yml`, `wrangler.jsonc`).

## Consequences

Worker deployment configuration has one source of truth. Terraform changes require a successful
Worker deployment first when they attach or update the custom domain. DNS records issued for Google
Workspace are outside Terraform management.
