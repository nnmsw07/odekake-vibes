# Kibun v20.12.8 — quiet adult hero + SEO guardrails

- 「静かな大人時間」カードに、今回生成した庭園を望む静かなラウンジの専用Heroを追加。
- partner の4枚目だけに適用し、他の同行者向け4枚目カードには影響させない。
- SEO監査 `scripts/seo_audit.mjs` を追加。
  - sitemap掲載漏れ
  - 200応答
  - self-canonical
  - noindex / robots
  - 内部リンク切れ
  - 孤立ページ
  をまとめて検査。
- guide 358件のスポットCTAを、検索条件URLではなく各 `/spots/<slug>/` への通常リンクへ変更。
- Magazine等に残っていた旧 `?spot=spot_xxx` 内部リンク194件を固有spot URLへ正規化。
- noindexの旧記事2ページをsitemap生成対象から除外し、sitemapを534 → 532 URLへ整理。
- トップfooterに `/spots/` の通常リンクを追加し、スポット一覧hubの孤立を解消。
- Search Consoleの2026-09-07基準値（検出-未登録31 / クロール済み-未登録5）を監査フォルダへ保存。
- GitHub Actionsでpush/PR時のSEO監査＋毎週月曜7:20 JSTの公開URL監査を追加。

## 検証

- SEO audit: 532 URLs / 0 errors / 0 warnings — PASS
- guide → spot: 358 / 358
- legacy `?spot=` internal links: 0
