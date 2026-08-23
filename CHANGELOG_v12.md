# CHANGELOG v0.12 — Kibun UI V2

- 「誰と過ごす？」を追加：子ども / パートナー / ひとり / 友だち。
- 子どもモードのときだけ年齢条件を表示。
- 全83スポットに `audience_fit` と `adult_enjoyment_seed` を追加。
- 現在地取得＋30/60/90/120分の所要時間フィルターを追加。
- GitHub Pagesだけでも「町丁目代表点＋距離モデル」で概算所要時間が動く。
- Cloudflare Worker + Google Routes API を接続すれば実ルート時間へ差し替え可能。
- Hero写真をさらに主役にしたカードUIへ刷新。
- Google Places実写を優先できる `media_strategy` とWorkerサンプルを追加。
- 詳細画面に4つの audience fit を表示。
- Instagram/Reel機能は維持。

### 注意
概算所要時間はルート案内ではありません。公開時には「約」「概算」表示を残してください。
