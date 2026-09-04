# CHANGELOG v20.11.8

## Fix: unrelated Wikimedia images in SNS capture
- Added a venue/image relevance score before automatically using Wikimedia Commons photos.
- Removed the unsafe fallback that accepted the first Wikidata search result when no strong venue match existed.
- A Commons image must now match the spot name/known alias strongly enough; weak matches require area context.
- This prevents person/author portraits or unrelated public-domain images from being used just because their license is safe.
- IMAGE / RIGHTS candidates now show a match score and low-confidence candidates are disabled.
- If no trustworthy match is found, the screenshot keeps the designed no-photo card instead of showing a wrong image.
