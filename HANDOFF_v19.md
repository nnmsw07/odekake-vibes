# Kibun V19 handoff — 2026-08-28

## Current release state

- 165 spots total.
- V19 adds 40 spots: 8 user-requested + 32 gap-filling spots.
- `recommendation_group` prevents multiple facilities from the same complex from occupying the three recommendations at once.
- Google Places Hero is enabled globally with `placePhotoMode: "prefer_places"`.
- Existing audited Hero overrides and fixed Place IDs are preserved.
- The new 40 spots use Google Places real photos first and keep AI images only as fallback.
- Production API base configured as `https://kibun-api.misawa-nana7.workers.dev`.
- Worker exposes `/health`, `/place-photo`, `/place-photos`, and `/travel-times`.

## Google Places behavior

For a spot with no fixed Place ID, the Worker uses the spot's `media_strategy.google_places.query` plus address to run Places Text Search. Low-confidence name matches are rejected and the existing AI Hero remains visible.

For audited spots, `media_strategy.google_places.place_id` and `photo_index_override` bypass search ambiguity and keep the selected photo stable.

## Private Hero audit UI

Open the site with `?heroAudit=1` to display the private Hero audit dock. It can:

- browse Google Places photo candidates;
- change the search query;
- retry with/without address;
- pin the matched Google Place;
- choose a photo index;
- export the resulting overrides.

## Validation

Run:

```bash
node test_recommender.js
node test_v12.js
node test_v17.js
node test_v17_1.js
node test_v18.js
node test_v19.js
node test_v19_places.js
```

All local tests should pass before deployment.

## One external check still required

A local/offline test cannot prove that the deployed Cloudflare Worker currently has a valid `GOOGLE_MAPS_API_KEY` secret and Google billing/API access. After deployment, open `/health`, then inspect one new spot (for example Sanrio Puroland) and confirm that its AI fallback is replaced by a Google Places photo with Google Maps attribution.
