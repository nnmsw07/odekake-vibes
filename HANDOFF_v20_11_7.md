# HANDOFF v20.11.7

The user found that the SNS-safe screenshot page still showed no photos because v20.11.6 required manually selecting each image in IMAGE / RIGHTS first.

v20.11.7 changes the default behavior for screenshot mode:
- adopted SNS image -> use immediately
- otherwise auto-resolve an open-license real photo
- otherwise keep the existing editorial no-photo fallback

The resolver first checks Wikidata P18 / P373 and then Wikimedia Commons search. It reuses the v20.11.6 license parser and only injects candidates classified as `safe` (CC0 / Public Domain / CC BY under the current rules).

Auto-found photos are previews, not a substitute for checking whether the pictured place is the correct spot. The screenshot intro reminds the editor to visually verify the match.
