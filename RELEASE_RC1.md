# Kibun Trip — Release Candidate 1

RC1では新機能追加を止め、公開品質の確認を優先する。

## P0 release gate

- [x] UI回帰ガード: 気分カード / 親も楽しい日に / 承認済みヒーロー
- [x] SEO構造監査: sitemap / self-canonical / noindex / robots / 内部リンク / 孤立ページ / 200応答
- [x] 旧GitHub Pages origin と canonical origin の監査
- [x] GA4導入確認
- [x] 推薦 → プラン → スポット → 外部リンク / アフィリエイトの主要イベント確認
- [x] プライバシーポリシー / 利用規約 / 免責
- [x] アフィリエイト開示 / 問い合わせ先
- [x] 404ページ
- [x] 主要ローカルアセット参照チェック

## Merge前

GitHub Actions の `Kibun Release Gate` が green であること。

## Merge後

1. Cloudflare Pages のGitHub連携デプロイ完了を確認する。
2. `Kibun SEO Audit` の live audit を実行し、公開URLの200 / canonical / noindex / legacy origin を確認する。
3. スマホ実機で以下の導線を1回通す。
   - 同行者選択
   - 気分選択
   - 「この気分で出かける」
   - プラン詳細
   - スポット詳細
   - 公式サイトまたは予約リンク
4. GA4 Realtime / DebugView で主要イベントが届くことを確認する。

## RC1以降に回すもの

- プラン作成機能の本格拡張
- 犬連れコンテンツの大幅拡張
- 英語版の完全追随
- 公演データ連携の高度化
- アフィリエイト対応率のさらなる改善
