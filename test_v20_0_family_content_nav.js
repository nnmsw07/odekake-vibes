const fs=require('fs'),assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));assert.ok(seed.spots.length>=300);assert.ok(/^0\.20\.\d+(?:\.\d+)?(?:\.\d+)?$/.test(seed.metadata.version));
const names=seed.spots.map(s=>s.name);for(const n of ['べるべるパーク新宿本店','べるべるパーク渋谷店','べるべるパーク池袋本店','べるべるパーク横浜関内店','coしぶや（渋谷区子育てネウボラ）','latte chano-mama','京王あそびの森 HUGHUG〈ハグハグ〉','ギャラクシティ','新宿御苑'])assert.ok(names.includes(n),n);
const bel=seed.spots.filter(s=>/^spot_29[2-5]$/.test(s.spot_id));assert.equal(bel.length,4);assert.ok(bel.every(s=>s.recommendation_group==='belbel-park'));assert.ok(bel.every(s=>s.media_strategy.hero_priority[0]==='google_places'&&s.media_strategy.google_places.place_id===null));
const co=seed.spots.find(s=>s.spot_id==='spot_296');assert.ok(/登録不要/.test(co.public_copy));assert.ok(/利用条件/.test(co.public_copy));
const P=require('./plans.js');for(const id of ['family_shinjuku_green_play_cafe','family_ikebukuro_city_play_cafe','family_shibuya_green_cafe','family_shinjuku_belbel_cafe']){const p=P.curatedPlanPreview(seed,id);assert.ok(p&&p.curated,id);}
const idx=fs.readFileSync('index.html','utf8');assert.ok(idx.includes('data-bottom-nav="spots"'));assert.ok(idx.includes('assets/nav/spot.svg'));assert.ok(/(?:300|306|317|320|324)スポット/.test(idx));
assert.ok(fs.readFileSync('app.js','utf8').includes("params.get('browse')==='1'"));
for(const p of ['assets/nav/article.svg','assets/nav/spot.svg','assets/nav/plan.svg','assets/nav/mood.svg','assets/editorial/cafe.webp','assets/editorial/scenic.webp'])assert.ok(fs.existsSync(p),p);
for(const slug of ['oyako-rest-indoor','shibuya-with-kids','shinjuku-family-day']){const p=`magazine/${slug}/index.html`;assert.ok(fs.existsSync(p),p);const h=fs.readFileSync(p,'utf8');assert.ok(h.includes('article-hero-media'));assert.ok(h.includes('?browse=1'));}
const hub=fs.readFileSync('magazine/index.html','utf8');assert.ok((hub.match(/class="article-card"/g)||[]).length>=9);assert.ok(hub.includes('article-card-media'));
const site=fs.readFileSync('sitemap.xml','utf8');for(const s of ['oyako-rest-indoor','shibuya-with-kids','shinjuku-family-day'])assert.ok(site.includes('/magazine/'+s+'/'));
console.log('V20.0 PASS: 300 spots + family content + 4-tab nav + 9 magazine articles + editorial hero art');
