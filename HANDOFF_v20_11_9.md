# HANDOFF v20.11.9

## Goal
Make the Instagram screenshot flow visually useful without introducing unrelated automatically matched photos.

## Behavior
### Slide 1
- In `SNS投稿用`, use a theme-aware generated Kibun image from existing local AI assets.
- Example mappings include rainy/indoor → culture interior, water → cool water, family/play → kids play, onsen → onsen garden, nature → forest path.

### Slide 2+
- Use only `IMAGE / RIGHTS` records whose `rights_status` is `safe`.
- If no approved safe image exists, keep the photo-free editorial card.
- Do not auto-inject unreviewed Commons search results into publish screenshots.

### Hero audit
- `監査Hero確認` remains independent and can show Google Places hero photos for visual audit only.

## Seed data
`sns-image-audit-seed.js` is generated from the user's exported `kibun-sns-image-audit-v20.11.8.json`.
The export contains 9 records; the one marked `needs_review` is retained but not eligible for safe publish mode.
