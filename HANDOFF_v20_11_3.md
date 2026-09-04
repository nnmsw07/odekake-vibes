# HANDOFF v20.11.3

## Goal
Make SNS Audit usable as a screenshot-production surface while keeping Hero Audit selections consistent across screens.

## What changed
### 1. First slide is image-led
`/sns-audit/?capture=<idea-or-post-id>` now renders slide 1 with a representative spot Hero as a full-background 4:5 cover.

### 2. Two image modes
Default:
- `?capture=<id>&imageMode=safe`
- Label: **SNS投稿用**
- Uses stored/fallback Hero assets and avoids replacing them with Google Places photos.

Internal QA:
- `?capture=<id>&imageMode=audit`
- Label: **監査Hero確認**
- Uses the audited Google Places Hero through `KibunMedia`.
- Shows `HERO PREVIEW · 権利確認` so it is not confused with a cleared-for-social asset.

This separation is intentional: a Hero photo that is valid for in-site Places display is not automatically cleared for reposting as social creative.

### 3. Hero Audit consistency
SNS Audit previously used a partial `KIBUN_HERO_SPOTS` map, so some spots ignored the Hero Audit selection and fell back to generic AI imagery.
It now loads `media.js` and calls `KibunMedia.resolvePlacePhoto(spot)`, which reads the audited `media_strategy.google_places.photo_index_override` embedded in `data.js`.

`magazine/magazine-media.js` has also been regenerated from current `data.js` for all magazine Hero IDs so the article Hero resolver matches the current audit choices.

## Important
This update intentionally does NOT include:
- `sns-audit-data.js`
- `sns-editorial-data.js`
- `data.js`

So it should not reduce the Editors idea count or revert the Operations post seed.
