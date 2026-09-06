#!/usr/bin/env bash
set -euo pipefail
git add -A
git commit -m "fix magazine dog thumbnails v20.12.5" || true
git push origin main
