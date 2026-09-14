const fs=require('fs');
const assert=require('assert');
const {seedPhotoOverrides,buildMergedExport,effectivePhotoIndex}=require('./hero-audit-guard.js');

const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const config=fs.readFileSync('config.js','utf8');
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));

assert.equal(byId.spot_099.name,'グランツリー武蔵小杉');
assert.equal(byId.spot_099.media_strategy.google_places.photo_index_override,4,'Grand Tree Hero pin regressed');
assert.equal(byId.spot_128.name,'サンシャインシティ');
assert.equal(byId.spot_128.media_strategy.google_places.photo_index_override,1,'Sunshine City Hero pin regressed');

const seedPins=seedPhotoOverrides(seed);
assert.equal(seedPins.spot_099,4);
assert.equal(seedPins.spot_128,1);
assert.ok(Object.keys(seedPins).length>200,'Expected the full audited seed pin set');

assert.deepEqual(effectivePhotoIndex(byId.spot_099,{}),{index:4,source:'seed'});
assert.deepEqual(effectivePhotoIndex(byId.spot_099,{spot_099:7}),{index:7,source:'local'});

const merged=buildMergedExport(seed,{spot_099:7},{spot_099:{query:'Grand Tree test',place_id:'test-place',matched_name:'',matched_address:'',use_address:true}});
assert.equal(merged.photo_index_overrides.spot_099,7,'Local audit choice must win over seed pin');
assert.equal(merged.photo_index_overrides.spot_128,1,'Existing seed pin must survive export');
assert.equal(merged.place_overrides.spot_099.place_id,'test-place');
assert.ok(config.includes('/hero-audit-guard.js?v=201911'),'Hero audit guard is not loaded by config.js');

console.log(`Hero audit guard OK: ${Object.keys(seedPins).length} seed photo pins preserved; Grand Tree #4 / Sunshine City #1 protected.`);
