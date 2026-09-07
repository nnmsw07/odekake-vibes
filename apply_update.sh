#!/usr/bin/env bash
set -euo pipefail

git add \
  sns-audit/audit.js \
  sns-audit/audit.css \
  sns-audit/index.html \
  sns-audit/plan.js \
  sns-audit-data.js \
  test_v20_12_7_sns_threads_ui.js \
  CHANGELOG_v20_12_7.md \
  apply_update.sh

if git diff --cached --quiet; then
  echo 'No changes to commit.'
  exit 0
fi

git commit -m 'update SNS Threads and fixed UI intro v20.12.7'
git push origin main
