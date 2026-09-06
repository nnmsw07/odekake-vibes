const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const mag=fs.readFileSync('magazine/index.html','utf8');
const data=fs.readFileSync('data.js','utf8');
assert(app.includes('heroAuditSpotSearch'),'Hero Audit search input missing');
assert(app.includes('hero-audit-search-count'),'Hero Audit search count missing');
assert(css.includes('input[type="search"]'),'Hero Audit search styles missing');
for(const src of ['assets/editorial/baby-first-outing.webp','assets/editorial/green-breathing-room.webp','assets/editorial/night-starts-after-five.webp','assets/editorial/hotel-without-staying.webp','assets/editorial/parents-eat-well.webp']){
  assert(index.includes(src) || mag.includes(src.replace('assets/','../assets/')),'preview image ref missing '+src);
  assert(fs.existsSync(src),'asset missing '+src);
}
for(const name of ['スターバックス リザーブ® ロースタリー 東京','Cafe La Bohème 白金','小笠原伯爵邸','RAKU SPA BAY 横浜','BLUE FRONT SHIBAURA TOWER S']){
  assert(data.includes(name),'missing new spot '+name);
}
console.log('v20.12.2 spots + audit search: PASS');
