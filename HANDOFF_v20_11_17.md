# Handoff v20.11.17

## Hero selection

The user-exported Hero choices are preserved in `HERO_OVERRIDES_v20_11_17.json`. The effective runtime values are also written into `seed.json` / `data.js`.

Counts: 189 photo indices, 16 manual Place pins. Hero Audit continues to request up to 10 photos, so indices 0–9 are valid.

## Google Places failure handling

`app.js` now preloads a Google Places photo before swapping the existing Hero. If the remote URL fails or expires, the original static/AI Hero is restored and compact/detail Google attribution is removed. This prevents an attribution-only blank Hero.

## Terrace article Hero

`assets/editorial/terrace-after-sunset.webp` is intentionally static editorial art. The article list card and article page no longer attach `data-hero-spot` to this Hero, so it is not overwritten by a random facility photo.
