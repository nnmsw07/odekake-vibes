# Kibun — おでかけVibes MVP

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
- `data.js` — ブラウザから直接読む10スポットデータ
- `seed.json` — 元JSON
- `images/ai/` — 権利未確保スポット用の暫定イメージ
- `test_recommender.js` — 推薦ロジックの簡易テスト

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
