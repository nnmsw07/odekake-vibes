# CHANGELOG v20.8.1

## Instagram link fix
- 詳細ページの旧 `instagram.com/explore/search/keyword/?q=...` 導線を廃止。
- 主導線を `instagram.com/popular/<keyword>/` に変更。
- Instagram側でホーム/ログインへ戻される場合に備え、`site:instagram.com` のGoogle検索フォールバックを追加。
- データ内に残っていた旧Instagram keyword-search URLも `/popular/` 形式へ置換。
- 公式Instagramプロフィール/Reelが登録済みのスポットは従来どおり直接リンクを優先。

## Cache
- `app.js`, `data.js`, `styles.css` を `v=2081` に更新。

## Data
- スポット数・アフィリエイト設定は v20.8.0 から変更なし（431スポット）。
