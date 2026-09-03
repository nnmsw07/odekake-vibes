# v20.9.1 — SNS Audit integration

- v20.9.0 (Affiliate Audit v2 + Hero Audit 10 candidates)をベースにSNS Auditを統合。
- `/sns-audit/` と `/?snsAudit=1` を追加。
- SNS投稿ごとに、投稿日・Channel・状態・記事/プラン/スポット遷移先・spot ID・使用Hero・Instagram導線・Affiliate準備状況・投稿実績を管理。
- SNS AuditはlocalStorageへ端末保存し、JSONのコピー・保存・読み込みに対応。
- 既存データからspot名、Hero、Instagram導線候補、Affiliate監査状況を補完できる。
- 既存の9/30投稿枠を初期seedとして保持（内容は捏造せず、監査画面で設定）。
- Affiliate AuditにHero / SNS Audit切替を追加。Hero Audit dockにもSNS Audit導線を追加。
- v20.9.0の431スポット、Affiliate監査、Hero候補最大10枚、Worker変更をすべて維持。
