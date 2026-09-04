# CHANGELOG v20.11.2

## SNS Audit screenshot / hero fix
- Added a screenshot-friendly Instagram capture mode to `sns-audit`.
- You can now open `sns-audit/?capture=<idea_id or post_id>` and scroll through polished 4:5 slides that are ready to screenshot for Instagram.
- Added “スクショ用ページを開く” actions in:
  - the Editors idea detail dialog
  - the Operations post draft box (when carousel slides exist)
- Added hero-image resolution in SNS Audit using the existing Google Places photo API when available.
- Audit slide previews and screenshot pages now prefer resolved live hero photos, then fall back to the stored hero asset.
- Reused `magazine/magazine-media.js` hero overrides by exposing the hero spot map as `window.KIBUN_HERO_SPOTS`.
- Kept the existing localStorage key so previously saved SNS Audit data is preserved.

## Files changed
- `sns-audit/index.html`
- `sns-audit/audit.js`
- `sns-audit/audit.css`
- `magazine/magazine-media.js`
- `test_v20_11_2_sns_capture.js`
