# CHANGELOG v20.11.3

## SNS screenshot cover
- Instagram screenshot mode now uses a representative spot Hero as the **first-slide background** instead of a text-only cover.
- Cover title uses the editorial theme title where possible, with a dark readability overlay and 4:5 Instagram layout.
- Cover spot is selected from the post spots using visual appeal plus an audited-Hero bonus.

## Image-rights aware modes
- Screenshot mode now has two image modes:
  - **SNS投稿用** (default): uses stored AI / self-owned / explicitly licensed-style Hero assets where available and does not swap them to Google Places photos.
  - **監査Hero確認**: resolves the audited Google Places Hero for visual QA and adds a visible `HERO PREVIEW · 権利確認` marker.
- Google Places attribution returned by the existing photo API is shown in internal previews where available.

## Hero Audit consistency fix
- SNS Audit now uses the same shared `KibunMedia.resolvePlacePhoto()` resolver as the main spot UI.
- This means `media_strategy.google_places.photo_index_override` and audited Place IDs are honored instead of relying on the partial magazine-only Hero map.
- Regenerated `magazine/magazine-media.js` from current `data.js` so all 18 magazine Hero spots use the current audited `photo_index_override` / Place ID values.
- Bumped magazine Hero resolver cache-buster to `v=2113` on magazine pages.

## Regression protection
- Does not replace `sns-audit-data.js`, `sns-editorial-data.js`, `data.js`, or seed post/idea data.
- Existing Kibun Editors ideas and Operations posts are preserved.
