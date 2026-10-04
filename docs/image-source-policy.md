# Kibun image source policy

Kibunの個別スポットHeroは、アクセス数に比例して外部API費用が増えない **確認済みの静的画像** を第一候補にする。

## 優先順位

1. `owned` — Kibun自身が撮影・制作し、施設の実景として使用できる画像
2. `official_permission` — 施設公式の広報素材、または個別許諾を得た画像
3. `wikimedia_commons` — Wikimedia Commons上で商用再利用条件を確認済みの画像
4. `open_license` — Openverse等で発見し、元ページで商用利用可能なライセンスを確認済みの画像
5. `google_places` — Place IDを固定済みのスポットだけに限定したフォールバック
6. 既存のイメージ画像 — 個別施設の実写と誤認させない用途に限定

## 大原則

- 検索で見つけただけの画像を自動ダウンロード・転載しない。
- Openverseは「候補発見」の入口として使い、最終的なライセンスは必ず元画像ページで確認する。
- Wikimedia Commonsも各ファイルページのライセンス、作者、帰属表示条件を確認する。
- 施設公式サイト上の画像は「公式に載っている」だけでは転載可とはみなさない。広報素材の利用条件または個別許諾を確認する。
- 個別スポットHeroに登録する画像は、その施設そのものが写っていることを目視確認し `exact_spot: true` とする。
- 権利確認済みの画像はKibun配下の `assets/` に保存し、公開画面では静的ファイルを読む。第三者の画像URLへの直リンクをランタイム依存にしない。
- 作者名・ライセンス表記が必要な場合は、サイト上でも条件どおりの帰属表示を行う。

## 登録フロー

1. `node scripts/audit_image_sources.mjs` を実行し、Google Places依存または静的画像不足のスポットを抽出する。
2. 出力された公式URL / Wikimedia Commons / Openverseの検索リンクから候補を確認する。
3. 施設一致と利用条件を人が確認する。
4. 許諾・ライセンス条件に従って画像を `assets/` 配下へ保存する。
5. `verified-image-sources.json` に権利情報を登録する。
6. `node scripts/validate_verified_image_sources.mjs` を実行する。
7. スポットデータ側のHero画像と `media_strategy.current_provider` を更新する。確認済み静的画像に切り替えたスポットではGoogle Placesを通常表示の画像取得元にしない。

## `verified-image-sources.json` の形式

```json
[
  {
    "spot_id": "spot_000",
    "source_type": "wikimedia_commons",
    "source_url": "https://commons.wikimedia.org/wiki/File:Example.jpg",
    "license": "CC BY-SA 4.0",
    "rights_basis": "Commons file pageで商用再利用条件を確認",
    "author": "Example Author",
    "attribution": "Example Author / CC BY-SA 4.0",
    "local_asset": "assets/spots/spot_000/example.webp",
    "exact_spot": true,
    "verified_at": "2026-10-04",
    "notes": "Hero用にトリミング"
  }
]
```

`source_type` は `owned`, `official_permission`, `wikimedia_commons`, `open_license` のいずれか。`verified-image-sources.json` は権利確認台帳であり、候補段階の画像は登録しない。

## Google Placesの扱い

通常ユーザー表示では、Place ID未固定のスポットに対してText Searchを行わない。Google Places写真を使う場合もPlace ID固定済みに限定し、静的な確認済み画像へ置き換えられたスポットから順にGoogle依存を減らす。

Hero監査 (`?heroAudit=1`) は管理作業用なので検索を許可するが、候補確認を繰り返すほどPlaces API利用量が増える点に注意する。
