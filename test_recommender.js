const assert = require('assert');
const fs = require('fs');
const path = require('path');
const R = require('./recommender.js');
const seed = JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));

let r = R.recommend(seed,{selectedVibes:['cool','relax'],childAgeMonths:15,weather:'hot',availableMinutes:180});
assert.equal(r.recommendations[0].spot_id,'spot_005');
assert.equal(r.recommendations.length,3);

r = R.recommend(seed,{selectedVibes:['nature','waterside','extraordinary'],childAgeMonths:15,weather:'hot',availableMinutes:360});
assert.equal(r.recommendations[0].spot_id,'spot_010');

r = R.recommend(seed,{selectedVibes:['cross_cultural'],childAgeMonths:15,weather:'any',availableMinutes:180});
assert.equal(r.recommendations.length,0);
assert.ok(r.coverage_warning);

console.log('PASS: 3 recommendation scenarios');
