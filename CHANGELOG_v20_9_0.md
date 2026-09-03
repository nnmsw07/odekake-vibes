# v20.9.0 — Affiliate Audit v2 + Hero Audit 10-photo mode

## Affiliate Audit v2

- Base: v20.8.3.
- Affiliate source-link coverage: **126 spots / 136 links → 148 spots / 159 links**.
- Added **22 newly configured spots / 23 direct source links**.
- Added `AFFILIATE_AUDIT_v20_9_0.json` and `affiliate-audit-status.js` so all 431 spots have an explicit audit outcome.
- Affiliate Audit UI now has a separate **監査結果** filter. It opens on `再調査` so unresolved A/B candidates are easy to work through.
- Search-result pages and ambiguous facility matches remain excluded from production source links.
- Asoview links keep `conversion_check_required: true` where LinkSwitch conversion still needs URL-by-URL confirmation.

## Hero Audit

- Google Places candidate photos: **6 → maximum 10**.
- Worker `/place-photos` limit: **8 → 10** and default request count is now 10.
- Hero Audit copy now clearly tells the operator that up to 10 photos are shown and the Places search name can be changed if all candidates are weak.
- Existing user-selected photo/place overrides are preserved.

## Deployment note

- Static frontend files changed.
- **Cloudflare Worker also changed** (`worker/worker.js`), so `wrangler deploy` is required after the GitHub update.
- No new image assets.
