const assert=require('assert');
const fs=require('fs');
const path=require('path');
const R=require('./recommender.js');
const P=require('./plans.js');
const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));

// Existing recommendation engine remains the source of the three anchors.
const ctx={selectedVibes:['culture','creative'],audience:'partner',weather:'any',availableMinutes:180,allowOvernight:false,currentDate:'2026-08-30T12:00:00+09:00'};
const rec=R.recommend(seed,ctx);
const plans=P.buildPlans(seed,rec,ctx,{displayMinutes:180});
assert.equal(plans.length,rec.recommendations.length);
assert.equal(plans.length,3);
assert.ok(plans.every(p=>['single','combo','overnight'].includes(p.type)));
assert.ok(plans.every(p=>p.title&&p.lead&&p.duration_label));
assert.ok(plans.every(p=>p.spot_ids.length>=1&&p.spot_ids.length<=2));
assert.ok(plans.every(p=>p.primary_spot_id));

// A destination that can itself fill a half day must stay a one-place plan.
const longRec={recommendations:[{spot_id:'spot_136',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:92},why:[]}]};
const longPlan=P.buildPlans(seed,longRec,ctx,{displayMinutes:180})[0];
assert.equal(longPlan.type,'single');
assert.deepEqual(longPlan.spot_ids,['spot_136']);

// Short stops can be composed when the same local area has a compatible second stop.
const miniSeed={spots:[
 {spot_id:'a',name:'小さなカフェ',category_primary:'cafe',categories:['food'],city:'横浜市中区',address:'横浜市中区',stay_minutes_seed:55,vibes_seed:{},experience_seed:{},audience_fit:{partner:90}},
 {spot_id:'b',name:'小さなギャラリー',category_primary:'gallery',categories:['culture'],city:'横浜市中区',address:'横浜市中区',stay_minutes_seed:70,vibes_seed:{},experience_seed:{},audience_fit:{partner:90}},
 {spot_id:'c',name:'遠い公園',category_primary:'park',categories:['nature'],city:'鎌倉市',address:'鎌倉市',stay_minutes_seed:70,vibes_seed:{},experience_seed:{},audience_fit:{partner:90}}
]};
const miniRec={recommendations:[{spot_id:'a',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:90},why:[]}]};
const miniCtx={selectedVibes:[],audience:'partner',weather:'any',availableMinutes:180,allowOvernight:false,currentDate:'2026-08-30T12:00:00+09:00'};
const miniPlan=P.buildPlans(miniSeed,miniRec,miniCtx,{displayMinutes:180})[0];
assert.equal(miniPlan.type,'combo');
assert.deepEqual(miniPlan.spot_ids,['a','b']);

// Overnight mode can join a daytime destination and a nearby hotel.
const stayCtx={selectedVibes:['relax','extraordinary'],audience:'partner',weather:'any',availableMinutes:1080,allowOvernight:true,currentDate:'2026-08-30T12:00:00+09:00'};
const stayRec=R.recommend(seed,stayCtx);
const stayPlans=P.buildPlans(seed,stayRec,stayCtx,{displayMinutes:480});
assert.ok(stayPlans.some(p=>p.type==='overnight'));
assert.ok(stayPlans.filter(p=>p.type==='overnight').some(p=>p.spot_ids.some(id=>byId[id]?.overnight)));

const index=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
assert.ok(index.includes('TODAY\'S PLANS'));
assert.ok(index.includes('id="planDialog"'));
assert.ok(/plans\.js\?v=(?:198\d|1990|2000|2030|2033|2040)/.test(index));
assert.ok(index.includes('今日の過ごし方を見る'));
assert.ok(app.includes("trackEvent('plan_open'"));
assert.ok(app.includes("trackEvent('plan_spot_open'"));
console.log('V19.8 PLANS PASS: flexible single/combo/overnight day-plan recommendations');
