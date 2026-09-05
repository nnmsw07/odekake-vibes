#!/usr/bin/env bash
set -euo pipefail
ZIP="kibun-v20.11.20-beer-garden-hero.zip"
unzip -oq "$ZIP" -d .
git add seed.json data.js index.html images/ai/hilton-tokyo-beer-garden-2026.webp apply_update.sh
git diff --cached --quiet || git commit -m "Fix beer garden hero images"
git push origin HEAD:main
