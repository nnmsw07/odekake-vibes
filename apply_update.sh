#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f index.html || ! -f app.js ]]; then
  echo "ERROR: Kibun repository root で実行してください。" >&2
  exit 1
fi

HERE="$(cd "$(dirname "$0")" && pwd)"
VERSION="v20.19.3"

copy_one(){
  local f="$1"
  mkdir -p "$(dirname "$f")"
  cp -f "$HERE/$f" "$f"
}

FILES=(
  index.html
  en/index.html
  magazine/index.html
  en/magazine/index.html
  magazine/stage-day/index.html
  magazine/whats-on-weekend/index.html
  magazine/indoor-adult-day/index.html
  magazine/yokohama-after-curtain/index.html
  en/magazine/stage-day/index.html
  en/magazine/whats-on-weekend/index.html
  en/magazine/indoor-adult-day/index.html
  en/magazine/yokohama-after-curtain/index.html
  assets/editorial/v201903/stage-day.webp
  assets/editorial/v201903/whats-on-weekend.webp
  assets/editorial/v201903/indoor-adult-day.webp
  assets/editorial/v201903/yokohama-after-curtain.webp
)
if [[ "$HERE" != "$(pwd)" ]]; then
  for f in "${FILES[@]}"; do copy_one "$f"; done
fi

# Obsolete generic black-background sunset thumbnail: never use it again.
rm -f assets/editorial/scenic.webp

node --check app.js
[[ ! -f en/app.js ]] || node --check en/app.js
python - <<'PY'
from pathlib import Path
for rel in ['index.html','en/index.html']:
    s=Path(rel).read_text()
    assert 'mood-card-mobile-v201903' in s, rel
    assert 'styles.css?v=201903' in s, rel
for slug in ['stage-day','whats-on-weekend','indoor-adult-day','yokohama-after-curtain']:
    ja=Path('magazine')/slug/'index.html'
    assert 'assets/editorial/v201903/' in ja.read_text(), ja
    en=Path('en/magazine')/slug/'index.html'
    if en.exists(): assert 'assets/editorial/v201903/' in en.read_text(), en
for p in Path('.').rglob('*.html'):
    assert 'assets/editorial/scenic.webp' not in p.read_text(errors='ignore'), p
print('v20.19.3 checks: PASS')
PY

if git diff --quiet -- . ':!apply_update.sh' && git diff --cached --quiet; then
  echo "$VERSION is already applied."
  exit 0
fi

git add -A
git commit -m "Kibun v20.19.3: fix mood cards and editorial thumbnails"
git push origin main

echo "$VERSION applied and pushed."
