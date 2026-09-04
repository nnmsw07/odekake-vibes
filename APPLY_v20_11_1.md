# Apply v20.11.1 SNS Editors restore

```bash
unzip -o kibun-v20.11.1-sns-editors-restore.zip -d .

node test_v20_11_0_editorial_batch.js
node test_v20_11_1_sns_editors_restore.js

git status
git add sns-audit/ sns-editorial-data.js \
  CHANGELOG_v20_11_1.md HANDOFF_v20_11_1.md APPLY_v20_11_1.md \
  test_v20_11_1_sns_editors_restore.js
git commit -m "fix: restore Kibun Editors on v20.11.0"
git push
```
