# V19.7.2 — Experience / Stage expansion

- 体験・観劇15スポットを追加し 241 → 256 spots。
- 新規: 歌舞伎座 / JR東日本四季劇場［春］ / 新橋演舞場 / KAAT 神奈川芸術劇場 / Artbar Tokyo 横浜元町 / Artbar Tokyo 代官山 / CREA BASE 新宿御苑前 / うづまこ陶芸教室 / ダルン陶芸教室 / 横浜市陶芸センター / 金継ぎ教室つぐつぐ 浅草店 / 椎名切子 SHOP & FACTORY / 元祖食品サンプル屋 合羽橋店 / Atelier ann 浅草 / 小津和紙 手漉き和紙体験工房。
- ブラウズカテゴリに `観劇・舞台` を追加し、従来の `体験・学び` を `つくる・体験` へ編集。
- ホームに `MAKE / WATCH / TRY` の編集セクションを追加。
- 劇場4件は公演日時・チケット依存が強いため `recommendation_mode: browse_only`。ブラウズ/編集導線には出すが、通常の「今日の3つ」には混ぜない。
- `planning_profile` を導入し、予約推奨スポットは詳細に `🎟️ 予約推奨` を表示。
- 新規15件はGoogle Places Hero優先、AI fallback。photo indexは未監査。

- 東京23区の体験ガイドから横浜元町の誤混入を除外し、37件へ修正。横浜体験ガイドは25件。
