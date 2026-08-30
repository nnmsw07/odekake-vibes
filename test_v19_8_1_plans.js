const assert=require('assert');
const fs=require('fs');
const path=require('path');
const R=require('./recommender.js');
const P=require('./plans.js');
const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));

// Selected time is the plan promise, not the primary spot's raw stay estimate.
assert.equal(P.requestedDurationLabel(90),'1〜2時間');
assert.equal(P.requestedDurationLabel(180),'半日くらい');
assert.equal(P.requestedDurationLabel(360),'たっぷり半日');
assert.equal(P.requestedDurationLabel(480),'1日プラン');

const ctx={selectedVibes:['culture','creative'],audience:'partner',weather:'any',availableMinutes:180,allowOvernight:false,currentDate:'2026-08-30T12:00:00+09:00'};
const rec=R.recommend(seed,ctx);
const plans=P.buildPlans(seed,rec,ctx,{displayMinutes:180});
assert.equal(plans.length,3);
assert.ok(plans.every(p=>p.duration_label==='半日くらい'));
assert.ok(plans.every(p=>p.type==='overnight'||p.estimated_minutes>=P.minCoverageMinutes(180)));
assert.ok(plans.every(p=>!p.title.includes('外の時間を長くする')));
assert.ok(plans.every(p=>!p.title.includes('手を動かす時間をつくる')));

// A short primary with no usable companion must be replaced for a half-day request.
const miniSeed={spots:[
 {spot_id:'short',name:'小さな植物室',category_primary:'garden',categories:['nature'],city:'A市',address:'A市',stay_minutes_seed:90,vibes_seed:{culture:70,creative:70},experience_seed:{},audience_fit:{partner:90}},
 {spot_id:'long',name:'大きな美術館',category_primary:'museum',categories:['culture'],city:'B市',address:'B市',stay_minutes_seed:150,vibes_seed:{culture:85,creative:75},experience_seed:{},audience_fit:{partner:90}}
]};
const miniRec={recommendations:[{spot_id:'short',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:95},why:[]}]};
const miniPlan=P.buildPlans(miniSeed,miniRec,ctx,{displayMinutes:180})[0];
assert.ok(miniPlan);
assert.equal(miniPlan.primary_spot_id,'long');
assert.equal(miniPlan.duration_label,'半日くらい');
assert.ok(miniPlan.estimated_minutes>=P.minCoverageMinutes(180));

// Short-time requests may still return a single compact stop.
const shortCtx={...ctx,availableMinutes:90};
const shortPlan=P.buildPlans(miniSeed,miniRec,shortCtx,{displayMinutes:90})[0];
assert.ok(shortPlan);
assert.equal(shortPlan.primary_spot_id,'short');
assert.equal(shortPlan.duration_label,'1〜2時間');

console.log('V19.8.1 PLANS PASS: requested-time coverage + natural generic copy');
