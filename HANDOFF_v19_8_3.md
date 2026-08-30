# HANDOFF v19.8.3

## Current state

- Dataset: **286 spots**
- New: 28 Food/Cafe + 2 Odaiba family anchors
- Plan: micro-area / role complement enabled
- Affiliate: curated single-provider display enabled
- Fujiya Hotel: OZmall individual link > Jalan Hakone area fallback
- Worker: no change
- assets: no change

## What to verify after deploy

1. 子ども / 1日 / お台場系の条件で、`お台場海浜公園 → 日本科学未来館 or レゴランド → お台場のカフェ` のような近距離Planが出ること。
2. `お台場海浜公園 → 東京ミッドタウン` が出ないこと。
3. 地域×カテゴリの `🍽️ カフェ・グルメ` で新規28件が検索できること。
4. 富士屋ホテル詳細ではPR導線が1件だけ表示され、OZmall個別ページへ遷移すること。
5. 他の箱根ホテルは、個別リンクがまだないため既存のじゃらん箱根エリア導線のままであること。
6. `?heroAudit=1` で spot_257〜286 のHero候補を次回監査すること。

## Affiliate rule

A8生成コードは変更しない。新しいASP/個別施設リンクは、ユーザーがA8等で生成したコードを受け取ってから追加する。存在しない個別リンクは推測で作らない。
