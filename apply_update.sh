#!/usr/bin/env bash
set -euo pipefail

git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi
git commit -m "Add dog-friendly audience articles and plans"
git push origin main
