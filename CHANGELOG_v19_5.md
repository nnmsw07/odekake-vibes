# CHANGELOG v19.5 — kibuntrip.com public release prep

## Brand / domain
- 正式サービス名を `Kibun Trip` としてSEO・OGP・法務ページに反映。
- メインURLを `https://kibuntrip.com/` に固定。
- GitHub Pages用 `CNAME` を追加。

## SEO / sharing
- canonical / description / Open Graph / Twitter Card / WebSite JSON-LDを追加。
- `robots.txt` / `sitemap.xml` / `404.html` を追加。
- OGP画像、favicon、Apple touch icon、manifest iconsを追加。

## Privacy
- 任意出発地検索時にGoogle Places APIへ検索語を送信することをプライバシーポリシーへ追記。

## Worker
- `ALLOWED_ORIGIN` に `kibuntrip.com`, `www.kibuntrip.com`, `.jp`, GitHub Pages移行元を追加。
- Workerコード/API仕様そのものは変更なし。Cloudflareへの再デプロイは必要。

## Data
- 211 spotsを維持。dataset versionを `0.19.5` へ更新。
