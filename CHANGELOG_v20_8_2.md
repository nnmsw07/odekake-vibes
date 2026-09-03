# CHANGELOG v20.8.2

## Hero audit refresh
- 2026-09-03に受領したHero監査exportを正式反映。
- `photo_index_overrides`: **167件**を監査ファイルとして保存し、seed/dataへ反映。
- そのうちv20.8.1から実値が変わったのは **93件**（主にspot_319以降の追加スポット）。
- `place_overrides`: **10件**を固定。v20.8.1で未固定だった6件（spot_334 / 336 / 338 / 357 / 373 / 419）を新たにGoogle Place IDへ固定。
- Place IDは `media_strategy.google_places.place_id` と `routing.google_place_id` の両方へ同期。
- `use_address` / matched name / matched address も監査exportどおり保存。

## Data / Cache
- スポット数は **431件のまま**。
- アフィリエイト・Instagram導線はv20.8.1を維持。
- `data.js` cache busterを `v=2082` に更新。

## Worker / assets
- Worker更新なし。
- 画像assets追加なし。Google Places Heroの選択のみ更新。
