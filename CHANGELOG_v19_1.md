# CHANGELOG v19.1

## 0.19.1 — 2026-08-28

V19のHero Google Places設定を引き継ぎ可能な状態に仕上げた保守リリース。

- 新規40スポットすべてが Google Places Hero対象であることを検証する `test_v19_places.js` を追加。
- Google Placesを優先し、AIをfallbackとして残す構成を自動テスト化。
- 本番Worker URL、Places / Routes endpoint、Secret bindingの配線を静的テスト化。
- `README.md` を165スポット / V19仕様へ更新。
- `HANDOFF_v19.md` を追加し、Hero監査と外部確認手順を明記。
- 推薦ロジック・スポットデータ・Worker実装そのものには変更なし。
