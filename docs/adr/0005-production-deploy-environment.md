# ADR 0005: Scope deployments to the production environment

Ensure only production deployment jobs receive production environment secrets.

## Context

The deploy and apply jobs declare the GitHub `production` environment. Pull request build and plan
jobs declare `ci`.

The production environment's `main` branch restriction is documented in the infrastructure README
(`.github/workflows/deploy.yml`, `.github/workflows/pull-request.yml`, `infra/README.md`).

## Decision

Use the GitHub `production` environment for deploy and apply jobs, and reserve `ci` for pull request
work. The scheduled and manually dispatched workflow also deploys the Worker using the production
environment.

Only push-to-`main` runs apply Terraform (`.github/workflows/deploy.yml`,
`.github/workflows/pull-request.yml`).

## Alternatives considered

- Use production credentials in pull request jobs: this would give untrusted pull request code access to deployment credentials, while the workflow currently separates those jobs into `ci` (`.github/workflows/pull-request.yml`).
- Use a non-production environment for deploys: the workflow declares production for deployed runs (`.github/workflows/deploy.yml`).

## Consequences

Scheduled and manually dispatched Worker deployments run with production environment secrets.
Terraform apply is limited to pushes on `main`; pull requests can plan with the `ci` environment.
