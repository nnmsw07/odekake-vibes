# HANDOFF v20.10.2

## Scope
Mobile hotfix for the `/magazine/` page plus article-image polish.

## What changed
1. **Magazine plan preview hotfix**
   - Reinforced `.plan-preview-card` / `.article-card` anchor styling in `magazine/magazine.css`.
   - Ensured card text keeps the intended Kibun styling rather than default purple underlined link rendering.
   - Added explicit flex/card behavior so the preview remains visually grouped as a card.

2. **Cache refresh**
   - Updated `magazine.css`, `config.js`, and `magazine-media.js` query params across `magazine/index.html` and all article detail pages to `v=2102`.
   - This should help flush stale cached CSS/JS on mobile browsers.

3. **Article images → hero image feel**
   - Removed the “イメージ” badge from the top-page magazine preview cards so the visuals read as article hero images.
   - Kept Google Places–based representative hero loading in place.
   - Aligned `art-and-cafe` preview to `spot_101`, matching the article hero.

## Main edited files
- `magazine/magazine.css`
- `magazine/index.html`
- `magazine/*/index.html`
- `index.html`

## Suggested verification
- Open `/magazine/` on mobile and confirm the “読むより、そのまま出かけたい日。” section renders as bordered cards with non-underlined body text.
- Hard refresh once if an old cached style persists.
- Confirm homepage article cards no longer show the “イメージ” badge and still resolve representative hero photos.
