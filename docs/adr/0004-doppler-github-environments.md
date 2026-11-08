# ADR 0004: Fetch deployment secrets from Doppler at runtime

Use one scoped Doppler service token per GitHub environment. Keep deployment
credential values in Doppler and download them only when a consuming step runs.

## Context

Site checks and PR plans use the GitHub `ci` environment; deploy and apply use
`production`. Earlier workflows consumed copies synchronized through the Doppler
GitHub integration. Runtime reads remove those copied application credentials and
make the source project/config explicit in repository code.

## Decision

Store only `DOPPLER_TOKEN` in each GitHub environment: a read-only token scoped to
`clzmj-dev/ci` for `ci`, and a separate read-only token scoped to `clzmj-dev/prd` for
`production`. Restrict production to `main`.

Secret-consuming steps call `scripts/with-doppler.ts ci|prd -- <command>`. It reads
Doppler's HTTPS download API, validates project/config metadata, masks values in
GitHub logs, and supplies only the explicit allowlist to its child. The child does
not receive the service token. There are no secret files, GitHub environment or
output writes, CLI fallback, or native synchronization dependencies.

## Alternatives considered

- Native GitHub sync: duplicates application secrets in GitHub and requires sync
  configuration and status checks.
- Repository-level service token: loses the separate `ci`/production credential
  contexts and the production branch restriction.
- Inject secrets into every job step: exposes them to installation and checks
  that do not consume them.

## Consequences

Doppler availability is required when consuming steps start. Config mismatches or
missing allowlisted values fail before starting the child. Application credential
rotation takes effect on the next runtime read; service-token rotation updates
one GitHub environment secret. See [environments](../environments.md) for the
allowlist and rotation sequence. Live GitHub/Doppler settings remain externally
managed and must be verified separately.
