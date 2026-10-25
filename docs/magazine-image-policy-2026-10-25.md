# Kibun Magazine：写真と情報の信頼性方針（2026-10-25）

## 掲載優先順位
1. 自分で撮影した現地の写真（owned）
2. 施設公式から、サイト・記事での掲載許諾を得た写真（official_permission）
3. 利用条件を確認した自由ライセンス・Wikimedia Commons写真（open_license / wikimedia_commons）
4. Google Places APIでその場で取得した実際の施設の写真（Google Maps・投稿者・出典リンクの帰属を付ける）
5. 実写がない場合に限り、明確な「イメージ画像」表示を伴う生成画像

特定施設の実写ではないAI画像を、施設写真と誤認させる見せ方にしない。

## 既存の記事内でGoogle Placesを表示する場合
- `magazine/magazine-media.js` が `/place-photo` のレスポンス（`photoUri`, `authors`, `photoGoogleMapsUri` / `placeGoogleMapsUri`）を受け取る。
- Google Mapsの表示、写真投稿者名・提供されたプロフィール画像／リンク、Google Mapsの出典リンクを写真上の小さなクレジットとして併記する。
- 出典リンクが欠ける・URLが不正・写真取得に失敗したときは Google写真を出さずに代替画像へ戻す。AIの代替画像は「イメージ画像」と表示。
- Google写真をダウンロードしてGit管理・キャッシュしない（Google Maps Platformのキャッシュ制限に注意）。
- 写真の出典が実際の画像でなく施設へのリンクである場合は、APIが返すリンクを用いている。今後、Google Mapsの個々の写真に遷移できるか実ブラウザでも監査する。

## 公式・許諾済み写真に置き換える方法
記事の対象 `<img data-hero-spot="spot_XXX" ...>` に以下を加える：
```html
data-photo-provider="official_permission"
data-photo-credit="施設名／提供者"
data-photo-source-url="https://施設の公式写真掲載元"
```
許諾を確認してから使う。これらを設定した記事ではGoogle Placesの自動写真への上書きを停止する。
自分で撮った写真の場合は `data-photo-provider="owned"` を使える。
※「公式サイトに掲載されている」だけでは転載許諾は得られていない。

## 記事の確認日
公式情報で営業・設備・料金・公開情報を確認した記事に限り、記事の `<article>` タグへ以下を設定：
```html
data-kibun-verified="2026-10-25"
data-kibun-verified-source="https://施設の公式情報URL"
```
日付は実際の確認日にする。未確認記事に一律の日付を付けない。

## リリース後確認
- 記事一覧と個別記事（特集トップ／施設カード）でGoogle Mapsクレジット・投稿者・出典リンクが写真と一緒に表示されること
- 外部リンクは安全なHTTPSだけで開き、JSを埋め込めないこと
- 回線エラー／出典不足／公式写真指定時の表示と、AI画像の「イメージ画像」表示
- モバイル画面でのクレジットの可読性・レイアウト
- Worker側の `photoGoogleMapsUri` が個別写真ではなく施設URLにフォールバックする仕様があるため、Google Maps写真元リンクの正確性を追加監査
- `node tests/magazine-photo-trust.cjs` で回帰テスト
