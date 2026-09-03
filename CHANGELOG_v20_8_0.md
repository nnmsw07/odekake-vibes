# CHANGELOG v20.8.0

## Spot diversity
- 387 → **431 spots** (+44).
- New prefecture coverage: 茨城県 / 栃木県 / 群馬県.
- Strengthened 山梨県 / 静岡県.
- Added nature parks, aquariums, zoos/safaris, farms, science/transport museums, ropeways/scenic rides, factory tours, gardens, amusement/theme parks and rail experiences rather than adding more cafe-heavy inventory.
- Browse regions now include 茨城 / 栃木 / 群馬 / 山梨 / 静岡 in addition to the previous areas.

## Affiliate sweep
- `sourceLinks` spot coverage: **43 → 126 spots**.
- Direct link entries: **53 → 136 links**.
- Newly connected existing spots: **55**.
- New v20.8 spots with confirmed direct links: **28/44**.
- Expanded beyond Asoview to exact facility pages on KLOOK / じゃらん遊び・体験 / 一休.com where confirmed.
- Only facility-specific direct booking/ticket pages are registered; generic search/result pages and ambiguous product matches are intentionally excluded.
- Asoview links keep `conversion_check_required: true` because LinkSwitch conversion must still be checked URL-by-URL.

## UI / cache
- Public spot count copy updated to 431.
- `data.js`, `affiliate-config.js`, `styles.css`, `app.js` cache keys bumped to `v=2080`.

## Worker / assets
- Worker update: none.
- New image assets: none. New spots use Google Places first, then existing AI fallback assets.
