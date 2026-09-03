# Handoff v20.10.1 — SNS Editors

## What changed
`/sns-audit/` now opens on an editorial planning board rather than the post-operation tracker.

Flow:

1. IDEA / DRAFT — choose a useful outing theme.
2. Open 「投稿を作る」 — review carousel, IG caption, X draft, hashtags, spots and images.
3. Choose 「運用に追加」 — persist the draft in the existing tracker.
4. PUBLISH / LEARN — manage destination, Hero, Instagram route, affiliate readiness and results.

## Files
- `sns-audit/index.html` — new two-workspace UI.
- `sns-audit/audit.css` — Editors cards, filters, detail dialog, mobile layout.
- `sns-audit/audit.js` — idea generation, scoring, social drafts, migration, existing tracker integration.
- `sns-editorial-data.js` — current Magazine + Plan catalog used by SNS Editors.
- `sns-audit-data.js` — seed version bumped to 20.10.1.
- `test_v20_10_1_sns_editors.js` — static + runtime smoke test.

## Notes
- Generated ideas are rule-based on existing editorial scores/tags. They are intentionally not an external LLM dependency.
- Several themes use the site's already-curated Magazine spot selection where that is stronger than re-ranking raw spots (e.g. Tokyo rainy family, parent-rest indoor, Yokohama small holiday, afternoon tea, craft, Hakone stay).
- Existing v20.9.1 localStorage is migrated automatically.
