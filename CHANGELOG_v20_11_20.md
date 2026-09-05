# Kibun v20.11.20 — Spot SEO routes / sitemap

- `?spot=spot_xxx` だけだったスポットに、`/spots/<slug>/` の検索エンジン向け固有URLを生成。
- 各スポットURLに固有の title / description / canonical / OGP / Twitter meta / Place JSON-LD を設定。
- 既存のKibun UIをそのまま利用し、固有URLから対象スポット詳細を自動で開く。
- `/spots/` にクロール可能なスポット一覧を生成。
- `sitemap.xml` にトップ、全スポット、Magazine / Plans / Guide の静的ページを収録。
- `robots.txt` に `https://kibuntrip.com/sitemap.xml` を明示。
- `scripts/generate_seo_pages.mjs` は現在のスポットデータを自動検出するため、今後スポット追加後に再実行すれば一覧と sitemap も追随。

Cloudflare の手動ログイン・手動デプロイは不要。GitHub push 後の既存自動デプロイを利用する。
