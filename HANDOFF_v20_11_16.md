# Handoff v20.11.16

Instagram captions use `captionSpotLine()`.

Resolution order:
1. explicit spot social fields (`instagram_handle`, `official_instagram_handle`, direct Instagram profile URL)
2. conservative `OFFICIAL_INSTAGRAM_BY_NAME` fallback map
3. no mention

Do not auto-guess handles from spot names or Instagram search pages. A mention is not image-use permission; image-rights logic remains separate.
