# HANDOFF v19.8.5

## 確認ポイント
1. 子ども + 1日 + 文化/食：横浜美術館が主役なら「アート → 子どもの遊び → ごはん」のKIBUN EDITが出ること。
2. 子ども + 1日 + 買い物/食：買い物施設を主役にしつつ、2stop目以降に遊び・食事を組み込めること。
3. トップが `NOW ON KIBUN / いま、気になる。` になり、子連れ一色ではないこと。
4. 時期を変えたテストでは、プール/水遊びは夏に加点、冬に減点されること。
5. 3stop Planの詳細pillが「3つで一日をつなぐ」になること。

## 実装メモ
- `plans.js`: `CURATED_PLANS`, `curatedPlanForPrimary`, `companionContext`
- `featured.js`: seasonal / freshness / weekly rotation / audience-category diversity
- `app.js`: featured表示、KIBUN EDIT表示、3stop pill
- `index.html`: NOW ON KIBUN文言とcache-buster

Worker更新なし / assets更新なし / 286 spotsのまま。
