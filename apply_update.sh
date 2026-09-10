#!/usr/bin/env bash
set -euo pipefail
node test_v20_12_9_quiet_adult.js
while IFS= read -r file; do
  [[ -n "$file" ]] && git add -- "$file"
done < UPDATE_MANIFEST_v20_12_9.txt
git add -- UPDATE_MANIFEST_v20_12_9.txt apply_update.sh
if git diff --cached --quiet; then
  echo 'No changes to commit.'
  exit 0
fi
git commit -m 'fix quiet adult hero v20.12.9'
git push origin main
