const fs=require('fs');
const path=require('path');
const assert=require('assert');
const root=__dirname;
const text=f=>fs.readFileSync(path.join(root,f),'utf8');
const exists=f=>fs.existsSync(path.join(root,f));
const seed=JSON.parse(text('seed.json'));
const perfData=JSON.parse(text('performances.json'));
const performances=perfData.performances||perfData;
const bySlug=slug=>seed.spots.find(s=>s.slug===slug);

assert.strictEqual(seed.metadata.version,'0.20.15.0','version');
assert.strictEqual(seed.spots.length,489,'spot count');

const newVenues=[
  'new-national-theatre-tokyo','tokyo-metropolitan-theatre','tokyu-theatre-orb','nissay-theatre',
  'tokyo-takarazuka-theatre','national-noh-theatre','yokohama-minato-mirai-hall',
  'kanagawa-prefectural-music-hall','yokohama-noh-theatre','billboard-live-yokohama','ariake-shiki-theatre'
];
for(const slug of newVenues){
  const s=bySlug(slug); assert(s,`${slug} exists`); assert(s.performance_profile,`${slug} has performance profile`);
}
const profiled=seed.spots.filter(s=>s.performance_profile);
assert(profiled.length>=15,`expected >=15 performance venues, got ${profiled.length}`);

assert(performances.length>=60,`expected >=60 performances, got ${performances.length}`);
const spotIds=new Set(seed.spots.map(s=>s.spot_id));
const allowed=new Set(['ballet','opera','musical','theater','kabuki','noh_kyogen','classical','dance','live','family']);
const genres=new Set();
for(const p of performances){
  assert(spotIds.has(p.venue_spot_id),`${p.performance_id}: venue exists`);
  assert(allowed.has(p.genre),`${p.performance_id}: allowed genre ${p.genre}`);
  assert(/^https:\/\//.test(p.official_url||''),`${p.performance_id}: official URL`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(p.start_date||''),`${p.performance_id}: start date`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(p.end_date||p.start_date||''),`${p.performance_id}: end date`);
  genres.add(p.genre);
}
for(const g of allowed) assert(genres.has(g),`genre coverage: ${g}`);
function hasPerf(venueSlug, titlePart){
  const v=bySlug(venueSlug); return performances.some(p=>p.venue_spot_id===v.spot_id && p.title.includes(titlePart));
}
assert(hasPerf('new-national-theatre-tokyo','街の灯'),'NNTT ballet sample');
assert(hasPerf('kaat-kanagawa-arts-theatre','蛙昇天'),'KAAT theatre sample');
assert(hasPerf('kabukiza','錦秋十月大歌舞伎'),'Kabukiza sample');
assert(hasPerf('national-noh-theatre','Discover Noh & Kyogen'),'Noh sample');
assert(hasPerf('shiki-theatre-haru','アナと雪の女王'),'Shiki Frozen sample');
assert(hasPerf('yokohama-minato-mirai-hall','音と光の動物園'),'family concert sample');

for(const f of ['performances/index.html','performances/app.js','en/performances/index.html','en/performances/app.js']) assert(exists(f),`${f} exists`);
for(const f of ['performances/index.html','en/performances/index.html']){
  const h=text(f); assert(h.includes('performanceGenreFilters'),`${f}: genre filters`); assert(h.includes('performanceAreaFilters'),`${f}: area filters`); assert(h.includes('performanceWhenFilters'),`${f}: when filters`); assert(h.includes('performanceSearch'),`${f}: search`);
}
for(const f of ['index.html','en/index.html']){
  const h=text(f); assert(h.includes('performancePreviewGrid'),`${f}: performance preview`); assert(h.includes('performances.js?v=201500'),`${f}: performance data`);
}
assert(text('app.js').includes('performanceSectionHtml'),'JP dynamic venue detail performance section');
const enApp=text('en/app.js');
assert(enApp.includes('performanceSectionHtml'),'EN dynamic venue detail performance section');
assert(enApp.includes("initialParams.get('spot')"),'EN deep-link spot support');

const enVenue=text('en/spots/new-national-theatre-tokyo/index.html');
assert(enVenue.includes('Upcoming performances'),'generated EN venue page embeds lineup');
assert(enVenue.includes('The City Lights'),'generated EN venue page includes performance');

for(const slug of ['tokyo-with-toddler','rainy-day-tokyo','japanese-culture','quiet-yokohama']){
  const f=`en/magazine/${slug}/index.html`; assert(exists(f),`${slug} English feature exists`); const h=text(f); assert(!h.includes('noindex,follow'),`${slug} indexable`);
}
const enSpotDirs=fs.readdirSync(path.join(root,'en/spots'),{withFileTypes:true}).filter(x=>x.isDirectory()).length;
assert.strictEqual(enSpotDirs,489,'all spots have English browse pages');
let indexed=0,noindex=0;
for(const ent of fs.readdirSync(path.join(root,'en/spots'),{withFileTypes:true})){
  if(!ent.isDirectory()) continue;
  const h=text(path.join('en/spots',ent.name,'index.html'));
  if(/name="robots" content="noindex,follow"/.test(h)) noindex++; else indexed++;
}
assert(indexed>=61,`expected >=61 edited/indexable English spot pages, got ${indexed}`);
assert(noindex+indexed===489,'English page accounting');

const sitemap=text('sitemap.xml');
for(const u of ['https://kibuntrip.com/performances/','https://kibuntrip.com/en/performances/','https://kibuntrip.com/en/','https://kibuntrip.com/en/spots/new-national-theatre-tokyo/','https://kibuntrip.com/en/magazine/japanese-culture/']) assert(sitemap.includes(u),`sitemap contains ${u}`);
const home=text('index.html'), enHome=text('en/index.html');
assert(home.includes('関東＋伊豆489スポット'),'JP home current count');
assert(enHome.includes('489 spots'),'EN home current count');
assert(!home.includes('関東＋伊豆478スポット'),'JP home no stale 478 count');
assert(!enHome.includes('478 spots'),'EN home no stale 478 count');

console.log(`v20.15.0 PASS: ${seed.spots.length} spots / ${profiled.length} performance venues / ${performances.length} performances / ${genres.size} genres / ${indexed} edited EN pages / ${noindex} fallback EN pages`);
