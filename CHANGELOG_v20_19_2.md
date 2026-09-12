# Kibun v20.19.2

## UI hotfix
- Tighten the two supporting STEP 1 mood cards on mobile so they keep the approved editorial proportions instead of becoming tall, sparse cards.
- Bump home CSS/JS cache keys to `201902` for both Japanese and English so the corrected layout is loaded immediately after deploy.

## Feature / magazine hero imagery
- Use each featured spot's own representative hero image for spot cards inside feature articles.
- Use a representative spot hero for feature-article heroes and magazine-hub cards instead of the generic scenic illustration.
- Expand the magazine media resolver to all referenced feature spots, preserving current Hero Audit photo/place overrides when Google Places media is available.
- Add `scripts/sync_magazine_hero_media.py` so the hero mapping can be regenerated deterministically after future editorial additions.

## Venue-specific WHAT'S ON
- Change “see all” from a spot detail page to open a venue-filtered WHAT'S ON view first.
- The venue view combines that venue's exhibitions/events and performances, and then offers a second CTA to browse all other venues.
- Apply the same flow in Japanese and English.

## English parity
- Mirror the v20.19.2 home cache/layout fix, hero-image behavior, and venue-specific WHAT'S ON flow in `/en/`.
- Existing English feature pages and cards now use the same representative-hero media behavior as Japanese pages.

## Verification
- v20.19.2 targeted checks
- Recommender regression
- Event audit
- Performance audit
- SEO audit
