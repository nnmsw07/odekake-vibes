# Kibun deployment environments

## Branch roles

- `main` — production. Cloudflare Pages production branch. Merges here publish to `https://kibuntrip.com/`.
- `develop` — sandbox/staging. Cloudflare Pages preview branch. Use the stable branch alias for device checks before production.
- `feature/*` / `fix/*` — work branches. Open PRs into `develop` for normal development.

## Normal flow

1. Create `feature/*` or `fix/*` from `develop`.
2. Open a PR to `develop` and let CI + Cloudflare Preview run.
3. Check the preview on mobile.
4. Merge to `develop` when the sandbox looks good.
5. For a production release, open a PR from `develop` to `main`.
6. Merge to `main` only after the release gate passes.

## Hotfix flow

For an urgent production-only fix, branch from `main`, open a PR to `main`, then sync the same change back to `develop`.

## Cloudflare Pages branch control

Configure the Pages project so that:

- Production branch: `main`
- Preview branches: at least `develop` (all non-production branches is also acceptable)

Cloudflare Pages preview deployments receive `X-Robots-Tag: noindex` by default, so sandbox URLs should not compete with production in search.

## Analytics

Preview/sandbox traffic should not pollute production GA4 reporting. Prefer a separate GA4 measurement ID for sandbox, or disable GA4 on preview deployments before using the sandbox for repeated testing.
