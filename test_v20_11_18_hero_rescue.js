const fs=require('fs');
const assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));

// Every local static Hero fallback referenced by a spot must physically exist.
for(const s of seed.spots){
  const url=s.hero_image?.url;
  if(!url || /^https?:/.test(url)) continue;
  assert.ok(fs.existsSync(url),`${s.spot_id} ${s.name}: missing local hero ${url}`);
  assert.ok(fs.statSync(url).size>1000,`${s.spot_id} ${s.name}: hero asset is unexpectedly small`);
}

assert.equal(byId.spot_447.media_strategy.google_places.query,'ヒルトン東京');
assert.equal(byId.spot_447.media_strategy.google_places.photo_index_override,1);
for(const id of ['spot_447','spot_448','spot_449','spot_454','spot_457']){
  assert.equal(byId[id].hero_image.url,'images/ai/terrace-evening-generic.webp',`${id} safe terrace fallback`);
}
assert.equal(byId.spot_453.hero_image.url,'images/ai/culture-interior.jpg');

const app=fs.readFileSync('app.js','utf8');
assert.ok(app.includes('function handleStaticHeroError(img)'), 'static Hero error handler missing');
assert.ok(app.includes("img.style.visibility='hidden'"), 'broken static image should be hidden, not removed');
assert.ok(app.includes("img=document.createElement('img')"), 'Places rescue must recreate a missing img element');
assert.ok(app.includes("node.classList.remove('image-fallback')"), 'successful Places photo must clear fallback state');

const media=fs.readFileSync('media.js','utf8');
assert.ok(media.includes("u.searchParams.set('allowLowMatch','1')"), 'audited photo override must be allowed through low-name-match guard');
const worker=fs.readFileSync('worker/worker.js','utf8');
assert.ok(worker.includes("const allowLowMatch=url.searchParams.get('allowLowMatch')==='1' && Number.isInteger(photoIndex)"), 'worker low-match override guard missing');
assert.ok(worker.includes("confidence==='low' && !allowLowMatch"), 'worker should only bypass low match for an explicit indexed photo');

const home=fs.readFileSync('index.html','utf8');
assert.ok(home.includes('media.js?v=27&amp;h=211118'), 'media.js cache bust missing');
assert.ok(home.includes('app.js?v=2091&amp;h=211118'), 'app.js cache bust missing');
assert.ok(home.includes('styles.css?v=2110&amp;h=211118'), 'styles cache bust missing');

console.log('v20.11.18 Hero rescue checks passed');
