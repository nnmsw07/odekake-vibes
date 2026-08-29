# Kibun Trip MVP v0.19.5 — 211 spots

「今日はどんな気分？」から始める、関東近郊のおでかけ推薦Web MVPです。同行者・気分・子どもの年齢・移動時間などを使い、「今日の3つ」を返します。

## v0.19 の状態

- **211スポット**収録
- 同行者: 子ども / パートナー / ひとり / 友だち
- 気分・やりたいことを最大3つ選択
- 子どもの年齢によるhard filter
- 出発地を **現在地 / 駅名・地名・住所検索** から自由に指定して移動時間絞り込み
- Google Placesによる出発地検索 + Google Routes APIによる実ルート時間（Worker設定時）
- Google Places Heroによる施設実写（取得失敗時はAIイメージへfallback）
- `recommendation_group` による同一複合施設の3枠重複抑制
- Kibunロゴから **地域 × カテゴリ** で211スポットをブラウズ
- Hero監査UI (`?heroAudit=1`)

V19.5の公開準備は `CHANGELOG_v19_5.md` / `DOMAIN_SETUP_v19_5.md` / `HANDOFF_v19_5.md` を参照してください。スポット追加履歴は `CHANGELOG_v19_3.md` / `SPOT_ADDITIONS_10_v19_3.md` に残しています。

## ローカル確認

ビルド不要です。このフォルダで:

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

`index.html` の直接オープンでも基本UIは動きますが、API連携やブラウザ制約の確認にはローカルサーバーを推奨します。

## 主なファイル

- `index.html` — UI
- `styles.css` — スマホ優先デザイン
- `app.js` — UI / 詳細 / Hero監査
- `recommender.js` — 推薦ロジック
- `data.js` — ブラウザ用211スポットデータ
- `seed.json` — 元データ
- `travel.js` — 出発地検索 / ルート時間取得
- `media.js` — Google Places Hero取得
- `config.js` — API URL / Places Hero設定
- `worker/worker.js` — Cloudflare Worker (場所検索 / Places Hero / Routes proxy)
- `GOOGLE_PLACES_SETUP_v13.md` — Google Cloud / Worker設定
- `HANDOFF_v19_4.md` — 現在地点と次の確認事項

## Google Places Hero

現在の方針は **Google Places実写を優先し、取得できない場合だけAI画像へfallback** です。

`config.js`:

```js
placePhotoEnabled: true,
placePhotoMode: "prefer_places",
```

APIキーはフロントへ置かず、Cloudflare WorkerのSecret `GOOGLE_MAPS_API_KEY` に保存します。詳細は `GOOGLE_PLACES_SETUP_v13.md` を参照してください。

## Hero監査

公開URLの末尾に `?heroAudit=1` を付けると管理用のHero監査UIを表示します。Google Placesの複数候補から写真を選び、Place IDやphoto indexの固定値を書き出せます。

通常利用では監査UIは表示されません。

## テスト

Node.jsで:

```bash
node test_recommender.js
node test_v12.js
node test_v17.js
node test_v17_1.js
node test_v18.js
node test_v19.js
node test_v19_places.js
node test_v19_4.js
```

## GitHub Pages

フォルダ内容をリポジトリ直下へ配置して公開できます。APIキーはGitHubへ置かず、Cloudflare Worker側だけに保存してください。


## v19.4.2 ブラウズUI
- 地域・カテゴリは自由入力ではなく、あらかじめ用意した選択肢（チップ）から選択。
- 地域 × カテゴリのAND絞り込み。
- 自由入力はスポット名検索のみ任意で残す。

## v19.5 独自ドメイン公開準備

- 正式ドメイン: `https://kibuntrip.com`
- `CNAME`, `robots.txt`, `sitemap.xml`, OGP, favicon, Web App Manifestを追加
- 正式サービス名は **Kibun Trip**、UI上の短いブランドは **Kibun** を継続
- Worker CORSに `kibuntrip.com` / `.jp` / GitHub Pages移行元を追加
- `.jp` はGitHub Pagesの第2 apexとして設定せず、`.com` への301リダイレクト推奨

DNSとGitHub Pages設定の具体手順は `DOMAIN_SETUP_v19_5.md` を参照してください。


## GA4 (v19.5.1)

Production measurement ID: `G-M99DNGD18F`. Main interaction events are tracked without sending user-entered origin text or coordinates to GA4. See `HANDOFF_v19_5_1.md`.
