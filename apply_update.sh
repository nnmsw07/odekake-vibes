#!/usr/bin/env bash
set -euo pipefail

git add sns-audit/index.html \
  sns-audit/image-audit.js \
  CHANGELOG_v20_11_8.md \
  HANDOFF_v20_11_8.md \
  APPLY_v20_11_8.md \
  test_v20_11_8_image_match_guard.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Fix SNS open photo matching"
git push origin main
