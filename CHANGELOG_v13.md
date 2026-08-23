# V0.13 — Google Places Hero ready

- Google Places写真をAI Heroの代替として実運用できる実装へ更新
- `apiBaseUrl` 1行でRoutes / Placesを両方有効化
- Google Placesの施設名マッチ判定を追加し、低信頼結果は既存Heroへフォールバック
- Googleの写真順＋横長適性を使ったHero候補選択
- `photo_index_override` / `force` / `disabled` を使える画像監査構造
- Google Maps attribution、写真投稿者、元写真リンクを表示
- 写真リソース名や短期URLをKibun側に保存しない
- IntersectionObserverで見えるHeroだけ取得しAPIコールを抑制
- 監査済み実写は保持し、デフォルトではAI画像だけPlacesへ差し替え
- `privacy.html` / `terms.html` を追加
- Cloudflare WorkerのOrigin制限・health endpointを強化
