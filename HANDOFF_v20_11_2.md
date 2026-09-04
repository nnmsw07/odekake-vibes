# HANDOFF v20.11.2

## What this update does
This is a UI/UX improvement for SNS Audit.
It does **not** reseed the Editors idea dataset by itself.

### Main additions
1. **Screenshot mode for Instagram**
   - New route pattern: `sns-audit/?capture=<id>`
   - Accepts either:
     - an Editors idea id (example: `rain-tokyo-indoor-7`)
     - or an Operations post id (example: `post_2026_09_30`)
   - Renders clean 4:5 Instagram-style slides for easy screenshot capture.

2. **Hero image improvement**
   - Slide previews inside the idea dialog now mark each image with `data-hero-spot`.
   - The page resolves those spots through `placePhotoApiUrl` when available.
   - If the API does not return a usable photo, it falls back to the existing stored hero asset.

3. **Open capture page from the UI**
   - Idea detail dialog: “スクショ用ページを開く”
   - Operations draft box: “スクショ用ページを開く”

## Important note about the “6 posts only” symptom
That symptom is most likely from applying another zip that overwrote the SNS editors seed / restore state.
This v20.11.2 package does not restore the missing idea/post set by itself.

If the list has reverted, first re-apply the earlier restore package:
- `kibun-v20.11.1-sns-editors-restore.zip`

Then apply this package:
- `kibun-v20.11.2-sns-capture-hero-fix.zip`

## Quick sanity checks after deploy
- Open `https://kibuntrip.com/sns-audit/`
- Open any Editors idea
- Confirm the dialog shows **“スクショ用ページを開く”**
- Tap it and confirm:
  - a dedicated screenshot page opens
  - slides render in 4:5 format
  - hero images try to resolve to live facility photos
- In Operations, open a post with generated draft content and confirm the same button appears.
