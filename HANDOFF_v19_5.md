# Kibun Trip v19.5 handoff — 2026-08-29

## Current
- 211 spots
- dataset version `0.19.5`
- production domain target: `https://kibuntrip.com`
- secondary domain: `https://kibuntrip.jp` → 301 to `.com`
- formal brand: `Kibun Trip` / UI short brand: `Kibun`

## Implemented
- Custom-domain `CNAME`
- canonical / OGP / Twitter Card / JSON-LD
- favicon / app icons / OGP image
- robots / sitemap / 404 / manifest
- legal-page domain/brand refresh
- privacy disclosure for location text search
- Worker CORS production-domain allowlist

## Deployment required
1. GitHub: v19.5 filesをcommit/push
2. GitHub Pages: Custom domain = `kibuntrip.com`
3. DNS: apex A records + `www` CNAME
4. Worker: updated `wrangler.toml` で再deploy
5. `.jp`: `.com` へ301 redirect
6. HTTPS安定後: Search Console + sitemap

## Next product phase
- GA4イベント設計（recommend / detail / browse / origin search）
- `/en/` 英語UI設計と表示テキストのi18n化
- 予約/チケット導線の収益化設計
- SEOでindexableな地域×カテゴリ landing pageの検討
