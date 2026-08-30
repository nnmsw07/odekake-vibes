const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('data.js','utf8'),sandbox);
const seed=sandbox.window.ODEKAKE_SEED;assert.equal(seed.spots.length,286);
const ids=Array.from({length:15},(_,i)=>`spot_${String(242+i).padStart(3,'0')}`);for(const id of ids){const s=seed.spots.find(x=>x.spot_id===id);assert(s,id);assert(s.editorial?.title);assert(s.media_strategy?.hero_priority?.[0]==='google_places');}
for(const id of ['spot_242','spot_243','spot_244','spot_245'])assert.equal(seed.spots.find(x=>x.spot_id===id).recommendation_mode,'browse_only');
const app=fs.readFileSync('app.js','utf8');assert(app.includes("['stage','🎭 観劇・舞台']"));assert(app.includes('renderExperienceFeatures'));assert(app.includes('🎟️ 予約推奨'));

const tokyoGuide=fs.readFileSync('guide/tokyo23-experience/index.html','utf8');
const yokohamaGuide=fs.readFileSync('guide/yokohama-experience/index.html','utf8');
assert(tokyoGuide.includes('37スポット掲載'));assert(!tokyoGuide.includes('Artbar Tokyo 横浜元町'));
assert(yokohamaGuide.includes('25スポット掲載'));assert(yokohamaGuide.includes('Artbar Tokyo 横浜元町'));assert(yokohamaGuide.includes('ダルン陶芸教室'));assert(yokohamaGuide.includes('横浜市陶芸センター'));
const rec=require('./recommender.js');const kabuki=seed.spots.find(x=>x.spot_id==='spot_242');const ctx={audience:'partner',selectedVibes:['culture'],weather:'any',availableMinutes:300,childAgeMonths:null,allowOvernight:false};const out=rec.recommend({vibe_definitions:seed.vibe_definitions,spots:[kabuki,seed.spots[0],seed.spots[1],seed.spots[2]]},ctx);assert(!out.recommendations.some(x=>x.spot_id==='spot_242'));assert(out.excluded.some(x=>x.spot_id==='spot_242'));
console.log('V19.7.2 Experience PASS: 286 spots + 15 curated experiences + stage browse-only + editorial feature section');
