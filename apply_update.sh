#!/usr/bin/env bash
set -euo pipefail

MANIFEST="UPDATE_MANIFEST_v20_13_0.txt"
if [[ ! -f "$MANIFEST" ]]; then
  echo "Missing $MANIFEST. Run this from the Kibun repository root after unzipping the update." >&2
  exit 1
fi

echo "[1/4] Syntax checks"
node --check app.js
node --check plans.js
node --check recommender.js
node --check scripts/generate_en_pages.mjs
node --check scripts/generate_seo_pages.mjs
node --check scripts/seo_audit.mjs

echo "[2/4] v20.13.0 regression test"
node test_v20_13_0_family_en_seo.js

echo "[3/4] SEO audit"
node scripts/seo_audit.mjs --report seo-audit/v20.13.0-local

echo "[4/4] Commit and push"
while IFS= read -r file; do
  [[ -n "$file" ]] && git add -- "$file"
done < "$MANIFEST"
git add -- "$MANIFEST" apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Kibun v20.13.0: family filters and English MVP"
git push origin main

echo "Done. Cloudflare Pages will deploy from GitHub automatically."
