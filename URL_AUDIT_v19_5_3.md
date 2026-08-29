# Kibun Trip V19.5.3 — Official URL Audit

公開前のリンク切れ対策として、`seed.json` の211スポットすべての `official_url` を2026-08-29時点で監査した。

## 結果

- 対象: 211スポット
- 変更なし / 現行URLとして維持: 198件
- 現行URLへ正規化: 13件
- 未解決の既知404: 0件
- V19.5.2で先行修正済み: 日産ウォーターパーク 1件

直接ページを確認できないサイト（bot対策や取得制限など）は、施設名・運営元・現行公式ページを検索してクロスチェックした。単なる取得エラーをリンク切れとは判定していない。

## V19.5.3で変更した13件

| Spot | 施設 | 旧URL | 新URL |
|---|---|---|---|
| spot_047 | 神奈川県立観音崎公園 | `https://www.kanagawaparks.com/kannonzaki/` | `https://www.kanagawa-park.or.jp/kannonzaki/` |
| spot_056 | 神奈川県立四季の森公園 | `https://www.kanagawaparks.com/shikinomori/` | `https://www.kanagawa-park.or.jp/shikinomori/` |
| spot_057 | 神奈川県立相模原公園 | `https://www.sagamihara.kanagawa-park.or.jp/` | `https://www.kanagawa-park.or.jp/sagamihara/` |
| spot_067 | 消防博物館 | `https://www.tfd.metro.tokyo.lg.jp/learning/contents/museum.html` | `https://www.tfd.metro.tokyo.lg.jp/taiken/hkkan/` |
| spot_090 | 二子玉川ライズ | `https://sc.rise.sc/` | `https://rise.sc/` |
| spot_110 | マクセル アクアパーク品川 | `https://www.aqua-park.jp/` | `https://www.aqua-park.jp/aqua/` |
| spot_122 | ムーミンバレーパーク | `https://metsa-hanno.com/moominvalleypark/` | `https://metsa-hanno.com/` |
| spot_125 | 井の頭自然文化園 | `https://www.tokyo-zoo.net/zoo/ino/` | `https://www.tokyo-zoo.net/inokashira/` |
| spot_134 | 豊洲市場 | `https://www.shijou.metro.tokyo.lg.jp/toyosu` | `https://www.shijou.metro.tokyo.lg.jp/info/0/kenngaku/kenngaku1` |
| spot_170 | BAR PANORAMA | `https://www.cinemasunshine.co.jp/gdcs/` | `https://www.cinemasunshine.co.jp/pages/gdcs/` |
| spot_188 | 龍宮城スパホテル三日月 ガーデンプール | `https://www.mikazuki.co.jp/ryugu/` | `https://www.mikazuki.co.jp/ryugujo/yutoasobi/pool/garden/` |
| spot_189 | 稲毛海浜公園プール | `https://sunsetbeachpark.jp/` | `https://sunsetbeachpark.jp/activity/pool/` |
| spot_209 | 瑞聖寺 | `http://www.zuisho-ji.or.jp/` | `https://www.gotokyo.org/jp/spot/1090/index.html` |

## 今後のチェック

`scripts/check_official_urls.mjs` を追加。Node.js 18+ で以下を実行すると、211件の `official_url` を一括確認できる。

```bash
node scripts/check_official_urls.mjs
```

- 404 / 410: FAIL
- 403 / 429: WARN（bot制限の可能性）
- 5xx / timeout: WARN（再確認対象）
- 2xx / 3xx: OK

公開後も月1回程度のリンク監査を推奨。
