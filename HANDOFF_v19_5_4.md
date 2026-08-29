# Handoff — V19.5.4

- 211 spots
- Primary domain: https://kibuntrip.com
- GA4: G-M99DNGD18F
- V19.5.3 URL audit retained
- V19.5.4 operational audit added
- `recommender.js` now supports `available_ranges` and `unavailable_ranges`
- Seasonal/known closure dates are conservatively hard-filtered
- Worker: no change required from V19.5.x

Before the next public-data refresh, run:

```bash
node scripts/check_official_urls.mjs
node scripts/audit_operating_snapshots.mjs
node test_v19_5_4_operations.js
```
