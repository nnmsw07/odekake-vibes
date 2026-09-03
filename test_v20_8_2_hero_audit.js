const fs=require('fs');
const assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const audit=JSON.parse(fs.readFileSync('HERO_OVERRIDES_v20_8_2.json','utf8'));
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));
assert.ok(['0.20.8.2','0.20.10.0'].includes(seed.metadata.version));
assert.ok(seed.spots.length>=431);
assert.strictEqual(Object.keys(audit.photo_index_overrides).length,167);
assert.strictEqual(Object.keys(audit.place_overrides).length,10);
for(const [id,idx] of Object.entries(audit.photo_index_overrides)){
  assert.ok(byId[id],`missing ${id}`);
  assert.strictEqual(byId[id].media_strategy.google_places.photo_index_override,idx,`${id} photo index`);
}
for(const [id,p] of Object.entries(audit.place_overrides)){
  const s=byId[id]; assert.ok(s,`missing ${id}`);
  const gp=s.media_strategy.google_places;
  assert.strictEqual(gp.query,p.query,`${id} query`);
  assert.strictEqual(gp.place_id,p.place_id,`${id} place_id`);
  assert.strictEqual(gp.status,'resolved_manual',`${id} status`);
  assert.strictEqual(gp.matched_name,p.matched_name,`${id} matched_name`);
  assert.strictEqual(gp.matched_address,p.matched_address,`${id} matched_address`);
  assert.strictEqual(gp.use_address,p.use_address,`${id} use_address`);
  assert.strictEqual(s.routing.google_place_id,p.place_id,`${id} routing place id`);
}
const data=fs.readFileSync('data.js','utf8');
assert.ok(data.includes('\"version\": \"0.20.8.2\"')||data.includes('\"version\": \"0.20.10.0\"'));
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('data.js?v=2082')||index.includes('data.js?v=20100'));
console.log('v20.8.2 Hero audit checks: OK');
