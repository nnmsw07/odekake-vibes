# SOCIAL / PRIOR-CHAT CATCH-UP v20.7.0

確認日: 2026-09-03

- ベース: 324 spots (v20.6.4 + v20.6.5 Instagram detail CTA)
- 方針: 前チャットのスクリーンショット/明示依頼を再監査。既存は重複追加せず、新規漏れだけを追加。
- Instagram投稿そのものの画像・動画は保存/転載せず、施設データと検索/公式アカウント導線だけを保持。

## 今回追加: 63件
- spot_325 — 清里テラス
- spot_326 — 城ヶ島
- spot_327 — 長瀞岩畳
- spot_328 — 大山寺
- spot_329 — アサヒスカイルーム
- spot_330 — 表参道バンブー
- spot_331 — Cafe Bell
- spot_332 — オリエント・カフェ
- spot_333 — BUNDAN COFFEE & BEER
- spot_334 — CANADE LOUNGE
- spot_335 — 迎賓館赤坂離宮
- spot_336 — café TEIEN
- spot_337 — Café 1894
- spot_338 — dotcom coffee Asakusabashi
- spot_339 — ARC
- spot_340 — UNISON TAILOR
- spot_341 — CONTAINER
- spot_342 — Rain On The Roof
- spot_343 — Common cafe&music bar lounge
- spot_344 — uRn.chAi&TeA ルミネ新宿店
- spot_345 — OMOカフェ＆バル（OMO5東京五反田）
- spot_346 — EAT GOOD PLACE
- spot_347 — OGAWA COFFEE LABORATORY 高輪
- spot_348 — LOOPS
- spot_349 — サロン・ド・テ ロンド
- spot_350 — goodcoffee 新橋
- spot_351 — Sfumato
- spot_352 — 田園調布せせらぎ館
- spot_353 — VAT BAKERY
- spot_354 — PARC CAFE at TOE LIBRARY
- spot_355 — BREWS
- spot_356 — felice domani nakameguro
- spot_357 — Factory & Labo 神乃珈琲
- spot_358 — 橙子猫 Orange Cat
- spot_359 — SHARE LOUNGE MARUNOUCHI
- spot_360 — ampere 本の森ちゅうおう
- spot_361 — WeLoveDonut 神楽坂店
- spot_362 — SISIRI 恵比寿店
- spot_363 — Monkey Cafe
- spot_364 — GLITCH COFFEE TOKYO 日本橋本町
- spot_365 — yoka／余暇
- spot_366 — EN
- spot_367 — Bacha Coffee 新丸ビル
- spot_368 — ちいさな硝子の本の博物館
- spot_369 — みそめぼれ
- spot_370 — AIGIS 東京・表参道店
- spot_371 — 喫茶ゆうびん屋
- spot_372 — HININE NOTE 代々木公園店
- spot_373 — VANILLABEANS THE ROASTERY HAMMERHEAD
- spot_374 — もみの気ハウス 渋谷道玄坂店
- spot_375 — 梅体験専門店「蝶矢」鎌倉店
- spot_376 — AP LAB Tokyo
- spot_377 — Re:MAKE OUTLET レイクタウンアウトレット
- spot_378 — クレヨンしんちゃん オカシナもぐもぐワールド
- spot_379 — 丸亀製麺 手づくり体験教室 東京立川
- spot_380 — シルバニアファミリー 森の大きなお家 東京ソラマチ店
- spot_381 — 大慶園
- spot_382 — nanetokyo
- spot_383 — Pippi
- spot_384 — まもなく済州ビーチ
- spot_385 — Animal Cafe 爬にまるカフェ
- spot_386 — my clay story
- spot_387 — ＋add

## 既に反映済み（重複追加なし）
- べるべるパーク新宿本店
- べるべるパーク渋谷店
- べるべるパーク池袋本店
- べるべるパーク横浜関内店
- chano-ma 横浜
- chano-ma 二子玉川
- chano-ma 池袋
- 和カフェ yusoshi chano-ma 上野
- 和カフェ yusoshi chano-ma 立川
- latte chano-mama
- coしぶや（渋谷区子育てネウボラ）
- うんこミュージアム YOKOHAMA BAY
- スターバックス コーヒー 横浜海の公園店
- THE SUNSET OF MARS
- ASOBono!
- こびとはくぶつかん
- 神奈川県立近代美術館 葉山
- 大雄山最乗寺
- ぼうさいの丘公園

## 統合扱い
- OTO-RACTION PARK / 八景島 — 既存の「横浜・八景島シーパラダイス」側で発見可能なため独立重複は作らない。

## 品質メモ
- 公式サイトを確認できた候補は official_url / dynamic_snapshot.source_url に保持。
- Instagram/SNS発見のみで運用詳細が確定しない候補は research_status.dynamic_detail = social_discovery_pending とし、「最新情報を確認」の保守的コピーにした。
- 新規Heroは Google Places 実写を第一候補、取得できない場合のみ既存AI/Editorial fallback。SNS画像は転載しない。
