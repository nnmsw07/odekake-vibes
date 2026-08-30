# Kibun Trip MVP v0.19.8.2 — 256 spots

## v19.8.2 — Plan quality / family balance

Plan生成を「時間を埋める組み合わせ」から「過ごし方として自然な流れ」へ寄せました。半日以下では宿泊Planを出さず、同系統の公園→公園などを原則回避。組み合わせ判定を横浜市・川崎市では区単位まで細分化し、子連れの長時間Planでは「大人も楽しめる主役 + 子どもの時間 + 食事/休憩」の役割バランスを優先します。飲食スポット自体の拡充は次段階で行います。詳細は `CHANGELOG_v19_8_2.md` / `HANDOFF_v19_8_2.md` を参照してください。

## v19.8.1 — Plan duration & copy polish

「使える時間」とPlanの粒度を揃えました。半日指定時に1〜2時間の短い単独Planへフォールバックせず、近隣との組み合わせまたは別候補へバックフィルします。また「外の時間を長くする」「手を動かす時間をつくる」のような機械的な汎用コピーをやめ、未編集スポットは自然で具体的な表現へ変更しました。詳細は `CHANGELOG_v19_8_1.md` / `HANDOFF_v19_8_1.md` を参照してください。

## v19.8 — Kibun Plans

「今日の3つ」をスポット3件の羅列から、**今日の過ごし方3案**へ変更しました。単一施設で半日〜1日楽しめる場所は `ONE PLACE`、短めの場所は近隣の寄り道と `DAY PLAN`、宿泊を許可した場合は `STAY PLAN` として臨機応変に組み立てます。詳細は `PLANS_DESIGN_v19_8.md` / `HANDOFF_v19_8.md` を参照してください。

「今日はどんな気分？」から始める、関東近郊のおでかけ推薦Web MVPです。同行者・気分・子どもの年齢・移動時間などを使い、「今日の3つ」を返します。

## v0.19 の状態

- **256スポット**収録
- 同行者: 子ども / パートナー / ひとり / 友だち
- 気分・やりたいことを最大3つ選択
- 子どもの年齢によるhard filter
- 出発地を **現在地 / 駅名・地名・住所検索** から自由に指定して移動時間絞り込み
- Google Placesによる出発地検索 + Google Routes APIによる実ルート時間（Worker設定時）
- Google Places Heroによる施設実写（取得失敗時はAIイメージへfallback）
- `recommendation_group` による同一複合施設の3枠重複抑制
- Kibunロゴから **地域 × カテゴリ** で256スポットをブラウズ
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
- `data.js` — ブラウザ用256スポットデータ
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

## V19.5.3 official URL audit

公開前に241スポットの `official_url` を監査し、13件を現行URLへ正規化しました。詳細は `URL_AUDIT_v19_5_3.md`。今後は `node scripts/check_official_urls.mjs` で一括確認できます。


## V19.5.4 operations audit

公開前の名称・休館/休業・営業時間棚卸しを実施しました。季節プール等は2026年営業期間を `availability_constraints` に入れ、営業期間外や既知メンテナンス日は推薦から除外します。詳細は `OPERATIONS_AUDIT_v19_5_4.md`。`node scripts/audit_operating_snapshots.mjs` で古い動的情報を再点検できます。


## V19.6 SEO / Affiliate foundation

- `/guide/` と地域×カテゴリSEOガイド20ページを追加
- `sitemap.xml` にガイドページを追加
- SEOガイドから `/?region=...&category=...` でKibunのブラウズを直接開ける
- GA4イベント `seo_guide_cta` / `seo_guide_open` を追加
- 241スポットへ内部 `monetization.affiliate_fit (A/B/C)` を付与
- `affiliate-config.js` / `affiliate.js` を追加。ただし **enabled=false** で、提携前はPR導線を一切表示しない
- 提携後のPRリンクは `rel="sponsored noopener"`、GA4 `affiliate_click` で計測

詳細: `SEO_PLAN_v19_6.md` / `AFFILIATE_AUDIT_v19_6.md`



## v19.7.3 Hero audit refresh

- Stay / Experience追加分について、ユーザー監査exportをseedへ反映。
- `spot_212`〜`spot_256`のうち29件でGoogle Places `photo_index_override`を固定。
- `spot_213` / `spot_225` / `spot_253` / `spot_255` はPlace IDも手動固定。
- 監査exportは `HERO_OVERRIDES_v19_7_3.json` に保存。
- Worker / assets の更新なし。

## v19.7.2 Experience / Stage expansion
- 歌舞伎座 / 劇団四季 / 新橋演舞場 / KAATを「観劇・舞台」として追加。日時依存が強い劇場は `browse_only` とし、通常の「今日の3つ」へ無条件に混ぜない。
- 陶芸、Paint & Sip、金継ぎ、江戸切子、食品サンプル、香りづくり、和紙など11件のものづくり体験を追加。
- ブラウズに `🎭 観劇・舞台`、ホームに `MAKE / WATCH / TRY` を追加。
- 241 → 256スポット。新規15件はGoogle Places Hero優先＋AI fallback。V19.7.3でStay/Experience追加分のHero監査exportを反映し、29件のphoto index・4件のPlace IDを固定。
