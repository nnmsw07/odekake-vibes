#!/usr/bin/env bash
set -euo pipefail

echo "Applying Kibun v20.11.10 (pre-tested)..."

git add \
  sns-audit/index.html \
  sns-audit/audit.js \
  sns-audit/image-audit.js \
  CHANGELOG_v20_11_10.md \
  HANDOFF_v20_11_10.md \
  APPLY_v20_11_10.md \
  test_v20_11_10_auto_safe_images.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Restore strict auto photos in SNS capture"
git push origin main
