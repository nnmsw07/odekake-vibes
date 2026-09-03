# v20.9.1 handoff

## Integrated admin tools
- Hero Audit: `/?heroAudit=1`
- Affiliate Audit: `/affiliate-audit/` or `/?affiliateAudit=1`
- SNS Audit: `/sns-audit/` or `/?snsAudit=1`

## SNS Audit workflow
1. 投稿を追加、または9/30投稿枠を開く。
2. 記事 / プラン / スポットの遷移先を設定。
3. スポット投稿はspot IDを入れると、現在のHero・Instagram導線候補・Affiliate監査状況を参照できる。
4. 投稿後にImpressions / Reach / Saves / Clicks / Profile visits / メモを記録。
5. 内容は端末localStorageへ自動保存。必要時にJSONを書き出して次のリリースへ反映。

## Deployment
v20.8.3から直接上書きできる累積update-onlyを配布。v20.9.0を既に入れていても同じZIPで上書き可。
Workerはv20.9.0のHero10対応を含むため、v20.8.3から更新する場合は `npx wrangler deploy` が必要。
