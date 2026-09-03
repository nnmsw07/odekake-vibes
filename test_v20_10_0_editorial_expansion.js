const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);vm.runInContext(fs.readFileSync('affiliate-config.js','utf8'),ctx);vm.runInContext(fs.readFileSync('affiliate-audit-status.js','utf8'),ctx);
const seed=ctx.window.ODEKAKE_SEED, aff=ctx.window.KIBUN_AFFILIATE_CONFIG, audit=ctx.window.KIBUN_AFFILIATE_AUDIT_STATUS;
assert.strictEqual(seed.spots.length,446,'expected 446 spots');
for(let n=432;n<=446;n++) assert.ok(seed.spots.some(s=>s.spot_id===`spot_${n}`),`missing spot_${n}`);
assert.strictEqual(Object.keys(audit.spots).length,446,'affiliate audit must cover all spots');
assert.strictEqual(Object.keys(aff.sourceLinks).length,153,'expected 153 affiliate-configured spots');
assert.strictEqual(Object.values(aff.sourceLinks).flat().length,164,'expected 164 direct affiliate links');
const plans=fs.readFileSync('plans.js','utf8');
for(const id of ['family_minamimachida_snoopy_shop','partner_komaba_mingei_bundan','friends_kappabashi_tools_sample','partner_takanawa_mon_cafe','family_ichihara_animals_glamping','partner_kawaguchiko_ropeway_pica','family_kasama_market_etowa','partner_numazu_deepsea_inn']) assert.ok(plans.includes(`id:'${id}'`),`missing plan ${id}`);
const mag=fs.readFileSync('magazine/index.html','utf8');
for(const slug of ['outdoor-stay-with-comfort','tools-with-a-story','takanawa-after-five']) { assert.ok(mag.includes(`${slug}/`),`hub missing ${slug}`); assert.ok(fs.existsSync(`magazine/${slug}/index.html`),`article missing ${slug}`); }
const home=fs.readFileSync('index.html','utf8');assert.ok(home.includes('関東＋伊豆446スポット'),'home spot count stale');assert.ok(home.includes('magazine/outdoor-stay-with-comfort/'),'home magazine preview stale');
const sitemap=fs.readFileSync('sitemap.xml','utf8');for(const slug of ['outdoor-stay-with-comfort','tools-with-a-story','takanawa-after-five']) assert.ok(sitemap.includes(`/magazine/${slug}/`),`sitemap missing ${slug}`);
console.log('v20.10.0 editorial expansion tests passed');
