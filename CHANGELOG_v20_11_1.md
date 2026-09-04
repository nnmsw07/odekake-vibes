# v20.11.1 — SNS Editors restore

- v20.11.0のSeasonal editorial batchで旧SNS Audit UIが上書きされた状態を修復。
- Kibun Editorsの IDEA / DRAFT と PUBLISH / LEARN を復元。
- v20.11.0のSNS Audit seed（既存1件 + 新規記事5件）は保持し、端末保存データとID単位でマージ。
- 458スポットを使って投稿企画を再生成。
- v20.11.0で追加した5記事・5プランもSNS editorial catalogへ追加。
- `sns-audit-data.js` は意図的に同梱しないため、v20.11.0の6投稿を上書きしない。
- cache busterを `20111` に更新。
