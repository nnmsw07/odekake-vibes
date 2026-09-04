#!/usr/bin/env bash
set -euo pipefail

git add \
  sns-audit/index.html \
  sns-audit/audit.js \
  sns-audit/audit.css \
  sns-audit/image-audit.js \
  assets/sns/article-posters \
  CHANGELOG_v20_11_14.md \
  HANDOFF_v20_11_14.md \
  APPLY_v20_11_14.md \
  test_v20_11_14_article_poster_flow.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Refresh SNS article poster flow"
git push origin main
