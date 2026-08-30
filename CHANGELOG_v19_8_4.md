# CHANGELOG v19.8.4

## Fixes

- 日帰り利用できる `water_resort` / `resort_pool` を `stay` と誤判定しないように修正。
  - `overnight: true` または明示的な宿泊カテゴリだけを Stay として扱う。
  - 龍宮城スパホテル三日月の日帰りPlanで「今日はそのまま泊まる」と出る問題を解消。
- `shopping` を選択した場合の intent guard を追加。
  - ショッピングモール、アウトレット、商店街、マーケット、複合商業施設などを推薦対象にする。
  - サンリオピューロランド、八景島シーパラダイス等「買い物もできるが主目的はテーマパーク」の施設を買い物推薦の主役から除外。
- 地域×カテゴリの「買い物・複合施設」ブラウズも同じ shopping intent 判定に統一。

## Regression tests

- 日帰りリゾートのPlanタイトルに「泊まる」が混入しないこと。
- shopping推薦にピューロランド / 八景島が入らないこと。
- shopping推薦の全件が intent guard を通過すること。

スポット数・Worker・assetsに変更はありません。
