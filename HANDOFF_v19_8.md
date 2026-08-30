# HANDOFF v19.8

- Dataset: 256 spots（v19.7.3を維持）
- UI feature version: v19.8 Kibun Plans
- Worker: 更新なし
- assets: 更新なし
- 新規: `plans.js`, `test_v19_8_plans.js`, `PLANS_DESIGN_v19_8.md`
- 変更: `app.js`, `recommender.js`, `index.html`, `styles.css`, `README.md`

## QA
1. 半日指定で大型施設がONE PLACEとして1件だけで成立すること。
2. 短時間施設ではDAY PLANに2件表示される場合があること。
3. 「泊まりもあり」でSTAY PLANが候補に出ること。
4. 「この過ごし方を見る」→各スポット詳細へ遷移できること。
5. 地域×カテゴリ、Hero監査、アフィリエイトの既存機能が維持されること。

## Known limitation
プラン内の2施設間移動時間はまだGoogle Routesで個別検証していない。同じローカルエリアを優先し30分の移動バッファを置く初期実装。
