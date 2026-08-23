# Google Places Hero / Routes セットアップ v0.13

V0.13はコード側の実装済みです。公開環境でONにするには、Cloudflare WorkerへGoogle Maps PlatformのAPIキーをSecretとして設定し、`config.js` の `apiBaseUrl` を1行設定します。

## 1. Google Cloud

1. Google Cloudでプロジェクトを作成し、Billingを有効化
2. **Places API (New)** と **Routes API** を有効化
3. API Keyを作成
4. API restrictions は Places API (New) / Routes API のみに限定
5. キーはGitHubへ書かない

## 2. Cloudflare Worker

Cloudflare Dashboard → Workers & Pages → Create Worker からWorkerを作成し、`worker/worker.js` を貼り付けてDeployします。

Settings / Variables and Secrets で:

- Secret: `GOOGLE_MAPS_API_KEY` = Google CloudのAPI Key
- Variable: `ALLOWED_ORIGIN` = `https://nnmsw07.github.io`

Worker URLが `https://kibun-api.example.workers.dev` なら、ブラウザで `/health` を開き `{"ok":true,...}` が返ればOKです。

## 3. Kibun側

`config.js` の1行だけ変更:

```js
apiBaseUrl: "https://kibun-api.example.workers.dev",
```

これで:

- 現在地の所要時間 → Google Routesの実ルート
- AI Hero → Google Placesの実写（該当施設が高/中信頼でマッチした場合）

へ自動切替します。

## Hero写真の方針

V0.13のデフォルトは `replace_ai_only` です。すでに監査済みの実写は残し、AI HeroだけGoogle Placesへ差し替えます。

特定施設でGoogle Placesを優先したい場合は `media_strategy.google_places.force=true`。誤マッチする施設は `status="disabled"` にできます。写真候補が微妙な場合、`photo_index_override` でGoogle Placesの別候補へ切替可能です。

## 権利・表示

Google Places写真はKibunへ保存・再配布しません。毎回APIから短期URLを取得します。画面には `Google Maps` と写真投稿者の帰属、元写真へのリンクを表示します。

V0.13では `privacy.html` / `terms.html` も追加済みです。
