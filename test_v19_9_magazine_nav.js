const fs=require('fs'),assert=require('assert'),vm=require('vm');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
assert.ok(seed.spots.length>=291);assert.ok(/^0\.(19\.9|20\.\d+(?:\.\d+)?)$/.test(seed.metadata.version));
const names=seed.spots.map(s=>s.name);for(const n of ['chano-ma 横浜','chano-ma 二子玉川','chano-ma 池袋','和カフェyusoshi chano-ma 上野','和カフェyusoshi chano-ma 立川'])assert.ok(names.includes(n),n);
assert.ok(!seed.spots.some(s=>/chano-ma 代官山|chano-ma 秋葉原/.test(s.name)),'closed branches must not be added');
for(const s of seed.spots.filter(s=>['spot_287','spot_288','spot_289','spot_290','spot_291'].includes(s.spot_id))){assert.equal(s.plan_profile?.meal,true);assert.equal(s.plan_profile?.family_recovery,true);assert.ok(s.media_strategy?.hero_priority?.includes('google_places'));}
const index=fs.readFileSync('index.html','utf8');assert.ok(index.includes('KIBUN MAGAZINE'));assert.ok(index.includes('mobile-bottom-nav'));assert.ok(/(?:291|300|306|317|320|324)スポット/.test(index));
assert.ok(fs.existsSync('magazine/index.html'));assert.ok(fs.existsSync('plans/index.html'));
for(const slug of ['yokohama-family-cafe','yokohama-small-holiday','tokyo-rainy-family','art-and-cafe','hakone-stay-story','make-something']){const p=`magazine/${slug}/index.html`;assert.ok(fs.existsSync(p),p);const h=fs.readFileSync(p,'utf8');assert.ok(h.includes('<link rel="canonical"'),slug+' canonical');assert.ok(h.includes('mobile-nav'),slug+' nav');}
const P=require('./plans.js');const preview=P.curatedPlanPreview(seed,'family_yokohama_art_play_food');assert.ok(preview&&preview.curated&&preview.spot_ids.length>=2);assert.equal(preview.audience,'family');
const site=fs.readFileSync('sitemap.xml','utf8');assert.ok(site.includes('/magazine/'));assert.ok(site.includes('/plans/'));
console.log('V19.9+ MAGAZINE PASS: current seed + chano-ma + magazine + plan library + mobile nav');
