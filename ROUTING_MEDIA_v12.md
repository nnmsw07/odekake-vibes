# ROUTING & PLACE PHOTOS — v0.12

## 今すぐ動く部分
- ブラウザの Geolocation API で現在地を取得。
- Geolonia Japanese Addresses v2（CC BY 4.0）の町丁目代表点を使い、候補スポットの位置を概算。
- GitHub Pages単体では直線距離＋移動手段別モデルから「約○分」を算出し、30/60/90/120分で絞り込み。
- これは**概算**で、交通状況・乗換・道路網は未反映。画面にも「概算」と表示する。

## Google Routes APIへ切り替える
`worker/worker.js` は Cloudflare Worker 用のサンプル。Google Maps Platformで Routes API を有効化し、Worker secret `GOOGLE_MAPS_API_KEY` を設定。
デプロイ後 `config.js` の `travelApiUrl` を `https://<worker>/travel-times` に設定すると、UI/推薦ロジックはそのまま実ルート時間へ切り替わる。

## Google Places Hero
同じ Worker の `/place-photo?name=...&address=...` は Places Text Search → Place Photos の順に取得。`config.js` の `placePhotoApiUrl` を設定すると、表示時に現在のHeroより優先して実写を試す。
- 写真ファイルをKibunへ保存しない。
- Google Maps コンテンツとして `Google Maps` attributionを同じ画像コンテナ内に表示。
- `authorAttributions` が返った場合は投稿者情報を画像と関連付けて表示し、写真の `googleMapsUri` へアクセスできるようにする。
- Place photo resource nameを永続キャッシュしない。
- 施設公式提供写真がある場合はそちらを最優先。

## Hero優先順位
1. 施設から掲載許諾を得た公式写真
2. Google Places実写（API経由、必要なattribution表示）
3. Wikimedia等のライセンス明確な実写
4. Instagram公式Embed（詳細ページ）
5. AIイメージ（「イメージ」表示必須）

## Geolonia attribution
住所座標の概算に Geolonia Japanese Addresses v2 を利用。元データはデジタル庁アドレス・ベース・レジストリ由来、Geoloniaデータは CC BY 4.0。
