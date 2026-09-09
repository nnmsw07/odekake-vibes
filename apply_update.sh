#!/usr/bin/env bash
set -euo pipefail

while IFS= read -r file; do
  [[ -n "$file" ]] && git add -- "$file"
done < UPDATE_MANIFEST_v20_12_8.txt
git add -- UPDATE_MANIFEST_v20_12_8.txt apply_update.sh

if git diff --cached --quiet; then
  echo 'No changes to commit.'
  exit 0
fi

git commit -m 'add quiet adult hero and SEO audit v20.12.8'
git push origin main
