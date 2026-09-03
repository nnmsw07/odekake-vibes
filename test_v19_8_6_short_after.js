const assert=require('assert');
const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const P=require('./plans.js');
const ctx={audience:'family',selectedVibes:['culture'],childAgeMonths:18,weather:'any',availableMinutes:180,allowOvernight:false};
const plan=P.buildPlans(seed,{recommendations:[{spot_id:'spot_101',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:95},why:[]}]},ctx,{displayMinutes:180})[0];
assert(plan,'short plan should build');
assert(plan.after_suggestion,'2-3h plan should suggest an optional cafe/restaurant when available');
const after=seed.spots.find(s=>s.spot_id===plan.after_suggestion.spot_id);
assert(after,'after suggestion spot missing');
assert(P.isMealSpot(after),'after suggestion must be a cafe/restaurant style meal spot');
const core=plan.spot_ids.map(id=>seed.spots.find(s=>s.spot_id===id));
assert(core.every(s=>!P.isMealSpot(s)),'fixture core should not already include food');
assert(P.samePlanArea(core[core.length-1],after),'after suggestion should stay in the same local plan area');
assert(!plan.spot_ids.includes(after.spot_id),'optional after suggestion must not inflate the core plan duration');

const long=P.buildPlans(seed,{recommendations:[{spot_id:'spot_101',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:95},why:[]}]},{...ctx,availableMinutes:480},{displayMinutes:480})[0];
assert(!long.after_suggestion,'full-day plan should not get the short-plan AFTER module');

const app=fs.readFileSync('app.js','utf8'),idx=fs.readFileSync('index.html','utf8');
assert(app.includes('帰る前に、もう少し。'));
assert(app.includes('plan_after_spot_open'));
assert(/plans\.js\?v=(?:1986|1990|2000|2030|2033|2040|2050|2061|2063|2070|2080|2081|2083|2090|2091|20100|20101)/.test(idx));
assert(/app\.js\?v=(?:1986|1990|2000|2030|2033|2040|2050|2061|2063|2070|2080|2081|2083|2090|2091|20100|20101)/.test(idx));
assert(/styles\.css\?v=(?:1986|1990|2000|2030|2033|2040|2050|2061|2063|2070|2080|2081|2083|2090|2091|20100|20101)/.test(idx));
console.log(`V19.8.6 PASS: optional AFTER cafe suggestion -> ${after.name}`);
