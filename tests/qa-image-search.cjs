'use strict';
// Run from the repository root with: node tests/qa-image-search.cjs
// Fixture-based regression checks. Does not replace live browser or the 492-spot catalogue audit.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const rec=require('../recommender.js');
const planner=require('../plans.js');

function spot(id,name,city,category,vibes,stay=90,more={}){
  return {spot_id:id,name,city,prefecture:'神奈川県',address:city+' 中央1丁目',
    category_primary:category,stay_minutes_seed:stay,
    vibes_seed:vibes,public_copy:'おでかけ先',
    audience_fit:{family:92,partner:85,solo:85},
    experience_seed:{baby_fit:90,planning_friction:20},...more};
}
function run(seed,ctx){
  const recommendations=rec.recommend(seed,ctx);
  return {recommendations,plans:planner.buildPlans(seed,recommendations,ctx,{displayMinutes:ctx.availableMinutes})};
}
const ctx={audience:'family',childAgeMonths:16,selectedVibes:['relax','food'],
  availableMinutes:360,weather:'any',currentDate:'2026-10-22T09:00:00+09:00'};
const seed={vibe_definitions:{relax:{},food:{}},spots:[
  spot('spot_1','のんびりカフェ','横浜市中区','cafe',{relax:95,food:95}),
  spot('spot_2','ゆったりランチ','川崎市高津区','restaurant',{relax:92,food:90})
]};
const sixHours=run(seed,ctx);
assert.equal(sixHours.recommendations.recommendations.length,2);
assert.equal(sixHours.plans.length,2,'never hide real eligible recommendations when no nearby companion exists');
assert(sixHours.plans.every(p=>p.type==='single' && p.partial_coverage===true));
assert(sixHours.plans.every(p=>p.duration_label!=='1日プラン'),'a short single visit must not be labeled as a day plan');
const short=run(seed,{...ctx,availableMinutes:120});
assert.equal(short.plans.length,2);
assert(short.plans.every(p=>!p.partial_coverage));
const noDog=run(seed,{...ctx,audience:'dog'});
assert.equal(noDog.recommendations.recommendations.length,0,'dog eligibility remains a hard filter');
assert.equal(noDog.plans.length,0,'hard-filter zeroes must remain zero');
const unavailable=run({...seed,spots:seed.spots.map(s=>({...s,availability_constraints:{unavailable_until:'2026-12-01'}}))},ctx);
assert.equal(unavailable.plans.length,0,'closed venues remain excluded');

const pairedSeed={...seed,spots:[
  spot('spot_3','山下町の庭園','横浜市中区','garden',{relax:92,food:35}),
  spot('spot_4','山下町のカフェ','横浜市中区','cafe',{relax:89,food:94})
].map(s=>({...s,address:'横浜市中区山下町'}))};
const paired=planner.buildPlans(pairedSeed,{recommendations:[{spot_id:'spot_3',slot:'best_match',slot_label:'いちばんハマる',scores:{overall:88}}]},
  {...ctx,availableMinutes:240},{displayMinutes:240});
assert(paired.some(p=>p.type==='combo'),'keep valid nearby two-stop plans');

const js=read('kibun-images.js');
const context={window:{ODEKAKE_SEED:{spots:[]}},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(js,context,{filename:'kibun-images.js'});
const images=context.window.KibunImages;
assert(images && images.initialAssetForSpot);
let count=0;
for(const [key,items] of Object.entries(images.pools)){
  assert(items.length>0,key+' must have assets');
  for(const url of items){
    assert(url.startsWith('/assets/kibun-images/'),'unexpected image URL: '+url);
    const f=path.join(ROOT,url.slice(1));
    assert(fs.existsSync(f),'image missing: '+f);
    const bytes=fs.readFileSync(f);
    assert(bytes.length>100,'image empty: '+url);
    assert.equal(bytes.toString('ascii',0,4),'RIFF','WebP RIFF header: '+url);
    assert.equal(bytes.toString('ascii',8,12),'WEBP','WebP header: '+url);
    if(url.includes('/v2/'))count++;
  }
}
assert(count>=11,'expected eleven curated v2 assets');
function resolved(spot0,src){return images.initialAssetForSpot(spot0,src)||src;}
assert.match(resolved({name:'鉄道博物館'},'/assets/kibun-images/v2/aquarium_01.webp'),/railway_museum_01\.webp$/);
assert.match(resolved({name:'横浜イングリッシュガーデン'},'/assets/editorial/green-breathing-room.webp'),/garden_01\.webp$/);
assert.equal(resolved({name:'鉄道博物館'},'/assets/specific/official.webp'),'/assets/specific/official.webp');
assert.equal(resolved({name:'日本庭園',media_strategy:{display_mode:'detail_google'}},'/assets/google/photo.webp'),'/assets/google/photo.webp');
assert.equal(images.strongKey({name:'美術館'}),'','unrelated venues must not get category imagery');

const html=read('index.html');
assert(html.indexOf('kibun-images.js?v=201934')>=0 && html.indexOf('app.js?v=202003')>html.indexOf('kibun-images.js?v=201934'),
  'curated resolver must load before first home-card paint');
assert(html.includes('KIBUN_HOME_IMAGE_PRELOAD=true'));
assert(read('hero-audit-guard.js').includes('!global.KIBUN_HOME_IMAGE_PRELOAD'));
assert(read('config.js').includes('hero-audit-guard.js?v=201934'));
assert(html.includes('styles.css?v=202001'));
const app=read('app.js');
assert(app.includes('KibunImages?.initialAssetForSpot?.'),'imageBlock must resolve image before DOM insertion');
assert(app.includes('recommendation_error') && app.includes('finally{recommendBtn.disabled=false'),'loading state must always reset');
assert(app.includes('image-fallback-mark'),'bad images should have a visible fallback');

const begin=app.indexOf('function regionMatch(s,key){'),end=app.indexOf('// v20.20 acquisition presets',begin);
assert(begin>0 && end>begin,'region/category filter functions must be present');
const filters=new Function('shoppingIntentEligible',app.slice(begin,end)+';return {regionMatch,categoryMatch};')(rec.shoppingIntentEligible);
const yokohamaCafe=spot('spot_9','横浜カフェ','横浜市中区','cafe',{food:95,relax:91});
assert(filters.regionMatch(yokohamaCafe,'yokohama'));
assert(filters.categoryMatch(yokohamaCafe,'food'));
assert(filters.categoryMatch(yokohamaCafe,'relax'));
assert(!filters.regionMatch(yokohamaCafe,'tokyo23'));
assert(!filters.categoryMatch(yokohamaCafe,'animals'));

console.log('QA PASS: 6-hour food+relax fallback, valid pairing, short plans, hard filters, region/category filters, '+count+' WebP assets, synchronous thumbnail load, cache and failure recovery');
