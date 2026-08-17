const assert = require('assert');
const fs = require('fs');
const path = require('path');
const R = require('./recommender.js');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));

assert.equal(seed.spots.length,40);

let r = R.recommend(seed,{selectedVibes:['cool','relax'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.equal(r.recommendations[0].spot_id,'spot_005');
assert.equal(r.recommendations.length,3);

r = R.recommend(seed,{selectedVibes:['nature','waterside','extraordinary'],childAgeMonths:15,weather:'hot',availableMinutes:360});
assert.equal(r.recommendations[0].spot_id,'spot_010');

r = R.recommend(seed,{selectedVibes:['culture','relax'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.equal(r.recommendations[0].spot_id,'spot_035');

// Hard age constraint: JAL SKY MUSEUM must be excluded for a 1-year-old.
r = R.recommend(seed,{selectedVibes:['culture','extraordinary'],childAgeMonths:15,weather:'any',availableMinutes:240});
assert.ok(!r.recommendations.some(x => x.spot_id === 'spot_031'));
assert.ok(r.excluded.some(x => x.spot_id === 'spot_031'));

// Buzz should be data only, not override recommendation ranking.
const snoopy = seed.spots.find(s=>s.spot_id==='spot_036');
assert.ok(snoopy.buzz.score >= 90);
r = R.recommend(seed,{selectedVibes:['nature','relax'],childAgeMonths:15,weather:'clear',availableMinutes:180});
assert.notEqual(r.recommendations[0].spot_id,'spot_036');

console.log('PASS: 40 spots + 5 recommendation/data scenarios');
