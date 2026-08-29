# V19.6 SEO Guide Plan

検索流入の入口として、まず **地域 × カテゴリ 20ページ**を静的HTMLで追加しました。薄いページの大量生成は避け、DBに一定数のスポットがある組み合わせから開始します。

| URL | テーマ | 掲載数 |
|---|---|---:|
| `/guide/yokohama-kids/` | 横浜 × 子ども・遊び | 28 |
| `/guide/yokohama-water/` | 横浜 × 水遊び・プール | 17 |
| `/guide/yokohama-experience/` | 横浜 × 体験・学び | 22 |
| `/guide/yokohama-culture/` | 横浜 × アート・文化・本 | 21 |
| `/guide/yokohama-food/` | 横浜 × カフェ・グルメ | 18 |
| `/guide/yokohama-nature/` | 横浜 × 公園・自然 | 10 |
| `/guide/kawasaki-kids/` | 川崎 × 子ども・遊び | 9 |
| `/guide/kawasaki-culture/` | 川崎 × アート・文化・本 | 5 |
| `/guide/shonan-kids/` | 湘南・鎌倉 × 子ども・遊び | 10 |
| `/guide/shonan-nature/` | 湘南・鎌倉 × 公園・自然 | 9 |
| `/guide/shonan-water/` | 湘南・鎌倉 × 水遊び・プール | 9 |
| `/guide/miura-kids/` | 横須賀・三浦 × 子ども・遊び | 9 |
| `/guide/miura-water/` | 横須賀・三浦 × 水遊び・プール | 10 |
| `/guide/kenou-kids/` | 県央・丹沢 × 子ども・遊び | 10 |
| `/guide/kenou-nature/` | 県央・丹沢 × 公園・自然 | 7 |
| `/guide/tokyo23-kids/` | 東京23区 × 子ども・遊び | 38 |
| `/guide/tokyo23-culture/` | 東京23区 × アート・文化・本 | 40 |
| `/guide/tokyo23-experience/` | 東京23区 × 体験・学び | 29 |
| `/guide/chiba-kids/` | 千葉 × 子ども・遊び | 17 |
| `/guide/saitama-kids/` | 埼玉 × 子ども・遊び | 13 |

## 技術方針

- 各ページに固有 `title / description / canonical / OGP`。
- 各ページから `/?region=...&category=...` へ戻すことで、SEO流入後もKibunのブラウズ体験につなぐ。
- GA4 `seo_guide_cta` でガイド→アプリ遷移を計測。
- ホームのフッターから `/guide/` へクロール可能なリンクを設置。
- `sitemap.xml` にハブ＋20ページを追加。
- 次段階は Search Consoleの実クエリを見て「雨の日」「1歳」「デート」等の意図ページを追加。
