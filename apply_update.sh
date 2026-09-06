#!/usr/bin/env bash
set -euo pipefail

python3 patch_v20_12_6.py

node test_v20_12_3_seo_affiliate_similar.js
node test_v20_12_4_pet_audience.js
node test_v20_12_5_magazine_dog_hero.js
node test_v20_12_6_thumbnail_hero.js

git add seed.json data.js index.html magazine/index.html magazine/magazine-media.js \
  preview-hero-clean.js HERO_OVERRIDES_v20_12_6_DELTA.json \
  patch_v20_12_6.py test_v20_12_6_thumbnail_hero.js \
  CHANGELOG_v20_12_6.md HANDOFF_v20_12_6.md apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "fix magazine thumbnail flash and latest hero audit v20.12.6"
git push origin main
