# CHANGELOG v0.14 — Hero Audit

- Google Places Hero候補を最大6枚比較できる非公開監査モードを追加
- `?heroAudit=1` のときだけ監査UIを表示
- 83スポットを選択できる固定Hero監査ドックを追加
- 候補写真をタップすると詳細Heroを即時プレビュー
- 選択をlocalStorageへ保存
- 選択済み `spot_id -> photo index` をJSONで書き出し可能
- Workerに `/place-photos` を追加し、1回のPlace検索から複数候補を取得
- `config.js` に稼働中Worker URLを反映
- Routes候補数を36→10へ削減
- `worker/wrangler.toml` を同梱しGitHub→Cloudflareの継続デプロイに対応
