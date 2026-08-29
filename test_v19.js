const assert=require('assert');
const fs=require('fs');
const R=require('./recommender.js');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
assert.equal(seed.spots.length,211);
for(let i=126;i<=211;i++) assert.ok(seed.spots.some(s=>s.spot_id===`spot_${String(i).padStart(3,'0')}`));
for(const name of [
  'キラナガーデン豊洲','豊洲 千客万来','サンシャインシティ','横浜中華街','PLAY! PARK ERIC CARLE','市原ぞうの国','西武園ゆうえんち','サンリオピューロランド',
  '檜原 森のおもちゃ美術館','UE FANTASIA','魔法の文学館','The Library Lounge','BAR PANORAMA','渋谷区ふれあい植物センター','ワーナー ブラザース スタジオツアー東京','夢の島熱帯植物館','RÊVE DES LUMIÈRES',
  'MAHALO garden terrace','うみかぜ公園','コースカベイサイドストアーズ','大磯ロングビーチ','東京サマーランド','ゆめが丘ソラトス','Mulabo!','絵と言葉のライブラリー ミッカ'
]) assert.ok(seed.spots.some(s=>s.name===name),name);
const mini={vibe_definitions:{shopping:{}},spots:[
 {spot_id:'a',name:'A',category_primary:'mall',recommendation_group:'g',vibes_seed:{shopping:100,extraordinary:90,relax:90},audience_fit:{partner:100},experience_seed:{planning_friction:0,walking_load:0,parent_rest:100,quietness:80,food_experience:80,hands_on:20},adult_enjoyment_seed:100,stay_minutes_seed:60},
 {spot_id:'b',name:'B',category_primary:'museum',recommendation_group:'g',vibes_seed:{shopping:99,extraordinary:100,relax:90},audience_fit:{partner:100},experience_seed:{planning_friction:0,walking_load:0,parent_rest:100,quietness:80,food_experience:80,hands_on:20},adult_enjoyment_seed:100,stay_minutes_seed:60},
 {spot_id:'c',name:'C',category_primary:'street',vibes_seed:{shopping:85,extraordinary:70,relax:90},audience_fit:{partner:90},experience_seed:{planning_friction:0,walking_load:0,parent_rest:90,quietness:70,food_experience:70,hands_on:20},adult_enjoyment_seed:90,stay_minutes_seed:60},
 {spot_id:'d',name:'D',category_primary:'park',vibes_seed:{shopping:75,extraordinary:65,relax:100},audience_fit:{partner:90},experience_seed:{planning_friction:0,walking_load:0,parent_rest:100,quietness:90,food_experience:50,hands_on:20},adult_enjoyment_seed:90,stay_minutes_seed:60}
]};
const rr=R.recommend(mini,{audience:'partner',selectedVibes:['shopping'],weather:'any',availableMinutes:120});
const gids=rr.recommendations.map(x=>{const s=mini.spots.find(y=>y.spot_id===x.spot_id);return s.recommendation_group||s.spot_id;});
assert.equal(new Set(gids).size,gids.length);
const g=R.recommend(seed,{audience:'family',selectedVibes:['culture','extraordinary'],childAgeMonths:24,weather:'any'});
assert.ok(g.excluded.some(x=>x.spot_id==='spot_158'));
console.log('V19.3 PASS: 211 spots + recommendation-group diversity + age hard filter');
