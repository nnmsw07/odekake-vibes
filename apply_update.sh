#!/usr/bin/env bash
set -euo pipefail

node test_v20_11_25_ui_ogp.js
node test_v20_12_0_magazine_plus10.js
node test_v20_12_1_integrated.js

git add index.html sitemap.xml magazine/index.html magazine/magazine-media.js \
  magazine/baby-first-outing magazine/yokohama-rainy-day magazine/ride-and-transport \
  magazine/science-for-everyone magazine/waterfront-reset magazine/green-breathing-room \
  magazine/small-museums-big-day magazine/solo-reset magazine/factory-tour magazine/animals-close \
  assets/og-v201125/baby-first-outing-v201125.jpg assets/og-v201125/yokohama-rainy-day-v201125.jpg \
  assets/og-v201125/ride-and-transport-v201125.jpg assets/og-v201125/science-for-everyone-v201125.jpg \
  assets/og-v201125/waterfront-reset-v201125.jpg assets/og-v201125/green-breathing-room-v201125.jpg \
  assets/og-v201125/small-museums-big-day-v201125.jpg assets/og-v201125/solo-reset-v201125.jpg \
  assets/og-v201125/factory-tour-v201125.jpg assets/og-v201125/animals-close-v201125.jpg \
  CHANGELOG_v20_12_1.md HANDOFF_v20_12_1.md APPLY_v20_12_1.md \
  test_v20_12_0_magazine_plus10.js test_v20_12_1_integrated.js apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Integrate SNS refresh and 10 Magazine features"
git push origin main
