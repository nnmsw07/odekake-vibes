# Kibun v20.12.9 hotfix

- Fixes the 「静かな大人時間」 mood card so the generated lounge/garden hero image is actually displayed.
- Root cause: the legacy `.c4` gradient rule appeared later in `styles.css` and overrode the earlier `.quiet-adult` background image.
- Adds a higher-specificity final override and bumps CSS/JS cache keys to force browsers/CDN to fetch the corrected assets.
