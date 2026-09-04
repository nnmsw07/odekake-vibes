# APPLY v20.11.5

```bash
git pull origin main
unzip -o kibun-v20.11.5.zip -d .
node --check sns-audit/audit.js
node test_v20_11_5_sns_less_text.js
git status
git add sns-audit/audit.js sns-audit/audit.css sns-audit/index.html CHANGELOG_v20_11_5.md APPLY_v20_11_5.md test_v20_11_5_sns_less_text.js
git commit -m "Refine SNS screenshot cards"
git push origin main
```
