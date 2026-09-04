# CHANGELOG v20.11.4

## SNS Audit / Screenshot Mode refinement
- Added a clearer split between **SNS投稿用** and **監査Hero確認** modes on capture pages.
- In **SNS投稿用**, the system now prefers only socially reusable saved heroes.
- If a spot only has a repeated shared AI/editorial placeholder image, the spot slide now switches to a **photo-free polished text card** instead of repeating the same generated image.
- The **cover slide** still prioritizes a representative hero image when available so the first slide remains visually strong.
- Added clearer explanatory copy about image-rights handling in screenshot mode.
- Improved the screenshot card styling for **no-photo slides** and reduced the risk of the first slide feeling too plain.
- Tightened mobile typography for the screenshot cover slide.
- Refreshed cache-busting params for `sns-audit/index.html`.

## Files changed
- `sns-audit/audit.js`
- `sns-audit/audit.css`
- `sns-audit/index.html`
