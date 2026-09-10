import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const enSpots=(seed.spots||[]).filter(s=>s.i18n?.en?.name&&s.i18n?.en?.public_copy);

function familyChips(s){
  const f=s.family_profile||{}; const chips=[];
  if(f.floor_seating) chips.push('Floor seating');
  if(f.crawl_ok) chips.push('Baby can lie/crawl');
  if(f.baby_space) chips.push('Baby space');
  if(f.kids_space) chips.push('Kids space');
  if(f.nursing_room) chips.push('Nursing room');
  if(f.diaper_changing) chips.push('Diaper changing');
  if(f.baby_meal) chips.push('Baby meal support');
  if(f.childcare) chips.push('Childcare');
  return chips;
}
function visitorRows(s){
  const v=s.i18n?.en?.visitor_info||{}; const rows=[];
  if(v.english_friendly===true) rows.push(['English support','Documented']);
  if(v.japanese_required===false) rows.push(['Japanese required','No']);
  if(v.reservation==='recommended') rows.push(['Booking','Recommended']);
  else if(v.reservation==='required') rows.push(['Booking','Required']);
  if(v.cashless===true) rows.push(['Cashless','Available']);
  if(v.nearest_station) rows.push(['Nearest station',v.nearest_station]);
  if(v.tattoo_policy) rows.push(['Tattoo policy',v.tattoo_policy]);
  if(v.halal===true) rows.push(['Halal','Available']);
  if(v.vegan===true) rows.push(['Vegan','Available']);
  return rows;
}
function location(s){const en=s.i18n.en;return [en.city,en.prefecture].filter(Boolean).join(' · ')}
function write(file,html){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html)}

const card=s=>`<a class="card" href="/en/spots/${esc(s.slug||`${s.spot_id}-spot`)}/"><small>${esc(location(s))}</small><h3>${esc(s.i18n.en.name)}</h3><p>${esc(s.i18n.en.public_copy)}</p></a>`;
const hub=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>English spot guide | Kibun Trip</title><meta name="description" content="English Kibun spot guide for Tokyo, Yokohama and nearby areas."><link rel="canonical" href="https://kibuntrip.com/en/spots/"><link rel="alternate" hreflang="en" href="https://kibuntrip.com/en/spots/"><link rel="alternate" hreflang="ja" href="https://kibuntrip.com/spots/"><link rel="alternate" hreflang="x-default" href="https://kibuntrip.com/spots/"><meta name="robots" content="index,follow"><link rel="stylesheet" href="/en/styles.css"></head><body><header class="top"><div class="wrap" style="display:flex;justify-content:space-between"><a class="brand" href="/en/">Kibun Trip</a><a class="switch" href="/spots/" hreflang="ja">JA</a></div></header><main class="section"><div class="wrap"><p class="eyebrow">SPOTS</p><h1>English spot guide</h1><p>Start with a place, or go back to the mood-first home page.</p><div class="grid">${enSpots.map(card).join('')}</div></div></main><footer class="footer"><div class="wrap"><a href="/en/">English home</a> · <a href="/en/magazine/">Features</a> · <a href="/en/plans/">Plans</a></div></footer></body></html>`;
write(path.join(root,'en/spots/index.html'),hub);

for(const s of enSpots){
  const en=s.i18n.en, slug=s.slug||`${s.spot_id}-spot`, jp=`https://kibuntrip.com/spots/${slug}/`, url=`https://kibuntrip.com/en/spots/${slug}/`;
  const chips=familyChips(s);
  if(en.visitor_info?.english_friendly===true) chips.push('English support');
  const rows=visitorRows(s);
  const closed=(s.availability_constraints?.unavailable_ranges||[])[0];
  const fmtDate=v=>{const d=new Date(`${v}T00:00:00Z`);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(d)};
  const notice=closed?`<div class="notice"><strong>Scheduled closure</strong><p>Closed from ${esc(fmtDate(closed.from))} to ${esc(fmtDate(closed.until))}. Please check the official venue before visiting.</p></div>`:'';
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(en.name)} | Kibun Trip</title><meta name="description" content="${esc(en.public_copy)}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="en" href="${url}"><link rel="alternate" hreflang="ja" href="${jp}"><link rel="alternate" hreflang="x-default" href="${jp}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="stylesheet" href="/en/styles.css"></head><body><header class="top"><div class="wrap" style="display:flex;justify-content:space-between;align-items:center"><a class="brand" href="/en/">Kibun Trip</a><a class="switch" href="/spots/${esc(slug)}/" hreflang="ja">JA</a></div></header><main class="section"><div class="wrap feature"><p class="eyebrow">${esc(location(s))}</p><h1>${esc(en.name)}</h1><p>${esc(en.public_copy)}</p>${chips.length?`<div class="chips">${chips.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:''}${notice}${rows.length?`<div class="place"><strong>Visitor notes</strong>${rows.map(([a,b])=>`<p><b>${esc(a)}:</b> ${esc(b)}</p>`).join('')}</div>`:''}<div class="place"><strong>Address (Japanese)</strong><p>${esc(s.address||'Check official website')}</p><a href="${esc(s.official_url||'#')}" target="_blank" rel="noopener">Official website →</a></div><p><a href="/en/spots/">← All English spots</a></p></div></main><footer class="footer"><div class="wrap">Details such as opening hours, seating and language support can change. Please check the official venue before visiting.</div></footer></body></html>`;
  write(path.join(root,'en/spots',slug,'index.html'),html);
}
console.log(`English pages generated: ${enSpots.length} spots`);
