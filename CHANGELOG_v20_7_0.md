# CHANGELOG v20.7.0 — Prior-chat catch-up

## Data
- 324 → **387 spots**.
- 前チャットで共有されたスクリーンショット/候補を再監査し、既存・統合済みを除いて **63件** を追加。
- べるべるパーク / chano-ma / coしぶや / 以前の8候補は既存反映を確認し、重複追加なし。
- SNS発見のみで営業詳細の確度が低い候補は `social_discovery_pending` として保守的に保持。

## Detail UI
- v20.6.5の「Instagramでこのスポットを検索」を維持。
- `official_url` がInstagramの場合は「公式Instagramを見る」と表示するよう改善。

## Images
- SNS投稿画像・動画は保存/転載しない。
- 新規スポットも Google Places → AI/Editorial fallback の既存ポリシーを継承。

## Tests
- 旧バージョンの固定324件テストを将来拡張可能に修正。
- `test_v20_7_0_catchup.js` を追加し、全catch-up候補・重複ID/slug・13 Vibe/18 experience・Instagram導線を検証。
