(()=>{
'use strict';
const seed=window.ODEKAKE_SEED||{spots:[],vibe_definitions:{}};
const recommender=window.OdekakeRecommender;
const travel=window.KibunTravel;
const spots=seed.spots||[];
const $=id=>document.getElementById(id);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const AUDIENCES=[
  ['family','Family','◌','Takes age and practical family needs into account.'],
  ['partner','Partner','◇','Balances atmosphere, food and scenery.'],
  ['solo','Solo','○','Leans toward easy, unhurried places.'],
  ['friends','Friends','◎','Looks for shared experiences and food.'],
  ['dog','With a dog','△','Only uses spots with documented dog access.']
];
const VIBES={
  extraordinary:{name:'Something different',desc:'Make today feel less ordinary',photo:'extraordinary.webp'},
  relax:{name:'Take it slow',desc:'No rushing, no packed schedule',photo:'relax.webp'},
  scenic:{name:'See a good view',desc:'Sea, skyline or greenery',photo:'scenic.webp'},
  nature:{name:'Get into nature',desc:'Green, mountains, rivers and open air',photo:'nature.webp'},
  cool:{name:'Stay cool',desc:'Comfort on a hot day',photo:'cool.webp'},
  food:{name:'Eat something good',desc:'Make food part of the outing',photo:'food.webp'},
  stroll:{name:'Wander',desc:'Walk without overplanning'},
  shopping:{name:'Browse & shop',desc:'Shops, markets and mixed-use spaces'},
  culture:{name:'Culture & ideas',desc:'Art, museums, history and architecture'},
  animals:{name:'See animals',desc:'Aquariums, zoos and animal encounters'},
  creative:{name:'Make something',desc:'Craft, sound and hands-on creativity'},
  active:{name:'Move around',desc:'Play, climb, run or get active'},
  waterside:{name:'Be by the water',desc:'Sea, rivers, lakes and waterfronts'}
};
const MOOD_KEYS=['extraordinary','relax','scenic','nature','cool','food'];
const ACTIVITY_KEYS=['stroll','shopping','culture','animals','creative','active','waterside'];
const BROWSE_REGIONS=[['all','All areas'],['yokohama','Yokohama'],['tokyo','Tokyo'],['kanagawa','Kanagawa (other)'],['chiba','Chiba'],['saitama','Saitama'],['izu','Izu / Shizuoka']];
const BROWSE_CATEGORIES=[['all','All'],['floorseat','Floor / tatami seating'],['kidsspace','Baby / kids space'],['family','Family-friendly'],['indoor','Indoor'],['food','Food & cafés'],['culture','Culture'],['nature','Nature'],['waterside','Waterfront'],['dog','Dog-friendly']];

let selectedAudience='family';
let selectedVibes=[];
let travelMinutesBySpot={};
let lastTravelProvider=null;
let origin=null;
let browseRegion='all';
let browseCategory='all';
const favorites=new Set(JSON.parse(localStorage.getItem('kibun_favorites_en')||'[]'));

function enData(s){return s?.i18n?.en||{};}
function enName(s){return enData(s).name||s.name||'Untitled spot';}
function cleanCity(s){
  const known=enData(s).city;
  if(known&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(known)) return known;
  const city=String(s.city||'');
  const map={'横浜市西区':'Yokohama · Nishi Ward','横浜市中区':'Yokohama · Naka Ward','横浜市港北区':'Yokohama · Kohoku Ward','横浜市青葉区':'Yokohama · Aoba Ward','横浜市神奈川区':'Yokohama · Kanagawa Ward','鎌倉市':'Kamakura','藤沢市':'Fujisawa','川崎市':'Kawasaki','新宿区':'Shinjuku','渋谷区':'Shibuya','世田谷区':'Setagaya','江東区':'Koto','台東区':'Taito','立川市':'Tachikawa','千代田区':'Chiyoda','港区':'Minato','墨田区':'Sumida','豊島区':'Toshima','中央区':'Chuo'};
  return map[city]||city.replace(/市.*$/,'').replace(/区$/,'');
}
function enPref(s){
  const p=enData(s).prefecture;if(p) return p;
  return ({'東京都':'Tokyo','神奈川県':'Kanagawa','千葉県':'Chiba','埼玉県':'Saitama','静岡県':'Shizuoka','山梨県':'Yamanashi','茨城県':'Ibaraki','栃木県':'Tochigi','群馬県':'Gunma'})[s.prefecture]||s.prefecture||'';
}
function enLocation(s){return [cleanCity(s),enPref(s)].filter(Boolean).join(' · ');}
function genericCopy(s){
  const e=s.experience_seed||{},v=s.vibes_seed||{},bits=[];
  if((e.indoor||0)>=85) bits.push('an indoor option');
  else if((v.nature||0)>=80) bits.push('a nature-focused outing');
  else if((v.waterside||0)>=80) bits.push('a waterfront outing');
  else if((v.culture||0)>=80) bits.push('a culture-focused stop');
  else bits.push('a Kibun outing spot');
  if((s.audience_fit?.family||0)>=80) bits.push('that works well for families');
  else if((s.audience_fit?.partner||0)>=85) bits.push('that suits a relaxed day for two');
  return `${enName(s)} is ${bits.join(' ')} in ${enLocation(s)||'the Kanto area'}. Check the official venue for current details.`;
}
function enCopy(s){return enData(s).public_copy||genericCopy(s);}
function translated(s){return Boolean(enData(s).name&&enData(s).public_copy);}
function imageSrc(s){
  const url=s?.hero_image?.url||'';
  if(!url) return '';
  if(/^https?:\/\//i.test(url)||url.startsWith('/')) return url;
  return '/'+url.replace(/^\.\//,'');
}
function imageBlock(s){
  const src=imageSrc(s); const alt=escapeHtml(enName(s));
  if(!src) return `<div class="image-shell image-fallback"><span>◌</span></div>`;
  return `<div class="image-shell"><img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentElement.classList.add('image-fallback');this.remove()"></div>`;
}
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
  const v=enData(s).visitor_info||{},rows=[];
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
function vibeTop(s,n=3){return Object.entries(s.vibes_seed||{}).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,n).map(([k])=>VIBES[k]?.name||k);}
function activeClosure(s){
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  return (s.availability_constraints?.unavailable_ranges||[]).find(r=>day>=(r.from||'0000-01-01')&&day<=(r.until||'9999-12-31'))||null;
}
function slotLabel(slot){return ({best_match:'Best match',adventure:'A little different',easy:'Easy pace'})[slot]||'Pick';}
function englishWhy(s,rec){
  const out=[]; const v=s.vibes_seed||{},e=s.experience_seed||{};
  for(const key of selectedVibes.slice(0,2)) if(Number(v[key]||0)>=72) out.push(`Strong fit for “${VIBES[key]?.name||key}”`);
  if(selectedAudience==='family'){
    if(Number(s.audience_fit?.family||0)>=85) out.push('Strong family fit');
    if(Number(e.stroller_fit||0)>=80) out.push('Easy with a stroller');
    const fc=familyChips(s); if(fc.length) out.push(fc.slice(0,2).join(' · '));
  } else if(selectedAudience==='partner'&&Number(v.scenic||0)>=80) out.push('Good scenery for a day together');
  else if(selectedAudience==='solo'&&Number(e.quietness||0)>=75) out.push('Easy to enjoy at your own pace');
  else if(selectedAudience==='friends'&&(Number(e.hands_on||0)>=75||Number(v.food||0)>=80)) out.push('Works well as a shared experience');
  else if(selectedAudience==='dog') out.push('Dog access documented in Kibun');
  if(rec.travel_minutes!=null) out.push(`About ${rec.travel_minutes} min from your start point`);
  return [...new Set(out)].slice(0,3);
}
function setFavorite(id){
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  localStorage.setItem('kibun_favorites_en',JSON.stringify([...favorites]));
  $('favoriteCount').textContent=favorites.size;
}

function renderAudience(){
  $('audiencePicker').innerHTML=AUDIENCES.map(([key,label,icon])=>`<button type="button" class="audience-chip ${selectedAudience===key?'selected':''}" data-audience="${key}"><span>${icon}</span>${label}</button>`).join('');
  $('audiencePicker').querySelectorAll('[data-audience]').forEach(btn=>btn.addEventListener('click',()=>{selectedAudience=btn.dataset.audience;renderAudience();updateAudienceUi();}));
}
function updateAudienceUi(){
  const item=AUDIENCES.find(x=>x[0]===selectedAudience);$('audienceLead').textContent=item?.[3]||'';
  $('ageField').hidden=selectedAudience!=='family';
}
function vibeCard(key,mode){
  const v=VIBES[key],order=selectedVibes.indexOf(key)+1,selected=order>0;
  if(mode==='mood') return `<button type="button" class="vibe-card mood-photo-card ${selected?'selected':''}" data-vibe="${key}"><span class="mood-photo"><img src="/assets/vibes/${v.photo}" alt="" loading="lazy"></span><span class="vibe-icon"><img src="/assets/vibes/${key}.svg" alt=""></span>${selected?`<b class="vibe-order">${order}</b>`:''}<span class="vibe-text"><span class="vibe-name">${v.name}</span><span class="vibe-desc">${v.desc}</span></span></button>`;
  return `<button type="button" class="vibe-card activity-list-card ${selected?'selected':''}" data-vibe="${key}"><span class="vibe-icon"><img src="/assets/vibes/${key}.svg" alt=""></span><span class="vibe-text"><span class="vibe-name">${v.name}</span><span class="vibe-desc">${v.desc}</span></span><span class="activity-arrow">›</span>${selected?`<b class="vibe-order">${order}</b>`:''}</button>`;
}
function renderVibes(){
  $('vibeGrid').innerHTML=`<section class="vibe-group vibe-group-mood"><div class="vibe-group-head"><div class="vibe-step-label"><b>STEP 1</b><span>How should the day feel?</span></div><div class="vibe-group-copy"><strong>Pick a mood.</strong><p>You can combine it with an activity below.</p></div></div><div class="vibe-grid">${MOOD_KEYS.map(k=>vibeCard(k,'mood')).join('')}</div></section><section class="vibe-group vibe-group-activity"><div class="vibe-group-head"><div class="vibe-step-label"><b>STEP 2</b><span>Anything you want to do?</span></div><div class="vibe-group-copy"><strong>Add an activity.</strong><p>Up to three choices total.</p></div></div><div class="vibe-grid">${ACTIVITY_KEYS.map(k=>vibeCard(k,'activity')).join('')}</div></section>`;
  $('vibeGrid').querySelectorAll('[data-vibe]').forEach(btn=>btn.addEventListener('click',()=>toggleVibe(btn.dataset.vibe)));
  $('selectedHint').textContent=selectedVibes.length?`${selectedVibes.length}/3 selected. Order matters a little.`:'Choose at least one mood or activity.';
  $('clearVibes').hidden=!selectedVibes.length;
  $('selectedVibeTags').innerHTML=selectedVibes.map((k,i)=>`<span class="selected-vibe-tag"><b class="selected-vibe-tag-order">${i+1}</b>${escapeHtml(VIBES[k]?.name||k)}</span>`).join('');
  $('recommendBtn').disabled=!selectedVibes.length;
}
function toggleVibe(key){
  if(selectedVibes.includes(key)) selectedVibes=selectedVibes.filter(x=>x!==key);
  else if(selectedVibes.length<3) selectedVibes.push(key);
  else {selectedVibes=[...selectedVibes.slice(0,2),key];}
  renderVibes();
}

async function resolveTravel(){
  const max=Number($('travelLimitSelect').value||0);
  if(!origin||!max||!travel) return {map:{},required:false};
  $('locationStatus').textContent='Estimating travel times…';
  const ctx0={audience:selectedAudience,selectedVibes,childAgeMonths:selectedAudience==='family'?$('ageSelect').value:null,weather:$('weatherSelect').value,availableMinutes:Number($('timeSelect').value),allowOvernight:false};
  const ranked=spots.map(s=>[s,recommender.baseScores(s,ctx0).overall]).sort((a,b)=>b[1]-a[1]).slice(0,80).map(x=>x[0]);
  const result=await travel.getTimes(ranked,origin,$('travelModeSelect').value);
  travelMinutesBySpot=result?.times||{};lastTravelProvider=result?.provider||null;
  $('locationStatus').textContent=lastTravelProvider==='google_routes'?'Travel times ready':'Approximate travel times ready';
  return {map:travelMinutesBySpot,required:true};
}
async function renderRecommendations(){
  if(!selectedVibes.length||!recommender) return;
  const btn=$('recommendBtn');btn.disabled=true;btn.classList.add('loading');btn.textContent='Finding your day…';
  try{
    const t=await resolveTravel();
    const ctx={audience:selectedAudience,selectedVibes,childAgeMonths:selectedAudience==='family'?$('ageSelect').value:null,weather:$('weatherSelect').value,availableMinutes:Number($('timeSelect').value),allowOvernight:false,maxTravelMinutes:Number($('travelLimitSelect').value||0)||null,travelMinutesBySpot:t.map,requireKnownTravel:t.required,currentDate:new Date().toISOString()};
    const result=recommender.recommend(seed,ctx);
    $('coverageWarning').hidden=!result.coverage_warning;$('coverageWarning').textContent=result.coverage_warning?'Kibun does not have enough strong matches for that combination yet. Try changing one choice.':'';
    $('resultsGrid').innerHTML=result.recommendations.map((rec,i)=>resultCard(rec,i)).join('')||`<div class="empty-result"><div class="empty-icon">◌</div><p>No strong match yet. Try a broader mood or remove a travel-time limit.</p></div>`;
    $('resultsSection').hidden=false;
    $('resultsGrid').querySelectorAll('[data-open-spot]').forEach(x=>x.addEventListener('click',()=>openSpot(x.dataset.openSpot)));
    $('resultsGrid').querySelectorAll('[data-fav]').forEach(x=>x.addEventListener('click',()=>{setFavorite(x.dataset.fav);renderRecommendations();}));
    $('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){console.error(err);$('coverageWarning').hidden=false;$('coverageWarning').textContent='Something went wrong while building recommendations. Please try again.';$('resultsSection').hidden=false;}
  finally{btn.classList.remove('loading');btn.innerHTML='Show my day-out ideas <span>→</span>';btn.disabled=!selectedVibes.length;}
}
function resultCard(rec,index){
  const s=spots.find(x=>x.spot_id===rec.spot_id);if(!s)return'';
  const why=englishWhy(s,rec);const fav=favorites.has(s.spot_id),top=vibeTop(s,3);
  return `<article class="result-card ${index===0?'best':''} ${imageSrc(s)?'':'no-image'}"><div class="card-media"><div class="card-image">${imageBlock(s)}</div><span class="slot-chip">${slotLabel(rec.slot)}</span><span class="match-chip"><span>MOOD FIT</span><strong>${Math.round(rec.scores?.overall||0)}</strong><small>/100</small></span>${rec.travel_minutes!=null?`<span class="travel-chip">~${rec.travel_minutes} min</span>`:''}</div><div class="card-content"><div class="place-meta"><span>${escapeHtml(enLocation(s))}</span><span>${translated(s)?'EN guide':'JP name · EN summary'}</span></div><h3>${escapeHtml(enName(s))}</h3><p class="editorial">${escapeHtml(enCopy(s))}</p><div class="vibe-tags">${top.map(t=>`<span class="mini-tag">${escapeHtml(t)}</span>`).join('')}</div><ul class="why-list">${why.map(w=>`<li>${escapeHtml(w)}</li>`).join('')}</ul><div class="card-actions"><button class="detail-btn" type="button" data-open-spot="${s.spot_id}">See details <span>→</span></button><button class="fav-btn ${fav?'active':''}" type="button" data-fav="${s.spot_id}" aria-label="Favorite">${fav?'♥':'♡'}</button></div></div></article>`;
}

const PERFORMANCE_GENRE_EN={ballet:'Ballet',opera:'Opera',musical:'Musical',theater:'Theatre',kabuki:'Kabuki',noh_kyogen:'Noh & Kyogen',classical:'Classical',dance:'Dance',live:'Live music',family:'Family'};
function localIsoDate(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}
function performanceDateLabel(a,b){const x=new Date(`${a}T00:00:00`),y=new Date(`${b||a}T00:00:00`),o={month:'short',day:'numeric'};return a===(b||a)?x.toLocaleDateString('en-US',o):`${x.toLocaleDateString('en-US',o)} – ${y.toLocaleDateString('en-US',o)}`}
function upcomingPerformancesForSpot(id){const list=window.KIBUN_PERFORMANCES?.performances||[],today=localIsoDate();return list.filter(p=>p.venue_spot_id===id&&(p.end_date||p.start_date)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date)).slice(0,4)}
function performanceSectionHtml(spot){if(!spot?.performance_profile)return'';const items=upcomingPerformancesForSpot(spot.spot_id);const cards=items.length?items.map(p=>`<article class="performance-mini-card"><div class="performance-mini-date">${performanceDateLabel(p.start_date,p.end_date)}</div><div class="performance-mini-copy"><small>${PERFORMANCE_GENRE_EN[p.genre]||p.genre}</small><strong>${escapeHtml(p.title_en||p.title)}</strong></div><a href="${escapeHtml(p.official_url||spot.official_url)}" target="_blank" rel="noopener">Official →</a></article>`).join(''):'<p class="freshness">No upcoming performance is currently stored in Kibun. Check the official venue for the latest line-up.</p>';return `<section class="performance-detail-section"><div class="performance-detail-head"><div><p class="eyebrow">WHAT’S ON</p><h3>Upcoming performances</h3></div><a href="/en/performances/?area=${spot.prefecture==='東京都'?'tokyo':'kanagawa'}">All performances →</a></div><div class="performance-mini-list">${cards}</div><p class="freshness">Performance data checked: ${escapeHtml(spot.performance_profile.checked_at||'not recorded')}. Recheck times and ticket availability on the official site.</p></section>`}
function renderPerformancePreview(){const root=$('performancePreviewGrid'),data=window.KIBUN_PERFORMANCES?.performances||[];if(!root)return;const today=localIsoDate(),seen=new Set(),items=[];for(const p of data.filter(x=>(x.end_date||x.start_date)>=today).sort((a,b)=>a.start_date.localeCompare(b.start_date))){if(seen.has(p.venue_spot_id))continue;const sp=spots.find(s=>s.spot_id===p.venue_spot_id);if(!sp)continue;seen.add(p.venue_spot_id);items.push([p,sp]);if(items.length>=6)break;}root.innerHTML=items.map(([p,sp])=>`<a class="performance-preview-card" href="/en/?spot=${sp.spot_id}&source=performance_preview"><div class="performance-card-date"><b>${performanceDateLabel(p.start_date,p.end_date)}</b><span>${PERFORMANCE_GENRE_EN[p.genre]||p.genre}</span></div><small>${escapeHtml(enName(sp))}</small><h3>${escapeHtml(p.title_en||p.title)}</h3><span>See performance →</span></a>`).join('')}
function openSpot(id){
  const s=spots.find(x=>x.spot_id===id);if(!s)return;
  const fchips=familyChips(s),rows=visitorRows(s);
  const topVibes=Object.entries(s.vibes_seed||{}).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,6);
  const d=s.dynamic_snapshot||{},closure=activeClosure(s),slug=s.slug||`${s.spot_id}-spot`;
  const copyNote=!translated(s)?`<p class="fallback-copy-note">This spot does not yet have a hand-edited English translation. The summary is generated from Kibun's structured data; the official venue remains the source of truth.</p>`:'';
  $('dialogContent').innerHTML=`<div class="dialog-image">${imageBlock(s)}</div><div class="dialog-hero"><p class="eyebrow">${escapeHtml(enLocation(s))}</p><h2>${escapeHtml(enName(s))}</h2><p class="dialog-copy">${escapeHtml(enCopy(s))}</p>${copyNote}<div class="info-pills"><span class="info-pill">Stay ~${Math.round((s.stay_minutes_seed||120)/60*10)/10} hr</span>${travelMinutesBySpot[s.spot_id]!=null?`<span class="info-pill strong-pill">~${travelMinutesBySpot[s.spot_id]} min away</span>`:''}${translated(s)?'<span class="info-pill">Edited English</span>':'<span class="info-pill">English fallback</span>'}</div></div><div class="dialog-body">${closure?`<div class="closure-alert"><strong>Temporarily unavailable</strong><br>${escapeHtml(closure.note||`Scheduled closure: ${closure.from} – ${closure.until}`)}</div>`:''}${fchips.length?`<section class="family-support"><p class="eyebrow">FAMILY SUPPORT</p><h3>Useful with a baby or child</h3><div class="detail-family-grid">${fchips.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>${s.family_profile?.note?`<p class="freshness">${escapeHtml(s.family_profile.note)}</p>`:''}</section>`:''}${performanceSectionHtml(s)}${rows.length?`<section class="fact-box"><h4>International visitor notes</h4><div class="visitor-table">${rows.map(([a,b])=>`<div class="visitor-row"><b>${escapeHtml(a)}</b><span>${escapeHtml(b)}</span></div>`).join('')}</div></section>`:''}<h3>Good for</h3><div class="vibe-bars">${topVibes.map(([k,v])=>`<div class="vibe-bar"><span>${escapeHtml(VIBES[k]?.name||k)}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${Number(v)||0}%"></span></span><strong>${Math.round(Number(v)||0)}</strong></div>`).join('')}</div><div class="fact-box"><h4>Before you go</h4><p><strong>Opening hours:</strong> ${escapeHtml(d.opening_hours_text||'Check the official website.')}</p><p><strong>Price:</strong> ${escapeHtml(d.price_summary||'Check the official website.')}</p><p><strong>Reservation:</strong> ${escapeHtml(d.reservation_summary||'Check the official website.')}</p><p class="freshness">Kibun data checked: ${escapeHtml(d.checked_at||'not recorded')}. Details can change.</p></div><div class="fact-box"><h4>Access</h4><p>${escapeHtml(s.address||'See official website.')}</p><a class="official-link" href="${escapeHtml(s.official_url||'#')}" target="_blank" rel="noopener">Official website →</a><a class="detail-page-link" href="/en/spots/${escapeHtml(slug)}/">English spot page</a></div></div>`;
  $('spotDialog').showModal();
}

function regionMatch(s,key){
  if(key==='all')return true;if(key==='yokohama')return String(s.city||'').startsWith('横浜市');if(key==='tokyo')return s.prefecture==='東京都';if(key==='kanagawa')return s.prefecture==='神奈川県'&&!String(s.city||'').startsWith('横浜市');if(key==='chiba')return s.prefecture==='千葉県';if(key==='saitama')return s.prefecture==='埼玉県';if(key==='izu')return s.prefecture==='静岡県'||/伊豆/.test(`${s.city||''}${s.address||''}${s.name||''}`);return true;
}
function categoryMatch(s,key){
  const f=s.family_profile||{},e=s.experience_seed||{},v=s.vibes_seed||{},cats=(s.categories||[]).join(' ').toLowerCase();
  if(key==='all')return true;if(key==='floorseat')return f.floor_seating===true||f.shoes_off===true;if(key==='kidsspace')return f.baby_space===true||f.kids_space===true;if(key==='family')return Number(s.audience_fit?.family||0)>=80;if(key==='indoor')return Number(e.indoor||0)>=85||/indoor/.test(cats);if(key==='food')return Number(v.food||0)>=75||/restaurant|cafe|food/.test(cats);if(key==='culture')return Number(v.culture||0)>=75;if(key==='nature')return Number(v.nature||0)>=75;if(key==='waterside')return Number(v.waterside||0)>=75;if(key==='dog')return s.pet_profile?.status===true;return true;
}
function renderBrowseFilters(){
  $('browseRegionFilters').innerHTML=BROWSE_REGIONS.map(([k,l])=>`<button type="button" class="browse-filter ${browseRegion===k?'selected':''}" data-region="${k}">${l}</button>`).join('');
  $('browseCategoryFilters').innerHTML=BROWSE_CATEGORIES.map(([k,l])=>`<button type="button" class="browse-filter ${browseCategory===k?'selected':''}" data-category="${k}">${l}</button>`).join('');
  $('browseRegionFilters').querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{browseRegion=b.dataset.region;renderBrowseFilters();renderBrowseGrid();}));
  $('browseCategoryFilters').querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{browseCategory=b.dataset.category;renderBrowseFilters();renderBrowseGrid();}));
}
function renderBrowseGrid(){
  const q=String($('browseSearch').value||'').trim().toLowerCase();
  const matched=spots.filter(s=>regionMatch(s,browseRegion)&&categoryMatch(s,browseCategory)&&(!q||`${enName(s)} ${s.name||''} ${enLocation(s)} ${s.city||''} ${s.prefecture||''}`.toLowerCase().includes(q)));
  $('browseCount').textContent=`${matched.length} spot${matched.length===1?'':'s'}${matched.length>120?' · showing first 120':''}`;
  $('browseGrid').innerHTML=matched.slice(0,120).map(s=>`<button type="button" class="browse-spot-card" data-browse-open="${s.spot_id}"><span class="browse-spot-icon">${s.family_profile?.kids_space?'◉':s.family_profile?.floor_seating?'▱':Number(s.vibes_seed?.food||0)>=80?'◇':'○'}</span><span class="browse-spot-copy"><strong>${escapeHtml(enName(s))}</strong><small>${escapeHtml(enLocation(s))}${translated(s)?'':' · English fallback'}</small></span><span class="browse-spot-arrow">›</span></button>`).join('')||'<div class="browse-empty">No spots match these filters yet.</div>';
  $('browseGrid').querySelectorAll('[data-browse-open]').forEach(x=>x.addEventListener('click',()=>openSpot(x.dataset.browseOpen)));
}
function openBrowse(category=null){if(category)browseCategory=category;renderBrowseFilters();renderBrowseGrid();$('browseDialog').showModal();}

