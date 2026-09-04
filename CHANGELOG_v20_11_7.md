# CHANGELOG v20.11.7

## SNS screenshot auto-photo rescue
- Safe screenshot mode no longer stays photo-less just because `IMAGE / RIGHTS` has not been manually configured.
- For unconfigured spots, capture mode now automatically looks for a reusable real photo through:
  1. Wikidata representative image (P18)
  2. Wikidata Commons category (P373)
  3. Wikimedia Commons full-text search
- Only candidates classified as `safe` by the existing license rules are auto-previewed.
- Added query hints for common Tokyo spots used in the current rainy-day carousel.
- Existing manually selected SNS images still have the highest priority.
- If no safe open photo can be found, the editorial no-photo card remains the final fallback.
- Auto-lookups run with limited concurrency so a carousel does not issue all requests at once.
- The capture intro now explicitly asks for a final visual spot-match check before posting.
