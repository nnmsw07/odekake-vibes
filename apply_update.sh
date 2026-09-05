#!/usr/bin/env bash
set -euo pipefail

UPDATE_ZIP="${KIBUN_UPDATE_ZIP:-kibun-v20.11.17-hero-fix.zip}"
COMMIT_MESSAGE="Fix Kibun hero images and apply latest audit"

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Run this from inside the Kibun Git repository." >&2
  exit 1
fi
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if [[ -f "$UPDATE_ZIP" ]]; then
  echo "==> Applying $UPDATE_ZIP"
  unzip -oq "$UPDATE_ZIP" -d .
else
  echo "==> $UPDATE_ZIP not found; validating files already applied in the repository."
fi

echo "==> Syntax checks"
node --check app.js
node --check media.js
node --check magazine/magazine-media.js
node --check worker/worker.js

echo "==> Hero regression checks"
node test_v20_11_17_hero_hardening.js
node test_v20_10_2_magazine_hotfix.js
node test_v20_3_3_plan_and_magazine.js
node test_v20_10_1_hero_audit.js
node test_v20_8_2_hero_audit.js

if [[ ! -s assets/editorial/terrace-after-sunset.webp ]]; then
  echo "ERROR: terrace-after-sunset.webp is missing or empty." >&2
  exit 1
fi

git diff --check

echo "==> Staging only v20.11.17 files"
git add -- \
  seed.json \
  data.js \
  HERO_OVERRIDES_v20_11_17.json \
  app.js \
  styles.css \
  index.html \
  magazine/index.html \
  magazine/magazine-media.js \
  magazine/seasonal-harvest/index.html \
  magazine/terrace-after-sunset/index.html \
  assets/editorial/terrace-after-sunset.webp \
  CHANGELOG_v20_11_17.md \
  HANDOFF_v20_11_17.md \
  APPLY_v20_11_17.md \
  test_v20_11_17_hero_hardening.js \
  apply_update.sh

if git diff --cached --quiet; then
  echo "No v20.11.17 changes to commit."
  exit 0
fi

echo "==> Committing"
git commit -m "$COMMIT_MESSAGE"

echo "==> Pushing to origin/main"
git push origin main

echo "==> Done: v20.11.17 hero fix is pushed."
