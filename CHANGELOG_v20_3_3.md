# Kibun v20.3.3

- Plans上部3カードのDeep Linkを明示的な `index.html?plan=...` に変更。
- update-onlyにも `data.js` / `plans.js` / `app.js` を同梱し、Deep Link依存ファイルの取りこぼしを防止。
- Magazine一覧と各記事Heroは、記事内の代表スポットのGoogle Places Heroを優先表示。取得できない場合だけ既存ローカル画像へフォールバック。
- root script cache keyを2033へ更新。
