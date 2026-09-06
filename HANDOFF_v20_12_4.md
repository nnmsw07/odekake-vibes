# HANDOFF v20.12.4

- base: user supplied v20.12.3-era integrated repository
- spots: 473
- new audience: `dog` / UI label `わんこと`
- dog recommendation: `pet_profile.status === true` hard filter
- pet profiles: 21 spots (17 existing + 4 new)
- magazine audience filter: implemented
- dog articles: 5
- dog curated plans: 5
- pet audit: `/pet-audit/`
- pet info stale threshold: 180 days (audit)

## Important
犬連れ条件は変更されやすいため `pet_profile.checked_at` と `source_url` を維持してください。`pet_profile.status` を未確認のまま true にしないこと。
