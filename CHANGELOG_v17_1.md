# CHANGELOG v17.1

## UI
- 「今日はどんな一日にしたい？」を **cool / extraordinary / relax の3つ**に整理。
- `nature / scenic / stroll` を「今日は何を楽しみたい？」側へ移動。
- やりたいことは10軸、全体の選択上限は従来どおり最大3つ。
- Step 02を「今日を組み立てる」に変更し、選択前コピーも気分/体験どちらからでも入れる表現へ変更。
- 詳細の「この場所に合う気分」を「この場所に合う気分・楽しみ方」へ変更。

## Hero
- 2026-08-27のHero監査結果を正式反映。
- photo index 選択を73スポットへ反映。
- Google Place IDを10スポットへ固定。
- `use_address` もseedから実運用に反映されるようmedia.jsを修正。
- CC/Wikimedia実写をfallbackから外し、**Google Places → AIイメージ**へ統一。
- Google Placesが取得できた場合は従来どおりGoogle attributionを表示。

## Cache
- JS/CSSのcache busterを `v=17.1` に更新。

## Worker
- worker/ の更新なし。
