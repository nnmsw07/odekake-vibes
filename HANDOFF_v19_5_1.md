# Kibun Trip v19.5.1 handoff

## GA4
- Property: Kibun Trip
- Web stream: Kibun Trip Web
- Measurement ID: `G-M99DNGD18F`
- Production URL: `https://kibuntrip.com`

## Events
- `recommendation_generate`: 今日の3つ生成
- `spot_open`: 詳細表示。`source` = recommendation / browse / trending / unknown
- `browse_open`: 地域×カテゴリ画面を開く
- `browse_filter`: 地域またはカテゴリ選択
- `origin_search`: 出発地検索結果件数のみ。検索語は送信しない
- `origin_select`: geolocation / google_places 等の方式のみ。座標や地名は送信しない
- `external_link_click`: 公式サイト遷移

## Deploy
Worker変更なし。GitHub Pages側のみ更新すればよい。
公開後、GA4 Realtimeで自分のアクセスとイベントを確認する。
