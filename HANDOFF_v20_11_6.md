# HANDOFF v20.11.6 — SNS Image Audit

## Problem addressed
The screenshot workflow became too text-heavy because most saved spot heroes were shared AI placeholder images. Google Places hero photos are useful for site/audit display, but should not automatically be treated as reusable SNS creative.

## Architecture
### Separate image sources
- Google Places hero audit: site / visual audit path
- SNS Image Audit: reusable social-media image path

### SNS image storage
Browser-local selection state:
- key: `kibun-sns-image-audit-v20116`
- per spot stores image URL, source page, author, license metadata and rights status

### Wikimedia search
`image-audit.js` queries the Wikimedia Commons MediaWiki Action API using:
- `generator=search`
- file namespace `6`
- `prop=imageinfo`
- `iiprop=url|extmetadata`
- CORS `origin=*`

Metadata includes `LicenseShortName`, `UsageTerms`, `LicenseUrl`, `Artist`, `Credit` and `ImageDescription`.

### Conservative rights classifier
- green: CC0 / Public Domain / plain CC BY
- yellow: CC BY-SA / GFDL / conditional reuse requiring review
- red: NC / ND / unknown or blocked

Only green records are returned by `KibunSnsImages.getSafe()` and automatically used by screenshot mode. Yellow selections remain stored for review but do not replace the safe screenshot image.

## Screenshot behavior
In `imageMode=safe`:
1. approved SNS image from `KibunSnsImages.getSafe()`
2. distinct socially reusable saved hero
3. shared AI image only where current cover fallback permits it
4. photo-free editorial card

In `imageMode=audit`:
- Google Places / audited hero flow remains unchanged.

## Important legal/product note
The UI is intentionally a workflow aid, not a guarantee of legal clearance. Wikimedia Commons licenses differ by file, metadata can be imperfect, and non-copyright rights may still apply. The UI links to each file page for final confirmation.
