const assert = require('assert');
const fs = require('fs');
const path = require('path');
const R = require('./recommender.js');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));

assert.equal(seed.spots.length,286);

let r = R.recommend(seed,{selectedVibes:['cool','relax'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.ok(r.recommendations[0].scores.vibe >= 70);
assert.equal(r.recommendations.length,3);

// New nature/water data should meaningfully enter the ranking.
r = R.recommend(seed,{selectedVibes:['nature','waterside','extraordinary'],childAgeMonths:15,weather:'hot',availableMinutes:360});
assert.ok(r.recommendations[0].scores.vibe >= 70);
assert.ok(r.recommendations.some(x => x.scores.vibe >= 70));

r = R.recommend(seed,{selectedVibes:['culture','relax'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.ok(r.recommendations[0].scores.vibe >= 70); // expanded culture/relax dataset

// Hard age constraint: JAL SKY MUSEUM must be excluded for a 1-year-old.
r = R.recommend(seed,{selectedVibes:['culture','extraordinary'],childAgeMonths:15,weather:'any',availableMinutes:240});
assert.ok(!r.recommendations.some(x => x.spot_id === 'spot_031'));
assert.ok(r.excluded.some(x => x.spot_id === 'spot_031'));

// New animals data should improve coverage.
r = R.recommend(seed,{selectedVibes:['animals','cool'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.ok(['spot_109','spot_051','spot_052'].includes(r.recommendations[0].spot_id)); // すみだ / えのすい / カワスイ
assert.ok(r.recommendations.some(x => ['spot_109','spot_051','spot_052'].includes(x.spot_id))); // animals coverage

// New active/nature data should surface Aikawa Park.
r = R.recommend(seed,{selectedVibes:['active','nature'],childAgeMonths:15,weather:'clear',availableMinutes:240});
assert.ok(r.recommendations[0].scores.vibe >= 70);

// Buzz should remain data only, not override recommendation ranking.
const snoopy = seed.spots.find(s=>s.spot_id==='spot_036');
assert.ok(snoopy.buzz.score >= 90);
r = R.recommend(seed,{selectedVibes:['nature','relax'],childAgeMonths:15,weather:'clear',availableMinutes:180});
assert.notEqual(r.recommendations[0].spot_id,'spot_036');

// Temporary closure hard filter: 横須賀美術館 is unavailable through Sep 4, 2026.
r = R.recommend(seed,{selectedVibes:['culture','relax'],childAgeMonths:15,currentDate:'2026-08-22T12:00:00+09:00'});
assert.ok(r.excluded.some(x => x.spot_id === 'spot_053'));
r = R.recommend(seed,{selectedVibes:['culture','relax'],childAgeMonths:15,currentDate:'2026-09-05T12:00:00+09:00'});
assert.ok(!r.excluded.some(x => x.spot_id === 'spot_053'));

console.log('PASS: 286 spots + recommendation / age / buzz / temporary-closure scenarios');
