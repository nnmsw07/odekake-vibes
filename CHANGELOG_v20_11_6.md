# CHANGELOG v20.11.6

## SNS Image Audit
- Added a third SNS Audit workspace: **IMAGE / RIGHTS**.
- Added Wikimedia Commons image candidate search directly from each Kibun spot.
- Reads machine-readable Commons metadata including author, license name and license URL.
- Classifies candidates conservatively:
  - 🟢 `CC0`, Public Domain, `CC BY` → SNS reusable candidate
  - 🟡 `CC BY-SA`, GFDL and other conditional licenses → needs review
  - 🔴 non-commercial / no-derivatives / unknown → not auto-approved
- Selected images are saved in browser localStorage under `kibun-sns-image-audit-v20116`.
- Added import/export JSON for SNS image selections.
- Added manual registration for user-owned / explicitly permitted image URLs.

## Screenshot mode integration
- **SNS投稿用** now prioritizes an approved IMAGE / RIGHTS real photo before AI/fallback media.
- Approved Wikimedia image attribution is displayed on the screenshot slide.
- Instagram caption automatically appends a `Photo credits` section for approved reusable images.
- Cover image selection strongly prefers an approved SNS real photo.
- **監査Hero確認** remains separate and continues to use the Google Places hero audit flow.

## Editors integration
- Added an `SNS実写真を探す` action from the idea detail.
- Used-spot rows show an approved SNS image when one is already configured.

## Data safety
- This update does **not** overwrite `data.js`, `sns-editorial-data.js` or `sns-audit-data.js`.