async function useCurrentLocation(){
  if(!travel){$('locationStatus').textContent='Location is not available in this browser.';return;}
  const btn=$('locationBtn');btn.disabled=true;$('locationStatus').textContent='Getting your location…';
  try{origin=await travel.getCurrentPosition();$('locationStatus').textContent='Current location set';$('clearOriginBtn').hidden=false;}
  catch(err){$('locationStatus').textContent=err?.kind==='permission_denied'?'Location permission was not granted.':'Could not get your location.';}
  finally{btn.disabled=false;}
}
async function searchOrigin(){
  const q=$('locationQuery').value.trim();if(!q||!travel)return;
  const btn=$('locationSearchBtn');btn.disabled=true;$('locationCandidates').hidden=true;$('locationStatus').textContent='Searching…';
  try{
    const list=await travel.searchLocations(q);$('locationCandidates').innerHTML=list.slice(0,5).map((c,i)=>`<button type="button" class="location-candidate" data-location-index="${i}"><strong>${escapeHtml(c.name||c.label||q)}</strong><small>${escapeHtml(c.address||c.formatted_address||'')}</small></button>`).join('')||'<p class="location-candidate-empty">No matching start point found.</p>';$('locationCandidates').hidden=false;
    $('locationCandidates').querySelectorAll('[data-location-index]').forEach(b=>b.addEventListener('click',()=>{const c=list[Number(b.dataset.locationIndex)];const lat=Number(c.lat??c.latitude),lng=Number(c.lng??c.longitude);if(Number.isFinite(lat)&&Number.isFinite(lng)){origin={lat,lng};$('locationStatus').textContent=c.name||c.label||'Start point set';$('clearOriginBtn').hidden=false;$('locationCandidates').hidden=true;}}));
    $('locationStatus').textContent='Choose a result';
  }catch(err){$('locationStatus').textContent='Place search is unavailable right now.';}
  finally{btn.disabled=false;}
}
function clearOrigin(){origin=null;travelMinutesBySpot={};lastTravelProvider=null;$('locationStatus').textContent='No start point set';$('clearOriginBtn').hidden=true;$('locationCandidates').hidden=true;}

