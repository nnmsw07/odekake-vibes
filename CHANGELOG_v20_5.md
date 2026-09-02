# v20.5 — ValueCommerce LinkSwitch live

- ValueCommerce LinkSwitch tagをKibun Trip本番ページへ導入（vc_pid: 892690966）。
- LinkSwitch向け元URLを管理する Affiliate Audit を復活。`/affiliate-audit/` または `/?affiliateAudit=1` から開く。
- 既存のOZmall通常URL 9件（spot_307〜314, 317）を本番予約導線として有効化。
- PR表記は予約導線内に表示。通常URLはLinkSwitch対象の場合のみ公開導線へ出す。
- SPAで後から開くスポット詳細でも変換を拾いやすいよう、LinkSwitch読込前に非表示のseed anchorを生成し、変換済みhrefを予約ボタンに再利用する方式へ変更。
- Affiliate AuditにOZmallのLinkSwitch変換テストを追加。`dalr.valuecommerce.com` への変換を画面上で確認できる。
- アソビューは「LinkSwitch対応（限定）」のため、当面はAudit上で手動/MyLink運用を基本とする。
- data metadata version: 0.20.5
