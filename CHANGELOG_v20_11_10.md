# v20.11.10

- SNS screenshot safe mode now auto-fills missing spot photos from Wikimedia/Wikidata.
- Manually selected IMAGE / RIGHTS photos still have highest priority.
- Auto-fill is intentionally strict: facility relevance score must be 90+ and the image license must already be classified as reusable by the existing audit logic.
- This restores photos for high-confidence matches while keeping the v20.11.8 false-match guard.
- Cover slide remains a Kibun AI theme image.
