const assert=require('assert');
const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const P=require('./plans.js');
const F=require('./featured.js');

assert(P.CURATED_PLANS.length>=18,'curated plan library should be expanded');

const familyCtx={audience:'family',selectedVibes:['culture','food'],childAgeMonths:18,weather:'any',availableMinutes:480,allowOvernight:false};
const yokohama=P.buildPlans(seed,{recommendations:[{spot_id:'spot_101',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:96},why:[]}]},familyCtx,{displayMinutes:480})[0];
assert(yokohama?.curated,'Yokohama family plan should use editorial blueprint');
assert.deepStrictEqual(yokohama.spot_ids,['spot_101','spot_007','spot_259']);
assert.deepStrictEqual(yokohama.steps.map(x=>x.label),['大人も楽しむ','子どもの時間','ひと休み・ごはん']);

const shoppingCtx={audience:'family',selectedVibes:['shopping','food'],childAgeMonths:18,weather:'any',availableMinutes:480,allowOvernight:false};
const shopping=P.buildPlans(seed,{recommendations:[{spot_id:'spot_107',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:95},why:[]}]},shoppingCtx,{displayMinutes:480})[0];
assert(shopping?.curated,'shopping should still support non-shopping companions inside a plan');
assert(shopping.spot_ids.includes('spot_007'),'shopping plan should be able to add a child stop');
assert(shopping.spot_ids.includes('spot_259'),'shopping plan should be able to add a food stop');

const summer=new Date('2026-08-30T12:00:00+09:00'),winter=new Date('2026-12-15T12:00:00+09:00');
const pool=seed.spots.find(s=>/プール/.test(s.name)&&!s.overnight);
assert(pool,'pool fixture missing');
assert(F.seasonalFit(pool,summer)>F.seasonalFit(pool,winter),'pool should receive a summer seasonal boost');
const featured=F.selectFeaturedSpots(seed,summer,6);
assert.equal(featured.length,6,'featured section should return six spots');
const familyDominant=featured.filter(s=>F.featureBucket(s)==='family');
assert(familyDominant.length<=2,'featured section should cap family-dominant spots');
assert(featured.some(s=>F.featureBucket(s)!=='family'),'featured section should include a non-family lens');
assert.equal(new Set(featured.map(s=>s.spot_id)).size,featured.length,'featured spots must be unique');

const idx=fs.readFileSync('index.html','utf8');
assert(idx.includes('NOW ON KIBUN'));
assert(idx.includes('いま、気になる。'));
assert(idx.includes('featured.js?v=1985'));
console.log(`V19.8.5 PASS: ${P.CURATED_PLANS.length} curated plans + intent-neutral companions + seasonal diversified NOW ON KIBUN`);
