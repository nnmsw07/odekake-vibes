# Kibun v0.15

## Hero images
- Google Places を実在施設Heroの原則第一候補に変更。
- licensed/CC画像も、Google Placesが正常取得できる場合はGoogle Places実写へ置換。
- Google Places取得失敗時は既存画像へ安全にフォールバック。
- Hero監査で選択済みの50件を `photo_index_override` としてseedへ固定。

## Current location UX
- Geolocation失敗を原因別に分類。
- 許可拒否 / 位置特定不可 / タイムアウト / 非対応 / HTTPS要件を個別表示。
- Android / iOS では設定変更の具体的なヒントを表示。
- 「もう一度試す」「所要時間なしで続ける」をインライン表示。
- 汎用alertを廃止し、条件カード内で復旧できるUIへ変更。

## Cache
- JS/CSS query versionを `v=15` に更新。
