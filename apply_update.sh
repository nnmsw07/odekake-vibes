#!/usr/bin/env bash
set -euo pipefail

git add sns-audit/index.html \
  sns-audit/audit.css \
  sns-audit/audit.js \
  sns-audit/image-audit.js \
  CHANGELOG_v20_11_13.md \
  HANDOFF_v20_11_13.md \
  APPLY_v20_11_13.md \
  test_v20_11_13_editorial_redesign.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Refine SNS editorial note cards"
git push origin main
