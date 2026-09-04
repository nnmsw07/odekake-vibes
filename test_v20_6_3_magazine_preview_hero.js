const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
const app=fs.readFileSync('app.js','utf8');
const cards=[
  ['magazine/terrace-after-sunset/','spot_449'],
  ['magazine/night-starts-after-five/','spot_450'],
  ['magazine/hotel-without-staying/','spot_452'],
  ['magazine/parents-eat-well/','spot_454'],
  ['magazine/seasonal-harvest/','spot_458'],
];
for(const [href,id] of cards){assert.ok(html.includes(`href="${href}"`),`missing article ${href}`);assert.ok(html.includes(`data-media-spot="${id}"`),`missing representative Hero ${id}`);}
assert.ok(html.includes('class="magazine-preview-media image-shell"'),'preview media shell missing');
assert.ok(css.includes('.magazine-preview-media'),'preview media CSS missing');
assert.ok(css.includes('aspect-ratio:16/10'),'mobile image ratio missing');
assert.ok(app.includes("enhancePlacePhotos($('magazinePreview'))"),'Google Places enhancement not wired');
console.log('magazine preview hero tests passed');
