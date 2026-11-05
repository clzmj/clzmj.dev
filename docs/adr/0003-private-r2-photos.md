# ADR 0003: Keep Elsewhere photos in private R2

Keep source photos out of Git while making them available to site builds.

## Context

The repository ignores `assets/elsewhere/` and `public/elsewhere/`.

Workflows fetch the `elsewhere/` object prefix from R2 before building, and Terraform protects the
existing media bucket from deletion (`.gitignore`, `.github/workflows/deploy.yml`, `infra/r2.tf`,
`infra/README.md`).

## Decision

Store Elsewhere source photos in the private `clzmj-dev-media` R2 bucket. Do not commit photos to
Git. CI downloads the objects into `assets/elsewhere/` before the site build.

Keep the bucket private, with no custom domain or public `r2.dev` access (`infra/README.md`,
`infra/r2.tf`, `.github/workflows/pull-request.yml`, `.github/workflows/deploy.yml`).

## Alternatives considered

- Commit source photos to Git: ignored photo directories and workflow fetch steps make the current storage boundary explicit (`.gitignore`, `.github/workflows/deploy.yml`).
- Make the bucket public: the Terraform and infrastructure documentation specify private access (`infra/r2.tf`, `infra/README.md`).

## Consequences

Builds need working R2 read credentials and the expected objects. The source photos stay outside the
repository; generated and fetched photo files remain ignored.
