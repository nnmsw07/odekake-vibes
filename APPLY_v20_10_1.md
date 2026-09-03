# Apply v20.10.1 SNS Editors patch

This patch is intended to be overlaid on `kibun-v20.10.0-full`.

## Codespaces

```bash
unzip -o kibun-v20.10.1-sns-editors-update.zip -d .

node test_v20_9_1_sns_audit.js
node test_v20_10_0_editorial_expansion.js
node test_v20_10_1_sns_editors.js

git status
git add sns-audit/ sns-editorial-data.js sns-audit-data.js \
  CHANGELOG_v20_10_1.md HANDOFF_v20_10_1.md APPLY_v20_10_1.md \
  test_v20_10_1_sns_editors.js
git commit -m "feat: upgrade SNS Audit to Kibun Editors"
git push
```

If the production site is connected to GitHub/Cloudflare Pages, the push can trigger the normal deployment pipeline.
