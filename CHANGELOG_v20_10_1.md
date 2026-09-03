# v20.10.1 — Hero Audit refresh

- 最新のHero Audit exportをv20.10.0へ反映。
- `photo_index_overrides`: **182件**。新規spot_432〜446を含む。
- 前回からの選択変更: spot_302 `3→0` / spot_378 `3→4` / spot_431 `0→1`。
- 新規15スポット（spot_432〜446）は最大10候補から選択したindexを保存。
- `place_overrides`: **14件**。新たに spot_320 / 432 / 434 / 441 をmanual Place IDへ固定。
- Place IDは `media_strategy.google_places.place_id` と `routing.google_place_id` の両方へ同期。
- スポット数 **446件のまま**。Magazine / Plans / SNS Audit / Affiliate Auditはv20.10.0を維持。
- `data.js` cache busterを `v=20101` に更新。
- Worker / 画像assetsの追加変更なし。
