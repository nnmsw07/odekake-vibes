const assert=require('assert');
const fs=require('fs');
const path=require('path');
const P=require('./plans.js');
const seed=JSON.parse(fs.readFileSync(path.join(__dirname,'seed.json'),'utf8'));

// Half-day promise wins over "泊まりもあり": no hotel plan should leak into 180 minutes.
const hotelRec={recommendations:[{spot_id:'spot_212',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:98},why:[]}]};
const halfCtx={selectedVibes:['relax'],audience:'family',childAgeMonths:18,weather:'any',availableMinutes:1080,allowOvernight:true};
const halfPlans=P.buildPlans(seed,hotelRec,halfCtx,{displayMinutes:180});
assert.ok(halfPlans.every(p=>p.type!=='overnight'));

// Area matching is ward-level for Yokohama, so distant wards are not treated as one local cluster.
assert.equal(P.areaKey({city:'横浜市中区',address:'神奈川県横浜市中区山下町'}),'横浜市中区');
assert.equal(P.areaKey({city:'横浜市旭区',address:'神奈川県横浜市旭区大池町'}),'横浜市旭区');

// Same-kind park hopping is intentionally weak.
const parkA={category_primary:'park',categories:['nature']};
const parkB={category_primary:'large_park',categories:['nature']};
assert.ok(P.complementScore(parkA,parkB)<30);

// A long family plan should prefer kid/adult balance first, then a meal/rest stop.
const miniSeed={spots:[
 {spot_id:'adult',name:'大人も楽しいギャラリー',category_primary:'gallery',categories:['culture'],city:'港区',address:'東京都港区',stay_minutes_seed:120,vibes_seed:{culture:95,scenic:80},experience_seed:{baby_fit:35,toddler_fit:45,hands_on:10,physical_activity:10,parent_rest:85,food_experience:20},audience_fit:{family:76},adult_enjoyment_seed:98},
 {spot_id:'kid',name:'子どもが夢中のプレイパーク',category_primary:'indoor_play',categories:['play'],city:'港区',address:'東京都港区',stay_minutes_seed:120,vibes_seed:{active:95},experience_seed:{baby_fit:98,toddler_fit:100,hands_on:95,physical_activity:85,parent_rest:55,food_experience:10},audience_fit:{family:99},adult_enjoyment_seed:62},
 {spot_id:'cafe',name:'親子で休めるカフェ',category_primary:'cafe',categories:['food','cafe'],city:'港区',address:'東京都港区',stay_minutes_seed:60,vibes_seed:{food:95,relax:90},experience_seed:{baby_fit:85,toddler_fit:85,hands_on:5,physical_activity:0,parent_rest:98,food_experience:100},audience_fit:{family:95},adult_enjoyment_seed:92}
]};
const rec={recommendations:[{spot_id:'adult',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:94},why:[]}]};
const ctx={selectedVibes:[],audience:'family',childAgeMonths:18,weather:'any',availableMinutes:480,allowOvernight:false};
const p=P.buildPlans(miniSeed,rec,ctx,{displayMinutes:480})[0];
assert.deepEqual(p.spot_ids,['adult','kid','cafe']);
assert.equal(p.steps[1].label,'子どもの時間');
assert.equal(p.steps[2].label,'ひと休み・ごはん');

const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
assert.ok(app.includes("stayRequested&&selectedMinutes>=480"));
assert.ok(index.includes('短時間・半日は日帰りで提案します'));
console.log('V19.8.2 PLAN QUALITY PASS: no half-day hotel leak + ward locality + no park hopping + family balance + meal stop');
