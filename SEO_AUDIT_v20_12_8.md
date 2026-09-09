# Kibun SEO Audit v20.12.8

次回以降、スポット・記事・プラン・guideを追加したときにSEOの基本崩れを自動検知するための監査です。

## 自動チェック

`node scripts/seo_audit.mjs`

- sitemap掲載漏れ（spots / magazine / plans / guide の indexable ページ）
- sitemap URL のローカルHTTP 200応答
- self-canonical
- noindex / robots.txt ブロック
- 内部リンク切れ
- 孤立ページ
- guide → 個別 `/spots/<slug>/` の通常 `<a href>` 導線
- 旧 `?spot=spot_xxx` 内部リンクの残存

公開後の実URL確認:

`node scripts/seo_audit.mjs --live --base-url https://kibuntrip.com`

GitHub Actionsでも、push / PR時にローカル監査、毎週月曜7:20 JSTに公開URL監査を実行します。

## Search Console 経過確認

`seo-audit/search-console-baseline.json` に 2026-09-07 時点の基準値を保持しています。

- 検出 - インデックス未登録: 31件
- クロール済み - インデックス未登録: 5件

Search Console自体の件数は外部データなので、このコード監査だけでは自動取得しません。次回確認時はこの基準値と最新件数・対象URLを比較します。