$('clearVibes').addEventListener('click',()=>{selectedVibes=[];renderVibes();});
$('recommendBtn').addEventListener('click',renderRecommendations);
$('editBtn').addEventListener('click',()=>document.querySelector('.hero').scrollIntoView({behavior:'smooth'}));
$('browseBtn').addEventListener('click',()=>openBrowse());
$('bottomBrowseBtn').addEventListener('click',()=>openBrowse());
$('browseClose').addEventListener('click',()=>$('browseDialog').close());
$('browseDialog').addEventListener('click',e=>{if(e.target===$('browseDialog'))$('browseDialog').close();});
$('browseSearch').addEventListener('input',renderBrowseGrid);
$('dialogClose').addEventListener('click',()=>$('spotDialog').close());
$('spotDialog').addEventListener('click',e=>{if(e.target===$('spotDialog'))$('spotDialog').close();});
$('favoritesBtn').addEventListener('click',()=>{if(!favorites.size){alert('No favorites yet. Tap ♡ on a recommendation.');return;}const names=[...favorites].map(id=>enName(spots.find(s=>s.spot_id===id))).filter(Boolean);alert(`Favorites (${names.length})\n\n${names.join('\n')}`);});
$('locationBtn').addEventListener('click',useCurrentLocation);
$('clearOriginBtn').addEventListener('click',clearOrigin);
$('locationSearchBtn').addEventListener('click',searchOrigin);
$('locationQuery').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchOrigin();}});
document.querySelectorAll('[data-quick-category]').forEach(x=>x.addEventListener('click',()=>openBrowse(x.dataset.quickCategory)));

$('favoriteCount').textContent=favorites.size;
renderAudience();updateAudienceUi();renderVibes();renderBrowseFilters();renderPerformancePreview();const initialParams=new URLSearchParams(location.search);const initialSpot=initialParams.get('spot');if(initialSpot&&spots.some(s=>s.spot_id===initialSpot))setTimeout(()=>openSpot(initialSpot),80);
})();
