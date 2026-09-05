#!/usr/bin/env bash
set -euo pipefail

git add sns-audit/audit.js sns-audit/audit.css sns-audit/index.html \
  assets/sns/article-posters \
  assets/sns/article-spot-images \
  CHANGELOG_v20_11_22.md HANDOFF_v20_11_22.md APPLY_v20_11_22.md \
  test_v20_11_22_sns_article_spot_guide.js apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Refresh SNS article carousels"
git push origin HEAD:main
