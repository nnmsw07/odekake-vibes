# Kibun v20.19.0 — Mood UI + Editorial Expansion

## Mood UI
- Approved mobile mockを基準に「今日の気分」画面を再構成。
- モバイルでは導入コピーを圧縮し、1 / 2 / 3 の進行表示 → 同行者 → 気分へ直行。
- 同行者を横スクロール可能なピル型へ刷新。わんこは肉球アイコン。
- STEP 1 は「心地よく過ごしたい」を主役に、大カード1枚＋小カード2枚。
- 「心地よく過ごしたい」は季節・天気に応じて既存推薦軸へ変換し、年間を通して利用可能。
- STEP 2 は2列のコンパクトな横長タイルへ。線画アイコンと選択状態を統一。
- ヘッダーのお気に入りハートを外し、言語切替だけに整理。
- 下部ナビと気分アイコンを同じ線画トーンへ刷新。
- 日本語 / 英語トップを同じ構成へ揃えた。

## Editorial / Plans
- 日本語・英語で新規特集6本を追加。
  - 心地よく過ごしたい日
  - 舞台を休日の主役にする日
  - WHAT'S ONから決める休日
  - 本と建築の静かな午後
  - 大人の屋内休日
  - 観劇前後の横浜
- 特集ハブ: 日本語40本 / 英語12本。
- 公演を起点にしたキュレーションプラン8本を追加。
- プランハブ: 日本語52本 / 英語14本。
- 新規日本語特集6本に1200×630のOGPを追加。

## Hero Audit
- 最新のユーザーHero Audit exportを `HERO_OVERRIDES_v20_19_0.json` として保存。
- photo index override 211件、manual Place override 18件を `seed.json / data.js` に同期。
- spot_459（STARBUCKS RESERVE(R) ROASTERY TOKYO）、spot_460（Cafe La Bohème 白金）を含む最新Place指定を反映。

## SEO / QA
- 新規JA/EN特集をsitemapへ追加。
- SEO audit: 637 URLs / 0 errors / 0 warnings。
- Event audit: 24 events / 0 errors / 0 warnings。
- Performance audit: 65 performances / 0 errors / 0 warnings。
- v20.19 UI/content/override checks: 40 PASS。
- Recommender regression: PASS。
