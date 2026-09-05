# v20.11.15 handoff

User feedback:
- The Kibun logo baked into generated article posters looked crushed/distorted.
- The second carousel slide should demonstrate the actual Kibun site UI rather than explain the service abstractly.

Implementation:
- Slide 1 overlays the real `favicon.svg` + `Kibun Trip` text on a cream footer, masking the generated footer logo.
- The same footer includes `AIイメージ` and the generated-image disclaimer.
- Slide 2 is rendered in HTML/CSS and visually mirrors the main site's `MOOD FIRST. PLACE SECOND.` experience: audience chips, vibe chips, time/weather conditions, CTA and three-plan result preview.
- No state schema change; only rendering/cache-bust changes.
