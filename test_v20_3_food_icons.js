const fs=require('fs'),vm=require('vm'),assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));assert.strictEqual(seed.spots.length,317);
const ids=new Set(seed.spots.map(s=>s.spot_id));for(const id of ['spot_307','spot_309','spot_313','spot_314','spot_315','spot_316','spot_317'])assert.ok(ids.has(id),id);
for(const s of seed.spots.filter(s=>Number(s.spot_id.slice(5))>=307))assert.ok(s.categories.includes('afternoon_tea'),s.name);
const app=fs.readFileSync('app.js','utf8');assert.ok(app.includes("['afternoontea','アフタヌーンティー']"));for(const k of ['cool','nature','extraordinary','scenic','stroll','relax','shopping','food','culture','animals','creative','active','waterside'])assert.ok(fs.existsSync(`assets/vibes/${k}.svg`),k);
for(const k of ['article','plan','spot','mood'])assert.ok(fs.existsSync(`assets/nav/${k}.svg`),k);
const idx=fs.readFileSync('index.html','utf8');assert.ok(idx.includes('assets/nav/spot.svg'));assert.ok(!idx.includes('assets/nav/spot.png'));assert.ok(idx.includes('317スポット'));
assert.ok(fs.existsSync('magazine/yokohama-afternoon-tea/index.html'));
console.log('v20.3 food + unified icon tests passed');
