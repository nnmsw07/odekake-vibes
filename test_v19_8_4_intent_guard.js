const assert=require('assert');
const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const R=require('./recommender.js');
const P=require('./plans.js');

const dayResort=seed.spots.find(s=>s.name==='龍宮城スパホテル三日月');
assert(dayResort,'龍宮城スパホテル三日月 missing');
assert.strictEqual(Boolean(dayResort.overnight),false);
assert.notStrictEqual(P.categoryKind(dayResort),'stay','day-use resort must not be classified as stay');
const fakeRec={recommendations:[{spot_id:dayResort.spot_id,slot:'best_match',slot_label:'いちばんハマる',scores:{overall:90},why:[]}]};
const dayCtx={selectedVibes:['extraordinary'],audience:'family',childAgeMonths:18,weather:'any',availableMinutes:480,maxTravelMinutes:null,allowOvernight:false};
const dayPlan=P.buildPlans(seed,fakeRec,dayCtx,{displayMinutes:480})[0];
assert(dayPlan,'day-use resort plan should build');
assert(!/泊まる/.test(dayPlan.title),'day-trip plan title must not imply staying overnight');
assert.notStrictEqual(dayPlan.type,'overnight');

const shoppingCtx={selectedVibes:['shopping'],audience:'family',childAgeMonths:18,weather:'any',availableMinutes:480,maxTravelMinutes:null,allowOvernight:false};
const shopping=R.recommend(seed,shoppingCtx);
assert(shopping.recommendations.length>0,'shopping should return results');
assert(!shopping.recommendations.some(x=>/ピューロランド|八景島/.test(x.name)),'theme parks must not become primary shopping recommendations');
for(const x of shopping.recommendations){
  const s=seed.spots.find(z=>z.spot_id===x.spot_id);
  assert(R.shoppingIntentEligible(s),`shopping result should pass shopping intent gate: ${x.name}`);
}
console.log('V19.8.4 PASS: day-use resort copy guard + shopping intent gate');
