#!/usr/bin/env bash
set -euo pipefail

node test_v20_11_25_ui_ogp.js
node test_v20_12_0_magazine_plus10.js
node test_v20_12_1_integrated.js
node test_v20_12_2_spots_and_audit.js
node test_v20_12_3_seo_affiliate_similar.js
node test_v19_6_seo_affiliate.js

# Pier 8の旧ホテルSEO slugを削除。新しいLARBOARD slugはZIPに含まれています。
git rm -rf --ignore-unmatch spots/intercontinental-yokohama-pier8 >/dev/null 2>&1 || true

git add -A \
  app.js styles.css index.html seed.json data.js \
  affiliate-config.js affiliate-audit-status.js \
  magazine/index.html assets/editorial \
  _redirects sitemap.xml robots.txt spots-index.html spots/index.html spots/routes.json \
  spots/larboard-intercontinental-yokohama-pier8 \
  spots/starbucks-reserve-roastery-tokyo spots/la-boheme-shirogane spots/ogasawara-tei \
  spots/raku-spa-bay-yokohama spots/blue-front-shibaura-tower-s \
  spots/quays-pacific-grill spots/garden-house-kamakura spots/ristorante-ao-zushi-marina \
  spots/cicada-aoyama spots/joel-robuchon-ebisu spots/koffee-mameya-kakeru \
  seo-spot-spot_219.html seo-spot-spot_459.html seo-spot-spot_460.html seo-spot-spot_461.html \
  seo-spot-spot_462.html seo-spot-spot_463.html seo-spot-spot_464.html seo-spot-spot_465.html \
  seo-spot-spot_466.html seo-spot-spot_467.html seo-spot-spot_468.html seo-spot-spot_469.html \
  CHANGELOG_v20_12_3.md HANDOFF_v20_12_3.md APPLY_v20_12_3.md \
  test_v20_12_2_spots_and_audit.js test_v20_12_3_seo_affiliate_similar.js apply_update.sh

if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

git commit -m "Add SEO affiliate routes and similar spots"
git push origin main
