# APPLY v20.11.6

Upload `kibun-v20.11.6.zip` to the repository root, then run in Codespaces:

```bash
git pull origin main
unzip -o kibun-v20.11.6.zip -d .
node --check sns-audit/audit.js
node --check sns-audit/image-audit.js
node test_v20_11_6_sns_image_audit.js
git status
git add sns-audit/index.html \
  sns-audit/audit.js \
  sns-audit/audit.css \
  sns-audit/image-audit.js \
  CHANGELOG_v20_11_6.md \
  HANDOFF_v20_11_6.md \
  APPLY_v20_11_6.md \
  test_v20_11_6_sns_image_audit.js
git commit -m "Add SNS image rights audit"
git push origin main
```

Expected test output:

```text
v20.11.6 SNS Image Audit: PASS
```

## How to use
1. Open `SNS Audit`.
2. Tap `IMAGE / RIGHTS`.
3. Search for a spot, e.g. `チームラボボーダレス`.
4. Tap `Commons候補を探す`.
5. Open the Commons file page and confirm the candidate/license.
6. For a green candidate tap `SNS用に採用`.
7. Return to the idea's screenshot page. `SNS投稿用` will use that image first.
8. Caption copy now includes photo-credit lines when applicable.

Selections are stored in the current browser. Use `画像設定JSONを保存` to back them up or move them to another browser/device.
