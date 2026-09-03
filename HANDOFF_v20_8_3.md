# Handoff v20.8.3

## Fix
Mobile Chrome could render a large dark overlay across the mood screen because `.image-shell::after` and `.image-badge` were absolutely positioned without a positioned `.image-shell` ancestor.

## Changed
- `styles.css`: define `.image-shell` as a positioned, clipped container.
- `index.html`: stylesheet cache-buster `2083`.

## Unchanged
431 spots, affiliate links, Instagram handling, hero overrides, Worker, and image assets.
