# APPLY v20.11.2

## If your SNS posts / editors ideas dropped back to 6
Apply in this order.

### 1) Re-apply the restore package first
```bash
cd /workspaces/odekake-vibes-main
unzip -o /path/to/kibun-v20.11.1-sns-editors-restore.zip -d .
```

### 2) Then apply this screenshot / hero fix package
```bash
cd /workspaces/odekake-vibes-main
unzip -o /path/to/kibun-v20.11.2-sns-capture-hero-fix.zip -d .
```

## Commit / deploy
```bash
cd /workspaces/odekake-vibes-main
git status
node test_v20_11_2_sns_capture.js
git add sns-audit/index.html sns-audit/audit.js sns-audit/audit.css magazine/magazine-media.js test_v20_11_2_sns_capture.js CHANGELOG_v20_11_2.md HANDOFF_v20_11_2.md APPLY_v20_11_2.md
git commit -m "Add SNS screenshot capture mode and hero resolution"
git push
```

## What to verify on production
- `https://kibuntrip.com/sns-audit/`
- Open an idea → “スクショ用ページを開く” exists
- `?capture=<id>` page shows 4:5 Instagram-style slides
- Spot slides show the correct hero image when Places photo resolution succeeds
