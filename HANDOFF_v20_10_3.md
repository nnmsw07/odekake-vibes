# HANDOFF v20.10.3

## What changed
- Resolved remaining bug where `/magazine/` cards and some article pages still showed fallback editorial illustrations.
- `magazine/magazine-media.js` is now generated from the full set of `data-hero-spot` IDs currently used in the magazine pages.
- Updated cache-busting query string to `magazine-media.js?v=2103`.

## Why the bug happened
- `magazine/index.html` and article pages had correct `data-hero-spot` attributes.
- But `magazine/magazine-media.js` only contained a partial `HERO_SPOTS` map, so newly added editorial stories (including spot_432 / 436 / 446 / 318) never resolved to live hero photos and stayed on fallback illustration assets.

## Deploy note
- Because the previous script was likely cached on mobile, this hotfix intentionally bumps the JS query string.
