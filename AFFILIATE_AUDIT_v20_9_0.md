# Affiliate Audit v20.9.0

Checked: 2026-09-03

## Coverage

- Total spots: **431**
- Configured source-link spots: **148**
- Direct source links: **159**
- Newly configured vs v20.8.3: **22 spots / 23 links**

## Explicit audit status for all 431 spots

- **configured**: 148
- **direct_only**: 11
- **researched_no_partner**: 5
- **recheck_needed**: 127
- **not_target**: 140

`recheck_needed` is intentionally retained as a work queue. It means “still worth checking”, not “no product exists”.

## Newly configured in this pass

- `spot_012` うんこミュージアム YOKOHAMA BAY — じゃらん遊び・体験 / アソビュー！
- `spot_038` 西武アグリパーク所沢 — じゃらん遊び・体験
- `spot_040` キッズランドUS MAX 川越南古谷店 — アソビュー！
- `spot_127` 豊洲 千客万来（東京豊洲 万葉倶楽部） — じゃらん遊び・体験
- `spot_128` サンシャインシティ（サンシャイン水族館） — KLOOK
- `spot_146` 泉天空の湯 有明ガーデン — じゃらん遊び・体験
- `spot_174` RÊVE DES LUMIÈRES — KLOOK
- `spot_188` 龍宮城スパホテル三日月 ガーデンプール — アソビュー！
- `spot_198` マホロバ・マインズ三浦 ウォーターパーク — Yahoo!トラベル
- `spot_230` 鴨川シーワールドホテル — Yahoo!トラベル
- `spot_233` THE FARM — じゃらんnet
- `spot_238` 赤沢温泉ホテル — Yahoo!トラベル
- `spot_241` 界 アンジン — じゃらんnet
- `spot_246` Artbar Tokyo 横浜元町 — じゃらん遊び・体験
- `spot_247` Artbar Tokyo 代官山 — じゃらん遊び・体験
- `spot_255` Atelier ann 浅草 — じゃらん遊び・体験
- `spot_286` 日本科学未来館 — KLOOK
- `spot_321` 富士山木のおもちゃ美術館 — アソビュー！
- `spot_368` ちいさな硝子の本の博物館 — アソビュー！
- `spot_370` AIGIS 東京・表参道店 — じゃらん遊び・体験
- `spot_386` my clay story — じゃらん遊び・体験
- `spot_426` 沼津港深海水族館 — じゃらん遊び・体験

## Audit policy

- Register only a facility/product-specific page whose identity is clear.
- Do not register search-result pages merely to increase coverage.
- `direct_only` means an official booking/ticket path exists but no supported affiliate product was confirmed in this pass.
- `researched_no_partner` means the facility was actively checked and no supported affiliate booking product was found in this pass.
- `recheck_needed` remains unresolved and should be revisited.
- `not_target` is the current C-fit population and is intentionally deprioritized.
- Asoview URLs with `conversion_check_required: true` must be checked individually for ValueCommerce LinkSwitch conversion.
