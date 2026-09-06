# Kibun Trip v20.12.3

## 今回の更新

### 1. Hero Audit
- 下部ドックにスポット名検索を追加
- 名前 / alias / spot_id / 地域名で候補を絞り込み
- 469スポットでも監査しやすいUIへ

### 2. Pier 8の整理
- `spot_219` をホテル全体の紹介から **Restaurant & Bar LARBOARD｜インターコンチネンタル横浜Pier 8** に変更
- カテゴリを宿泊からレストランへ変更
- 紹介文・気分スコア・Hero検索名・SEO slug をレストラン単体向けに更新
- OZmallのLARBOARD施設別予約ページを予約導線に設定

### 3. 前回候補スポットの追加・精度修正
- スターバックス リザーブ® ロースタリー 東京
- Cafe La Bohème 白金
- 小笠原伯爵邸
- RAKU SPA BAY 横浜
- BLUE FRONT SHIBAURA TOWER S
- 未確認だったGoogle Place ID固定値を除去し、名称＋住所で安全にruntime解決する方式へ変更
- RAKU SPA BAY 横浜は現行公式URL・営業時間を更新

### 4. 似たスポットを6件追加
- QUAYS pacific grill
- GARDEN HOUSE KAMAKURA
- リストランテAO 逗子マリーナ
- CICADA
- シャトーレストラン ジョエル・ロブション
- KOFFEE MAMEYA Kakeru

### 5. アフィリエイト導線
施設別ページを確認できた以下に直接導線を設定。
- LARBOARD → OZmall
- 小笠原伯爵邸 → 一休.comレストラン
- RAKU SPA BAY 横浜 → アソビュー！
- GARDEN HOUSE KAMAKURA → 一休.comレストラン
- リストランテAO 逗子マリーナ → OZmall
- ジョエル・ロブション → 一休.comレストラン

### 6. SEO
- 掲載スポット数 458 → 469
- 469件すべてのSEO route / sitemapを再生成
- 今回追加・変更した12スポットの静的SEOページを更新ZIPに同梱
- Pier 8旧ホテルslugを削除してLARBOARD slugへ移行

### 7. Magazine画像
- 1歳記事など、汎用placeholderが先に見えるカードの初期Hero画像を改善
