# Kibun v20.11.21 — SEO route hotfix

- `/spots/` が 404 になるケースを修正。
- 通常の `spots/<slug>/index.html` に加えて、Cloudflare Pages 用の root fallback HTML を生成。
- `_redirects` の 200 rewrite で `/spots/<slug>/` のきれいなURLを維持したまま fallback HTML を配信。
- `spots/` が `.gitignore` 等の影響を受けても `git add -f` で確実にコミット。
- sitemap / canonical は引き続き `/spots/<slug>/` を使用。
- push 前に fallback ページ件数・`_redirects`・`spots-index.html` を検証。
