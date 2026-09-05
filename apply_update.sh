#!/usr/bin/env bash
set -euo pipefail

git add \
  sns-audit/index.html \
  sns-audit/audit.js \
  CHANGELOG_v20_11_16.md \
  HANDOFF_v20_11_16.md \
  APPLY_v20_11_16.md \
  test_v20_11_16_instagram_mentions.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Add verified Instagram mentions to SNS captions"
git push origin main
