#!/usr/bin/env bash
set -euo pipefail

git add index.html styles.css app.js magazine/index.html assets/og-kibun-magazine.png \
  magazine/art-and-cafe/index.html magazine/yokohama-family-cafe/index.html \
  magazine/night-starts-after-five/index.html magazine/tokyo-rainy-family/index.html \
  magazine/japanese-culture-experience/index.html magazine/yokohama-small-holiday/index.html \
  magazine/terrace-after-sunset/index.html magazine/make-something/index.html \
  magazine/hakone-stay-story/index.html magazine/oyako-rest-indoor/index.html \
  CHANGELOG_v20_11_24.md HANDOFF_v20_11_24.md APPLY_v20_11_24.md apply_update.sh \
  test_v20_11_24_mood_and_ogp.js

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Polish mood selector UI and article link previews"
git push origin main
