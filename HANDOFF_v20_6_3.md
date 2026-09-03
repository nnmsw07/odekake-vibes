# Handoff v20.6.3

## Magazine preview
トップページの `#magazinePreview` 4カードを画像付きに変更。記事一覧ページは既にHero画像付きのため、今回はホームのプレビューのみ。

## Image policy
実在スポットHeroはGoogle Places優先。失敗時のみ既存 `assets/editorial/*.webp` へfallback。新しい生成画像は追加していない。

## Representative spots
- 横浜の親子カフェ: spot_287 chano-ma 横浜
- 横浜の小さな休日: spot_101 横浜美術館
- 東京の雨の日親子: spot_286 日本科学未来館
- ART + CAFE: spot_152 国立新美術館

## Deployment
UI-only。Worker更新なし、画像asset更新なし。スポット数324のまま。
