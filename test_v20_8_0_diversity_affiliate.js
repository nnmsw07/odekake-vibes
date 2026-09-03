const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync(__dirname+'/affiliate-config.js','utf8'),ctx);
const seed=ctx.window.ODEKAKE_SEED,cfg=ctx.window.KIBUN_AFFILIATE_CONFIG;
assert(['0.20.8.0','0.20.8.1','0.20.8.2','0.20.10.0'].includes(seed.metadata.version));
assert.ok(seed.spots.length>=431);
for(const p of ['茨城県','栃木県','群馬県','山梨県','静岡県']) assert(seed.spots.some(s=>s.prefecture===p),`missing ${p}`);
const ids=seed.spots.map(s=>s.spot_id),slugs=seed.spots.map(s=>s.slug),names=seed.spots.map(s=>s.name);
assert.strictEqual(new Set(ids).size,seed.spots.length);assert.strictEqual(new Set(slugs).size,seed.spots.length);assert.strictEqual(new Set(names).size,seed.spots.length);
for(let n=388;n<=431;n++) assert(ids.includes(`spot_${String(n).padStart(3,'0')}`),`missing spot ${n}`);
const vk=['cool','nature','extraordinary','scenic','stroll','relax','shopping','food','culture','animals','creative','active','waterside'].sort();
const ek=['indoor','outdoor','physical_activity','hands_on','quietness','parent_rest','greenery','water_contact','animal_contact','food_experience','creative_sensory','baby_fit','toddler_fit','stroller_fit','rain_resilience','heat_resilience','walking_load','planning_friction'].sort();
for(const s of seed.spots){assert.deepStrictEqual(Object.keys(s.vibes_seed).sort(),vk,`${s.spot_id} vibes`);assert.deepStrictEqual(Object.keys(s.experience_seed).sort(),ek,`${s.spot_id} experience`);assert(s.name&&s.address&&s.official_url);assert(s.routing&&s.routing.municipality);assert(s.media_strategy.hero_priority.includes('google_places'));assert(/^[ABC]$/.test(s.monetization.affiliate_fit));}
const links=cfg.sourceLinks;assert.ok(Object.keys(links).length>=126,'affiliate spot coverage regression');assert.ok(Object.values(links).reduce((n,a)=>n+a.length,0)>=136,'affiliate direct-link count regression');
for(const [sid,arr] of Object.entries(links)){assert(Array.isArray(arr)&&arr.length);for(const x of arr){assert(/^https:\/\//.test(x.url),`${sid} non-https affiliate url`);}}
const must={'spot_006':'155067','spot_008':'156395','spot_028':'162792','spot_072':'152127','spot_081':'156007','spot_130':'162979','spot_389':'154299','spot_396':'150443','spot_404':'154783','spot_420':'149993','spot_428':'162138','spot_431':'160916','spot_120':'151188','spot_132':'150330'};
for(const [sid,id] of Object.entries(must)) assert((links[sid]||[]).some(x=>x.provider==='asoview'&&x.url.includes(`/base/${id}/`)),`missing ${sid} ${id}`);assert((links.spot_412||[]).some(x=>x.provider==='klook'&&x.url.includes('/95879-')));assert((links.spot_419||[]).some(x=>x.provider==='klook'&&x.url.includes('/89462-')));assert((links.spot_403||[]).some(x=>x.provider==='jalan_activity'));assert((links.spot_216||[]).some(x=>x.provider==='ikyu'&&x.url.includes('/00001254/')));assert((links.spot_218||[]).some(x=>x.provider==='ikyu'&&x.url.includes('/00000070/')));
const app=fs.readFileSync(__dirname+'/app.js','utf8');for(const k of ['ibaraki','tochigi','gunma','yamanashi','shizuoka']) assert(app.includes(`['${k}'`),`missing browse region ${k}`);
const idx=fs.readFileSync(__dirname+'/index.html','utf8');assert(/(?:431|446)スポット/.test(idx));assert(/data\.js\?v=(?:2080|2081|2082|20100)/.test(idx));assert(/affiliate-config\.js\?v=(?:2080|2090|2091|20100)/.test(idx));
console.log('v20.8.0 diversity + affiliate tests passed: 431 spots');
