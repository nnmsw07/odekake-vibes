# HANDOFF v19.8.6

## 目的
短時間Planでも「主役だけで終わる」のではなく、予定に余裕がある人へ同じエリアの良いカフェ・レストランを任意提案する。

## UI
- Planカード: `＋ 帰る前に寄るなら <店名>`
- Plan詳細: `AFTER / 帰る前に、もう少し。`
- AFTERはPlan本体とは別枠。選択した2〜3時間の中に必須で詰め込むものではない。

## ロジック
- 対象: 120分超〜240分以下
- Plan本体にmeal spotを含む場合は表示しない
- 同じローカルPlanエリアのmeal spotから選択
- `after_suggestion` はPlan本体の `spot_ids` に追加しない
- 1日 / 宿泊は従来ロジックのまま

## 確認
`node test_v19_8_6_short_after.js`

Worker / assets 更新なし。
