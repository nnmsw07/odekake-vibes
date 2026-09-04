#!/usr/bin/env bash
set -euo pipefail

git add \
  sns-audit/index.html \
  sns-audit/audit.js \
  sns-audit/image-audit.js \
  sns-image-audit-seed.js \
  CHANGELOG_v20_11_9.md \
  HANDOFF_v20_11_9.md \
  APPLY_v20_11_9.md \
  test_v20_11_9_sns_seed_ai_cover.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Use AI covers and approved SNS photos"
git push origin main
