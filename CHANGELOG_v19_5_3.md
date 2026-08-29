# V19.5.3 URL Audit

- 211スポットの `official_url` を公開前監査。
- 日産ウォーターパーク（V19.5.2）の修正に続き、URL移転・サイト再編・恒久リダイレクトを確認した13件を現行URLへ正規化。
- 瑞聖寺は不安定な旧HTTPサイトから、東京都公式観光サイト GO TOKYO の施設ページへ切替。
- `dynamic_snapshot.source_url` / Buzz evidence が旧公式URLを参照していた箇所も同時更新。
- `scripts/check_official_urls.mjs` を追加し、今後の一括リンク監査を可能にした。
- スポット総数は211件のまま。
