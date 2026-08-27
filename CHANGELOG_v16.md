# Kibun v0.16 — Hero rescue audit

## What changed
- Hero監査でGoogle Places写真を取得できない理由を表示。
- `low_match / place_not_found / no_photo / API / network` を区別。
- 監査画面で検索名を変更して再検索可能。
- 住所を検索に含める/外すを選択可能。
- 一致度LOWでも監査時だけ候補写真を表示し、目視確認できる。
- 正しいGoogle施設を確認したらPlace IDを端末に固定可能。
- 書き出しJSONに `photo_index_overrides` と `place_overrides` を含める。
- 通常ユーザー側の安全なlow-match fallbackは維持。

## Worker
`worker/worker.js` は更新あり。GitHub連携済みならmainへのコミット後にCloudflareへ自動デプロイされます。
