# v20.11.17

- Applied the latest Hero Audit export: 189 `photo_index_overrides` and 16 manual `place_overrides`.
- Added the newly selected Hero photos for spots 447, 448, 449, 453, 455, 456 and 458.
- Pinned the verified Google Places for THE OAK DOOR (`spot_448`) and the Yokohama Grand InterContinental used by `spot_449`.
- Hardened Google Places Hero rendering: a remote photo is preloaded before replacing the fallback, and failed/expired photos restore the original Hero instead of leaving only a Google Maps attribution badge.
- Added a compact attribution size guard and cache-busted the main UI assets.
- Replaced the generic illustration for 「まだ帰りたくない日の、外ごはん。東京・横浜のテラス6選」 with a dedicated wide Hero image, including article card, article Hero and OGP image.
- Synced Magazine Hero runtime settings for `spot_449` and `spot_458`.
