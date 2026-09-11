const fs=require('fs');
const path=require('path');
const assert=require('assert');
const root=__dirname;
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
const bySlug=slug=>seed.spots.find(s=>s.slug===slug);
const text=f=>fs.readFileSync(path.join(root,f),'utf8');

assert.strictEqual(seed.metadata.version,'0.20.14.0','version');
assert.strictEqual(seed.spots.length,478,'spot count');

for(const slug of ['umi-zoi-kikori-shokudo','kichiri-mollis-shinjuku','tatami-cafe-kumasanchi']){
  const s=bySlug(slug); assert(s,`${slug} exists`); assert.strictEqual(s.family_profile?.floor_seating,true,`${slug} floor seating`);
}
for(const slug of ['kamakura-kaigan-table','aloha-food-factory-shin-yokohama']){
  const s=bySlug(slug); assert(s,`${slug} exists`); assert.strictEqual(s.family_profile?.kids_space,true,`${slug} kids space`);
}
for(const slug of ['100spoons-azamino','100spoons-toyosu']){
  const s=bySlug(slug); assert(s,`${slug} exists`); assert.strictEqual(s.family_profile?.baby_space,true,`${slug} baby space`);
}
assert.strictEqual(bySlug('100spoons-azamino').family_profile?.kids_space,true,'Azamino kids space');
assert.strictEqual(bySlug('100spoons-tachikawa').family_profile?.floor_seating,true,'Tachikawa floor seating');
assert.strictEqual(bySlug('aloha-food-factory-shin-yokohama').i18n.en.visitor_info.japanese_required,null,'Do not infer Japanese is unnecessary from an English menu alone');

const floor=text('magazine/floor-seating-with-baby/index.html');
assert(floor.includes('小上がり・座敷のある店10選'),'Japanese floor article count/title');
for(const term of ['海沿いのキコリ食堂','KICHIRI MOLLIS','畳cafe&BAR くまさん家','100本のスプーン TACHIKAWA']) assert(floor.includes(term),`floor feature includes ${term}`);
const baby=text('magazine/baby-kids-space-cafes/index.html');
for(const term of ['Aloha Food Factory','鎌倉海岸テーブル','100本のスプーン あざみ野ガーデンズ']) assert(baby.includes(term),`baby feature includes ${term}`);
assert(baby.includes('10選'),'Japanese baby feature 10 places');

const enHome=text('en/index.html');
for(const id of ['audiencePicker','vibeGrid','recommendBtn','browseDialog','spotDialog','locationBtn','bottomBrowseBtn']) assert(enHome.includes(`id="${id}"`),`English home has ${id}`);
assert(enHome.includes('478 spots'),'English home count');
const enApp=text('en/app.js');
for(const term of ['OdekakeRecommender','floorseat','kidsspace','recommend(seed','searchLocations','familyChips']) assert(enApp.includes(term),`English app contains ${term}`);

const gen=text('scripts/generate_en_pages.mjs');
assert(gen.includes("'noindex,follow'"),'fallback pages noindex');
assert(gen.includes('spots.length'),'generator uses all spots');
const enSpotDirs=fs.readdirSync(path.join(root,'en/spots'),{withFileTypes:true}).filter(x=>x.isDirectory()).length;
assert.strictEqual(enSpotDirs,478,'all spots have English browse pages');
let noindex=0,indexed=0;
for(const ent of fs.readdirSync(path.join(root,'en/spots'),{withFileTypes:true})){
  if(!ent.isDirectory()) continue;
  const h=text(path.join('en/spots',ent.name,'index.html'));
  if(/name="robots" content="noindex,follow"/.test(h)) noindex++; else indexed++;
}
assert(noindex>300,'most untranslated fallback pages are noindex');
assert(indexed>=45,'edited English spot pages remain indexable');

const enFloor=text('en/magazine/floor-seating-cafes/index.html');
for(const term of ['10 places','Umi-zoi no Kikori Shokudo','KICHIRI MOLLIS Shinjuku','Tatami Cafe &amp; Bar Kumasanchi']) assert(enFloor.includes(term),`English floor feature includes ${term}`);
const enBaby=text('en/magazine/baby-friendly-cafes/index.html');
for(const term of ['Aloha Food Factory Shin-Yokohama','Kamakura Kaigan Table','100 Spoons Azamino Gardens']) assert(enBaby.includes(term),`English baby feature includes ${term}`);

const home=text('index.html');
assert(home.includes('関東＋伊豆478スポット'),'Japanese home count updated');
assert(home.includes('styles.css?v=201400')&&home.includes('data.js?v=201400')&&home.includes('app.js?v=201400'),'Japanese cache versions updated');

console.log(`v20.14.0 PASS: ${seed.spots.length} spots / ${indexed} edited EN pages / ${noindex} fallback EN pages`);
