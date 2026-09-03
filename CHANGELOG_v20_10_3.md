# v20.10.3 magazine hero image hotfix

- Fixed magazine/article hero image resolver so all editorial cards and article pages use the configured hero photos instead of fallback illustration assets.
- Added missing hero resolver entries for spot_318 / spot_432 / spot_436 / spot_446 and ensured all current magazine `data-hero-spot` IDs are covered.
- Bumped `magazine-media.js` cache-buster from `v=2102` to `v=2103` to avoid stale browser cache.
