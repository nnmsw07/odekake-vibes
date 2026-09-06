#!/usr/bin/env bash
set -euo pipefail

git add index.html styles.css app.js magazine/index.html assets/og-v201125 magazine/art-and-cafe/index.html magazine/hakone-stay-story/index.html magazine/hotel-without-staying/index.html magazine/japanese-culture-experience/index.html magazine/make-something/index.html magazine/night-starts-after-five/index.html magazine/outdoor-stay-with-comfort/index.html magazine/oyako-rest-indoor/index.html magazine/parents-eat-well/index.html magazine/seasonal-harvest/index.html magazine/shibuya-with-kids/index.html magazine/shinjuku-family-day/index.html magazine/takanawa-after-five/index.html magazine/terrace-after-sunset/index.html magazine/tokyo-rainy-family/index.html magazine/tools-with-a-story/index.html magazine/yokohama-afternoon-tea/index.html magazine/yokohama-family-cafe/index.html magazine/yokohama-small-holiday/index.html \
  CHANGELOG_v20_11_25.md HANDOFF_v20_11_25.md APPLY_v20_11_25.md test_v20_11_25_ui_ogp.js apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Redesign mood selector and refresh article OGP"
git push origin main
