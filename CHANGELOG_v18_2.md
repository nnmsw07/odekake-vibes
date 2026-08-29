# CHANGELOG v18.2

## 0.18.2 — 2026-08-27

- 125スポットのHero監査結果を正式反映。
- `photo_index_override` を手動選択済みスポットへ固定。
- 追加で確定したGoogle Place IDを `routing.google_place_id` と `media_strategy.google_places.place_id` に保存。
- `matched_name / matched_address / use_address` も保存し、再検索時の誤マッチを抑制。
- 写真未選択スポットはGoogle Places AUTO選択を継続。
- キャッシュバスターを `v=18.2` へ更新。
- Worker変更なし。
