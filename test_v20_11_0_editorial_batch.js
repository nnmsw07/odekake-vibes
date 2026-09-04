const fs=require('fs'),vm=require('vm'),assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
assert.equal(seed.metadata.version,'0.20.11.0');assert.equal(seed.spots.length,458);
for(let n=447;n<=458;n++)assert(seed.spots.some(s=>s.spot_id===`spot_${n}`),`missing spot_${n}`);
const slugs=['terrace-after-sunset','night-starts-after-five','hotel-without-staying','parents-eat-well','seasonal-harvest'];
const hub=fs.readFileSync('magazine/index.html','utf8'),home=fs.readFileSync('index.html','utf8'),site=fs.readFileSync('sitemap.xml','utf8');
for(const slug of slugs){assert(fs.existsSync(`magazine/${slug}/index.html`),slug);assert(hub.includes(`href="${slug}/"`),`hub ${slug}`);assert(home.includes(`magazine/${slug}/`),`home ${slug}`);assert(site.includes(`/magazine/${slug}/`),`sitemap ${slug}`)}
assert(home.includes('関東＋伊豆458スポット'));
const affCtx={window:{}};vm.createContext(affCtx);vm.runInContext(fs.readFileSync('affiliate-config.js','utf8'),affCtx);const aff=affCtx.window.KIBUN_AFFILIATE_CONFIG;
for(const id of ['spot_447','spot_448','spot_450','spot_451','spot_452','spot_454','spot_456','spot_457'])assert(aff.sourceLinks[id]?.length,`affiliate ${id}`);
const audit=JSON.parse(fs.readFileSync('AFFILIATE_AUDIT_v20_11_0.json','utf8'));assert.equal(audit.spot_count,458);assert.equal(Object.keys(audit.spots).length,458);
const sns=fs.readFileSync('sns-audit-data.js','utf8');for(const slug of slugs)assert(sns.includes(`/magazine/${slug}/`));assert(fs.readFileSync('sns-audit/audit.js','utf8').includes('mergeSeedPosts'));
const plans=fs.readFileSync('plans.js','utf8');for(const id of ['friends_shinjuku_rooftop_evening','partner_ikebukuro_aqua_night','family_minatomirai_play_247','family_motomachi_pignic_walk','family_miura_harvest_soleil'])assert(plans.includes(id));
const mm=fs.readFileSync('magazine/magazine-media.js','utf8');for(const id of ['spot_449','spot_450','spot_452','spot_454','spot_458'])assert(mm.includes(id),`hero ${id}`);
console.log('v20.11.0 editorial batch PASS');
