#!/usr/bin/env bash
set -euo pipefail

ZIP="kibun-v20.11.19-hero-fix.zip"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"
unzip -oq "$ZIP" -d .

FILES=(
  seed.json data.js app.js media.js styles.css index.html
  worker/worker.js HERO_OVERRIDES_v20_11_17.json
  magazine/index.html magazine/magazine-media.js
  magazine/seasonal-harvest/index.html magazine/terrace-after-sunset/index.html
  assets/editorial/terrace-after-sunset.webp images/ai/terrace-evening-generic.webp
  CHANGELOG_v20_11_19.md apply_update.sh
)

git add -- "${FILES[@]}"
if git diff --cached --quiet -- "${FILES[@]}"; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Fix Kibun hero images" -- "${FILES[@]}"
git push origin HEAD:main
echo "Done."
