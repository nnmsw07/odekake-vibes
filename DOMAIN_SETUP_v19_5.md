# Kibun Trip v19.5 — 独自ドメイン公開手順

正式ドメイン: `kibuntrip.com`
保有ドメイン: `kibuntrip.jp`（`.com` へ301リダイレクト推奨）
GitHub Pagesユーザー: `nnmsw07`

## 1. GitHub Pages側
1. リポジトリへv19.5をpush。
2. GitHub → Settings → Pages → Custom domain に `kibuntrip.com` を入力して保存。
3. DNS反映後、`Enforce HTTPS` を有効化。
4. リポジトリ直下の `CNAME` は `kibuntrip.com` のまま維持。

注意: `CNAME` ファイルを置くだけではGitHub Pages側のCustom domain設定は完了しません。

## 2. kibuntrip.com のDNS
Apex (`@`) はGitHub Pages公式IPへAレコード4本を設定。

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

IPv6を使う場合のAAAA: 
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

`www` はCNAMEで `nnmsw07.github.io` へ向ける。ワイルドカードDNS (`*.kibuntrip.com`) は作らない。

## 3. kibuntrip.jp
GitHub Pagesに2つ目のapexとして設定しない。ドメイン管理会社またはCloudflare Redirect Rules等で、

`https://kibuntrip.jp/*` → `https://kibuntrip.com/$1`

の恒久（301）リダイレクトにする。`www.kibuntrip.jp` も同様。

## 4. Cloudflare Worker
`worker/wrangler.toml` の `ALLOWED_ORIGIN` はv19.5で更新済み。

```toml
ALLOWED_ORIGIN = "https://kibuntrip.com,https://www.kibuntrip.com,https://kibuntrip.jp,https://www.kibuntrip.jp,https://nnmsw07.github.io"
```

Workerディレクトリで再デプロイする。Google Maps API Secret `GOOGLE_MAPS_API_KEY` は作り直さない。

## 5. 公開後チェック
- `https://kibuntrip.com/` がHTTPSで開く
- `www.kibuntrip.com` が正規URLへ寄る
- `.jp` が `.com` へ301転送される
- 現在地、任意出発地検索、Google Places Hero、Routesが動く
- LINE/X等への共有でOGP画像が出る
- `/robots.txt` と `/sitemap.xml` が200になる

## 6. Search Console
DNSが安定したらSearch Consoleで `kibuntrip.com` の「ドメイン プロパティ」を追加し、指定されたTXTレコードで所有権確認。確認後 `https://kibuntrip.com/sitemap.xml` を送信する。
