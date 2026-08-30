# CHANGELOG v19.8.3

## Plan quality: micro-area + role balance

- 256 → **286 spots**。
- カフェ / レストランを **28件**追加。
- お台場の親子Planを補強するため、`レゴランド・ディスカバリー・センター東京` / `日本科学未来館` を追加。
- `plans.js` に `planZone()` / `samePlanArea()` を追加。
- 「同じ区だから近い」という判定をやめ、台場 / 六本木、天王洲、みなとみらい、七里ヶ浜、強羅などのmicro-areaを優先。
- 子連れの長時間Planは `大人も楽しむ` → `子どもの時間` → `ひと休み・ごはん` の役割補完を優先。
- food/cafeの `plan_profile.role=companion` と `family_recovery` をPlanスコアに反映。

## Curated affiliate booking

- `affiliate-config.js` にprovider priorityを追加。
  - Stay: OZmall → 一休.com → じゃらんnet → JTB → Yahoo!トラベル
  - Food: OZmall → 一休.comレストラン
  - Experience: アソビュー！ → OZmall
- 詳細画面には複数予約サイトを並べず、**最優先の1リンクだけ**表示。
- `spot_214 富士屋ホテル` にユーザー提供のOZmall個別A8コードをそのまま追加。
- 既存のじゃらん箱根エリアA8コードはfallbackとして保持。
- A8のraw HTMLは改変せず保存・描画。
- GA4 `affiliate_click` でraw linkのproviderも取得できるよう修正。

## Media

- 新規30件は Google Places Hero優先 + AI fallback。
- 新規追加分のphoto indexは未監査。`?heroAudit=1` で次回監査対象。
- Worker / assets の変更なし。
