# v20.11.10 handoff

User observed that v20.11.9 showed no images for the Tokyo rainy-day carousel. That carousel uses spot_286, spot_136, spot_029, spot_110, spot_285, spot_130, and spot_100, while the imported v20.11.8 IMAGE / RIGHTS JSON did not contain those spot IDs.

v20.11.10 therefore keeps the intended hierarchy:
1. Cover: Kibun AI theme image.
2. Spot slides: manually selected IMAGE / RIGHTS image.
3. If missing: strict Wikimedia/Wikidata auto-fill only when relevance >= 90 and rights status is safe.
4. Otherwise: photo-free editorial card.

The stricter threshold is designed to prevent the unrelated-image problem seen with PLAY! PARK ERIC CARLE.
