# Operations

Preview, deploy, recover and verify `clzmj.dev` using the repository’s static export.

## Preview on the Mac

Run from the repository root; download the sanitized sources first using [photos](photos.md). The
scripts and browser requirement come from `package.json` and `scripts/generate.ts`.

```sh
bun install
bunx playwright install chromium webkit
bun run dev
```

For the production-shaped export, stop dev and run:

```sh
bun run build
bun run start
```

`start` serves `out/` at `http://127.0.0.1:3000`; `PORT` overrides the port (`scripts/serve.ts`). A
quick tunnel can expose this local server; no tunnel script or installation is bundled in the repo.

```sh
cloudflared tunnel --url http://127.0.0.1:3000
```

The target is the local static server in `scripts/serve.ts`. Keep that server running while sharing
it.

## Deploy

| Route     | Action                                           | Effect                                      |
| --------- | ------------------------------------------------ | ------------------------------------------- |
| Normal    | Merge a reviewed PR into `main`                  | Build, Worker upload, then Terraform apply  |
| Rebuild   | GitHub Actions → Deploy → Run workflow on `main` | Build and Worker upload; no Terraform apply |
| Scheduled | Daily 08:00 UTC                                  | Same as rebuild                             |

Source: `.github/workflows/deploy.yml`. PRs build and plan; they do not deploy a preview
(`.github/workflows/pull-request.yml`).

For a direct Worker upload, first build, then run with the production Cloudflare token/account
available as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the process environment:

```sh
bun run build
bunx wrangler@4.156.2 deploy
```

This is the Worker command used by `.github/workflows/deploy.yml`; it does not apply Terraform.
Production credentials come through Doppler sync; source config mappings are not versioned
([environments](environments.md)).

## Roll back

For an immediate Worker rollback, use production Cloudflare credentials and run from the repo root:

```sh
bunx wrangler@4.156.2 rollback
```

The command targets `clzmj-dev` via `wrangler.jsonc`; review its selected prior version before
confirming. It does not revert Git or Terraform. The next deployment rebuilds the current source.

For a lasting source rollback, revert the bad commit on a new branch and open a PR:

```sh
git switch -c revert-site-change origin/main
git revert <bad-commit-sha>
git push -u origin revert-site-change
```

Merge the revert PR to trigger the normal `main` deployment (`.github/workflows/deploy.yml`). For a
merge commit, select the correct parent with `git revert -m 1 <merge-commit-sha>`.

Photo source replacements in R2 need separate recovery; Git does not store them (`.gitignore`).

## Rotate credentials

| Credential           | Update location                                                                                                   | Verify afterward                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Media read pair      | Doppler source synced to GitHub `ci` and `production`                                                             | PR and production “Fetch Elsewhere photos” steps                        |
| Media upload pair    | Doppler `clzmj-dev/dev`: `MEDIA_R2_UPLOAD_ACCESS_KEY_ID`, `MEDIA_R2_UPLOAD_SECRET_ACCESS_KEY`                     | Upload/download using [photos](photos.md)                               |
| State R2 pair        | Doppler source synced to GitHub `ci` / `production`: `TF_STATE_R2_ACCESS_KEY_ID`, `TF_STATE_R2_SECRET_ACCESS_KEY` | PR read-only plan; production state lock and apply on a `main` push     |
| Cloudflare API token | Doppler source synced to GitHub `ci` / `production`: `CLOUDFLARE_API_TOKEN`                                       | PR plan with read token; production Wrangler and apply with write token |

Create the replacement credential with the same scope, update its named Doppler secret(s), and let
the GitHub integration sync automatically. Validate the consuming jobs before revoking the old
credential.

The repository documents this sync, but not token-creation UI steps or the `ci`/`prd` source
mapping.

Sources: `infra/README.md`, `.github/workflows/pull-request.yml`, `.github/workflows/deploy.yml`. R2
pairs are mapped to standard AWS variables only inside their consuming step; see [all
names](environments.md).

## Check live behavior

```sh
curl -I https://clzmj.dev/
curl -I 'https://www.clzmj.dev/example?check=1'
curl -i https://clzmj.dev/does-not-exist
```

| Check        | Expected result / source                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| Apex home    | Successful static home response (`app/page.tsx`, `infra/custom_domain.tf`)                                    |
| www          | `301`, location `https://clzmj.dev/example?check=1` (`infra/redirects.tf`)                                    |
| Missing path | `404` and “Nothing lives here.” (`wrangler.jsonc`, `app/not-found.tsx`)                                       |
| Browser      | Open a photo, dismiss it, scroll, switch theme; tests in `tests/viewer-scroll.spec.ts`, `tests/theme.spec.ts` |

## Troubleshooting

| Symptom                                        | Next action                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Local photo folder missing / metadata rejected | Follow [photo preparation](photos.md); the builder audits sources before encoding.                                 |
| Chromium executable missing                    | `bunx playwright install chromium`; generation uses it for OG images (`scripts/generate.ts`).                      |
| Preview shows stale content                    | Rebuild `out/` before `bun run start`; it is a static server (`scripts/serve.ts`).                                 |
| Daily rebuild leaves contributions unchanged   | Expected without refresh flags; `scripts/generate.ts` only checks `REFRESH_CONTRIBUTIONS` / `CONTRIBUTIONS_TOKEN`. |
| Worker deployed but domain/resources wrong     | Inspect the separate Terraform apply job; manual/scheduled deploys skip it (`.github/workflows/deploy.yml`).       |
| Viewer leaves scrolling blocked                | Reproduce the dismissal path with `tests/viewer-scroll.spec.ts`; see [known issues](photos.md#known-issues).       |
| CI fails                                       | Use the step-by-step [CI failure table](ci.md#failures).                                                           |
