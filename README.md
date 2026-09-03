# Kibun Trip MVP v20.1 — 306 spots


## v20.1 — 横浜・葉山のVibe拡張

海の公園＋文化財スターバックス、THE SUNSET OF MARS、葉山の近代美術館＋海景色レストラン、大雄山最乗寺を追加し、ASOBono!・こびとはくぶつかん・八景島の最新情報も更新しました。うんこミュージアムは削除せずスポット検索には残しつつ、Kibunの編集軸との相性を考えて通常推薦・特集から外しています。詳細は `CHANGELOG_v20_1.md` / `HANDOFF_v20_1.md` を参照してください。

## v19.9 — Magazine / Plans / chano-ma

chano-ma系列5店をFood companionとして追加。トップにKIBUN MAGAZINEを置き、6本のevergreen記事と編集Plan一覧を新設しました。スマホでは「記事 / プラン / 今日の気分」を下部ナビで往復できます。記事からSpot詳細、Plan一覧から編集Plan詳細へdeep linkできます。詳細は `CHANGELOG_v19_9.md` / `HANDOFF_v20_0.md` を参照してください。

## v19.8.6 — Short-plan AFTER cafe / restaurant suggestion

2〜3時間程度のPlanは、主役の過ごし方を無理に詰め込まず、同じローカルエリアに相性のよいカフェ・レストランがある場合だけ **「帰る前に、もう少し。」** として任意の寄り道候補を添えるようにしました。AFTER候補はPlan本体の滞在時間には含めず、行くかどうかをユーザーが選べます。子連れでは休みやすさ、ふたりでは余韻、ひとりでは寄りやすさなど同行者別のコピーを出します。データ件数は286スポットのままです。詳細は `CHANGELOG_v19_8_6.md` / `HANDOFF_v19_8_6.md` を参照してください。

## v19.8.5 — Editorial plan library / NOW ON KIBUN

「今日の3つ」の自動生成に加えて、横浜・お台場・立川・豊洲・江の島・清澄白河・天王洲・代官山などで、**大人も楽しむ → 子どもの時間 → ひと休み・ごはん**など一日の流れを編集した19本のKibun Planテンプレートを追加しました。買い物Intentは主役選定には厳密に使いつつ、Plan内の子どもスポットや食事まで買い物カテゴリに縛らないよう改善しています。トップの「TRENDING NOW」は「NOW ON KIBUN / いま、気になる。」へ変更し、季節・新しさ・編集スコア・週次ローテーションで自動入れ替え。子連れ系は最大2件に抑え、ふたり・ひとり・友だち視点も混ざるようにしました。データ件数は286スポットのままです。詳細は `CHANGELOG_v19_8_5.md` / `HANDOFF_v19_8_5.md` を参照してください。

## v19.8.4 — Intent guard / day-trip copy fix

日帰り利用できるリゾート施設を「宿泊施設」と誤分類して「今日はそのまま泊まる」と表示していた問題を修正しました。また「買い物を楽しみたい」を選んだとき、ショップを併設するテーマパークが上位に来るのではなく、ショッピングモール・商業複合施設・商店街・マーケットなど「買い物自体が主役になる場所」を優先する intent guard を追加しました。ブラウズの「買い物・複合施設」も同じ基準に揃えています。データ件数は286スポットのままです。詳細は `CHANGELOG_v19_8_4.md` / `HANDOFF_v19_8_4.md` を参照してください。

## v19.8.3 — Food / Cafe companions + curated booking

Planを「場所のハシゴ」ではなく一日の流れとして成立させるため、カフェ・レストラン28件と、お台場の親子向け主役2件を追加しました。Planの組み合わせは区単位より細かい `plan zone` を優先し、お台場→赤坂のような同一区内の遠距離ハシゴを抑制します。子連れの長時間Planでは「大人も楽しむ / 子どもの時間 / ひと休み・ごはん」の役割を優先。予約導線は複数ASPを並べず、個別リンク＋編集優先順位で1件だけ表示します。富士屋ホテルはユーザー提供のA8生成コードをそのまま保持し、OZmall個別ページを第一候補、じゃらん箱根エリアをfallbackとして残しています。詳細は `FOOD_CAFE_EXPANSION_v19_8_3.md` / `CHANGELOG_v19_8_3.md` / `HANDOFF_v19_8_3.md`。

## v19.8.2 — Plan quality / family balance

Plan生成を「時間を埋める組み合わせ」から「過ごし方として自然な流れ」へ寄せました。半日以下では宿泊Planを出さず、同系統の公園→公園などを原則回避。組み合わせ判定を横浜市・川崎市では区単位まで細分化し、子連れの長時間Planでは「大人も楽しめる主役 + 子どもの時間 + 食事/休憩」の役割バランスを優先します。飲食スポット自体の拡充は次段階で行います。詳細は `CHANGELOG_v19_8_2.md` / `HANDOFF_v19_8_2.md` を参照してください。

