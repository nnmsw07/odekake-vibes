# v19.8.6 — Short-plan AFTER cafe / restaurant suggestion

- 2〜3時間（現在UIの「半日くらい」= 180分）のPlanに、任意の食事・カフェ候補を追加。
- 本編のPlan時間を水増ししないため、`after_suggestion` は `spot_ids` / `estimated_minutes` には含めない。
- 同じ `planZone` / ローカルエリアにある `isMealSpot()` だけを候補化。
- 3つの結果で同じAFTER候補が重複しにくいよう、その生成回では候補を分散。
- Planカードには「＋ 帰る前に寄るなら」、Plan詳細には `AFTER / 帰る前に、もう少し。` を表示。
- 同行者別にAFTERコピーを変更（family / partner / solo / friends）。
- `plan_after_spot_open` をGA4イベントとして送信。
- 1日・宿泊Plan、すでに食事を含むPlanにはAFTER候補を追加しない。
- 286 spots据え置き。Worker / assets / seed更新なし。
