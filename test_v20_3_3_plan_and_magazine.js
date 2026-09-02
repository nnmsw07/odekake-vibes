const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync('plans/index.html','utf8');
for(const id of ['family_umi_no_koen_sea_cafe','partner_yokohama_art_walk_food','family_hayama_art_garden_cafe']){
  assert.ok(html.includes(`../index.html?plan=${id}&amp;source=plan_mood_visual`),`explicit deep link missing ${id}`);
}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);
const P=require('./plans.js');
for(const id of ['family_umi_no_koen_sea_cafe','partner_yokohama_art_walk_food','family_hayama_art_garden_cafe']){
  const p=P.curatedPlanPreview(ctx.window.ODEKAKE_SEED,id);assert.ok(p,`deep link plan does not resolve ${id}`);assert.ok(p.spot_ids.length>=2);
}
const root=fs.readFileSync('index.html','utf8');
assert.ok(/data\.js\?v=(?:2051|2061)/.test(root));assert.ok(root.includes('plans.js?v=2040'));assert.ok(/app\.js\?v=(?:2050|2061)/.test(root));
const hub=fs.readFileSync('magazine/index.html','utf8');
assert.ok(/magazine-media\.js\?v=(?:2033|2040)/.test(hub));
const reps={
 'yokohama-afternoon-tea':'spot_307','yokohama-family-cafe':'spot_287','yokohama-small-holiday':'spot_101','tokyo-rainy-family':'spot_286','art-and-cafe':'spot_101','hakone-stay-story':'spot_050','make-something':'spot_253','oyako-rest-indoor':'spot_292','shibuya-with-kids':'spot_171','shinjuku-family-day':'spot_300'};
for(const [slug,id] of Object.entries(reps)){
  assert.ok(hub.includes(`href="${slug}/"`) && hub.includes(`data-hero-spot="${id}"`),`hub hero missing ${slug}`);
  const a=fs.readFileSync(path.join('magazine',slug,'index.html'),'utf8');
  assert.ok(a.includes(`data-hero-spot="${id}"`),`article hero missing ${slug}`);
  assert.ok(a.includes('../magazine-media.js?v=2033'),`article resolver missing ${slug}`);
}
const resolver=fs.readFileSync('magazine/magazine-media.js','utf8');
assert.ok(resolver.includes('placePhotoApiUrl'));assert.ok(resolver.includes("d.matchConfidence==='low'"));
console.log('v20.3.3 plan deep-link + magazine hero tests passed');
