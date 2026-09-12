import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
const spots=seed.spots||[];
const performanceData=fs.existsSync(path.join(root,'performances.json'))?JSON.parse(fs.readFileSync(path.join(root,'performances.json'),'utf8')):{performances:[]};
const eventData=fs.existsSync(path.join(root,'events.json'))?JSON.parse(fs.readFileSync(path.join(root,'events.json'),'utf8')):{events:[]};
const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const write=(file,html)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html)};
const translated=s=>Boolean(s.i18n?.en?.name&&s.i18n?.en?.public_copy);
const enName=s=>s.i18n?.en?.name||s.name||'Kibun spot';
const pref=s=>s.i18n?.en?.prefecture||({'東京都':'Tokyo','神奈川県':'Kanagawa','千葉県':'Chiba','埼玉県':'Saitama','静岡県':'Shizuoka','山梨県':'Yamanashi','茨城県':'Ibaraki','栃木県':'Tochigi','群馬県':'Gunma'}[s.prefecture]||s.prefecture||'');
const city=s=>{
  const known=s.i18n?.en?.city;
  if(known&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(known)) return known;
  const map={'横浜市西区':'Yokohama · Nishi Ward','横浜市中区':'Yokohama · Naka Ward','横浜市港北区':'Yokohama · Kohoku Ward','横浜市青葉区':'Yokohama · Aoba Ward','横浜市神奈川区':'Yokohama · Kanagawa Ward','鎌倉市':'Kamakura','藤沢市':'Fujisawa','川崎市':'Kawasaki','新宿区':'Shinjuku','渋谷区':'Shibuya','世田谷区':'Setagaya','江東区':'Koto','台東区':'Taito','立川市':'Tachikawa','千代田区':'Chiyoda','港区':'Minato','墨田区':'Sumida','豊島区':'Toshima','中央区':'Chuo'};
  return map[s.city]||String(s.city||'').replace(/市.*$/,'').replace(/区$/,'');
};
const location=s=>[city(s),pref(s)].filter(Boolean).join(' · ');
const genericCopy=s=>{
  const e=s.experience_seed||{},v=s.vibes_seed||{};let kind='a Kibun outing spot';
  if(Number(e.indoor||0)>=85) kind='an indoor outing option';
  else if(Number(v.nature||0)>=80) kind='a nature-focused outing';
  else if(Number(v.waterside||0)>=80) kind='a waterfront outing';
  else if(Number(v.culture||0)>=80) kind='a culture-focused stop';
  else if(Number(v.food||0)>=80) kind='a food-focused stop';
  const family=Number(s.audience_fit?.family||0)>=80?' It also scores well for family outings in Kibun.':'';
  return `${enName(s)} is ${kind} in ${location(s)||'the Kanto area'}.${family} Check the official venue for current details.`;
};
const copy=s=>s.i18n?.en?.public_copy||genericCopy(s);
function familyChips(s){
  const f=s.family_profile||{},chips=[];
  if(f.floor_seating) chips.push('Floor / tatami seating');
  if(f.shoes_off) chips.push('Shoes off');
  if(f.crawl_ok) chips.push('Lie down / crawl');
  if(f.baby_space) chips.push('Baby space');
  if(f.kids_space) chips.push('Kids space');
  if(f.nursing_room) chips.push('Nursing room');
  if(f.diaper_changing) chips.push('Diaper changing');
  if(f.baby_meal) chips.push('Baby food support');
  if(f.baby_chair) chips.push('Baby chair');
  if(f.childcare) chips.push('Childcare');
  return chips;
}
function visitorRows(s){
  const v=s.i18n?.en?.visitor_info||{},rows=[];
  if(v.english_friendly===true) rows.push(['English support','Documented']);
  if(v.japanese_required===false) rows.push(['Japanese required','No']);
  if(v.reservation==='recommended') rows.push(['Reservation','Recommended']);
  else if(v.reservation==='required') rows.push(['Reservation','Required']);
  else if(v.reservation==='check venue') rows.push(['Reservation','Check venue']);
  if(v.cashless===true) rows.push(['Cashless payment','Available']);
  if(v.nearest_station) rows.push(['Nearest station',v.nearest_station]);
  if(v.tattoo_policy) rows.push(['Tattoo policy',v.tattoo_policy]);
  if(v.halal===true) rows.push(['Halal','Available']);
  if(v.vegan===true) rows.push(['Vegan','Available']);
  return rows;
}
const img=s=>{const u=s.hero_image?.url||'';if(!u)return'';return /^https?:\/\//i.test(u)||u.startsWith('/')?u:'/'+u.replace(/^\.\//,'')};
const todayIso=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const perfGenre={ballet:'Ballet',opera:'Opera',musical:'Musical',theater:'Theatre',kabuki:'Kabuki',noh_kyogen:'Noh & Kyogen',classical:'Classical',dance:'Dance',live:'Live music',family:'Family'};
const perfDate=(a,b)=>{const x=new Date(`${a}T00:00:00`),y=new Date(`${b||a}T00:00:00`),o={month:'short',day:'numeric'};return a===(b||a)?x.toLocaleDateString('en-US',o):`${x.toLocaleDateString('en-US',o)} – ${y.toLocaleDateString('en-US',o)}`};
function performanceSection(s){if(!s.performance_profile)return'';const today=todayIso(),items=(performanceData.performances||[]).filter(p=>p.venue_spot_id===s.spot_id&&(p.end_date||p.start_date)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,4);if(!items.length)return'';return `<section class="performance-detail-section"><div class="performance-detail-head"><div><p class="eyebrow">WHAT’S ON</p><h2>Upcoming performances</h2></div><a href="/en/performances/">All performances →</a></div><div class="performance-mini-list">${items.map(p=>`<article class="performance-mini-card"><div class="performance-mini-date">${esc(perfDate(p.start_date,p.end_date))}</div><div class="performance-mini-copy"><small>${esc(perfGenre[p.genre]||p.genre)}</small><strong>${esc(p.title_en||p.title)}</strong></div><a href="${esc(p.official_url||s.official_url)}" target="_blank" rel="noopener">Official →</a></article>`).join('')}</div><p class="freshness">Performance data checked: ${esc(s.performance_profile.checked_at||'not recorded')}. Recheck times and ticket availability on the official site.</p></section>`} 
const eventType={exhibition:'Exhibition',seasonal:'Seasonal',family:'Family event',workshop:'Workshop',festival:'Festival',experience:'Experience',show:'Show'};
function eventSection(s){const today=todayIso(),items=(eventData.events||[]).filter(e=>e.venue_spot_id===s.spot_id&&(e.end_date||e.start_date)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,5);if(!items.length)return'';return `<section class="performance-detail-section event-detail-section"><div class="performance-detail-head"><div><p class="eyebrow">EVENTS & EXPERIENCES</p><h2>On now & coming up</h2></div><a href="/en/whats-on/">See all →</a></div><div class="performance-mini-list">${items.map(e=>`<article class="performance-mini-card"><div class="performance-mini-date">${esc(perfDate(e.start_date,e.end_date))}</div><div class="performance-mini-copy"><small>${esc(eventType[e.event_type]||e.event_type)}</small><strong>${esc(e.title_en||e.title)}</strong>${e.venue_label&&e.venue_label!==s.name?`<span class="event-subvenue">${esc(e.venue_label)}</span>`:''}</div><a href="${esc(e.official_url||s.official_url)}" target="_blank" rel="noopener">Official →</a></article>`).join('')}</div><p class="freshness">Limited-time items are removed after their end date. Recheck exact times and same-day entry on the official page.</p></section>`}

const scheduledClosure=s=>{
  const ranges=s.availability_constraints?.unavailable_ranges||[];
  if(!ranges.length)return'';
  const r=ranges[0];
  return `<div class="closure-alert"><strong>Scheduled closure / unavailability</strong><br>${esc(r.from||'')} – ${esc(r.until||'')}${r.note?` · ${esc(r.note)}`:''}</div>`;
};
const commonHead=({title,description,canonical,ja,robots='index,follow,max-image-preview:large',enAlt=true})=>`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}">${enAlt?`<link rel="alternate" hreflang="en" href="${esc(canonical)}">`:''}<link rel="alternate" hreflang="ja" href="${esc(ja)}"><link rel="alternate" hreflang="x-default" href="${esc(ja)}"><meta name="robots" content="${robots}"><link rel="stylesheet" href="/styles.css?v=201901"><link rel="stylesheet" href="/en/styles.css?v=201901">`;
const header=ja=>`<header class="topbar"><a class="brand" href="/en/"><span class="brand-dot"></span>Kibun Trip</a><span class="topbar-tag">MOOD → DAY</span><div class="topbar-actions"><a class="lang-switch refined-lang" href="${esc(ja)}" hreflang="ja">JA</a></div></header>`;
const footer=`<footer class="footer shell"><div>© Kibun Trip</div><div class="footer-links"><a href="/en/">Mood</a><a href="/en/spots/">Spots</a><a href="/en/magazine/">Features</a><a href="/en/plans/">Plans</a><a href="/en/whats-on/">What’s on</a><a href="/en/performances/">Performances</a></div></footer>`;

const cards=spots.map(s=>{
  const slug=s.slug||`${s.spot_id}-spot`,family=familyChips(s);
  const search=`${enName(s)} ${s.name||''} ${location(s)} ${s.city||''} ${s.prefecture||''}`.toLowerCase();
  const cats=[s.family_profile?.floor_seating||s.family_profile?.shoes_off?'floorseat':'',s.family_profile?.baby_space||s.family_profile?.kids_space?'kidsspace':'',Number(s.audience_fit?.family||0)>=80?'family':''].filter(Boolean).join(' ');
  return `<a class="en-spot-directory-card" data-search="${esc(search)}" data-cats="${cats}" href="/en/spots/${esc(slug)}/"><div class="en-spot-directory-copy"><small>${esc(location(s))}${translated(s)?' · Edited English':' · English fallback'}</small><h3>${esc(enName(s))}</h3><p>${esc(copy(s))}</p>${family.length?`<div class="chips">${family.slice(0,3).map(x=>`<span class="mini-tag">${esc(x)}</span>`).join('')}</div>`:''}</div><span class="browse-spot-arrow">›</span></a>`;
}).join('');
const hub=`<!doctype html><html lang="en"><head>${commonHead({title:`All ${spots.length} spots | Kibun Trip`,description:`Browse all ${spots.length} Kibun outing spots around Tokyo, Kanagawa and nearby areas, with growing English and family-friendly notes.`,canonical:'https://kibuntrip.com/en/spots/',ja:'https://kibuntrip.com/spots/'})}</head><body class="en-site en-directory">${header('/spots/')}<main><section class="hero shell en-directory-hero"><p class="eyebrow">ALL SPOTS</p><h1>${spots.length} ways to<br><em>get out today.</em></h1><p class="hero-copy">Every Kibun spot is browseable in English. Hand-edited translations are expanding; fallback pages stay out of English search indexing until their copy is reviewed.</p><div class="en-directory-tools"><input id="spotSearch" type="search" placeholder="Search English / Japanese name or area"><div class="filters"><button class="active" data-cat="all">All</button><button data-cat="floorseat">Floor / tatami</button><button data-cat="kidsspace">Baby / kids space</button><button data-cat="family">Family-friendly</button></div><p id="directoryCount" class="browse-count">${spots.length} spots</p></div></section><section class="shell en-spot-directory" id="spotDirectory">${cards}</section></main>${footer}<script>(()=>{const cards=[...document.querySelectorAll('.en-spot-directory-card')],q=document.getElementById('spotSearch'),count=document.getElementById('directoryCount');let cat='all';function run(){const term=q.value.trim().toLowerCase();let n=0;for(const c of cards){const ok=(!term||c.dataset.search.includes(term))&&(cat==='all'||c.dataset.cats.split(' ').includes(cat));c.hidden=!ok;if(ok)n++;}count.textContent=n+' spot'+(n===1?'':'s');}q.addEventListener('input',run);document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.cat;document.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('active',x===b));run();}));})();</script></body></html>`;
write(path.join(root,'en/spots/index.html'),hub);

for(const s of spots){
  const full=translated(s),slug=s.slug||`${s.spot_id}-spot`,url=`https://kibuntrip.com/en/spots/${slug}/`,jp=`https://kibuntrip.com/spots/${slug}/`;
  const chips=familyChips(s),rows=visitorRows(s),src=img(s);
  const robots=full?'index,follow,max-image-preview:large':'noindex,follow';
  const bodyImage=src?`<div class="en-spot-page-hero"><img src="${esc(src)}" alt="${esc(enName(s))}" loading="eager" referrerpolicy="no-referrer"></div>`:'';
  const family=chips.length?`<section class="family-support"><p class="eyebrow">FAMILY SUPPORT</p><h2>Useful with a baby or child</h2><div class="detail-family-grid">${chips.map(x=>`<span>${esc(x)}</span>`).join('')}</div>${s.family_profile?.note?`<p class="freshness">${esc(s.family_profile.note)}</p>`:''}</section>`:'';
  const visitor=rows.length?`<section class="fact-box"><h2>International visitor notes</h2><div class="visitor-table">${rows.map(([a,b])=>`<div class="visitor-row"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div></section>`:'';
  const html=`<!doctype html><html lang="en"><head>${commonHead({title:`${enName(s)} | Kibun Trip`,description:copy(s),canonical:url,ja:jp,robots,enAlt:full})}</head><body class="en-site en-spot-page">${header(`/spots/${slug}/`)}<main><article class="shell en-spot-article">${bodyImage}<div class="en-spot-copy"><p class="eyebrow">${esc(location(s))}</p><h1>${esc(enName(s))}</h1><p class="en-spot-lead">${esc(copy(s))}</p>${!full?'<p class="fallback-copy-note">This page uses a short English fallback generated from Kibun’s structured data. It is intentionally noindex until the English copy is hand-edited.</p>':''}${scheduledClosure(s)}${family}${performanceSection(s)}${eventSection(s)}${visitor}<section class="fact-box"><h2>Access</h2><p>${esc(s.address||'See the official website.')}</p><a class="official-link" href="${esc(s.official_url||'#')}" target="_blank" rel="noopener">Official website →</a></section><p class="en-back"><a href="/en/spots/">← All ${spots.length} spots</a></p></div></article></main>${footer}</body></html>`;
  write(path.join(root,'en/spots',slug,'index.html'),html);
}
console.log(`English spot pages generated: ${spots.length} total (${spots.filter(translated).length} edited, ${spots.filter(s=>!translated(s)).length} noindex fallbacks)`);
