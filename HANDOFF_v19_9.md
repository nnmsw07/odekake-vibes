# HANDOFF v19.9

## Dataset
291 spots。spot_287〜291 は chano-ma 横浜 / 二子玉川 / 池袋 / 上野 / 立川。Google Places Heroはqueryのみで未監査。

## 新しい情報設計
- `magazine/`: 検索流入・回遊を狙う静的編集記事。速報よりevergreenを優先。
- `plans/`: CURATED_PLANSを一覧化。
- mobile bottom nav: 記事 / プラン / 今日の気分。

## 次回
1. `?heroAudit=1` で spot_287〜291 を画像監査。
2. Search Consoleで `/magazine/` のindex確認。
3. GA4で magazine→spot / plans→plan の回遊を観測。
4. OZmall / 一休の個別レストランリンクが取れた店舗から予約導線を追加。

Worker / assets更新なし。
