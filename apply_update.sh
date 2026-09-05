#!/usr/bin/env bash
set -euo pipefail

git add sns-audit/index.html sns-audit/audit.css sns-audit/audit.js \
  CHANGELOG_v20_11_23.md HANDOFF_v20_11_23.md APPLY_v20_11_23.md \
  test_v20_11_23_poster_exact.js apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Show SNS posters without cropping"
git push origin main
