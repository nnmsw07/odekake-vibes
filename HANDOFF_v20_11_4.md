# HANDOFF v20.11.4

## Goal
Address the remaining SNS capture issues raised by the user:
- the first slide should feel stronger
- screenshot mode should be usable for Instagram by simple screen capture
- not every spot slide should show the same generated image
- image-rights handling should be clearer
- audited hero selection should still be inspectable

## Implementation summary
### 1) Dual screenshot modes kept and clarified
- `SNS投稿用` = socially safer output
- `監査Hero確認` = Google Places hero preview for audit / checking only

### 2) Safer social behavior for spot images
New logic detects shared generic hero sources (AI/editorial/plan placeholders or heavily reused hero assets).
- In safe mode, those images are **not reused** on spot slides.
- Instead, the slide renders a polished placeholder card with spot facts.

### 3) First slide remains visually important
- Cover slide still tries to use a representative hero image when possible, even in safe mode.
- If no suitable image exists, the cover still renders as a clean text-first design.

### 4) Styling additions
Added styles for:
- `.ig-safe-note`
- `.ig-media-placeholder`
- `.ig-placeholder-mark`
- `.ig-placeholder-copy`
- `.ig-facts`
- mobile cover typography refinement

## Main files
- `sns-audit/audit.js`
- `sns-audit/audit.css`
- `sns-audit/index.html`

## Notes
This update intentionally avoids treating Google Places preview images as automatically reusable for SNS posting. The audit preview remains available, but the default posting mode now de-emphasizes rights-risky repeated imagery.
