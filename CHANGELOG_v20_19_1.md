# Kibun v20.19.1

Hotfix for the v20.19 mood/editorial release.

## Fixes

- Reduced the two supporting STEP 1 mood cards on mobile so they match the approved composition instead of becoming tall portrait cards.
- Prevented the supporting mood titles/descriptions from breaking into awkward multi-line stacks on narrow screens.
- Added the missing layout styles for the newer feature-article spot blocks (`article-spot`, media, copy and numbering).
- Fixed feature images remaining transparent when the Google Places photo endpoint is unavailable on an article page; the bundled editorial image now appears immediately as a safe fallback.
- Bumped relevant CSS/media cache versions so Cloudflare/browser caches do not keep the broken v20.19 presentation.
- Kept the English mood UI and English feature pages in parity with the same fixes.
- Updated generators so future regeneration does not reintroduce the stale asset versions.

## Verification

- v20.19.1 hotfix checks: PASS
- v20.19.0 content/UI checks: PASS
- recommender regression: PASS
- UI/OGP regression: PASS
- event audit: PASS
- performance audit: PASS
- SEO audit: 637 sitemap URLs / 0 errors / 0 warnings
