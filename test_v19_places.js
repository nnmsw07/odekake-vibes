const assert=require('assert');
const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const config=fs.readFileSync('config.js','utf8');
const worker=fs.readFileSync('worker/worker.js','utf8');

assert.equal(seed.spots.length,241,'V19.3 must contain 241 spots');
const added=seed.spots.filter(s=>/^spot_(17[5-9]|18[0-9]|19[0-9]|20[0-9]|21[0-1])$/.test(s.spot_id));
assert.equal(added.length,37,'V19.3 must contain 37 newly added spots');

for(const s of added){
  const gp=s.media_strategy?.google_places;
  assert.ok(gp,`${s.spot_id} ${s.name}: google_places strategy missing`);
  assert.ok(String(gp.query||'').trim(),`${s.spot_id} ${s.name}: Google Places query missing`);
  assert.notEqual(gp.status,'disabled',`${s.spot_id} ${s.name}: Google Places unexpectedly disabled`);
  assert.equal(s.media_strategy?.current_provider,'ai',`${s.spot_id} ${s.name}: AI must remain fallback provider`);
  assert.equal(s.hero_image?.type,'ai',`${s.spot_id} ${s.name}: fallback hero must remain AI`);
}

assert.match(config,/placePhotoEnabled:\s*true/,'Google Places Hero must be enabled');
assert.match(config,/placePhotoMode:\s*"prefer_places"/,'Google Places must be preferred');
assert.match(config,/apiBaseUrl:\s*"https:\/\/kibun-api\.misawa-nana7\.workers\.dev"/,'Production Worker URL missing');
assert.match(config,/placePhotoApiUrl\s*=.*\/place-photo/,'place-photo URL derivation missing');
assert.match(config,/placePhotosApiUrl\s*=.*\/place-photos/,'place-photos URL derivation missing');

for(const endpoint of ['/health','/place-photo','/place-photos','/travel-times']){
  assert.ok(worker.includes(`'${endpoint}'`) || worker.includes(`"${endpoint}"`) || worker.includes(endpoint),`Worker endpoint missing: ${endpoint}`);
}
assert.ok(worker.includes('GOOGLE_MAPS_API_KEY'),'Worker secret binding missing');
assert.ok(worker.includes('Places API') || worker.includes('places.googleapis.com'),'Places API call missing');

console.log('V19.3 Places PASS: 37 new spots -> Google Places preferred, AI fallback preserved, Worker wiring present');
