const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(read('data.js'),ctx);vm.runInContext(read('affiliate-config.js'),ctx);vm.runInContext(read('affiliate.js'),ctx);
const seed=ctx.window.ODEKAKE_SEED,cfg=ctx.window.KIBUN_AFFILIATE_CONFIG,byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));
const expected={
 spot_212:['jalan','https://www.jalan.net/yad396617/'],
 spot_213:['jalan','https://www.jalan.net/yad369086/'],
 spot_214:['ozmall','https://www.ozmall.co.jp/travel/stay/1186/'],
 spot_215:['jalan','https://www.jalan.net/yad365401/'],
 spot_217:['jalan','https://www.jalan.net/yad322559/']
};
for(const [id,[provider,url]] of Object.entries(expected)){
 const x=cfg.sourceLinks[id]?.[0];assert.ok(x,`missing source link ${id}`);assert.equal(x.provider,provider);assert.equal(x.url,url);assert.equal(x.scope,'spot');
 const links=ctx.window.KibunAffiliate.allLinksFor(byId[id]);assert.equal(links[0].scope,'spot');assert.equal(links[0].provider,provider);assert.ok(!links.some(v=>v.scope==='area'));
}
assert.ok(!cfg.links.spot_212 && !cfg.links.spot_217,'legacy A8 Hakone links removed');
assert.ok(!(cfg.sourceLinks.spot_216||[]).some(x=>x.provider==='jalan'),'Hyatt Hakone must not get an unverified Jalan link');assert.ok((cfg.sourceLinks.spot_216||[]).some(x=>x.provider==='ikyu'&&x.url==='https://www.ikyu.com/00001254/'),'Hyatt Hakone verified Ikyu link');
assert.ok(!read('affiliate-config.js').includes('LRG_141600'),'Hakone area URL removed');
assert.ok(/affiliate-config\.js\?v=(?:2052|2061|2080|2081|2090|2091|20100|20101)/.test(read('index.html')));assert.ok(/affiliate-config\.js\?v=(?:2052|2061|2080|2081|2090|2091|20100|20101)/.test(read('affiliate-audit/index.html')));
console.log('v20.5.2 hotel-specific booking links passed');
