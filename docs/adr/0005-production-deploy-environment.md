# ADR 0005: Scope deployments to the production environment

Ensure only production deployment jobs receive production environment secrets.

## Context

The deploy and apply jobs declare the GitHub `production` environment.

Reusable site checks and PR plans declare `ci`; Terraform, Workflows and Secrets checks declare no environment
(`.github/workflows/checks.yml`, `.github/workflows/pull-request.yml`,
`.github/workflows/deploy.yml`).

The production environment's `main` branch restriction is documented in the infrastructure README
(`.github/workflows/deploy.yml`, `.github/workflows/pull-request.yml`, `infra/README.md`).

## Decision

Use the GitHub `production` environment for deploy and apply jobs. Reusable site checks use `ci` for
PRs and every deploy trigger. Scheduled and manually dispatched runs deploy the Worker using
production credentials after all checks pass (`.github/workflows/deploy.yml`).

Only push-to-`main` runs apply Terraform (`.github/workflows/deploy.yml`,
`.github/workflows/pull-request.yml`).

## Alternatives considered

- Use production credentials in pull request jobs: this would give untrusted pull request code access to deployment credentials, while the workflow currently separates those jobs into `ci` (`.github/workflows/pull-request.yml`).
- Use a non-production environment for deploys: the workflow declares production for deployed runs (`.github/workflows/deploy.yml`).

## Consequences

Every production deployment waits for the reusable checks; apply also waits for Worker deployment
(`.github/workflows/deploy.yml`). Scheduled and manual Worker deploys use production secrets.
Terraform apply is limited to pushes on `main`; pull requests can plan with the `ci` environment.
