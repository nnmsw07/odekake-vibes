# HANDOFF v19.4

## 現在の状態
- 211 spots
- dataset version: 0.19.4
- Google Places Hero優先 / AI fallback
- 最新Hero監査反映済み
- 自由な出発地検索を実装済み
- Kibunロゴから地域 / カテゴリブラウズを実装済み

## v19.4で重要な変更

### 1. Hero監査
`HERO_OVERRIDES_v19_4.json`
- photo index: 153 spots
- explicit place overrides: 28
- seed内place ID: 37 spots

### 2. 出発地検索
条件欄から以下が可能。
- 現在地
- 駅名
- 地名
- 住所
- 出発地なし

Workerの `/location-search` がGoogle Places Text Searchを呼ぶ。
選択した緯度経度は既存 `/travel-times` へ渡す。

### 3. ブラウズ
左上Kibunロゴ → Browse dialog。
- 地域別
- カテゴリ別
- フリーワード

ブラウズは「気分推薦を使わずに自分で探したい人」の逃げ道として設計。
Kibunのメイン体験「気分 → 今日の3つ」は維持する。

## デプロイ時の注意
今回は **worker更新あり**。

1. GitHub Pages側: 通常どおり全ファイルをcommit / push
2. Cloudflare Worker側: `worker/worker.js` を再デプロイ
3. `GOOGLE_MAPS_API_KEY` Secretは既存のものをそのまま使用
4. Places API (New) と Routes APIが有効であることを確認

## 次のフェーズ
公開前品質監査を続行。
優先順:
1. 211件の名称・URL・閉館チェック
2. 夏季限定 / 臨時情報の表示品質
3. Hero監査残り
4. SEO / OGP / Search Console
5. アフィリエイト導線
