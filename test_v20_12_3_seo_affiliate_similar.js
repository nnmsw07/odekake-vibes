const fs=require('fs');
const assert=require('assert');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const spots=new Map(seed.spots.map(s=>[s.spot_id,s]));
assert.strictEqual(seed.spots.length,469,'spot count must be 469');
assert.strictEqual(spots.get('spot_219').name,'Restaurant & Bar LARBOARD｜インターコンチネンタル横浜Pier 8');
assert.strictEqual(spots.get('spot_219').category_primary,'restaurant');
assert.ok(spots.get('spot_219').official_url.includes('larboard'));
const newIds=['spot_459','spot_460','spot_461','spot_462','spot_463','spot_464','spot_465','spot_466','spot_467','spot_468','spot_469'];
for(const id of newIds){
  assert(spots.has(id),id+' missing');
  const hero=spots.get(id).hero_image?.url;
  if(hero && !/^https?:/.test(hero)) assert(fs.existsSync(hero),id+' hero fallback missing: '+hero);
}
const affText=fs.readFileSync('affiliate-config.js','utf8');
for(const id of ['spot_219','spot_461','spot_462','spot_465','spot_466','spot_468']) assert(affText.includes('"'+id+'"'),id+' affiliate source missing');
for(const token of ['restaurant/9669/','restaurant.ikyu.com/103006/','asoview.com/base/163206/','restaurant.ikyu.com/124520/','ozmall.co.jp/restaurant/4199/','restaurant.ikyu.com/100154/']) assert(affText.includes(token),'affiliate URL missing '+token);
const routes=JSON.parse(fs.readFileSync('spots/routes.json','utf8')).routes;
assert.strictEqual(routes.length,469,'SEO route count mismatch');
for(const id of ['spot_219',...newIds]){
  const r=routes.find(x=>x.spot_id===id); assert(r,id+' route missing');
  assert(fs.existsSync(`spots/${r.slug}/index.html`),id+' nested SEO page missing');
  assert(fs.existsSync(r.fallback_file),id+' fallback SEO page missing');
  const html=fs.readFileSync(r.fallback_file,'utf8');
  assert(html.includes(`spot=${id}`),id+' deep link missing');
}
const index=fs.readFileSync('index.html','utf8');
assert(index.includes('関東＋伊豆469スポット'));
assert(index.includes('data.js?v=201230'));
assert(index.includes('affiliate-config.js?v=201230'));
assert(index.includes('app.js?v=201125&amp;h=201230'));
assert(index.includes('styles.css?v=201125&amp;h=201230'));
assert(!fs.existsSync('spots/intercontinental-yokohama-pier8'),'old Pier8 SEO directory should be removed');
console.log('v20.12.3 SEO + affiliate + similar spots: PASS');
