const fs=require('fs'),assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const exportData=JSON.parse(fs.readFileSync('HERO_OVERRIDES_v20_11_17.json','utf8'));
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));
assert.equal(Object.keys(exportData.photo_index_overrides).length,189);
assert.equal(Object.keys(exportData.place_overrides).length,16);
for(const [id,idx] of Object.entries(exportData.photo_index_overrides)){
  assert(byId[id],`${id} missing`); assert(idx>=0&&idx<=9,`${id} bad photo index`);
  assert.equal(byId[id].media_strategy.google_places.photo_index_override,idx,`${id} photo override`);
}
for(const [id,p] of Object.entries(exportData.place_overrides)){
  const s=byId[id],gp=s.media_strategy.google_places;
  assert(s,`${id} missing`); assert.equal(gp.place_id,p.place_id,`${id} place`);
  assert.equal(gp.query,p.query,`${id} query`); assert.equal(gp.status,'resolved_manual',`${id} status`);
  assert.equal(gp.use_address,p.use_address,`${id} use_address`); assert.equal(s.routing.google_place_id,p.place_id,`${id} routing place`);
}
assert.equal(byId.spot_447.media_strategy.google_places.photo_index_override,1);
assert.equal(byId.spot_448.media_strategy.google_places.photo_index_override,5);
assert.equal(byId.spot_449.media_strategy.google_places.photo_index_override,8);
assert.equal(byId.spot_453.media_strategy.google_places.photo_index_override,2);
assert.equal(byId.spot_455.media_strategy.google_places.photo_index_override,8);
assert.equal(byId.spot_456.media_strategy.google_places.photo_index_override,4);
assert.equal(byId.spot_458.media_strategy.google_places.photo_index_override,0);
assert.equal(byId.spot_448.media_strategy.google_places.place_id,'ChIJKf3d-3aLGGAR1zL6Rw3pDCQ');
assert.equal(byId.spot_449.media_strategy.google_places.place_id,'ChIJpf4-TltcGGARDViYb-z1wbc');
const app=fs.readFileSync('app.js','utf8');
assert(app.includes('function preloadHeroImage'));
assert(app.includes('await preloadHeroImage(p.photoUri)'));
assert(app.includes("node.querySelector('.gmp-attribution.compact')?.remove()"));
assert(app.includes('fallbackSrc'));
assert(app.includes('max-height:30px'));
const css=fs.readFileSync('styles.css','utf8');
assert(css.includes('v20.11.17: Places photo failure/Android text autosizing guard.'));
assert(css.includes('.image-shell:not(.google-places-photo)>.gmp-attribution.compact'));
const mag=fs.readFileSync('magazine/index.html','utf8');
const article=fs.readFileSync('magazine/terrace-after-sunset/index.html','utf8');
assert(mag.includes('assets/editorial/terrace-after-sunset.webp'));
assert(article.includes('assets/editorial/terrace-after-sunset.webp'));
assert(!article.includes('data-hero-spot="spot_449"'));
assert(fs.existsSync('assets/editorial/terrace-after-sunset.webp'));
const mm=fs.readFileSync('magazine/magazine-media.js','utf8');
assert(mm.includes('"photoIndex":8'));
assert(mm.includes('"photoIndex":0'));
const index=fs.readFileSync('index.html','utf8');
for(const name of ['styles.css?v=2110&amp;h=211117','data.js?v=20110&amp;h=211117','app.js?v=2091&amp;h=211117']) assert(index.includes(name),`${name} cache bust missing`);
console.log('v20.11.17 hero hardening tests passed');
