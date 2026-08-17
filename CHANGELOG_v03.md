# Kibun v0.3 changes

## Data
- 10 → **40 spots** (Kanagawa-heavy + Tokyo/Chiba/Saitama)
- Added `buzz` layer to 30 newly researched spots
- `buzz` is editorial/experimental and does **not** drive the main recommendation score
- Added explicit hard age constraint support; JAL SKY MUSEUM is excluded for preschool-age inputs

## Recommendation
- Keeps the Vibe-first weighting
- Adventure/Easy slots now require minimum Vibe match (`vibe >= 45`) so convenience cannot overpower the selected mood

## UI
- Core v0.2 UI unchanged
- Added a compact **TRENDING NOW / いま、ちょっと話題。** strip with the six highest-Buzz spots
- Buzz >= 90 gets a small `🔥 話題` badge in cards/details
- Hero microcopy now says the app is testing with 40 spots

## Images
- Existing rights-cleared photos remain
- New spots temporarily reuse the existing AI image set and are labeled `イメージ`
- Replace with rights-cleared exact-spot photos as they become available

## Important
Dynamic information (hours, fees, reservations, temporary closures) is a snapshot. Refresh before relying on an “open now” feature.
