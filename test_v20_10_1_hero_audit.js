const fs=require('fs'),vm=require('vm'),assert=require('assert');
const audit=JSON.parse(fs.readFileSync('HERO_OVERRIDES_v20_10_1.json','utf8'));
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
assert.ok(['0.20.10.1','0.20.11.0'].includes(seed.metadata.version));
assert.ok(seed.spots.length>=446);
assert.equal(Object.keys(audit.photo_index_overrides).length,182);
assert.equal(Object.keys(audit.place_overrides).length,14);
for(const [id,idx] of Object.entries(audit.photo_index_overrides)){
  assert(idx>=0&&idx<=9,`${id} bad index ${idx}`);
  const s=seed.spots.find(x=>x.spot_id===id); assert(s,`${id} missing`);
  assert.equal(s.media_strategy.google_places.photo_index_override,idx,`${id} photo index`);
}
for(const [id,p] of Object.entries(audit.place_overrides)){
  const s=seed.spots.find(x=>x.spot_id===id); assert(s,`${id} missing`);
  assert.equal(s.routing.google_place_id,p.place_id,`${id} routing place id`);
  assert.equal(s.media_strategy.google_places.place_id,p.place_id,`${id} media place id`);
  assert.equal(s.media_strategy.google_places.query,p.query,`${id} query`);
  assert.equal(s.media_strategy.google_places.use_address,p.use_address,`${id} use_address`);
}
assert.equal(audit.photo_index_overrides.spot_302,0);
assert.equal(audit.photo_index_overrides.spot_378,4);
assert.equal(audit.photo_index_overrides.spot_431,1);
for(const id of ['spot_432','spot_433','spot_434','spot_435','spot_436','spot_437','spot_438','spot_439','spot_440','spot_441','spot_442','spot_443','spot_444','spot_445','spot_446']) assert(id in audit.photo_index_overrides);
for(const id of ['spot_320','spot_432','spot_434','spot_441']) assert(id in audit.place_overrides);
const index=fs.readFileSync('index.html','utf8'); assert(/data.js\?v=(?:20101|20110)/.test(index));
console.log('v20.10.1 hero audit refresh tests passed');
