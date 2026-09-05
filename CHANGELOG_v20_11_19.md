# Kibun v20.11.19 — Hero fix consolidated

- Consolidates the selected Google Places Hero overrides and place overrides from the latest Hero audit.
- Keeps the Hero rescue fix for missing local fallbacks and Google Places replacement timing.
- Includes the dedicated editorial Hero for 「まだ帰りたくない日の、外ごはん。」 and related magazine Hero updates.
- `apply_update.sh` is intentionally lightweight: apply files, commit, push. No Wrangler login/deploy and no Codespaces-side tests.
- Cloudflare deployment is expected to run automatically from the GitHub integration after push.
