const fs = require('fs');
const assert = require('assert');
const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
const audit = JSON.parse(fs.readFileSync('HERO_OVERRIDES_v19_7_3.json','utf8'));
const byId = Object.fromEntries(seed.spots.map(s => [s.spot_id, s]));
assert.equal(seed.metadata.version, '0.19.7.3');
assert.equal(seed.spots.length, 256);
assert.equal(Object.keys(audit.photo_index_overrides).length, 29);
assert.equal(Object.keys(audit.place_overrides).length, 4);
for (const [id, idx] of Object.entries(audit.photo_index_overrides)) {
  assert.equal(byId[id].media_strategy.google_places.photo_index_override, idx, id);
}
for (const [id, p] of Object.entries(audit.place_overrides)) {
  const gp = byId[id].media_strategy.google_places;
  assert.equal(gp.place_id, p.place_id, id);
  assert.equal(gp.status, 'resolved_manual', id);
  assert.equal(gp.matched_name, p.matched_name, id);
  assert.equal(gp.matched_address, p.matched_address, id);
  assert.equal(gp.use_address, p.use_address, id);
  assert.equal(byId[id].routing.google_place_id, p.place_id, id);
}
const photoCount = seed.spots.filter(s => Number.isInteger(s?.media_strategy?.google_places?.photo_index_override)).length;
const placeIdCount = seed.spots.filter(s => !!s?.media_strategy?.google_places?.place_id).length;
assert.equal(photoCount, 182);
assert.equal(placeIdCount, 45);
console.log('V19.7.3 Hero PASS: 29 new photo overrides + 4 manual Place IDs; totals 182 photo overrides / 45 Place IDs');
