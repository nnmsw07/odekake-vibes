# Handoff v20.9.0

## Baseline

- Base: v20.8.3 mobile overlay fix
- Spots: 431
- Affiliate source-link coverage: 148 spots / 159 links
- Hero Audit candidates: up to 10 Google Places photos

## Affiliate audit files

- `AFFILIATE_AUDIT_v20_9_0.md`
- `AFFILIATE_AUDIT_v20_9_0.json`
- `affiliate-audit-status.js`

Open `/affiliate-audit/`. The new **監査結果** filter defaults to `再調査`. Use it to work only on unresolved A/B candidates. An empty `sourceLinks` entry must not be interpreted as “already researched”; use the explicit audit outcome.

## Hero audit

Open `/?heroAudit=1`.

- Up to 10 candidates are shown.
- If all photos are weak, edit the Google Places search name and press `再検索`.
- Place ID and photo index exports continue to use the existing override format.

## Deployment

1. Apply the update ZIP and push the static site.
2. Redeploy the Worker because the `/place-photos` candidate limit changed:

```bash
cd worker
npx wrangler deploy
cd ..
```
