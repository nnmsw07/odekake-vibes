# APPLY v20.11.3

Upload `kibun-v20.11.3-update.zip` to the repository root, then run:

```bash
cd /workspaces/odekake-vibes-main
unzip -o kibun-v20.11.3-update.zip -d .
node test_v20_11_3_sns_cover_hero.js
git status
git add sns-audit/index.html sns-audit/audit.js sns-audit/audit.css \
  magazine/magazine-media.js magazine/ \
  test_v20_11_3_sns_cover_hero.js test_v20_11_2_sns_capture.js test_v20_3_3_plan_and_magazine.js CHANGELOG_v20_11_3.md HANDOFF_v20_11_3.md APPLY_v20_11_3.md
git commit -m "Improve SNS cover and align audited hero images"
git push
```

Expected test output:

```text
v20.11.3 SNS cover/hero checks passed (18 magazine heroes aligned)
```

## Production check
1. Open `/sns-audit/`.
2. Open any idea and confirm the Hero thumbnails are no longer all the same fallback when audited photos exist.
3. Tap `スクショ用ページを開く`.
4. Slide 1 should now have a Hero image background.
5. Use **SNS投稿用** for screenshot-ready assets.
6. Use **監査Hero確認** only to verify the Hero Audit photo choice; Google/third-party image reuse rights still need separate confirmation.
