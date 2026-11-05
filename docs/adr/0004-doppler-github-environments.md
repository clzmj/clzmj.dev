# ADR 0004: Sync deployment secrets from Doppler to GitHub environments

Keep deployment secret values in Doppler and expose them to CI through scoped GitHub environments.

## Context

Infrastructure documentation identifies Doppler as the source of truth.

The workflows request secrets through the GitHub `ci` and `production` environments, and do not use
repository-level secrets (`infra/README.md`, `.github/workflows/pull-request.yml`,
`.github/workflows/deploy.yml`).

## Decision

Manage secret values in Doppler and sync the required values to GitHub environments.

Reusable site checks and PR plans use `ci`; deployment and apply jobs use `production`
(`.github/workflows/checks.yml`, `.github/workflows/pull-request.yml`,
`.github/workflows/deploy.yml`).

The repository documents the required GitHub secret names and environment permissions, but does not
define the Doppler configuration names or a verifiable name-to-environment mapping
(`infra/README.md`, `.github/workflows/pull-request.yml`, `.github/workflows/deploy.yml`).

## Alternatives considered

- Store values as repository-level GitHub secrets: workflows select environment-scoped secrets and the infrastructure documentation says no repository-level secrets are used (`infra/README.md`, `.github/workflows/deploy.yml`).
- Edit GitHub values directly: the repository documentation directs operators to manage values in Doppler (`infra/README.md`).

## Consequences

GitHub jobs receive secrets through their declared environments. Repository files alone cannot
confirm external Doppler configuration names or synchronization state.
