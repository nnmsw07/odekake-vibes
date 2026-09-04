# CHANGELOG v20.11.9

## SNS screenshot image policy
- The **first carousel slide now uses a Kibun-generated thematic AI image** in SNS publish mode.
- Spot slides no longer auto-insert unapproved Wikimedia search results into the publish-ready screenshot page.
- Spot slides use **IMAGE / RIGHTS approved safe images first**; otherwise they fall back to the photo-free editorial card.
- Hero Audit mode remains separate and continues to show audited Google Places hero photos for verification only.

## Selected SNS image seed
- Added `sns-image-audit-seed.js` from the exported IMAGE / RIGHTS audit JSON supplied by the user.
- Includes 9 selected records.
- Records marked `safe` are available to publish-mode screenshot cards.
- `needs_review` records remain visible in IMAGE / RIGHTS but are not treated as safe publish images.
- Local IMAGE / RIGHTS selections still override seeded defaults.

## Why
This separates three concerns cleanly:
1. Cover creativity → generated AI image
2. Spot accuracy → manually approved reusable real photos
3. Site hero audit → Google Places hero preview
