#!/usr/bin/env bash
set -euo pipefail
python3 patch_v20_12_6_1.py
node test_v20_12_6_1_home_terrace.js
node test_v20_12_4_pet_audience.js
node test_v20_12_5_magazine_dog_hero.js
node test_v20_12_6_thumbnail_hero.js

git add index.html patch_v20_12_6_1.py test_v20_12_6_1_home_terrace.js apply_update.sh CHANGELOG_v20_12_6_1.md
if git diff --cached --quiet; then
  echo 'No changes to commit.'
  exit 0
fi
git commit -m 'fix blank terrace magazine hero v20.12.6.1'
git push origin main
