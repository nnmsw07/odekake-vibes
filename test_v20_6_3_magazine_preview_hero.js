const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');
const cards=[
  ['magazine/yokohama-family-cafe/','spot_287','assets/editorial/cafe.webp'],
  ['magazine/yokohama-small-holiday/','spot_101','assets/editorial/scenic.webp'],
  ['magazine/tokyo-rainy-family/','spot_286','assets/editorial/relax.webp'],
  ['magazine/art-and-cafe/','spot_152','assets/editorial/culture.webp'],
];
for(const [href,id,fallback] of cards){
  assert.ok(html.includes(`href="${href}"`),`missing article ${href}`);
  assert.ok(html.includes(`data-media-spot="${id}"`),`missing representative Hero ${id}`);
  assert.ok(html.includes(`src="${fallback}"`),`missing fallback ${fallback}`);
}
assert.ok(html.includes('class="magazine-preview-media image-shell"'),'preview media shell missing');
assert.ok(html.includes('<span class="image-badge">イメージ</span>'),'AI fallback label missing');
assert.ok(css.includes('.magazine-preview-media'),'preview media CSS missing');
assert.ok(css.includes('aspect-ratio:16/10'),'mobile image ratio missing');
assert.ok(app.includes("enhancePlacePhotos($('magazinePreview'))"),'Google Places enhancement not wired');
console.log('v20.6.3 magazine preview hero tests passed');
