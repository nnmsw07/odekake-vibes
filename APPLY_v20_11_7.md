# APPLY v20.11.7

```bash
git pull origin main
unzip -o kibun-v20.11.7.zip -d .
node --check sns-audit/audit.js
node --check sns-audit/image-audit.js
node test_v20_11_7_auto_open_photos.js
git status
git add sns-audit/index.html sns-audit/audit.js sns-audit/image-audit.js CHANGELOG_v20_11_7.md APPLY_v20_11_7.md HANDOFF_v20_11_7.md test_v20_11_7_auto_open_photos.js
git commit -m "Auto-find open photos for SNS capture"
git push origin main
```
