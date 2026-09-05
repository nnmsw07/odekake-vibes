#!/usr/bin/env bash
set -euo pipefail

git add \
  sns-audit/index.html \
  sns-audit/audit.js \
  sns-audit/audit.css \
  CHANGELOG_v20_11_15.md \
  HANDOFF_v20_11_15.md \
  APPLY_v20_11_15.md \
  test_v20_11_15_site_ui_slide.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Polish SNS brand and site UI slide"
git push origin main