## v19.8.1 — Plan duration & copy polish

「使える時間」とPlanの粒度を揃えました。半日指定時に1〜2時間の短い単独Planへフォールバックせず、近隣との組み合わせまたは別候補へバックフィルします。また「外の時間を長くする」「手を動かす時間をつくる」のような機械的な汎用コピーをやめ、未編集スポットは自然で具体的な表現へ変更しました。詳細は `CHANGELOG_v19_8_1.md` / `HANDOFF_v19_8_1.md` を参照してください。

## v19.8 — Kibun Plans

「今日の3つ」をスポット3件の羅列から、**今日の過ごし方3案**へ変更しました。単一施設で半日〜1日楽しめる場所は `ONE PLACE`、短めの場所は近隣の寄り道と `DAY PLAN`、宿泊を許可した場合は `STAY PLAN` として臨機応変に組み立てます。詳細は `PLANS_DESIGN_v19_8.md` / `HANDOFF_v19_8.md` を参照してください。

「今日はどんな気分？」から始める、関東近郊のおでかけ推薦Web MVPです。同行者・気分・子どもの年齢・移動時間などを使い、「今日の3つ」を返します。

## 現在の状態

- **306スポット**収録
- 同行者: 子ども / パートナー / ひとり / 友だち
- 気分・やりたいことを最大3つ選択
- 子どもの年齢によるhard filter
- 出発地を **現在地 / 駅名・地名・住所検索** から自由に指定して移動時間絞り込み
- Google Placesによる出発地検索 + Google Routes APIによる実ルート時間（Worker設定時）
- Google Places Heroによる施設実写（取得失敗時はAIイメージへfallback）
- `recommendation_group` による同一複合施設の3枠重複抑制
- Kibunロゴから **地域 × カテゴリ** で306スポットをブラウズ
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
- `data.js` — ブラウザ用306スポットデータ
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



## v20.8.2 Hero audit refresh

- 最新のユーザーHero監査exportを `HERO_OVERRIDES_v20_8_2.json` に保存。
- 167件のphoto index選択と10件のPlace ID固定をseed/dataへ反映。
- spot_334 / 336 / 338 / 357 / 373 / 419 は今回新たにPlace IDを固定。
- Worker / assets変更なし。

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
## v20.8.3 mobile image overlay fix

モバイルChromeで画像用グラデーションや「イメージ」バッジがカード外へはみ出し、画面中央に大きな黒い帯が出ることがある問題を修正。`.image-shell` を positioned + clipped container として定義し、stylesheet cache-buster を `2083` に更新。

## v20.9.0 Affiliate Audit v2 + Hero Audit 10-photo mode

- Affiliate direct-source coverage: 148 spots / 159 links.
- All 446 spots have an explicit affiliate audit status in `affiliate-audit-status.js`; `AFFILIATE_AUDIT_v20_10_0.json` is the current snapshot and v20.9.0 remains as the previous 431-spot audit snapshot.
- `/affiliate-audit/` now defaults to the unresolved `再調査` queue and can filter by static audit outcome.
- `?heroAudit=1` now requests and displays up to 10 Google Places photo candidates instead of 6.
- `worker/worker.js` changed for the 10-photo limit, so Cloudflare Worker redeploy is required.

## v20.9.1 SNS Audit

管理用SNS投稿監査ページを追加しました。

- `/sns-audit/` または `/?snsAudit=1`
- 記事 / プラン / スポット遷移先、Hero、Instagram導線、Affiliate準備状況、投稿実績を投稿単位で管理
- 編集値は端末に保存し、JSONで書き出し / 読み込み可能
- Hero Audit / Affiliate Audit / SNS Audit間を管理画面から移動可能


## v20.10.0 editorial + destination expansion

- 431 → 446 spots (+15): stay, craft/design, culture/architecture, seasonal pool, animals, market, and new-city culture.
- Added 8 curated plans, including four overnight flows.
- Added three original Kibun Magazine stories: outdoor stays, tools/craft, and an after-five Takanawa walk.
- Editorial framing is original to Kibun; external editorial references are used only as inspiration for topic discovery, never copied in wording or page structure.
- Affiliate audit status now covers all 446 spots.


## v20.10.1 Hero Audit refresh
- Latest Hero Audit export saved as `HERO_OVERRIDES_v20_10_1.json`.
- 182 photo selections and 14 manual Google Place pins applied to seed/data.
- New spots 432–446 are included in the audited Hero selection.
- `data.js?v=20101`; no Worker or image asset change.
