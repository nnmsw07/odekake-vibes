const fs=require('fs'),vm=require('vm'),assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const ids=new Set(seed.spots.map(s=>s.spot_id));
const slugs=["baby-first-outing", "yokohama-rainy-day", "ride-and-transport", "science-for-everyone", "waterfront-reset", "green-breathing-room", "small-museums-big-day", "solo-reset", "factory-tour", "animals-close"];
const hub=fs.readFileSync('magazine/index.html','utf8'),home=fs.readFileSync('index.html','utf8'),site=fs.readFileSync('sitemap.xml','utf8'),mm=fs.readFileSync('magazine/magazine-media.js','utf8');
assert.strictEqual(slugs.length,10);
for(const slug of slugs){
  const f=`magazine/${slug}/index.html`; assert.ok(fs.existsSync(f),`missing ${f}`);
  const page=fs.readFileSync(f,'utf8');
  assert.ok(hub.includes(`href="${slug}/"`),`hub missing ${slug}`);
  assert.ok(site.includes(`/magazine/${slug}/`),`sitemap missing ${slug}`);
  assert.ok(page.includes('data-hero-spot="'),`hero spot missing ${slug}`);
  const hero=(page.match(/data-hero-spot="(spot_\d+)"/)||[])[1]; assert.ok(hero&&ids.has(hero),`invalid hero ${slug}`); assert.ok(mm.includes(`"${hero}"`),`hero map missing ${hero}`);
  const refs=[...page.matchAll(/\?spot=(spot_\d+)&amp;source=magazine/g)].map(m=>m[1]);
  assert.ok(refs.length>=7,`too few spots in ${slug}`); assert.strictEqual(refs.length,new Set(refs).size,`duplicate spot in ${slug}`);
  for(const id of refs)assert.ok(ids.has(id),`bad spot ${id} in ${slug}`);
  assert.ok(page.includes('今日の気分から探す →'),'mood CTA missing');
}
for(const slug of ['terrace-after-sunset','baby-first-outing','yokohama-rainy-day','waterfront-reset','science-for-everyone','ride-and-transport','night-starts-after-five','hotel-without-staying','parents-eat-well','seasonal-harvest']) assert.ok(home.includes(`href="magazine/${slug}/"`),`home preview missing ${slug}`);
for(const [slug,id] of [['terrace-after-sunset','spot_449'],['night-starts-after-five','spot_450'],['hotel-without-staying','spot_452'],['parents-eat-well','spot_454'],['seasonal-harvest','spot_458']]){assert.ok(home.includes(`href="magazine/${slug}/"`));assert.ok(home.includes(`data-media-spot="${id}"`));}
console.log('v20.12.0 magazine +10 PASS');
