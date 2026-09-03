# v20.9.1 handoff

Base: v20.9.0. This release integrates the previously planned SNS Audit addon instead of keeping it as a separate patch.

## Audit entry points
- Affiliate Audit: `/affiliate-audit/`
- SNS Audit: `/sns-audit/` or `/?snsAudit=1`
- Hero Audit: `/?heroAudit=1`

## SNS Audit
- 30 September 2026 post slots are prefilled.
- Per-post fields: article/plan/spot destination, Hero, Instagram route, Affiliate readiness, status, published URL, impressions, likes, saves, comments and shares.
- Changes are stored in localStorage (`kibun-sns-audit-v2091`).
- JSON export/import is the portable backup.

## Worker
No additional Worker change from v20.9.0. If deploying this cumulative update over v20.8.3, deploy the included v20.9.0 Worker once.
