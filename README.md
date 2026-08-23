# Kibun MVP v0.3 — 40スポット + Buzz layer

「今日はどんな気分？」から始める、関東近郊おでかけ推薦の静的Web MVPです。

## すぐ見る

`index.html` を直接開いても動きます（データを `data.js` に同梱しています）。

より本番に近い確認は、このフォルダでローカルサーバーを起動してください。

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## 構成

- `index.html` — UI
- `styles.css` — スマホ優先デザイン
- `app.js` — UI制御・詳細モーダル・お気に入り
- `recommender.js` — Python版V0をJavaScriptへ移植した推薦ロジック
- `data.js` — ブラウザから直接読む40スポットデータ
- `seed.json` — 元JSON
- `images/ai/` — 権利未確保スポット用の暫定イメージ
- `test_recommender.js` — 推薦ロジックの簡易テスト
- `CHANGELOG_v03.md` — v0.3差分と注意点

## V0.2 の主な変更

- `cross_cultural`（異文化）を `culture`（文化にふれたい）へ変更
- 条件入力をデフォルトで折りたたみ
- 推薦カードを「写真 → 場所 → 理由」中心の構成へ変更
- ハマり度スコアを補助情報へ格下げ
- 詳細画面の先頭にHero imageを追加
- 実写 / AIイメージ / 生成イラストをデータ上で区別
- 実写は権利情報・クレジットを保持し、イメージ画像は「イメージ」と表示
- Mood Collectionsを画像カード化

## 画像ポリシー

`hero_image` に以下を保持します。

```json
{
  "url": "...",
  "type": "photo | ai | illustration",
  "alt": "...",
  "credit": "...",
  "source_url": "...",
  "license": "...",
  "license_url": "...",
  "exact_spot": true
}
```

- `photo`: 再利用条件を確認できた実写のみ
- `ai`: AI生成による雰囲気イメージ。実在施設の正確な外観・内観ではない
- `illustration`: 雰囲気補助の生成イラスト
- AI/illustrationにはUI上で「イメージ」表示を付ける
- 将来、施設提供写真や自前写真が確保できたら差し替える

現在の実写採用は以下です。

- ヤマハミュージック 横浜みなとみらい — Wikimedia Commons / CC0 1.0
- よこはま動物園ズーラシア — Wikimedia Commons / CC BY 2.0

## テスト

Node.js があれば：

```bash
node test_recommender.js
```

## GitHub Pages

このフォルダの中身をリポジトリ直下へ置けば、ビルド不要でGitHub Pagesに載せられます。

## 次に入れると強い機能

1. 現在地・出発地からの実移動時間
2. 当日営業時間 / 予約枠の更新
3. 「行った / 期待通りだった / どんな気分に合った？」のフィードバック
4. 施設提供・自前写真への段階的な差し替え
5. 30〜100スポットへの拡張
6. URL共有できる検索条件・結果


## v0.3 更新内容

- 既存10スポット + 新規30スポット = **関東40スポット**
- `culture`（文化にふれたい）候補を大幅拡充
- experimentalな `buzz` レイヤーを追加
- 新規開業・リニューアルなど Buzz 90以上を「いま、ちょっと話題。」に表示
- Buzzは推薦の主スコアには未使用（年齢/Vibe適合を優先）
- JAL SKY MUSEUMのような明示的な年齢制限はhard filter対応を開始
- 新規スポットの写真は現時点では既存のAIイメージを仮利用。権利確認済み実写へ順次差し替える

### GitHub Pagesへ更新する場合

このフォルダの中身をリポジトリ直下へ上書きしてください。`images/ai/` はv0.2と同じ画像一式です。


## V0.4 画像更新

実写heroを9/40スポットまで増やしました。画像の出典・ライセンスは `IMAGE_CREDITS.md` と `seed.json` の `hero_image` を参照してください。CC BY / CC BY-SA画像は画面上にもクレジットを表示します。


## v0.8
- 83スポット収録（神奈川中心のPriority A 15件を追加）
- 一時休館のhard filterに対応


## v0.12 UI V2
同行者モード・現在地からの概算所要時間・audience_fit・Google Routes/Places拡張フックを追加。詳細は `ROUTING_MEDIA_v12.md`。
