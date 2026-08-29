# Handoff v19.6

## 公開後すぐ確認
1. `https://kibuntrip.com/guide/` が表示される
2. 20ガイドのcanonical / OGPが正しい
3. ガイドのCTAから地域×カテゴリのbrowse dialogが直接開く
4. Search Consoleの sitemap は同じ `https://kibuntrip.com/sitemap.xml` のまま。再送信は任意
5. GA4で `seo_guide_cta` / `seo_guide_open` を確認

## Affiliate
- 現在は完全OFF。`affiliate-config.js` の `enabled` をtrueにするだけではなく、ASP/OTA提携と商品URL照合を済ませてからlinksを登録する。
- 公式サイトリンクは常に残す。
- 最初は `AFFILIATE_AUDIT_v19_6.md` のA候補から商品照合。

## Next SEO
- Search Consoleで実クエリが出てから、雨の日 / 1歳 / デート / 穴場などの意図ページを追加。
- 211スポット個別ページは一括量産せず、検索需要・独自情報があるものから段階的に作る。
